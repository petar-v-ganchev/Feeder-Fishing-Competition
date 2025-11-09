import { collection, query, where, getDocs, orderBy, limit, increment, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { User, MatchHistory } from '../types';

export interface RankedPlayer {
    id: string;
    name: string;
    rank: number;
    winRatio: number;
    wins: number;
    matchesPlayed: number;
}

export type TimeScope = 'Daily' | 'Weekly' | 'Monthly' | 'All-Time';
type CountryScope = 'Global' | 'Country';

interface GetLeaderboardOptions {
    timeScope: TimeScope;
    countryScope: CountryScope;
    country?: string;
}

// Helper for 'All-Time' scope.
function processUserDocsToRankedList(docs: any[]): Omit<RankedPlayer, 'rank'>[] {
    return docs.map(doc => {
        const data = doc.data() as User;
        const stats = data.stats || { wins: 0, matchesPlayed: 0 };
        const winRatio = stats.matchesPlayed > 0 ? stats.wins / stats.matchesPlayed : 0;
        return {
            id: doc.id,
            name: data.displayName,
            winRatio,
            wins: stats.wins,
            matchesPlayed: stats.matchesPlayed,
        };
    });
}


export async function getLeaderboard(options: GetLeaderboardOptions): Promise<RankedPlayer[]> {
    const { timeScope, countryScope, country } = options;

    // --- All-Time Leaderboard ---
    // This is the most efficient query, reading from aggregated user stats.
    if (timeScope === 'All-Time') {
        const usersRef = collection(db, 'users');
        const constraints = [
            orderBy('stats.wins', 'desc'),
            orderBy('stats.matchesPlayed', 'asc'),
            limit(100)
        ];
        const q = countryScope === 'Country' && country
            ? query(usersRef, where('country', '==', country), ...constraints)
            : query(usersRef, ...constraints);
        
        const querySnapshot = await getDocs(q);
        const playersWithStats = processUserDocsToRankedList(querySnapshot.docs);
        return playersWithStats.map((player, index) => ({ ...player, rank: index + 1 }));
    }

    // --- Time-Scoped Leaderboards (Daily, Weekly, Monthly) ---
    // This requires querying raw match data and aggregating on the client.
    // It's less scalable but necessary without backend aggregation functions.
    const startDate = new Date();
    if (timeScope === 'Daily') startDate.setDate(startDate.getDate() - 1);
    if (timeScope === 'Weekly') startDate.setDate(startDate.getDate() - 7);
    if (timeScope === 'Monthly') startDate.setMonth(startDate.getMonth() - 1);
    
    const matchHistoryRef = collection(db, 'matchHistory');
    const queryConstraints: any[] = [
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc'),
        limit(1000) // Limit query to prevent excessive data transfer
    ];

    if (countryScope === 'Country' && country) {
        queryConstraints.push(where('country', '==', country));
    }

    const q = query(matchHistoryRef, ...queryConstraints);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return [];
    }

    // Aggregate results client-side
    const playerStats = new Map<string, { id: string; name: string; wins: number; matchesPlayed: number; }>();
    snapshot.docs.forEach(doc => {
        const match = doc.data() as MatchHistory;
        const stats = playerStats.get(match.userId) || { id: match.userId, name: match.displayName, wins: 0, matchesPlayed: 0 };
        
        stats.matchesPlayed += 1;
        if (match.isWin) {
            stats.wins += 1;
        }
        playerStats.set(match.userId, stats);
    });

    // Calculate win ratios and sort
    const rankedList = Array.from(playerStats.values())
        .map(p => ({
            ...p,
            winRatio: p.matchesPlayed > 0 ? p.wins / p.matchesPlayed : 0,
        }))
        .sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            return a.matchesPlayed - b.matchesPlayed;
        });
        
    // Assign ranks and return top 100
    return rankedList.slice(0, 100).map((player, index) => ({ ...player, rank: index + 1 }));
}


export async function updatePlayerStats(
    userId: string,
    isWin: boolean,
    rank: number,
    country: string,
    displayName: string
): Promise<void> {
    const batch = writeBatch(db);

    // 1. Update aggregate stats on user doc (for All-Time leaderboard)
    const userRef = doc(db, 'users', userId);
    const statsUpdate = {
        'stats.matchesPlayed': increment(1),
        'stats.wins': increment(isWin ? 1 : 0)
    };
    batch.update(userRef, statsUpdate);

    // 2. Create a new document in matchHistory for time-scoped leaderboards
    const matchHistoryRef = doc(collection(db, 'matchHistory'));
    const newMatchHistory: Omit<MatchHistory, 'id'> = {
        userId,
        displayName,
        country,
        isWin,
        rank,
        timestamp: serverTimestamp()
    };
    batch.set(matchHistoryRef, newMatchHistory);

    await batch.commit();
}


export async function getPlayerRanks(userId: string, country: string): Promise<{ global: number; country: number; }> {
    // This is computationally expensive and not ideal for a large-scale app.
    // In a real production app, ranks would be pre-calculated.
    // This function calculates All-Time rank on-demand.

    const usersRef = collection(db, 'users');
    const constraints = [orderBy('stats.wins', 'desc'), orderBy('stats.matchesPlayed', 'asc')];

    // Get global rank
    const globalQuery = query(usersRef, ...constraints);
    const globalSnapshot = await getDocs(globalQuery);
    const globalRank = globalSnapshot.docs.findIndex(doc => doc.id === userId) + 1;

    // Get country rank
    const countryQuery = query(usersRef, where('country', '==', country), ...constraints);
    const countrySnapshot = await getDocs(countryQuery);
    const countryRank = countrySnapshot.docs.findIndex(doc => doc.id === userId) + 1;

    return {
        global: globalRank > 0 ? globalRank : globalSnapshot.size,
        country: countryRank > 0 ? countryRank : countrySnapshot.size
    };
}
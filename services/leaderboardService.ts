import { collection, query, where, getDocs, orderBy, limit, increment, doc, writeBatch, serverTimestamp, documentId } from 'firebase/firestore';
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
        
        let querySnapshot;

        if (countryScope === 'Country' && country) {
            // When filtering by country, we can't also sort by a different field ('stats.wins') without a composite index.
            // The solution is to fetch all users for that country and perform the sorting on the client-side.
            const q = query(usersRef, where('country', '==', country));
            querySnapshot = await getDocs(q);
        } else {
            // For the global leaderboard, we can use the simple index on 'stats.wins' to sort on the server.
            const q = query(usersRef, 
                orderBy('stats.wins', 'desc'),
                limit(100)
            );
            querySnapshot = await getDocs(q);
        }
        
        const playersWithStats = processUserDocsToRankedList(querySnapshot.docs);

        // Sort on the client. This applies the primary sort for country-scoped queries 
        // and the tie-breaker logic for all queries.
        playersWithStats.sort((a, b) => {
            if (b.wins !== a.wins) {
                return b.wins - a.wins;
            }
            return a.matchesPlayed - b.matchesPlayed;
        });

        // Slice to get the top 100 *after* sorting. For the global query, this is redundant
        // but harmless. For the country query, it's essential.
        return playersWithStats.slice(0, 100).map((player, index) => ({ ...player, rank: index + 1 }));
    }


    // --- Time-Scoped Leaderboards (Daily, Weekly, Monthly) ---
    // This requires querying raw match data, aggregating on the client, and then fetching current user data.
    const startDate = new Date();
    if (timeScope === 'Daily') startDate.setDate(startDate.getDate() - 1);
    if (timeScope === 'Weekly') startDate.setDate(startDate.getDate() - 7);
    if (timeScope === 'Monthly') startDate.setMonth(startDate.getMonth() - 1);
    
    const matchHistoryRef = collection(db, 'matchHistory');
    const q = query(
        matchHistoryRef,
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc'),
        limit(2000) // Fetch a larger sample to ensure enough data for country leaderboards
    );
    
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return [];
    }
    
    let docs = snapshot.docs;

    // If a country is specified, filter the results locally.
    if (countryScope === 'Country' && country) {
        docs = docs.filter(doc => doc.data().country === country);
    }

    // Aggregate stats from match history, keyed by userId
    const playerStats = new Map<string, { wins: number; matchesPlayed: number; }>();
    docs.forEach(doc => {
        const match = doc.data() as MatchHistory;
        // Robustness: Only process records that have a valid userId.
        if (match.userId) {
            const stats = playerStats.get(match.userId) || { wins: 0, matchesPlayed: 0 };
            
            stats.matchesPlayed += 1;
            if (match.isWin) {
                stats.wins += 1;
            }
            playerStats.set(match.userId, stats);
        }
    });

    // Sort aggregated stats to find the top players by ID
    const sortedPlayerIds = Array.from(playerStats.entries())
        .map(([userId, stats]) => ({ userId, ...stats }))
        .sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            return a.matchesPlayed - b.matchesPlayed;
        })
        .slice(0, 100)
        .map(p => p.userId);

    if (sortedPlayerIds.length === 0) {
        return [];
    }
    
    // Fetch the current profiles for the top players to get up-to-date display names.
    // Firestore 'in' queries are limited to 30 items, so we chunk the IDs.
    const userProfiles = new Map<string, { displayName: string }>();
    const idChunks = [];
    for (let i = 0; i < sortedPlayerIds.length; i += 30) {
        idChunks.push(sortedPlayerIds.slice(i, i + 30));
    }

    const usersRef = collection(db, 'users');
    await Promise.all(idChunks.map(async (chunk) => {
        if (chunk.length === 0) return;
        const usersQuery = query(usersRef, where(documentId(), 'in', chunk));
        const usersSnapshot = await getDocs(usersQuery);
        usersSnapshot.forEach(doc => {
            const userData = doc.data() as User;
            userProfiles.set(doc.id, { displayName: userData.displayName });
        });
    }));

    // Combine the aggregated stats with the fresh profile data to build the final ranked list.
    const rankedList: RankedPlayer[] = [];
    sortedPlayerIds.forEach((userId, index) => {
        const stats = playerStats.get(userId);
        const profile = userProfiles.get(userId);

        // A profile might not be found if the user deleted their account.
        if (stats && profile) {
            rankedList.push({
                id: userId,
                name: profile.displayName,
                rank: index + 1,
                wins: stats.wins,
                matchesPlayed: stats.matchesPlayed,
                winRatio: stats.matchesPlayed > 0 ? stats.wins / stats.matchesPlayed : 0,
            });
        }
    });
        
    return rankedList;
}


export async function updatePlayerStats(
    userId: string,
    isWin: boolean,
    rank: number,
    country: string,
    eurosEarned: number,
    isLive: boolean = false
): Promise<void> {
    const batch = writeBatch(db);

    // 1. Update aggregate stats on user doc
    const userRef = doc(db, 'users', userId);
    
    const updates: any = {
        'euros': increment(eurosEarned)
    };

    // Only track competitive stats (wins/matchesPlayed) for live matches
    if (isLive) {
        updates['stats.matchesPlayed'] = increment(1);
        updates['stats.wins'] = increment(isWin ? 1 : 0);

        // 2. Create a new document in matchHistory for time-scoped leaderboards
        const matchHistoryRef = doc(collection(db, 'matchHistory'));
        const newMatchHistory: Omit<MatchHistory, 'id'> = {
            userId,
            country,
            isWin,
            rank,
            timestamp: serverTimestamp()
        };
        batch.set(matchHistoryRef, newMatchHistory);
    }

    batch.update(userRef, updates);
    await batch.commit();
}


export async function getPlayerRanks(userId: string, country: string): Promise<{ global: number; country: number; }> {
    // This is computationally expensive and not ideal for a large-scale app.
    // In a real production app, ranks would be pre-calculated.
    // This function calculates All-Time rank on-demand.

    const usersRef = collection(db, 'users');

    // --- Get global rank ---
    const globalQuery = query(usersRef, orderBy('stats.wins', 'desc'));
    const globalSnapshot = await getDocs(globalQuery);
    
    // Client-side sort before finding index (to handle tie-breakers)
    const sortedGlobalDocs = [...globalSnapshot.docs].sort((docA, docB) => {
        const a = docA.data().stats || { wins: 0, matchesPlayed: 0 };
        const b = docB.data().stats || { wins: 0, matchesPlayed: 0 };
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.matchesPlayed - b.matchesPlayed;
    });
    const globalRank = sortedGlobalDocs.findIndex(doc => doc.id === userId) + 1;


    // --- Get country rank ---
    // Fetch all users for the country without server-side sorting to avoid composite index error.
    const countryQuery = query(usersRef, where('country', '==', country));
    const countrySnapshot = await getDocs(countryQuery);

    // Client-side sort to determine rank.
    const sortedCountryDocs = [...countrySnapshot.docs].sort((docA, docB) => {
        const a = docA.data().stats || { wins: 0, matchesPlayed: 0 };
        const b = docB.data().stats || { wins: 0, matchesPlayed: 0 };
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.matchesPlayed - b.matchesPlayed;
    });
    const countryRank = sortedCountryDocs.findIndex(doc => doc.id === userId) + 1;

    return {
        global: globalRank > 0 ? globalRank : sortedGlobalDocs.length,
        country: countryRank > 0 ? countryRank : sortedCountryDocs.length
    };
}
import React, { useState, useMemo } from 'react';
import { Card } from './common/Card';
import { Header } from './common/Header';

interface LeaderboardScreenProps {
  onBack: () => void;
}

// --- MOCK DATA GENERATION ---
// This now includes match history with dates to allow for time-based filtering.

interface PlayerMatch {
  won: boolean;
  date: Date;
}

interface PlayerData {
  name: string;
  matchHistory: PlayerMatch[];
}

// Helper to generate dynamic player data with match history over a specified number of days
const generatePlayerHistory = (name: string, avgMatches: number, winRate: number, daysRange: number): PlayerData => {
    const matchHistory: PlayerMatch[] = [];
    const now = new Date();
    const numMatches = Math.floor(avgMatches * (0.8 + Math.random() * 0.4)); // +/- 20% variance

    for (let i = 0; i < numMatches; i++) {
        const date = new Date(now.getTime() - Math.random() * daysRange * 24 * 60 * 60 * 1000);
        matchHistory.push({
            won: Math.random() < winRate,
            date,
        });
    }

    return { name, matchHistory };
};

// Base stats for our mock players
const MOCK_RAW_PLAYERS_DATA = [
  { name: 'AnglerPro', avgMatches: 15, winRate: 8/15 },
  { name: 'FishMasterFlex', avgMatches: 150, winRate: 120/150 },
  { name: 'RiverKing', avgMatches: 110, winRate: 95/110 },
  { name: 'CastingQueen', avgMatches: 100, winRate: 0.8 },
  { name: 'TheBaiter', avgMatches: 105, winRate: 0.71 },
  { name: 'ReelDeal', avgMatches: 90, winRate: 0.66 },
  { name: 'WaterWhisperer', avgMatches: 160, winRate: 0.68 },
  { name: 'LureLord', avgMatches: 70, winRate: 0.71 },
  { name: 'SilentStriker', avgMatches: 120, winRate: 0.73 },
  { name: 'DepthDweller', avgMatches: 85, winRate: 0.53 },
  { name: 'PikePro', avgMatches: 180, winRate: 0.72 },
  { name: 'TackleTitan', avgMatches: 95, winRate: 0.73 },
  { name: 'BobberBoss', avgMatches: 60, winRate: 0.5 },
  { name: 'HookedHero', avgMatches: 130, winRate: 0.7 },
  { name: 'MarinaMaverick', avgMatches: 115, winRate: 0.56 },
];

// Generate the full dataset. daysRange=400 ensures we have data older than a year.
const MOCK_HUMAN_PLAYERS: PlayerData[] = MOCK_RAW_PLAYERS_DATA.map(p => generatePlayerHistory(p.name, p.avgMatches, p.winRate, 400));


type LeaderboardTab = 'Global' | 'Country';
type TimeScope = 'All-Time' | 'Weekly' | 'Monthly' | 'Yearly';

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('Country');
  const [activeTimeScope, setActiveTimeScope] = useState<TimeScope>('Weekly');

  const rankedPlayers = useMemo(() => {
    let startDate: Date | null = null;
    
    // Set the start date for filtering based on the selected time scope
    if (activeTimeScope !== 'All-Time') {
        const tempDate = new Date();
        switch(activeTimeScope) {
            case 'Weekly':
                tempDate.setDate(tempDate.getDate() - 7);
                break;
            case 'Monthly':
                tempDate.setDate(tempDate.getDate() - 30); // Use 30 days for consistency
                break;
            case 'Yearly':
                tempDate.setFullYear(tempDate.getFullYear() - 1);
                break;
        }
        startDate = tempDate;
    }

    const playersWithStats = MOCK_HUMAN_PLAYERS.map(player => {
        const filteredHistory = startDate
          ? player.matchHistory.filter(match => match.date >= startDate!)
          : player.matchHistory;

        const wins = filteredHistory.filter(match => match.won).length;
        const matchesPlayed = filteredHistory.length;
        const winPercentage = matchesPlayed > 0 ? wins / matchesPlayed : 0;
        const points = wins * winPercentage;

        return { name: player.name, points, wins, matchesPlayed };
      });
      
    return playersWithStats
      .filter(p => p.matchesPlayed > 0) // Only show players with matches in the period
      .sort((a, b) => b.points - a.points) // Sort in descending order
      .slice(0, 10)
      .map((player, index) => ({ ...player, rank: index + 1 }));
      
  }, [activeTimeScope]); // Recalculate when the time scope changes

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Header title="Leaderboard" onBack={onBack} />
      
      <div className="flex border-b border-gray-700 mb-2">
        {(['Country', 'Global'] as LeaderboardTab[]).map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-center font-semibold transition-colors ${activeTab === tab ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
            >
                {tab}
            </button>
        ))}
      </div>

      <div className="flex justify-around bg-gray-800 rounded-lg p-1 mb-4">
        {(['Weekly', 'Monthly', 'Yearly', 'All-Time'] as TimeScope[]).map(scope => (
            <button
                key={scope}
                onClick={() => setActiveTimeScope(scope)}
                className={`flex-1 py-1 px-2 text-center text-sm font-semibold rounded-md transition-colors ${activeTimeScope === scope ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
                {scope}
            </button>
        ))}
      </div>
      
      <Card>
        {rankedPlayers.length > 0 ? (
            <ul>
                {rankedPlayers.map((player) => (
                    <li key={player.rank} className={`flex items-center justify-between py-1 px-2 rounded-lg ${player.name === 'AnglerPro' ? 'bg-blue-900/50' : ''}`}>
                       <div className="flex items-center">
                            <span className="font-bold text-lg w-8 text-center text-gray-400">{player.rank}</span>
                            <span className="ml-4 font-semibold">{player.name}</span>
                       </div>
                       <span className="font-bold text-blue-400">{player.points.toFixed(2)} pts</span>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-center text-gray-500 py-8">No players found for this period.</p>
        )}
      </Card>
    </div>
  );
};
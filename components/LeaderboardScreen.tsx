import React, { useState, useEffect } from 'react';
import { Card } from './common/Card';
import { Header } from './common/Header';
import { getLeaderboard, type RankedPlayer, type TimeScope } from '../services/leaderboardService';
import type { User } from '../types';

interface LeaderboardScreenProps {
  onBack: () => void;
  user: User;
}

type CountryScope = 'Global' | 'Country';
const TIME_SCOPES: TimeScope[] = ['Daily', 'Weekly', 'Monthly', 'All-Time'];

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack, user }) => {
  const [countryScope, setCountryScope] = useState<CountryScope>('Country');
  const [timeScope, setTimeScope] = useState<TimeScope>('Weekly');
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
        setIsLoading(true);
        try {
            const rankedPlayers = await getLeaderboard({
                countryScope: countryScope,
                timeScope: timeScope,
                country: user.country,
            });
            setPlayers(rankedPlayers);
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
            setPlayers([]);
        } finally {
            setIsLoading(false);
        }
    };

    fetchLeaderboard();
  }, [countryScope, timeScope, user.country]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Header title="Leaderboard" onBack={onBack} />
      
      <div className="flex border-b border-gray-700 mb-4">
        {(['Country', 'Global'] as CountryScope[]).map(tab => (
            <button
                key={tab}
                onClick={() => setCountryScope(tab)}
                className={`flex-1 py-2 text-center font-semibold transition-colors ${countryScope === tab ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
            >
                {tab}
            </button>
        ))}
      </div>

      <div className="flex justify-center mb-4 bg-gray-800 p-1 rounded-lg">
          {TIME_SCOPES.map(scope => (
              <button 
                key={scope}
                onClick={() => setTimeScope(scope)}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${timeScope === scope ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                  {scope}
              </button>
          ))}
      </div>
      
      <Card>
        {isLoading ? (
            <div className="text-center text-gray-400 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                Loading rankings...
            </div>
        ) : players.length > 0 ? (
            <ul>
                {players.map((player) => (
                    <li key={player.rank} className={`flex items-center justify-between py-1 px-2 rounded-lg ${player.id === user.id ? 'bg-blue-900/50' : ''}`}>
                       <div className="flex items-center">
                            <span className="font-bold text-lg w-8 text-center text-gray-400">{player.rank}</span>
                            <span className="ml-4 font-semibold">{player.name}</span>
                       </div>
                        <div className="text-right">
                           <span className="font-bold text-blue-400">{(player.winRatio * 100).toFixed(0)}% WR</span>
                           <span className="text-xs text-gray-400 ml-2">({player.wins}/{player.matchesPlayed})</span>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-center text-gray-500 py-8">No match data for this period.</p>
        )}
      </Card>
    </div>
  );
};
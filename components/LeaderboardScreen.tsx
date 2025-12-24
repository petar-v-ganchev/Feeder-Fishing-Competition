import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './common/Card';
import { Header } from './common/Header';
import { getLeaderboard, type RankedPlayer, type TimeScope } from '../services/leaderboardService';
import type { User } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface LeaderboardScreenProps {
  onBack: () => void;
  user: User;
}

type CountryScope = 'Global' | 'Country';

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack, user }) => {
  const { t } = useTranslation();
  const [countryScope, setCountryScope] = useState<CountryScope>('Country');
  const [timeScope, setTimeScope] = useState<TimeScope>('All-Time');
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const TIME_SCOPES = useMemo<{label: string, value: TimeScope}[]>(() => [
    { label: t('leaderboard.daily'), value: 'Daily' },
    { label: t('leaderboard.weekly'), value: 'Weekly' },
    { label: t('leaderboard.monthly'), value: 'Monthly' },
    { label: t('leaderboard.all_time'), value: 'All-Time' },
  ], [t]);

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
      <Header title={t('leaderboard.title')} onBack={onBack} />
      
      <div className="flex border-b border-gray-700 mb-4">
        {(['Country', 'Global'] as const).map(tab => (
            <button
                key={tab}
                onClick={() => setCountryScope(tab as CountryScope)}
                className={`flex-1 py-2 text-center font-semibold transition-colors ${countryScope === tab ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
            >
                {tab === 'Country' ? t('leaderboard.country') : t('leaderboard.global')}
            </button>
        ))}
      </div>

      <div className="flex justify-center mb-4 bg-gray-800 p-1 rounded-lg">
          {TIME_SCOPES.map(scope => (
              <button 
                key={scope.value}
                onClick={() => setTimeScope(scope.value)}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${timeScope === scope.value ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                  {scope.label}
              </button>
          ))}
      </div>
      
      <Card>
        {isLoading ? (
            <div className="text-center text-gray-400 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                {t('leaderboard.loading')}
            </div>
        ) : players.length > 0 ? (
            <ul>
                {players.map((player) => (
                    <li key={player.id} className={`flex items-center justify-between py-1 px-2 rounded-lg ${player.id === user.id ? 'bg-blue-900/50' : ''}`}>
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
            <p className="text-center text-gray-500 py-8">{t('leaderboard.empty')}</p>
        )}
      </Card>
    </div>
  );
};
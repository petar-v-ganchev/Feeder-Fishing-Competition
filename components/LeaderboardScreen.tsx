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
    <div className="flex flex-col min-h-screen bg-white">
      <Header title={t('leaderboard.title')} onBack={onBack} />
      
      <div className="px-6 flex flex-col flex-grow pb-6">
        <div className="flex border-b border-outline mb-4">
          {(['Country', 'Global'] as const).map(tab => (
              <button
                  key={tab}
                  onClick={() => setCountryScope(tab as CountryScope)}
                  className={`flex-1 py-3 text-center text-xs font-bold transition-all ${countryScope === tab ? 'text-primary border-b-2 border-primary' : 'text-onSurfaceVariant'}`}
              >
                  {tab === 'Country' ? t('leaderboard.country') : t('leaderboard.global')}
              </button>
          ))}
        </div>

        <div className="flex justify-center mb-6 bg-slate-50 p-1 rounded-medium gap-1">
            {TIME_SCOPES.map(scope => (
                <button 
                  key={scope.value}
                  onClick={() => setTimeScope(scope.value)}
                  className={`flex-1 px-2 py-1.5 text-[9px] font-black rounded-small transition-all ${timeScope === scope.value ? 'bg-primary text-white' : 'text-onSurfaceVariant hover:bg-slate-200'}`}>
                    {scope.label}
                </button>
            ))}
        </div>
        
        <Card className="flex-grow overflow-hidden flex flex-col p-0 border-none bg-slate-50 shadow-inner">
          {isLoading ? (
              <div className="flex-grow flex flex-col items-center justify-center text-onSurfaceVariant py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-[10px] font-bold">{t('leaderboard.loading')}</p>
              </div>
          ) : players.length > 0 ? (
              <ul className="flex-grow overflow-y-auto custom-scrollbar">
                  {players.map((player) => (
                      <li key={player.id} className={`flex items-center justify-between py-3 px-4 border-b border-white/50 last:border-0 ${player.id === user.id ? 'bg-primary/5' : ''}`}>
                         <div className="flex items-center gap-4">
                              <span className={`font-black text-sm w-6 text-center ${player.rank <= 3 ? 'text-primary' : 'text-onSurfaceVariant/50'}`}>{player.rank}</span>
                              <span className={`text-sm font-bold ${player.id === user.id ? 'text-primary' : 'text-onSurface'}`}>{player.name}</span>
                         </div>
                          <div className="text-right">
                             <span className="font-bold text-xs text-primary">{(player.winRatio * 100).toFixed(0)}% WR</span>
                             <span className="text-[9px] font-black text-onSurfaceVariant ml-2">({player.wins}/{player.matchesPlayed})</span>
                          </div>
                      </li>
                  ))}
              </ul>
          ) : (
              <p className="flex-grow flex items-center justify-center text-onSurfaceVariant py-8 text-[10px] font-bold opacity-50">{t('leaderboard.empty')}</p>
          )}
        </Card>
      </div>
    </div>
  );
};
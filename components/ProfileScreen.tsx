import React, { useState, useEffect } from 'react';
import { Screen, type User } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Header } from './common/Header';
import { getPlayerRanks } from '../services/leaderboardService';
import { useTranslation } from '../i18n/LanguageContext';

interface ProfileScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  onBack: () => void;
}

const StatItem: React.FC<{label: string, value: string | number, isLoading?: boolean}> = ({label, value, isLoading}) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
        <span className="text-gray-500 text-xs font-semibold">{label}</span>
        {isLoading ? (
            <div className="h-6 w-16 bg-slate-100 rounded animate-pulse"></div>
        ) : (
            <span className="font-bold text-lg text-primary">{value}</span>
        )}
    </div>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onNavigate, onLogout, onBack }) => {
  const { t } = useTranslation();
  const [ranks, setRanks] = useState<{global: number, country: number} | null>(null);
  const [isLoadingRanks, setIsLoadingRanks] = useState(true);

  useEffect(() => {
      const fetchRanks = async () => {
          setIsLoadingRanks(true);
          const playerRanks = await getPlayerRanks(user.id, user.country);
          setRanks(playerRanks);
          setIsLoadingRanks(false);
      };
      fetchRanks();
  }, [user.id, user.country]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title={t('profile.title')} onBack={onBack} />
      
      <div className="px-6 flex flex-col flex-grow pb-6">
        <Card className="mb-6 bg-slate-50 border-none shadow-sm">
          <div className="flex items-center space-x-4">
              {user.avatar.startsWith('data:image/') ? (
                  <img src={user.avatar} alt="User avatar" className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
              ) : (
                  <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center font-bold text-3xl">
                      {user.avatar}
                  </div>
              )}
              <div>
                  <h2 className="text-2xl font-bold text-primary">{user.displayName}</h2>
                  <p className="text-onSurfaceVariant text-xs font-medium">{user.email}</p>
                  <p className="text-onSurfaceVariant text-[10px] font-bold mt-1">{user.country}</p>
              </div>
          </div>
        </Card>
        
        <Card className="flex-grow mb-6">
          <h3 className="text-sm font-bold text-primary mb-4 border-b border-outline pb-2">{t('profile.stats')}</h3>
          <StatItem label={t('profile.matches_played')} value={user.stats.matchesPlayed} />
          <StatItem label={t('profile.wins')} value={user.stats.wins} />
          <StatItem label={t('profile.win_rate')} value={`${user.stats.matchesPlayed > 0 ? ((user.stats.wins / user.stats.matchesPlayed) * 100).toFixed(0) : 0}%`} />
          <StatItem label={t('profile.global_rank')} value={ranks ? `#${ranks.global}` : '-'} isLoading={isLoadingRanks} />
          <StatItem label={t('profile.country_rank')} value={ranks ? `#${ranks.country}` : '-'} isLoading={isLoadingRanks} />
        </Card>

        <div className="mt-auto flex flex-col gap-3">
          <Button onClick={() => onNavigate(Screen.EditProfile)} variant="primary">
            {t('profile.edit')}
          </Button>
          <Button onClick={onLogout} variant="secondary">
            {t('profile.logout')}
          </Button>
        </div>
      </div>
    </div>
  );
};
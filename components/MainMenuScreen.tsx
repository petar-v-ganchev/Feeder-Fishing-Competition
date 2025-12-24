import React from 'react';
import { Screen, type User, type DailyChallenge } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { useTranslation } from '../i18n/LanguageContext';

interface MainMenuScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  dailyChallenge: DailyChallenge | null;
  onClaimReward: () => void;
  isChallengeLoading: boolean;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ user, onNavigate, dailyChallenge, onClaimReward, isChallengeLoading }) => {
  const { t, formatCurrency } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen p-6 bg-white text-onSurface">
      <header className="py-6 mb-6 text-center">
        <p className="text-[10px] font-bold text-onSurfaceVariant mb-1">{t('main.welcome')}</p>
        <h1 className="text-2xl font-bold truncate max-w-full text-primary">{user.displayName}</h1>
      </header>
      
      <div className="flex-grow flex flex-col gap-4 w-full max-w-md mx-auto">
        <div className="bg-primary p-6 rounded-medium text-white shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold opacity-70">{t('shop.balance')}</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(user.euros)}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-full">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
          </div>
        </div>

        {dailyChallenge && (
            <Card variant="tonal" className="border-l-4 border-l-secondary">
                <div className="flex justify-between items-start">
                  <div className="flex-grow pr-2">
                    <p className="text-[10px] font-bold text-secondary mb-1">{t('main.challenge.title')}</p>
                    <p className="text-sm font-semibold leading-tight">{dailyChallenge.description}</p>
                  </div>
                  <p className="text-xs font-bold text-secondary whitespace-nowrap">+ {formatCurrency(dailyChallenge.reward)}</p>
                </div>
                {dailyChallenge.isCompleted && !dailyChallenge.isClaimed && (
                    <Button onClick={onClaimReward} className="h-8 text-[10px] mt-3">{t('main.challenge.claim')}</Button>
                )}
            </Card>
        )}

        <div className="grid grid-cols-1 gap-3 mt-4">
            <Button onClick={() => onNavigate(Screen.Matchmaking)} className="h-14">{t('main.practice')}</Button>
            <Button onClick={() => onNavigate(Screen.LiveMatchmaking)} variant="secondary" className="h-14 border-primary text-primary">{t('main.live')}</Button>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button onClick={() => onNavigate(Screen.Inventory)} variant="secondary" className="h-12 text-xs">{t('main.inventory')}</Button>
              <Button onClick={() => onNavigate(Screen.Leaderboard)} variant="secondary" className="h-12 text-xs">{t('main.leaderboard')}</Button>
              <Button onClick={() => onNavigate(Screen.Shop)} variant="secondary" className="h-12 text-xs">{t('main.shop')}</Button>
              <Button onClick={() => onNavigate(Screen.Profile)} variant="secondary" className="h-12 text-xs">{t('main.profile')}</Button>
            </div>
        </div>
      </div>
    </div>
  );
};
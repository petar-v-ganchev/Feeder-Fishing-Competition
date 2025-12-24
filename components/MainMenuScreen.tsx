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

const ChallengeLoadingSkeleton: React.FC = () => (
  <Card className="mb-6 border-l-4 border-gray-600 animate-pulse">
    <div className="h-5 bg-gray-700 rounded w-1/3 mb-3"></div>
    <div className="h-4 bg-gray-700 rounded w-full mb-4"></div>
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-24"></div>
        <div className="h-4 bg-gray-700 rounded w-20"></div>
      </div>
      <div className="h-10 bg-gray-700 rounded w-28"></div>
    </div>
  </Card>
);

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ user, onNavigate, dailyChallenge, onClaimReward, isChallengeLoading }) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col justify-center min-h-screen">
      <header className="flex justify-between items-center mb-6 pt-4">
        <div>
          <h1 className="text-2xl font-bold">{t('main.welcome', { name: user.displayName })}</h1>
        </div>
      </header>
      
      {isChallengeLoading ? (
        <ChallengeLoadingSkeleton />
      ) : dailyChallenge && (
        <Card className="mb-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-bold text-blue-400 mb-2">{t('main.challenge.title')}</h2>
          <p className="text-gray-300 mb-3">{dailyChallenge.description}</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">{t('main.challenge.reward')}: <span className="font-bold text-yellow-400">{dailyChallenge.reward} {t('common.currency')}</span></p>
              <p className="text-sm text-gray-400">{t('main.challenge.progress')}: {dailyChallenge.progress}/{dailyChallenge.targetCount}</p>
            </div>
            {dailyChallenge.isCompleted && !dailyChallenge.isClaimed && (
                <Button onClick={onClaimReward} className="!w-auto px-6">{t('main.challenge.claim')}</Button>
            )}
            {dailyChallenge.isClaimed && (
                 <p className="text-green-400 font-semibold">{t('main.challenge.completed')}</p>
            )}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <Button onClick={() => onNavigate(Screen.Matchmaking)} className="h-14 text-lg">{t('main.practice')}</Button>
        <Button onClick={() => onNavigate(Screen.LiveMatchmaking)} className="h-14 text-lg">{t('main.live')}</Button>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => onNavigate(Screen.Inventory)} variant="secondary" className="py-4">{t('main.inventory')}</Button>
          <Button onClick={() => onNavigate(Screen.Leaderboard)} variant="secondary" className="py-4">{t('main.leaderboard')}</Button>
          <Button onClick={() => onNavigate(Screen.Shop)} variant="secondary" className="py-4">{t('main.shop')}</Button>
          <Button onClick={() => onNavigate(Screen.Profile)} variant="secondary" className="py-4">{t('main.profile')}</Button>
        </div>
      </div>
    </div>
  );
};
import React, { useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

interface MatchmakingScreenProps {
  onMatchFound: () => void;
}

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({ onMatchFound }) => {
  const { t } = useTranslation();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onMatchFound();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onMatchFound]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <h1 className="text-3xl font-black mb-4 animate-pulse text-primary tracking-tighter">{t('matchmaking.finding')}</h1>
      <p className="text-onSurfaceVariant font-medium text-sm">{t('matchmaking.preparing')}</p>
    </div>
  );
};
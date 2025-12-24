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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4 animate-pulse">{t('matchmaking.finding')}</h1>
      <p className="text-gray-400">{t('matchmaking.preparing')}</p>
    </div>
  );
};
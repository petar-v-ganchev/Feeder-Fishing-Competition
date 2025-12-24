import React from 'react';
import type { MatchResult, MatchParticipant } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { useTranslation } from '../i18n/LanguageContext';

interface ResultsScreenProps {
  result: MatchResult;
  onContinue: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, onContinue }) => {
  const { t } = useTranslation();
  
  const getWeightDisplay = (participant: MatchParticipant) => {
    return `${participant.totalWeight.toFixed(2)} ${t('common.kg')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Card className="text-left p-4">
            <h2 className="text-xl font-bold mb-2 sticky top-0 bg-gray-800 py-1 border-b border-gray-700 -mx-4 px-4">{t('results.title')}</h2>
            <ul>
                {result.standings.map((p, index) => (
                    <li key={p.id} className={`flex justify-between items-center px-2 py-1 rounded ${!p.isBot ? 'bg-blue-800 border border-blue-600' : ''}`}>
                        <div className="flex items-center">
                            <span className="font-bold w-8 text-center text-gray-400">{index + 1}</span>
                            <span className="ml-2 truncate font-semibold">{p.name}</span>
                        </div>
                        <span className="font-bold text-blue-400">{getWeightDisplay(p)}</span>
                    </li>
                ))}
            </ul>
        </Card>
        
        <Card className="bg-gray-900 mt-6 mb-8 p-2">
            <h2 className="font-semibold text-lg">{t('results.rewards')}</h2>
            <p className="text-yellow-400 text-lg font-semibold">+{result.eurosEarned} {t('common.currency')}</p>
        </Card>

        <Button onClick={onContinue}>{t('results.back')}</Button>
      </div>
    </div>
  );
};

import React from 'react';
import type { MatchResult, MatchParticipant } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Header } from './common/Header';
import { useTranslation } from '../i18n/LanguageContext';

interface ResultsScreenProps {
  result: MatchResult;
  onContinue: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, onContinue }) => {
  const { t, formatCurrency } = useTranslation();
  
  const getWeightDisplay = (participant: MatchParticipant) => {
    return `${participant.totalWeight.toFixed(2)} ${t('common.kg')}`;
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Header title={t('results.title')} />
      
      <div className="px-6 flex flex-col flex-grow pb-6 overflow-hidden">
        {/* Ranking table - uses flex-grow and min-h-0 to ensure it takes available space and scrolls internally */}
        <Card className="flex-grow flex flex-col min-h-0 bg-white shadow-sm border-outline overflow-hidden mb-4 p-0">
            <ul className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-1">
                {result.standings.map((p, index) => (
                    <li 
                      key={p.id} 
                      className={`flex justify-between items-center px-3 py-2 rounded-medium transition-colors ${
                        !p.isBot 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-slate-50 border border-transparent'
                      }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`font-black w-4 text-center text-[10px] ${!p.isBot ? 'text-primary' : 'text-onSurfaceVariant/50'}`}>
                              {index + 1}
                            </span>
                            <span className={`truncate font-bold text-sm ${!p.isBot ? 'text-primary' : 'text-onSurface'}`}>
                              {p.name}
                            </span>
                        </div>
                        <span className={`font-black text-sm ${!p.isBot ? 'text-primary' : 'text-onSurfaceVariant'}`}>
                          {getWeightDisplay(p)}
                        </span>
                    </li>
                ))}
            </ul>
        </Card>
        
        {/* Bottom section - stays fixed in view */}
        <div className="flex flex-col gap-3 flex-shrink-0">
            {/* Soft Rewards Tile */}
            <div className="bg-slate-50 border border-outline p-4 rounded-medium flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-onSurfaceVariant uppercase tracking-widest">{t('results.rewards')}</p>
                <p className="text-2xl font-black mt-0.5 text-primary">{formatCurrency(result.eurosEarned)}</p>
              </div>
              <div className="bg-primary/10 p-2.5 rounded-full text-primary">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <Button onClick={onContinue} className="h-12">{t('results.back')}</Button>
        </div>
      </div>
    </div>
  );
};

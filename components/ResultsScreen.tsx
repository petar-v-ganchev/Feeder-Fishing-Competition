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

/**
 * Formats a string to Title Case (e.g., "Hello World").
 * Used for Player Names.
 */
const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

/**
 * Formats a string to Sentence case (e.g., "Hello world").
 */
const toSentenceCase = (str: string): string => {
    if (!str) return '';
    const s = str.trim();
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, onContinue }) => {
  const { t, formatCurrency } = useTranslation();
  
  const playerRank = result.standings.findIndex(p => !p.isBot) + 1;
  const isPodium = playerRank <= 3;
  
  const getWeightDisplay = (participant: MatchParticipant) => {
    return `${participant.totalWeight.toFixed(2)} ${t('common.kg')}`;
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Header title={t('results.title')} />
      
      <div className="px-6 flex flex-col flex-grow pb-6 overflow-hidden">
        {/* Ranking table */}
        <Card className="flex-grow flex flex-col min-h-0 bg-white shadow-sm border-outline overflow-hidden mb-4 p-0">
            <ul className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-1">
                {result.standings.map((p, index) => {
                    const isUser = !p.isBot;
                    return (
                        <li 
                          key={p.id} 
                          className={`flex justify-between items-center px-3 py-2 rounded-medium transition-colors ${
                            isUser 
                              ? 'bg-primary text-white shadow-md' 
                              : 'bg-slate-50 border border-transparent'
                          }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`font-black w-4 text-center text-[10px] ${isUser ? 'text-white' : 'text-onSurfaceVariant/50'}`}>
                                  {index + 1}
                                </span>
                                <span className={`truncate font-bold text-xs ${isUser ? 'text-white' : 'text-onSurface'}`}>
                                  {toTitleCase(p.name)}
                                </span>
                            </div>
                            <span className={`font-black text-xs ${isUser ? 'text-white' : 'text-onSurfaceVariant'}`}>
                              {getWeightDisplay(p)}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </Card>
        
        {/* Bottom section - stays fixed in view */}
        <div className="flex flex-col gap-3 flex-shrink-0">
            {/* Rewards Tile */}
            <div className="bg-slate-50 border border-outline p-4 rounded-medium flex justify-between items-center relative overflow-hidden">
              {isPodium && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[7px] font-black px-2 py-0.5 rounded-bl-sm uppercase tracking-tighter shadow-sm z-10">
                   {t('results.podium_bonus')}
                </div>
              )}
              <div>
                <p className="text-[10px] font-black text-onSurfaceVariant tracking-widest">{toSentenceCase(t('results.rewards'))}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black mt-0.5 text-primary">{formatCurrency(result.eurosEarned)}</p>
                    <p className="text-[9px] font-bold text-onSurfaceVariant">Rank #{playerRank}</p>
                </div>
              </div>
              <div className={`p-2.5 rounded-full ${isPodium ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
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
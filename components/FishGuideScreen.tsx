
import React from 'react';
import { Card } from './common/Card';
import { Header } from './common/Header';
import { MOCK_FISH_SPECIES, type FishSpecies } from '../constants';
import { useTranslation } from '../i18n/LanguageContext';

interface FishGuideScreenProps {
  onBack: () => void;
}

const ParameterBadge: React.FC<{ label: string; values: string[] }> = ({ label, values }) => {
    // Deduplicate values for safe key usage
    const uniqueValues = Array.from(new Set(values));
    
    return (
        <div className="bg-gray-900/50 p-2 rounded border border-gray-700/50">
            <p className="text-[8px] font-bold text-gray-500 tracking-tighter mb-1">{label}</p>
            <div className="flex flex-wrap gap-1">
                {uniqueValues.map((val, idx) => (
                    <span key={`${val}-${idx}`} className="text-[9px] text-gray-200 bg-gray-700 px-1 rounded-sm leading-tight">
                        {val}
                    </span>
                ))}
            </div>
        </div>
    );
};

export const FishGuideScreen: React.FC<FishGuideScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col h-screen overflow-hidden">
      <Header title={t('guide.title')} onBack={onBack} />
      
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-1">
        <div className="space-y-4 pb-8">
            {MOCK_FISH_SPECIES.map((fish: FishSpecies, fishIdx) => {
                const isBig = fish.maxWeight > 2.0;
                
                return (
                    <Card key={`${fish.variant}-${fish.name}-${fishIdx}`} className="p-4 border-l-4 border-l-blue-500">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-black text-blue-400 flex items-center gap-2">
                                    {fish.name}
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${isBig ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                                        {isBig ? t('guide.big_sized') : t('guide.small_sized')}
                                    </span>
                                </h2>
                                <p className="text-xs text-gray-400 font-bold">Range: {fish.minWeight}{t('common.kg')} - {fish.maxWeight}{t('common.kg')}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-gray-500 font-medium block">{t('guide.difficulty')}</span>
                                <div className="flex gap-0.5 justify-end">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <div key={star} className={`w-1.5 h-1.5 rounded-full ${star <= (isBig ? 4 : 2) ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <ParameterBadge label={t('match.tackle.rod')} values={fish.preferredRods} />
                            <ParameterBadge label={t('match.tackle.hook')} values={fish.preferredHooks} />
                            <ParameterBadge label={t('match.tackle.bait')} values={fish.preferredBaits} />
                            <ParameterBadge label={t('match.tackle.groundbait')} values={fish.preferredGroundbaits} />
                            <ParameterBadge label={t('match.tackle.additive')} values={fish.preferredAdditives} />
                            <ParameterBadge label={t('match.tackle.distance')} values={fish.preferredDistance} />
                            <ParameterBadge label={t('match.tackle.interval')} values={fish.preferredIntervals} />
                            <ParameterBadge label={t('match.tackle.feedertip')} values={fish.preferredFeederTips} />
                            <ParameterBadge label={t('match.tackle.feeder')} values={fish.preferredFeeders} />
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-700/50">
                            <p className="text-[10px] text-gray-400 italic">
                                {t('guide.pro_tip')}
                            </p>
                        </div>
                    </Card>
                );
            })}
        </div>
      </div>
    </div>
  );
};

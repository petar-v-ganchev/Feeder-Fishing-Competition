
import React, { useState, useMemo } from 'react';
import { Card } from './common/Card';
import { Header } from './common/Header';
import type { GameItem, User } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface InventoryScreenProps {
  onBack: () => void;
  user: User;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ onBack, user }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<GameItem['type'] | 'All'>('All');

  const CATEGORIES: { title: string; type: GameItem['type'] }[] = [
    { title: t('shop.category.groundbaits'), type: 'Groundbait' },
    { title: t('shop.category.bait'), type: 'Bait' },
    { title: t('shop.category.additives'), type: 'Additive' },
    { title: t('shop.category.rods'), type: 'Rod' },
    { title: t('shop.category.reels'), type: 'Reel' },
    { title: t('shop.category.lines'), type: 'Line' },
    { title: t('shop.category.hooks'), type: 'Hook' },
    { title: t('shop.category.feeders'), type: 'Feeder' },
    { title: t('shop.category.accessories'), type: 'Accessory' },
  ];

  // We still use uniqueInventory for display, but use indices for keys to be absolutely safe
  const uniqueInventory = useMemo(() => {
    const seen = new Set();
    return user.inventory.filter(item => {
      const duplicate = seen.has(item.id);
      seen.add(item.id);
      return !duplicate;
    });
  }, [user.inventory]);

  const filteredCategories = useMemo(() => {
    if (selectedCategory === 'All') return CATEGORIES;
    return CATEGORIES.filter(c => c.type === selectedCategory);
  }, [selectedCategory, CATEGORIES]);

  const filterOptions = useMemo(() => [
    { label: t('shop.category.all'), value: 'All' as const },
    ...CATEGORIES.map(c => ({ label: c.title, value: c.type }))
  ], [CATEGORIES, t]);

  const hasAnyItems = useMemo(() => {
      if (selectedCategory === 'All') return uniqueInventory.length > 0;
      return uniqueInventory.some(i => i.type === selectedCategory);
  }, [selectedCategory, uniqueInventory]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title={t('inventory.title')} onBack={onBack} />

      <div className="px-6 flex flex-col flex-grow pb-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelectedCategory(opt.value)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                selectedCategory === opt.value 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-slate-100 text-onSurfaceVariant hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        
        <div className="space-y-1 flex-grow">
          {filteredCategories.map(category => {
            const itemsInCategory = uniqueInventory.filter(item => item.type === category.type);
            if (itemsInCategory.length === 0) return null;

            return (
              <div key={category.type} className="pb-2">
                <h2 className="text-sm font-bold mb-1 text-primary border-b border-outline pb-1">
                  {category.title}
                </h2>
                <div className="space-y-1">
                  {itemsInCategory.map((item, idx) => (
                    <Card key={`${item.id}-${idx}`} className="p-3 bg-slate-50 border-none">
                      <h3 className="font-bold text-sm text-primary mb-0.5">{t(`item.name.${item.id}`)}</h3>
                      <p className="text-onSurfaceVariant text-[10px] leading-tight">{t(`item.desc.${item.id}`)}</p>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {!hasAnyItems && (
            <div className="text-center py-12 text-onSurfaceVariant text-xs font-bold opacity-50">
               {t('inventory.empty')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

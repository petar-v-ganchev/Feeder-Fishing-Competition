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

  const filteredCategories = useMemo(() => {
    if (selectedCategory === 'All') return CATEGORIES;
    return CATEGORIES.filter(c => c.type === selectedCategory);
  }, [selectedCategory, CATEGORIES]);

  const filterOptions = useMemo(() => [
    { label: t('shop.category.all'), value: 'All' as const },
    ...CATEGORIES.map(c => ({ label: c.title, value: c.type }))
  ], [CATEGORIES, t]);

  const hasAnyItems = useMemo(() => {
      if (selectedCategory === 'All') return user.inventory.length > 0;
      return user.inventory.some(i => i.type === selectedCategory);
  }, [selectedCategory, user.inventory]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Header title={t('inventory.title')} onBack={onBack} />

      <div className="flex flex-wrap gap-2 mb-6">
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelectedCategory(opt.value)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              selectedCategory === opt.value 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      
      <div className="space-y-6">
        {filteredCategories.map(category => {
          const itemsInCategory = user.inventory.filter(item => item.type === category.type);
          if (itemsInCategory.length === 0) return null;

          return (
            <div key={category.type}>
              <h2 className="text-xl font-bold mb-3 text-gray-300 border-b border-gray-700 pb-2">
                {category.title}
              </h2>
              <div className="space-y-4">
                {itemsInCategory.map(item => (
                  <Card key={item.id} className="p-4">
                    <h3 className="font-bold text-lg text-blue-400 mb-1">{t(`item.name.${item.id}`)}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{t(`item.desc.${item.id}`)}</p>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {!hasAnyItems && (
          <div className="text-center py-12 text-gray-500">
             {t('inventory.empty')}
          </div>
        )}
      </div>
    </div>
  );
};
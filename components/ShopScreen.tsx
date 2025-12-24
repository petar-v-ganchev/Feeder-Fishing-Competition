import React, { useState, useMemo } from 'react';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Header } from './common/Header';
import { MOCK_SHOP_ITEMS } from '../constants';
import type { User, GameItem } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface ShopScreenProps {
  user: User;
  onBack: () => void;
  onPurchase: (item: GameItem) => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ user, onBack, onPurchase }) => {
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
      if (selectedCategory === 'All') return MOCK_SHOP_ITEMS.length > 0;
      return MOCK_SHOP_ITEMS.some(i => i.type === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Header title={t('shop.title')} onBack={onBack} />
      
      <Card className="mb-4 text-center">
        <p className="text-sm text-gray-400">{t('shop.balance')}</p>
        <p className="text-2xl font-bold text-yellow-400">{user.euros.toLocaleString()} {t('common.currency')}</p>
      </Card>

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
          const itemsInCategory = MOCK_SHOP_ITEMS.filter(item => item.type === category.type);
          if (itemsInCategory.length === 0) return null;

          return (
            <div key={category.type}>
              <h2 className="text-xl font-bold mb-3 text-gray-300 border-b border-gray-700 pb-2">{category.title}</h2>
              <div className="space-y-4">
                {itemsInCategory.map(item => {
                  const isOwned = user.inventory.some(invItem => invItem.id === item.id);
                  const canAfford = user.euros >= item.price;

                  return (
                    <Card key={item.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-grow">
                          <h3 className="font-bold text-lg text-blue-400 mb-1">{t(`item.name.${item.id}`)}</h3>
                          <p className="text-gray-300 text-xs sm:text-sm pr-4 leading-relaxed">{t(`item.desc.${item.id}`)}</p>
                        </div>
                        <div className="text-right flex-shrink-0 flex flex-col items-end">
                          <p className="text-base font-bold text-yellow-400 mb-2">{item.price} {t('common.currency')}</p>
                          <Button
                            onClick={() => onPurchase(item)}
                            disabled={isOwned || !canAfford}
                            className="!w-24"
                          >
                            {isOwned ? t('shop.owned') : t('shop.buy')}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {!hasAnyItems && (
          <div className="text-center py-12 text-gray-500">
             {t('shop.empty')}
          </div>
        )}
      </div>
    </div>
  );
};
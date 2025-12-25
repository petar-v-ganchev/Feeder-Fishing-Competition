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
  const { t, formatCurrency } = useTranslation();
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
    <div className="flex flex-col min-h-screen bg-white">
      <Header title={t('shop.title')} onBack={onBack} />
      
      <div className="px-6 flex flex-col flex-grow pb-6">
        {/* Balance Tile - Matched with Main Menu design */}
        <div className="bg-primary p-6 rounded-medium text-white shadow-sm flex justify-between items-center mb-6">
          <div>
            <p className="text-[10px] font-bold opacity-70">{t('shop.balance')}</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(user.euros)}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-full">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelectedCategory(opt.value)}
              className={`px-3 py-1.5 rounded-full text-[9px] font-bold transition-all ${
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
            const itemsInCategory = MOCK_SHOP_ITEMS.filter(item => item.type === category.type);
            if (itemsInCategory.length === 0) return null;

            return (
              <div key={category.type} className="pb-2">
                <h2 className="text-sm font-bold mb-1 text-primary border-b border-outline pb-1">{category.title}</h2>
                <div className="space-y-1">
                  {itemsInCategory.map(item => {
                    const isOwned = user.inventory.some(invItem => invItem.id === item.id);
                    const canAfford = user.euros >= item.price;

                    return (
                      <Card key={item.id} className="p-3 bg-slate-50 border-none shadow-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex-grow pr-4">
                            <h3 className="font-bold text-sm text-primary mb-0.5">{t(`item.name.${item.id}`)}</h3>
                            <p className="text-onSurfaceVariant text-[9px] leading-tight">{t(`item.desc.${item.id}`)}</p>
                          </div>
                          <div className="text-right flex-shrink-0 flex flex-col items-end">
                            <p className="text-xs font-bold text-primary mb-1">{formatCurrency(item.price)}</p>
                            <Button
                              onClick={() => onPurchase(item)}
                              disabled={isOwned || !canAfford}
                              className="!h-7 !w-20 !text-[8px] !px-2"
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
            <div className="text-center py-12 text-onSurfaceVariant text-xs font-bold opacity-50">
               {t('shop.empty')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
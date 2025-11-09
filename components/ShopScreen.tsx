

import React from 'react';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Header } from './common/Header';
import { MOCK_SHOP_ITEMS } from '../constants';
import type { User, GameItem } from '../types';

interface ShopScreenProps {
  user: User;
  onBack: () => void;
  onPurchase: (item: GameItem) => void;
}

const CATEGORIES: { title: string; type: GameItem['type'] }[] = [
    { title: 'Groundbaits', type: 'Groundbait' },
    { title: 'Bait', type: 'Bait' },
    { title: 'Additives', type: 'Additive' },
    { title: 'Rods', type: 'Rod' },
    { title: 'Reels', type: 'Reel' },
    { title: 'Lines', type: 'Line' },
    { title: 'Hooks', type: 'Hook' },
    { title: 'Feeders', type: 'Feeder' },
    { title: 'Accessories', type: 'Accessory' },
];

export const ShopScreen: React.FC<ShopScreenProps> = ({ user, onBack, onPurchase }) => {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Header title="Shop" onBack={onBack} />
      
      <Card className="mb-6 text-center">
        <p className="text-sm text-gray-400">Your Balance</p>
        <p className="text-2xl font-bold text-yellow-400">{user.euros.toLocaleString()} Euro</p>
      </Card>

      <div className="space-y-6">
        {CATEGORIES.map(category => {
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
                    <Card key={item.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-blue-400 mb-2">{item.name}</h3>
                          <p className="text-gray-300 text-sm pr-4">{item.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-bold text-yellow-400">{item.price} Euro</p>
                          <Button
                            onClick={() => onPurchase(item)}
                            disabled={isOwned || !canAfford}
                            className="mt-2 !py-2 !px-6 text-sm"
                          >
                            {isOwned ? 'Owned' : 'Buy'}
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
      </div>
    </div>
  );
};
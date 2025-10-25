
import React from 'react';
import { Card } from './common/Card';
import { Header } from './common/Header';
import type { GameItem, User } from '../types';

interface InventoryScreenProps {
  onBack: () => void;
  user: User;
}

const CATEGORIES: { title: string; type: GameItem['type'] }[] = [
    { title: 'Rods', type: 'Rod' },
    { title: 'Reels', type: 'Reel' },
    { title: 'Lines', type: 'Line' },
    { title: 'Hooks', type: 'Hook' },
    { title: 'Feeders', type: 'Feeder' },
    { title: 'Groundbaits', type: 'Groundbait' },
    { title: 'Bait', type: 'Bait' },
    { title: 'Additives', type: 'Additive' },
    { title: 'Accessories', type: 'Accessory' },
];

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ onBack, user }) => {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Header title="Inventory" onBack={onBack} />
      
      <div className="space-y-6">
        {CATEGORIES.map(category => {
          const itemsInCategory = user.inventory.filter(item => item.type === category.type);
          if (itemsInCategory.length === 0) return null;

          return (
            <div key={category.type}>
              <h2 className="text-xl font-bold mb-3 text-gray-300 border-b border-gray-700 pb-2">{category.title}</h2>
              <div className="space-y-4">
                {itemsInCategory.map(item => (
                  <Card key={item.id}>
                    <h3 className="font-bold text-lg text-blue-400 mb-2">{item.name}</h3>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
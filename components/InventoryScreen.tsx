import React, { useState, useMemo } from 'react';
import { Card } from './common/Card';
import { Header } from './common/Header';
import type { GameItem, User } from '../types';

interface InventoryScreenProps {
  onBack: () => void;
  user: User;
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

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ onBack, user }) => {
  const [selectedCategory, setSelectedCategory] = useState<GameItem['type'] | 'All'>('All');

  const filteredCategories = useMemo(() => {
    if (selectedCategory === 'All') return CATEGORIES;
    return CATEGORIES.filter(c => c.type === selectedCategory);
  }, [selectedCategory]);

  const filterOptions = useMemo(() => [
    { label: 'All Items', value: 'All' as const },
    ...CATEGORIES.map(c => ({ label: c.title, value: c.type }))
  ], []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Header title="Inventory" onBack={onBack} />

      {/* Category Filter Bar - Matching Shop design */}
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
                    <h3 className="font-bold text-lg text-blue-400 mb-1">{item.name}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty state check */}
        {filteredCategories.every(cat => user.inventory.filter(i => i.type === cat.type).length === 0) && (
          <div className="text-center py-12 text-gray-500">
             No items found in this category.
          </div>
        )}
      </div>
    </div>
  );
};
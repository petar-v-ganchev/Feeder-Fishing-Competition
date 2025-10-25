
import React, { useState } from 'react';
import type { Screen, Loadout, User, GameItem } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Header } from './common/Header';
import { 
    MOCK_HOOK_SIZES, 
    DEFAULT_LOADOUT,
    MOCK_FEEDER_TYPES,
    MOCK_FEEDER_TIPS,
    MOCK_CASTING_DISTANCES,
    MOCK_CASTING_INTERVALS
} from '../constants';

interface LoadoutScreenProps {
  onStartMatch: (loadout: Loadout) => void;
  onBack: () => void;
  user: User;
}

const SelectInput: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]}> = ({label, value, onChange, options}) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select value={value} onChange={onChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


export const LoadoutScreen: React.FC<LoadoutScreenProps> = ({ onStartMatch, onBack, user }) => {
    const [loadout, setLoadout] = useState<Loadout>(() => {
    const getFirstOwned = (type: GameItem['type']) => user.inventory.find(i => i.type === type)?.name;
    
    return {
      rod: getFirstOwned('Rod') || DEFAULT_LOADOUT.rod,
      bait: getFirstOwned('Bait') || DEFAULT_LOADOUT.bait,
      groundbait: getFirstOwned('Groundbait') || DEFAULT_LOADOUT.groundbait,
      hookSize: DEFAULT_LOADOUT.hookSize,
      feederType: DEFAULT_LOADOUT.feederType,
      feederTip: DEFAULT_LOADOUT.feederTip,
      castingDistance: DEFAULT_LOADOUT.castingDistance,
      castingInterval: DEFAULT_LOADOUT.castingInterval,
    };
  });

  const handleLoadoutChange = <K extends keyof Loadout,>(field: K, value: Loadout[K]) => {
    setLoadout(prev => ({ ...prev, [field]: value }));
  };

  const availableRods = user.inventory.filter(i => i.type === 'Rod').map(i => i.name);
  const availableBaits = user.inventory.filter(i => i.type === 'Bait').map(i => i.name);
  const availableGroundbaits = user.inventory.filter(i => i.type === 'Groundbait').map(i => i.name);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Header title="Match Prep" onBack={onBack} />
      
      <Card className="mb-6 text-center">
        <p className="text-gray-400">Dominant Species Expected</p>
        <h2 className="text-2xl font-bold text-blue-400">Bream</h2>
        <p className="text-sm text-gray-500 mt-1">Venue: Crystal Lake</p>
      </Card>
      
      <Card>
        <div className="grid grid-cols-2 gap-4">
            <SelectInput 
                label="Feeder Rod"
                value={loadout.rod}
                onChange={(e) => handleLoadoutChange('rod', e.target.value)}
                options={availableRods}
            />
            <SelectInput 
                label="Bait"
                value={loadout.bait}
                onChange={(e) => handleLoadoutChange('bait', e.target.value)}
                options={availableBaits}
            />
            <SelectInput 
                label="Groundbait"
                value={loadout.groundbait}
                onChange={(e) => handleLoadoutChange('groundbait', e.target.value)}
                options={availableGroundbaits}
            />
            <SelectInput 
                label="Hook Size"
                value={loadout.hookSize}
                onChange={(e) => handleLoadoutChange('hookSize', e.target.value)}
                options={MOCK_HOOK_SIZES}
            />
            <SelectInput 
                label="Feeder Type"
                value={loadout.feederType}
                onChange={(e) => handleLoadoutChange('feederType', e.target.value)}
                options={MOCK_FEEDER_TYPES}
            />
            <SelectInput 
                label="Feeder Tip"
                value={loadout.feederTip}
                onChange={(e) => handleLoadoutChange('feederTip', e.target.value)}
                options={MOCK_FEEDER_TIPS}
            />
            <SelectInput 
                label="Casting Distance"
                value={loadout.castingDistance}
                onChange={(e) => handleLoadoutChange('castingDistance', e.target.value)}
                options={MOCK_CASTING_DISTANCES}
            />
            <SelectInput 
                label="Casting Interval"
                value={loadout.castingInterval}
                onChange={(e) => handleLoadoutChange('castingInterval', e.target.value)}
                options={MOCK_CASTING_INTERVALS}
            />
        </div>
      </Card>
      
      <div className="mt-8">
        <Button onClick={() => onStartMatch(loadout)}>Start Match</Button>
      </div>
    </div>
  );
};
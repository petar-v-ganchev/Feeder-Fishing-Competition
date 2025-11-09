import React, { useState } from 'react';
// FIX: 'Screen' is an enum used as a value, so it must be imported as a value, not a type.
import { Screen, type Loadout, type User, type GameItem } from '../types';
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
  onNavigate: (screen: Screen) => void;
}

const SelectInput: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]}> = ({label, value, onChange, options}) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1 truncate" title={label}>{label}</label>
        <select value={value} onChange={onChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


export const LoadoutScreen: React.FC<LoadoutScreenProps> = ({ onStartMatch, onBack, user, onNavigate }) => {
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
      
      <Card className="mb-4">
        <div className="text-center border-b border-gray-700 pb-2 mb-3">
            <h2 className="text-xl font-bold">Crystal Lake</h2>
        </div>
        <div className="flex justify-around items-center text-center">
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Dominant</p>
                <p className="font-semibold text-blue-400">Bream <span className="text-sm font-normal text-gray-300">(Medium)</span></p>
            </div>
            <div className="border-l border-gray-600 h-8 self-center"></div>
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Secondary</p>
                <p className="font-semibold text-teal-400">Roach <span className="text-sm font-normal text-gray-300">(Small)</span></p>
            </div>
        </div>
      </Card>
      
      <Card>
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
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
                label="Distance"
                value={loadout.castingDistance}
                onChange={(e) => handleLoadoutChange('castingDistance', e.target.value)}
                options={MOCK_CASTING_DISTANCES}
            />
            <SelectInput 
                label="Interval"
                value={loadout.castingInterval}
                onChange={(e) => handleLoadoutChange('castingInterval', e.target.value)}
                options={MOCK_CASTING_INTERVALS}
            />
        </div>
      </Card>
      
      <div className="mt-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => onNavigate(Screen.Inventory)} variant="secondary">Inventory</Button>
          <Button onClick={() => onNavigate(Screen.Shop)} variant="secondary">Shop</Button>
        </div>
        <Button onClick={() => onStartMatch(loadout)}>Start Match</Button>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Screen, type Loadout, type User, type GameItem } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Header } from './common/Header';
import { 
    DEFAULT_LOADOUT,
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
    <div className="flex items-center justify-between gap-2 py-0.5 min-h-[24px]">
        <label className="text-[10px] font-bold text-gray-400 truncate w-[75px] shrink-0" title={label}>
          {label}
        </label>
        <div className="relative flex-grow">
          <select 
            value={value} 
            onChange={onChange} 
            className="w-full h-[22px] px-1.5 bg-gray-700 border border-gray-600 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.75rem_0.75rem] bg-[right_0.15rem_center] bg-no-repeat pr-4"
          >
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
    </div>
);


export const LoadoutScreen: React.FC<LoadoutScreenProps> = ({ onStartMatch, onBack, user, onNavigate }) => {
    const [loadout, setLoadout] = useState<Loadout>(() => {
    const getFirstOwned = (type: GameItem['type']) => user.inventory.find(i => i.type === type)?.name;
    
    return {
      rod: getFirstOwned('Rod') || DEFAULT_LOADOUT.rod,
      reel: getFirstOwned('Reel') || DEFAULT_LOADOUT.reel,
      line: getFirstOwned('Line') || DEFAULT_LOADOUT.line,
      hook: getFirstOwned('Hook') || DEFAULT_LOADOUT.hook,
      feeder: getFirstOwned('Feeder') || DEFAULT_LOADOUT.feeder,
      bait: getFirstOwned('Bait') || DEFAULT_LOADOUT.bait,
      groundbait: getFirstOwned('Groundbait') || DEFAULT_LOADOUT.groundbait,
      additive: getFirstOwned('Additive') || DEFAULT_LOADOUT.additive,
      feederTip: DEFAULT_LOADOUT.feederTip,
      castingDistance: DEFAULT_LOADOUT.castingDistance,
      castingInterval: DEFAULT_LOADOUT.castingInterval,
    };
  });

  const handleLoadoutChange = <K extends keyof Loadout,>(field: K, value: Loadout[K]) => {
    setLoadout(prev => ({ ...prev, [field]: value }));
  };

  const getInventoryOptions = (type: GameItem['type']) => {
      const items = user.inventory.filter(i => i.type === type).map(i => i.name);
      return items.length > 0 ? items : [DEFAULT_LOADOUT[type.toLowerCase() as keyof Loadout] || 'None'];
  };

  return (
    <div className="flex flex-col h-screen max-h-screen p-2 overflow-hidden bg-gray-900">
      <div className="flex-shrink-0">
        <header className="relative flex items-center justify-center p-1.5 mb-1">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 text-blue-400 hover:text-blue-300 transition-colors text-sm px-1"
            >
              &lt; Back
            </button>
          )}
          <h1 className="text-lg font-bold text-center">Match Prep</h1>
        </header>
      </div>
      
      {/* Venue Section */}
      <div className="flex-shrink-0 mb-2">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-xl border-b-4 border-blue-600/50">
          <div className="text-center border-b border-gray-700 pb-2 mb-3">
              <h2 className="text-base font-black uppercase tracking-widest text-blue-400">Crystal Lake</h2>
              <p className="text-[10px] text-gray-500 font-medium">Session: 3 Hours • Clear Conditions</p>
          </div>
          <div className="flex justify-around items-center text-center gap-4">
              <div className="flex-1">
                  <p className="text-[9px] text-gray-500 font-bold tracking-tighter mb-0.5">Dominant</p>
                  <p className="font-black text-sm text-blue-300">Bream</p>
                  <p className="text-[10px] font-medium text-gray-400">Medium Sized</p>
              </div>
              <div className="border-l border-gray-700 h-10"></div>
              <div className="flex-1">
                  <p className="text-[9px] text-gray-500 font-bold tracking-tighter mb-0.5">Secondary</p>
                  <p className="font-black text-sm text-teal-300">Roach</p>
                  <p className="text-[10px] font-medium text-gray-400">Small Sized</p>
              </div>
          </div>
        </div>
      </div>
      
      {/* Tackle Section */}
      <div className="flex-grow overflow-hidden flex flex-col min-h-0">
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 shadow-inner flex flex-col justify-between overflow-y-auto">
          <div className="flex flex-col space-y-0">
              <SelectInput 
                  label="Rod"
                  value={loadout.rod}
                  onChange={(e) => handleLoadoutChange('rod', e.target.value)}
                  options={getInventoryOptions('Rod')}
              />
              <SelectInput 
                  label="Reel"
                  value={loadout.reel}
                  onChange={(e) => handleLoadoutChange('reel', e.target.value)}
                  options={getInventoryOptions('Reel')}
              />
              <SelectInput 
                  label="Line"
                  value={loadout.line}
                  onChange={(e) => handleLoadoutChange('line', e.target.value)}
                  options={getInventoryOptions('Line')}
              />
              <SelectInput 
                  label="Hook"
                  value={loadout.hook}
                  onChange={(e) => handleLoadoutChange('hook', e.target.value)}
                  options={getInventoryOptions('Hook')}
              />
              <SelectInput 
                  label="Feeder"
                  value={loadout.feeder}
                  onChange={(e) => handleLoadoutChange('feeder', e.target.value)}
                  options={getInventoryOptions('Feeder')}
              />
               <SelectInput 
                  label="Additive"
                  value={loadout.additive}
                  onChange={(e) => handleLoadoutChange('additive', e.target.value)}
                  options={getInventoryOptions('Additive')}
              />
              <SelectInput 
                  label="Bait"
                  value={loadout.bait}
                  onChange={(e) => handleLoadoutChange('bait', e.target.value)}
                  options={getInventoryOptions('Bait')}
              />
              <SelectInput 
                  label="Groundbait"
                  value={loadout.groundbait}
                  onChange={(e) => handleLoadoutChange('groundbait', e.target.value)}
                  options={getInventoryOptions('Groundbait')}
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
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex-shrink-0 mt-2 mb-1 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => onNavigate(Screen.Inventory)} 
            variant="secondary"
          >
            Inventory
          </Button>
          <Button 
            onClick={() => onNavigate(Screen.Shop)} 
            variant="secondary"
          >
            Shop
          </Button>
        </div>
        <Button 
          onClick={() => onStartMatch(loadout)}
          className="shadow-lg shadow-blue-900/40"
        >
          Start Match
        </Button>
      </div>
    </div>
  );
};
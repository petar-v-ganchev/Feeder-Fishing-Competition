import React, { useState, useMemo } from 'react';
import { Screen, type Loadout, type User, type GameItem } from '../types';
import { Button } from './common/Button';
import { 
    DEFAULT_LOADOUT,
    MOCK_FEEDER_TIPS,
    MOCK_CASTING_DISTANCES,
    MOCK_CASTING_INTERVALS,
    MOCK_FISH_SPECIES
} from '../constants';
import { useTranslation } from '../i18n/LanguageContext';

interface LoadoutScreenProps {
  onStartMatch: (loadout: Loadout) => void;
  onBack: () => void;
  user: User;
  onNavigate: (screen: Screen) => void;
}

const SelectInput: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {label: string, value: string}[]}> = ({label, value, onChange, options}) => (
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
              {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
    </div>
);

export const LoadoutScreen: React.FC<LoadoutScreenProps> = ({ onStartMatch, onBack, user, onNavigate }) => {
  const { t } = useTranslation();
  
  const venueFish = useMemo(() => {
    const shuffled = [...MOCK_FISH_SPECIES].sort(() => 0.5 - Math.random());
    const dominant = shuffled[0];
    const secondary = shuffled[1];

    return {
        dominant: {
            id: dominant.name,
            name: t(`species.${dominant.name}`),
            variant: t(`guide.${dominant.variant.toLowerCase()}_sized`),
            fullName: `${dominant.variant} ${dominant.name}`
        },
        secondary: {
            id: secondary.name,
            name: t(`species.${secondary.name}`),
            variant: t(`guide.${secondary.variant.toLowerCase()}_sized`),
            fullName: `${secondary.variant} ${secondary.name}`
        }
    };
  }, [t]);

  // Robust initialization helper
  const getBestOwnedId = (type: GameItem['type'], defaultId: string) => {
      const owned = user.inventory.filter(i => i.type === type);
      if (owned.length === 0) return defaultId;
      const foundDefault = owned.find(i => i.id === defaultId);
      return foundDefault ? foundDefault.id : owned[0].id;
  };

  const getOwnedTip = () => {
      const ownedTips = user.inventory.filter(i => i.id.startsWith('acc_qt'));
      if (ownedTips.length === 0) return DEFAULT_LOADOUT.feederTip;
      
      const defaultOwned = ownedTips.find(i => {
          const numeric = i.id.replace('acc_qt', '');
          const tipVal = `${numeric.slice(0, 1)}.${numeric.slice(1)}oz`;
          return tipVal === DEFAULT_LOADOUT.feederTip;
      });
      if (defaultOwned) return DEFAULT_LOADOUT.feederTip;

      const firstId = ownedTips[0].id.replace('acc_qt', '');
      return `${firstId.slice(0, 1)}.${firstId.slice(1)}oz`;
  };

  // State initialized with calculated inventory matches
  const [loadout, setLoadout] = useState<Loadout>(() => ({
      rod: getBestOwnedId('Rod', DEFAULT_LOADOUT.rod),
      reel: getBestOwnedId('Reel', DEFAULT_LOADOUT.reel),
      line: getBestOwnedId('Line', DEFAULT_LOADOUT.line),
      hook: getBestOwnedId('Hook', DEFAULT_LOADOUT.hook),
      feeder: getBestOwnedId('Feeder', DEFAULT_LOADOUT.feeder),
      bait: getBestOwnedId('Bait', DEFAULT_LOADOUT.bait),
      groundbait: getBestOwnedId('Groundbait', DEFAULT_LOADOUT.groundbait),
      additive: getBestOwnedId('Additive', DEFAULT_LOADOUT.additive),
      feederTip: getOwnedTip(),
      castingDistance: DEFAULT_LOADOUT.castingDistance,
      castingInterval: DEFAULT_LOADOUT.castingInterval,
  }));

  const handleLoadoutChange = <K extends keyof Loadout,>(field: K, value: Loadout[K]) => {
    setLoadout(prev => ({ ...prev, [field]: value }));
  };

  const getInventoryOptions = (type: GameItem['type']) => {
      return user.inventory
        .filter(i => i.type === type)
        .map(i => ({ label: t(`item.name.${i.id}`), value: i.id }));
  };

  const getTipOptions = () => {
      return MOCK_FEEDER_TIPS.filter(tip => {
          const id = `acc_qt${tip.replace('.', '').replace('oz', '')}`;
          return user.inventory.some(i => i.id === id);
      }).map(opt => ({ label: t(`opt.tip.${opt}`), value: opt }));
  };

  const getDistanceOptions = () => MOCK_CASTING_DISTANCES.map(opt => {
      let key = 'medium';
      if (opt.includes('20m')) key = 'short';
      if (opt.includes('60m')) key = 'long';
      if (opt.includes('80m')) key = 'extreme';
      return { label: t(`opt.dist.${key}`), value: opt };
  });

  const getIntervalOptions = () => MOCK_CASTING_INTERVALS.map(opt => {
      let key = 'regular';
      if (opt.includes('2 mins')) key = 'frequent';
      if (opt.includes('10 mins')) key = 'patient';
      return { label: t(`opt.int.${key}`), value: opt };
  });

  const handleStartMatchInternal = () => {
    onStartMatch({
      ...loadout,
      venueFish: {
        dominant: venueFish.dominant.fullName,
        secondary: venueFish.secondary.fullName
      }
    });
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
              &lt; {t('nav.back')}
            </button>
          )}
          <h1 className="text-lg font-bold text-center">{t('match.prep')}</h1>
        </header>
      </div>
      
      <div className="flex-shrink-0 mb-2">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-xl border-b-4 border-blue-600/50">
          <div className="text-center border-b border-gray-700 pb-2 mb-3">
              <h2 className="text-base font-black uppercase tracking-widest text-blue-400">{t('match.venue')}</h2>
              <p className="text-[10px] text-gray-500 font-medium">{t('match.session')}</p>
          </div>
          <div className="flex justify-around items-center text-center gap-4">
              <div className="flex-1">
                  <p className="text-[9px] text-gray-500 font-bold tracking-tighter mb-0.5">{t('match.dominant')}</p>
                  <p className="font-black text-sm text-blue-300">{venueFish.dominant.name}</p>
                  <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest">{venueFish.dominant.variant}</p>
              </div>
              <div className="border-l border-gray-700 h-10"></div>
              <div className="flex-1">
                  <p className="text-[9px] text-gray-500 font-bold tracking-tighter mb-0.5">{t('match.secondary')}</p>
                  <p className="font-black text-sm text-teal-300">{venueFish.secondary.name}</p>
                  <p className="text-[10px] font-bold text-teal-500/80 uppercase tracking-widest">{venueFish.secondary.variant}</p>
              </div>
          </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-hidden flex flex-col min-h-0">
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 shadow-inner flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div className="flex flex-col space-y-0">
              <SelectInput label={t('match.tackle.rod')} value={loadout.rod} onChange={(e) => handleLoadoutChange('rod', e.target.value)} options={getInventoryOptions('Rod')} />
              <SelectInput label={t('match.tackle.reel')} value={loadout.reel} onChange={(e) => handleLoadoutChange('reel', e.target.value)} options={getInventoryOptions('Reel')} />
              <SelectInput label={t('match.tackle.line')} value={loadout.line} onChange={(e) => handleLoadoutChange('line', e.target.value)} options={getInventoryOptions('Line')} />
              <SelectInput label={t('match.tackle.hook')} value={loadout.hook} onChange={(e) => handleLoadoutChange('hook', e.target.value)} options={getInventoryOptions('Hook')} />
              <SelectInput label={t('match.tackle.feeder')} value={loadout.feeder} onChange={(e) => handleLoadoutChange('feeder', e.target.value)} options={getInventoryOptions('Feeder')} />
              <SelectInput label={t('match.tackle.additive')} value={loadout.additive} onChange={(e) => handleLoadoutChange('additive', e.target.value)} options={getInventoryOptions('Additive')} />
              <SelectInput label={t('match.tackle.bait')} value={loadout.bait} onChange={(e) => handleLoadoutChange('bait', e.target.value)} options={getInventoryOptions('Bait')} />
              <SelectInput label={t('match.tackle.groundbait')} value={loadout.groundbait} onChange={(e) => handleLoadoutChange('groundbait', e.target.value)} options={getInventoryOptions('Groundbait')} />
              <SelectInput label={t('match.tackle.feedertip')} value={loadout.feederTip} onChange={(e) => handleLoadoutChange('feederTip', e.target.value)} options={getTipOptions()} />
              <SelectInput label={t('match.tackle.distance')} value={loadout.castingDistance} onChange={(e) => handleLoadoutChange('castingDistance', e.target.value)} options={getDistanceOptions()} />
              <SelectInput label={t('match.tackle.interval')} value={loadout.castingInterval} onChange={(e) => handleLoadoutChange('castingInterval', e.target.value)} options={getIntervalOptions()} />
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 mt-2 mb-1 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => onNavigate(Screen.Inventory)} variant="secondary">{t('main.inventory')}</Button>
          <Button onClick={() => onNavigate(Screen.Shop)} variant="secondary">{t('main.shop')}</Button>
        </div>
        <Button onClick={handleStartMatchInternal} className="shadow-lg shadow-blue-900/40">{t('match.start')}</Button>
      </div>
    </div>
  );
};
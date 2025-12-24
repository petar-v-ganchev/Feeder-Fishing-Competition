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
    <div className="flex items-center justify-between gap-s py-xs min-h-[32px]">
        <label className="text-caption font-medium text-onSurfaceVariant truncate w-[90px] shrink-0" title={label}>
          {label}
        </label>
        <div className="relative flex-grow">
          <select 
            value={value} 
            onChange={onChange} 
            className="w-full h-[28px] px-s bg-surface border border-outline rounded-small text-caption focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem_1rem] bg-[right_0.25rem_center] bg-no-repeat pr-s"
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
            variant: t(`common.${dominant.variant.toLowerCase()}`),
            fullName: `${dominant.variant} ${dominant.name}`
        },
        secondary: {
            id: secondary.name,
            name: t(`species.${secondary.name}`),
            variant: t(`common.${secondary.variant.toLowerCase()}`),
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

  const handleIntervalOptions = () => MOCK_CASTING_INTERVALS.map(opt => {
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
    <div className="flex flex-col h-screen max-h-screen p-m overflow-hidden bg-surface text-onSurface">
      <div className="flex-shrink-0">
        <header className="relative flex items-center justify-center p-s mb-xs">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 p-2 text-primary hover:text-secondary transition-colors"
              aria-label="Go back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold text-center text-primary">{t('match.prep')}</h1>
        </header>
      </div>
      
      <div className="flex-shrink-0 mb-m">
        <div className="bg-slate-50 border border-outline rounded-medium p-4 shadow-sm border-b-2 border-primary/20">
          <div className="text-center border-b border-outline pb-2 mb-2">
              <h2 className="text-xs font-bold text-primary">{t('match.venue')}</h2>
          </div>
          <div className="flex justify-around items-center text-center gap-4">
              <div className="flex-1">
                  <p className="text-[10px] text-onSurfaceVariant font-bold mb-1">{t('match.dominant')}</p>
                  <p className="font-bold text-sm text-blue-800">{venueFish.dominant.name}</p>
                  <p className="text-[10px] font-medium text-primary opacity-70">{venueFish.dominant.variant}</p>
              </div>
              <div className="border-l border-outline h-8"></div>
              <div className="flex-1">
                  <p className="text-[10px] text-onSurfaceVariant font-bold mb-1">{t('match.secondary')}</p>
                  <p className="font-bold text-sm text-slate-700">{venueFish.secondary.name}</p>
                  <p className="text-[10px] font-medium text-onSurfaceVariant opacity-70">{venueFish.secondary.variant}</p>
              </div>
          </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-hidden flex flex-col min-h-0">
        <div className="bg-slate-50 border border-outline rounded-medium px-4 py-2 shadow-inner flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div className="flex flex-col space-y-1">
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
              <SelectInput label={t('match.tackle.interval')} value={loadout.castingInterval} onChange={(e) => handleLoadoutChange('castingInterval', e.target.value)} options={handleIntervalOptions()} />
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 mt-4 mb-2 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => onNavigate(Screen.Inventory)} variant="secondary" className="h-10 text-xs">{t('main.inventory')}</Button>
          <Button onClick={() => onNavigate(Screen.Shop)} variant="secondary" className="h-10 text-xs">{t('main.shop')}</Button>
        </div>
        <Button onClick={handleStartMatchInternal} className="h-14">{t('match.start')}</Button>
      </div>
    </div>
  );
};
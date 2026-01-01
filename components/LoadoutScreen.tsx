import React, { useState, useMemo, useEffect } from 'react';
import { Screen, type Loadout, type User, type GameItem } from '../types';
import { Button } from './common/Button';
import { Header } from './common/Header';
import { 
    DEFAULT_LOADOUT,
    MOCK_FEEDER_TIPS,
    MOCK_CASTING_DISTANCES,
    MOCK_CASTING_INTERVALS,
    MOCK_FISH_SPECIES
} from '../constants';
import { useTranslation } from '../i18n/LanguageContext';
import { saveActiveLoadout, loadActiveLoadout } from '../services/tacticService';

interface LoadoutScreenProps {
  onStartMatch: (loadout: Loadout) => void;
  onBack: () => void;
  user: User;
  onNavigate: (screen: Screen) => void;
}

const SelectInput: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {label: string, value: string}[]}> = ({label, value, onChange, options}) => (
    <div className="flex items-center justify-between gap-2 py-1 min-h-[32px]">
        <label className="text-xs font-medium text-onSurfaceVariant truncate w-[90px] shrink-0" title={label}>
          {label}
        </label>
        <div className="relative flex-grow">
          <select 
            value={value} 
            onChange={onChange} 
            className="w-full h-[28px] px-2 bg-surface border border-outline rounded-small text-xs focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem_1rem] bg-[right_0.25rem_center] bg-no-repeat pr-6"
          >
              {options.length > 0 ? (
                options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)
              ) : (
                <option value={value}>{value}</option>
              )}
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

  const getBestOwnedId = (type: GameItem['type'], defaultId: string) => {
      const owned = user.inventory.filter(i => i.type === type);
      if (owned.length === 0) return defaultId;
      const foundDefault = owned.find(i => i.id === defaultId);
      return foundDefault ? foundDefault.id : owned[0].id;
  };

  const getOwnedTip = () => {
      const ownedTips = user.inventory.filter(i => i.id.startsWith('acc_qt'));
      if (ownedTips.length === 0) return DEFAULT_LOADOUT.feederTip;
      const firstId = ownedTips[0].id.replace('acc_qt', '');
      return `${firstId.slice(0, 1)}.${firstId.slice(1)}oz`;
  };

  const [loadout, setLoadout] = useState<Loadout>(() => {
      const saved = loadActiveLoadout() || JSON.parse(localStorage.getItem('lastLoadout') || 'null');
      
      if (saved) {
          try {
              const validateItem = (type: GameItem['type'], id: string) => 
                  user.inventory.some(i => i.type === type && i.id === id) ? id : getBestOwnedId(type, id);
              
              return {
                  ...saved,
                  rod: validateItem('Rod', saved.rod),
                  reel: validateItem('Reel', saved.reel),
                  line: validateItem('Line', saved.line),
                  hook: validateItem('Hook', saved.hook),
                  feeder: validateItem('Feeder', saved.feeder),
                  bait: validateItem('Bait', saved.bait),
                  groundbait: validateItem('Groundbait', saved.groundbait),
                  additive: validateItem('Additive', saved.additive),
                  feederTip: MOCK_FEEDER_TIPS.includes(saved.feederTip) ? saved.feederTip : getOwnedTip(),
              };
          } catch (e) {
              console.warn("Failed to parse saved loadout:", e);
          }
      }

      return {
          ...DEFAULT_LOADOUT,
          rod: getBestOwnedId('Rod', DEFAULT_LOADOUT.rod),
          reel: getBestOwnedId('Reel', DEFAULT_LOADOUT.reel),
          line: getBestOwnedId('Line', DEFAULT_LOADOUT.line),
          hook: getBestOwnedId('Hook', DEFAULT_LOADOUT.hook),
          feeder: getBestOwnedId('Feeder', DEFAULT_LOADOUT.feeder),
          bait: getBestOwnedId('Bait', DEFAULT_LOADOUT.bait),
          groundbait: getBestOwnedId('Groundbait', DEFAULT_LOADOUT.groundbait),
          additive: getBestOwnedId('Additive', DEFAULT_LOADOUT.additive),
          feederTip: getOwnedTip(),
      };
  });

  useEffect(() => {
    const finalLoadout = {
      ...loadout,
      venueFish: {
        dominant: venueFish.dominant.fullName,
        secondary: venueFish.secondary.fullName
      }
    };
    saveActiveLoadout(finalLoadout);
    localStorage.setItem('lastLoadout', JSON.stringify(loadout));
  }, [loadout, venueFish]);

  const handleLoadoutChange = <K extends keyof Loadout,>(field: K, value: Loadout[K]) => {
    setLoadout(prev => ({ ...prev, [field]: value }));
  };

  const getInventoryOptions = (type: GameItem['type'], defaultId: string) => {
      const owned = user.inventory.filter(i => i.type === type);
      if (owned.length === 0) return [{ label: t(`item.name.${defaultId}`), value: defaultId }];
      return owned.map(i => ({ label: t(`item.name.${i.id}`), value: i.id }));
  };

  const getTipOptions = () => {
      const ownedTips = user.inventory.filter(i => i.id.startsWith('acc_qt'));
      return ownedTips.map(i => {
          const numeric = i.id.replace('acc_qt', '');
          const tipVal = `${numeric.slice(0, 1)}.${numeric.slice(1)}oz`;
          return { label: t(`opt.tip.${tipVal}`), value: tipVal };
      });
  };

  const getDistanceOptions = () => {
    const keys: Record<string, string> = {
      'Short (20m)': 'opt.dist.short',
      'Medium (40m)': 'opt.dist.medium',
      'Long (60m)': 'opt.dist.long',
      'Extreme (80m)': 'opt.dist.extreme' // added missing key
    };
    return MOCK_CASTING_DISTANCES.map(d => ({ label: t(keys[d] || d), value: d }));
  };

  const getIntervalOptions = () => {
    const keys: Record<string, string> = {
      'Frequent (2 mins)': 'opt.int.frequent',
      'Regular (5 mins)': 'opt.int.regular',
      'Patient (10 mins)': 'opt.int.patient'
    };
    return MOCK_CASTING_INTERVALS.map(i => ({ label: t(keys[i] || i), value: i }));
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-surface text-onSurface">
      <Header title={t('match.prep')} onBack={onBack} />
      
      <div className="px-6 flex-grow flex flex-col min-h-0 pb-4">
        <div className="flex-shrink-0 mb-4">
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
        
        <div className="flex-grow overflow-hidden flex flex-col min-h-0 mb-4">
          <div className="bg-slate-50 border border-outline rounded-medium px-4 py-2 shadow-inner flex flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="flex flex-col space-y-1">
                <SelectInput label={t('match.tackle.rod')} value={loadout.rod} onChange={(e) => handleLoadoutChange('rod', e.target.value)} options={getInventoryOptions('Rod', DEFAULT_LOADOUT.rod)} />
                <SelectInput label={t('match.tackle.reel')} value={loadout.reel} onChange={(e) => handleLoadoutChange('reel', e.target.value)} options={getInventoryOptions('Reel', DEFAULT_LOADOUT.reel)} />
                <SelectInput label={t('match.tackle.line')} value={loadout.line} onChange={(e) => handleLoadoutChange('line', e.target.value)} options={getInventoryOptions('Line', DEFAULT_LOADOUT.line)} />
                <SelectInput label={t('match.tackle.hook')} value={loadout.hook} onChange={(e) => handleLoadoutChange('hook', e.target.value)} options={getInventoryOptions('Hook', DEFAULT_LOADOUT.hook)} />
                <SelectInput label={t('match.tackle.feeder')} value={loadout.feeder} onChange={(e) => handleLoadoutChange('feeder', e.target.value)} options={getInventoryOptions('Feeder', DEFAULT_LOADOUT.feeder)} />
                <SelectInput label={t('match.tackle.additive')} value={loadout.additive} onChange={(e) => handleLoadoutChange('additive', e.target.value)} options={getInventoryOptions('Additive', DEFAULT_LOADOUT.additive)} />
                <SelectInput label={t('match.tackle.bait')} value={loadout.bait} onChange={(e) => handleLoadoutChange('bait', e.target.value)} options={getInventoryOptions('Bait', DEFAULT_LOADOUT.bait)} />
                <SelectInput label={t('match.tackle.groundbait')} value={loadout.groundbait} onChange={(e) => handleLoadoutChange('groundbait', e.target.value)} options={getInventoryOptions('Groundbait', DEFAULT_LOADOUT.groundbait)} />
                <SelectInput label={t('match.tackle.feedertip')} value={loadout.feederTip} onChange={(e) => handleLoadoutChange('feederTip', e.target.value)} options={getTipOptions()} />
                <SelectInput label={t('match.tackle.distance')} value={loadout.castingDistance} onChange={(e) => handleLoadoutChange('castingDistance', e.target.value)} options={getDistanceOptions()} />
                <SelectInput label={t('match.tackle.interval')} value={loadout.castingInterval} onChange={(e) => handleLoadoutChange('castingInterval', e.target.value)} options={getIntervalOptions()} />
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Button 
                variant="secondary" 
                onClick={() => onNavigate(Screen.Inventory)}
                className="h-10 text-[10px]"
            >
                {t('main.inventory')}
            </Button>
            <Button 
                variant="secondary" 
                onClick={() => onNavigate(Screen.Shop)}
                className="h-10 text-[10px]"
            >
                {t('main.shop')}
            </Button>
          </div>
          <Button onClick={() => onStartMatch(loadout)} className="h-14">{t('match.start')}</Button>
        </div>
      </div>
    </div>
  );
};
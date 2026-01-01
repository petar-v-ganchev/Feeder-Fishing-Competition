import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { MatchResult, User, Loadout, MatchParticipant } from '../types';
import { 
    MOCK_FEEDER_TIPS, 
    MOCK_CASTING_DISTANCES, 
    MOCK_CASTING_INTERVALS,
    MOCK_RODS,
    MOCK_REELS,
    MOCK_LINES,
    MOCK_BAITS,
    MOCK_GROUNDBAITS,
    MOCK_HOOK_SIZES,
    MOCK_FEEDER_TYPES,
    MOCK_ADDITIVES,
    MOCK_FISH_SPECIES
} from '../constants';
import { type LiveParticipant } from '../services/liveMatchService';
import { useTranslation } from '../i18n/LanguageContext';

interface MatchUIScreenProps {
  user: User;
  playerLoadout: Loadout;
  onMatchEnd: (result: MatchResult) => void;
  participantsOverride?: LiveParticipant[];
}

const MATCH_DURATION = 600; // 10 minutes in seconds

const FIPSED_PRO_NAMES = [
    "Stevie Ringler", "Lee Edvards", "Gabor Domer", "Jense Koschnic",
    "Micky Vialls", "Angel De Pascali", "Arjen Klopp", "Vadim Yakubow",
    "Matt Weigand", "Jan v. Shendel", "Tamas Waltermann", "Adame Wakeline",
    "Phil Ringler", "Franco Gianotty"
];

const COL_WIDTH = 130; 
const ROW_HEIGHT_CLASS = 'h-[52px]'; 

/**
 * Formats a string to Sentence case (e.g., "Hello world").
 */
const toSentenceCase = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Calculates how well a loadout matches a specific fish species preferences.
 * Returns a value between 0 and 1.
 */
const calculateEfficiency = (loadout: Loadout): number => {
    if (!loadout.venueFish) return 0.5;
    
    // Find the fish species object for the dominant fish
    const targetFish = MOCK_FISH_SPECIES.find(f => 
        `${f.variant} ${f.name}` === loadout.venueFish?.dominant
    );

    if (!targetFish) return 0.5;

    let matches = 0;
    const totalParams = 11;

    if (targetFish.preferredRods.includes(loadout.rod)) matches++;
    if (targetFish.preferredReels.includes(loadout.reel)) matches++;
    if (targetFish.preferredLines.includes(loadout.line)) matches++;
    if (targetFish.preferredHooks.includes(loadout.hook)) matches++;
    if (targetFish.preferredFeeders.includes(loadout.feeder)) matches++;
    if (targetFish.preferredBaits.includes(loadout.bait)) matches++;
    if (targetFish.preferredGroundbaits.includes(loadout.groundbait)) matches++;
    if (targetFish.preferredAdditives.includes(loadout.additive)) matches++;
    if (targetFish.preferredFeederTips.includes(loadout.feederTip)) matches++;
    if (targetFish.preferredDistance.includes(loadout.castingDistance)) matches++;
    if (targetFish.preferredIntervals.includes(loadout.castingInterval)) matches++;

    return matches / totalParams;
};

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateBotLoadout = (venueFish: Loadout['venueFish']): Loadout => ({
    rod: getRandomElement(MOCK_RODS),
    reel: getRandomElement(MOCK_REELS),
    line: getRandomElement(MOCK_LINES),
    hook: getRandomElement(MOCK_HOOK_SIZES),
    feeder: getRandomElement(MOCK_FEEDER_TYPES),
    bait: getRandomElement(MOCK_BAITS),
    groundbait: getRandomElement(MOCK_GROUNDBAITS),
    additive: getRandomElement(MOCK_ADDITIVES),
    feederTip: getRandomElement(MOCK_FEEDER_TIPS),
    castingDistance: getRandomElement(MOCK_CASTING_DISTANCES),
    castingInterval: getRandomElement(MOCK_CASTING_INTERVALS),
    venueFish
});

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const MatchUIScreen: React.FC<MatchUIScreenProps> = ({ user, playerLoadout, onMatchEnd, participantsOverride }) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
    const [lastCatchId, setLastCatchId] = useState<string | null>(null);
    const [playerCatchTimestamps, setPlayerCatchTimestamps] = useState<number[]>([]);
    
    const [participants, setParticipants] = useState<MatchParticipant[]>(() => {
        const p: MatchParticipant = {
            id: user.id, 
            name: user.displayName, 
            isBot: false, 
            loadout: { ...playerLoadout }, 
            totalWeight: 0, 
            catchStreak: 0, 
            lastCatchTime: Date.now()
        };
        const bots = FIPSED_PRO_NAMES.map((name, i) => ({
            id: `bot_${i}`, 
            name: name, 
            isBot: true, 
            loadout: generateBotLoadout(playerLoadout.venueFish), 
            totalWeight: 0, 
            catchStreak: 0, 
            lastCatchTime: Date.now()
        }));
        return [p, ...bots];
    });

    const participantsRef = useRef(participants);
    useEffect(() => { participantsRef.current = participants; }, [participants]);

    // Timer Effect: Independent of the catch simulation
    useEffect(() => {
        if (timeLeft <= 0) {
            const standings = [...participantsRef.current].sort((a,b) => b.totalWeight - a.totalWeight);
            onMatchEnd({
                playerWeight: standings.find(s => s.id === user.id)?.totalWeight || 0,
                opponentWeight: standings[0].totalWeight,
                eurosEarned: 100,
                standings,
                isLive: !!participantsOverride
            });
            return;
        }

        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, onMatchEnd, participantsOverride, user.id]);

    // Simulation Effect: Independent of the clock ticking
    useEffect(() => {
        const sim = setInterval(() => {
            setParticipants(prev => prev.map(p => {
                const eff = calculateEfficiency(p.loadout);
                // Increased probabilities: 4% base + up to 12% bonus = max 16% per 3s
                const baseChance = 0.04;
                const maxBonus = 0.12;
                const catchChance = baseChance + (eff * maxBonus);
                
                if (Math.random() < catchChance) {
                    const weight = parseFloat((Math.random() * 1.5 + 0.1).toFixed(2));
                    setLastCatchId(p.id);
                    if (!p.isBot) {
                        setPlayerCatchTimestamps(prev => [...prev, Date.now()]);
                    }
                    // Clear the catch visual after a delay
                    setTimeout(() => setLastCatchId(null), 2500);
                    return { ...p, totalWeight: p.totalWeight + weight, lastCatchTime: Date.now() };
                }
                return p;
            }));
        }, 3000);

        return () => clearInterval(sim);
    }, []);

    const currentPlayer = useMemo(() => participants.find(p => p.id === user.id), [participants, user.id]);
    const botParticipants = useMemo(() => participants.filter(p => p.isBot), [participants]);

    // Calculate Trend: Comparing catch count in the last 60s vs the 60s before that.
    const catchTrend = useMemo(() => {
        const now = Date.now();
        const windowSize = 60000; // 60 seconds
        
        const recentCatches = playerCatchTimestamps.filter(ts => ts >= now - windowSize).length;
        const previousCatches = playerCatchTimestamps.filter(ts => ts >= now - (windowSize * 2) && ts < now - windowSize).length;
        
        if (recentCatches > previousCatches) return 'rising';
        if (recentCatches < previousCatches) return 'falling';
        return 'stable';
    }, [playerCatchTimestamps]);

    const updatePlayerTactic = (field: keyof Loadout, value: string) => {
        setParticipants(prev => prev.map(p => 
            p.id === user.id 
                ? { ...p, loadout: { ...p.loadout, [field]: value } }
                : p
        ));
    };

    const getInventoryOptions = (type: string, currentVal: string): string[] => {
        const owned: string[] = user.inventory.filter(i => i.type === type).map(i => i.id);
        if (!owned.includes(currentVal)) owned.push(currentVal);
        return Array.from(new Set(owned));
    };

    const getTipOptions = (currentVal: string): string[] => {
        const owned = MOCK_FEEDER_TIPS.filter(tip => {
            const id = `acc_qt${tip.replace('.', '').replace('oz', '')}`;
            return user.inventory.some(i => i.id === id);
        });
        if (!owned.includes(currentVal)) owned.push(currentVal);
        return Array.from(new Set(owned));
    };

    const TACTICS_FIELDS: { label: string, field: keyof Loadout, options: string[] }[] = [
        { label: t('match.tackle.rod'), field: 'rod', options: getInventoryOptions('Rod', currentPlayer?.loadout.rod || '') },
        { label: t('match.tackle.reel'), field: 'reel', options: getInventoryOptions('Reel', currentPlayer?.loadout.reel || '') },
        { label: t('match.tackle.line'), field: 'line', options: getInventoryOptions('Line', currentPlayer?.loadout.line || '') },
        { label: t('match.tackle.hook'), field: 'hook', options: getInventoryOptions('Hook', currentPlayer?.loadout.hook || '') },
        { label: t('match.tackle.feeder'), field: 'feeder', options: getInventoryOptions('Feeder', currentPlayer?.loadout.feeder || '') },
        { label: t('match.tackle.bait'), field: 'bait', options: getInventoryOptions('Bait', currentPlayer?.loadout.bait || '') },
        { label: t('match.tackle.groundbait'), field: 'groundbait', options: getInventoryOptions('Groundbait', currentPlayer?.loadout.groundbait || '') },
        { label: t('match.tackle.additive'), field: 'additive', options: getInventoryOptions('Additive', currentPlayer?.loadout.additive || '') },
        { label: t('match.tackle.feedertip'), field: 'feederTip', options: getTipOptions(currentPlayer?.loadout.feederTip || '') },
        { label: t('match.tackle.distance'), field: 'castingDistance', options: MOCK_CASTING_DISTANCES },
        { label: t('match.tackle.interval'), field: 'castingInterval', options: MOCK_CASTING_INTERVALS },
    ];

    const sortedParticipants = [...participants].sort((a,b) => b.totalWeight - a.totalWeight);
    const rank = sortedParticipants.findIndex(s => s.id === user.id) + 1;

    const getOptionLabel = (field: string, opt: string) => {
        if (opt.includes('_')) return t(`item.name.${opt}`);
        if (field === 'feederTip') return t(`opt.tip.${opt}`);
        if (field === 'castingDistance') {
            let key = 'medium';
            if (opt.includes('20m')) key = 'short';
            if (opt.includes('60m')) key = 'long';
            if (opt.includes('80m')) key = 'extreme';
            return t(`opt.dist.${key}`);
        }
        if (field === 'castingInterval') {
            let key = 'regular';
            if (opt.includes('2 mins')) key = 'frequent';
            if (opt.includes('10 mins')) key = 'patient';
            return t(`opt.int.${key}`);
        }
        return opt;
    };

    const TrendIcon = () => {
        if (catchTrend === 'rising') return (
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        );
        if (catchTrend === 'falling') return (
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        );
        return (
            <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h14" />
            </svg>
        );
    };

    const getTrendLabel = () => {
        if (catchTrend === 'rising') return t('match.ui.trend_rising');
        if (catchTrend === 'falling') return t('match.ui.trend_falling');
        return t('match.ui.trend_stable');
    };

    return (
        <div className="flex flex-col h-screen bg-white text-onSurface overflow-hidden select-none">
            {/* Stats Header */}
            <div className="mx-4 mt-4 mb-2 bg-slate-50 rounded-medium shadow-md border border-outline flex-shrink-0">
                <div className="grid grid-cols-3 gap-px bg-outline/20 overflow-hidden rounded-medium">
                    <div className="bg-slate-50 text-center py-2 border-r border-outline/20">
                        <p className="text-[8px] font-bold text-onSurfaceVariant mb-0.5">{t('match.ui.position')}</p>
                        <p className="text-xl font-black text-primary">#{rank}</p>
                    </div>
                    {/* Replaced Tactical Efficiency with Catch Trend */}
                    <div className="bg-slate-50 text-center py-2 flex flex-col items-center px-2">
                        <p className="text-[7px] font-bold text-onSurfaceVariant mb-1">{toSentenceCase(t('match.ui.trend'))}</p>
                        <div className="flex items-center gap-1.5 mb-1 bg-white px-2 py-0.5 rounded-full border border-outline shadow-sm">
                            <TrendIcon />
                            <span className={`text-[9px] font-black uppercase tracking-tight ${
                                catchTrend === 'rising' ? 'text-green-700' : 
                                catchTrend === 'falling' ? 'text-red-700' : 
                                'text-yellow-700'
                            }`}>
                                {getTrendLabel()}
                            </span>
                        </div>
                    </div>
                    <div className="bg-slate-50 text-center py-2 border-l border-outline/20">
                        <p className="text-[8px] font-bold text-onSurfaceVariant mb-0.5">{toSentenceCase(t('match.ui.time'))}</p>
                        <p className="text-xl font-black text-primary font-mono">{formatTime(timeLeft)}</p>
                    </div>
                </div>
            </div>

            {/* Compact Dashboard Grid */}
            <div className="flex-grow flex flex-col overflow-hidden relative border-t border-outline">
                <div 
                  className="flex-grow overflow-auto custom-scrollbar snap-x snap-mandatory"
                  style={{ scrollPaddingLeft: `${COL_WIDTH}px` }}
                >
                    <table className="border-separate border-spacing-0 w-max min-w-full table-fixed">
                        <thead>
                            <tr className="h-16">
                                {/* Player Sticky Header - Solid Background */}
                                <th 
                                  className={`sticky left-0 z-50 border-b-2 border-primary/20 border-r border-outline px-2 text-center transition-colors duration-500 shadow-[4px_0_10px_rgba(0,0,0,0.1)] ${lastCatchId === user.id ? 'bg-green-100' : 'bg-blue-50'}`} 
                                  style={{ width: COL_WIDTH }}
                                >
                                    <p className="text-[10px] font-black truncate text-primary leading-tight tracking-tight">{toSentenceCase(user.displayName)}</p>
                                    <p className={`text-sm font-black mt-0.5 ${lastCatchId === user.id ? 'text-green-700 scale-105' : 'text-secondary'} transition-all`}>
                                        {currentPlayer?.totalWeight.toFixed(2)} kg
                                    </p>
                                </th>
                                {/* Scrollable Opponent Headers */}
                                {botParticipants.map(bot => (
                                    <th key={bot.id} className={`bg-slate-100 border-b-2 border-primary/20 border-r border-outline px-2 text-center transition-colors duration-500 snap-start ${lastCatchId === bot.id ? 'bg-green-50' : ''}`} style={{ width: COL_WIDTH }}>
                                        <p className="text-[9px] font-bold truncate text-onSurface leading-tight tracking-tight opacity-70">{toSentenceCase(bot.name)}</p>
                                        <p className={`text-xs font-black mt-0.5 ${lastCatchId === bot.id ? 'text-green-600 scale-105' : 'text-onSurfaceVariant'} transition-all`}>
                                            {bot.totalWeight.toFixed(2)} kg
                                        </p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {TACTICS_FIELDS.map((f) => (
                                <tr key={f.field} className={ROW_HEIGHT_CLASS}>
                                    {/* Player Sticky Cells - Non-bold content */}
                                    <td 
                                      className="sticky left-0 z-30 bg-blue-50 border-b border-r border-outline px-2 shadow-[4px_0_10px_rgba(0,0,0,0.05)]" 
                                      style={{ width: COL_WIDTH }}
                                    >
                                        <div className="relative h-full flex items-center">
                                            <div className="relative w-full">
                                                <label className="absolute -top-1.5 left-1 px-1 bg-blue-50 text-[6px] font-black text-primary uppercase tracking-tight z-10 leading-none">
                                                    {f.label}
                                                </label>
                                                <select 
                                                    value={currentPlayer?.loadout[f.field] as string}
                                                    onChange={(e) => updatePlayerTactic(f.field, e.target.value)}
                                                    className="w-full h-[26px] bg-white border border-outline rounded-small text-[9px] px-1.5 focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.8rem_0.8rem] bg-[right_0.1rem_center] bg-no-repeat pr-4 text-left truncate"
                                                >
                                                    {f.options.map(opt => (
                                                        <option key={opt} value={opt}>
                                                            {getOptionLabel(f.field, opt)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Scrollable Opponent Cells */}
                                    {botParticipants.map(bot => (
                                        <td key={bot.id} className="bg-white border-b border-r border-outline px-2 text-center snap-start" style={{ width: COL_WIDTH }}>
                                            <div className="relative h-full flex items-center">
                                                <div className="relative w-full border border-slate-100 rounded-small bg-slate-50/30 px-1 pt-1 pb-0">
                                                    <span className="absolute -top-1.5 left-1 px-1 bg-white text-[6px] font-bold text-onSurfaceVariant uppercase tracking-tight z-10 leading-none">
                                                        {f.label}
                                                    </span>
                                                    <span className="text-[9px] text-onSurface/50 truncate block text-center py-1">
                                                        {getOptionLabel(f.field, bot.loadout[f.field] as string)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Compact Footer */}
            <div className="bg-slate-100 border-t border-outline px-4 py-2 flex justify-between items-center flex-shrink-0">
                <span className="text-[9px] font-bold text-onSurfaceVariant animate-pulse">
                    Live feed
                </span>
                <div className="flex gap-3">
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span className="text-[8px] font-black text-primary uppercase">{user.displayName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                        <span className="text-[8px] font-black text-secondary uppercase">Weight</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
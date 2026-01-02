import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
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
    MOCK_FISH_SPECIES,
    DEFAULT_LOADOUT
} from '../constants';
import { type LiveParticipant } from '../services/liveMatchService';
import { useTranslation } from '../i18n/LanguageContext';
import { saveActiveLoadout } from '../services/tacticService';

interface MatchUIScreenProps {
  user: User;
  playerLoadout: Loadout;
  onMatchEnd: (result: MatchResult) => void;
  participantsOverride?: LiveParticipant[]; 
}

const MATCH_DURATION = 120; 
const COL_WIDTH = 130; 
const ROW_HEIGHT_CLASS = 'h-[52px]'; 
const MAX_PARTICIPANTS = 15;

const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

const toSentenceCase = (str: string): string => {
    if (!str) return '';
    const s = str.trim();
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

/**
 * Calculates a weighted efficiency score based on how well the loadout matches
 * the dominant fish species preferences. Primary factors (Bait, Groundbait) carry more weight.
 */
const calculateEfficiency = (loadout: Loadout): number => {
    if (!loadout.venueFish || !loadout.venueFish.dominant) return 0.5;
    
    const targetFish = MOCK_FISH_SPECIES.find(f => 
        `${f.variant} ${f.name}` === loadout.venueFish?.dominant
    );
    
    if (!targetFish) return 0.5;

    let totalPoints = 0;
    const weights = {
        bait: 4,
        groundbait: 4,
        hook: 3,
        distance: 2,
        interval: 1,
        feeder: 1,
        feederTip: 1,
        rod: 1,
        reel: 1,
        line: 1,
        additive: 1
    };

    if (targetFish.preferredBaits.includes(loadout.bait)) totalPoints += weights.bait;
    if (targetFish.preferredGroundbaits.includes(loadout.groundbait)) totalPoints += weights.groundbait;
    if (targetFish.preferredHooks.includes(loadout.hook)) totalPoints += weights.hook;
    if (targetFish.preferredDistance.includes(loadout.castingDistance)) totalPoints += weights.distance;
    if (targetFish.preferredIntervals.includes(loadout.castingInterval)) totalPoints += weights.interval;
    if (targetFish.preferredFeeders.includes(loadout.feeder)) totalPoints += weights.feeder;
    if (targetFish.preferredFeederTips.includes(loadout.feederTip)) totalPoints += weights.feederTip;
    if (targetFish.preferredRods.includes(loadout.rod)) totalPoints += weights.rod;
    if (targetFish.preferredReels.includes(loadout.reel)) totalPoints += weights.reel;
    if (targetFish.preferredLines.includes(loadout.line)) totalPoints += weights.line;
    if (targetFish.preferredAdditives.includes(loadout.additive)) totalPoints += weights.additive;

    const maxPoints = Object.values(weights).reduce((a, b) => a + b, 0);
    return totalPoints / maxPoints;
};

const calculateWinnings = (rank: number, isLive: boolean): number => {
    const basePrize = isLive ? 500 : 100;
    if (rank === 1) return basePrize;
    if (rank === 2) return Math.floor(basePrize * 0.6);
    if (rank === 3) return Math.floor(basePrize * 0.4);
    if (rank <= 5) return Math.floor(basePrize * 0.2);
    if (rank <= 10) return Math.floor(basePrize * 0.1);
    return Math.max(5, Math.floor(basePrize * 0.05));
};

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateCompetitiveLoadout = (venueFish: Loadout['venueFish']): Loadout => {
    const pickTactic = (preferred: string[], all: string[]) => {
        return Math.random() < 0.7 && preferred.length > 0 ? getRandomElement(preferred) : getRandomElement(all);
    };

    const targetFish = MOCK_FISH_SPECIES.find(f => 
        venueFish && `${f.variant} ${f.name}` === venueFish.dominant
    );

    if (!targetFish) return {
        ...DEFAULT_LOADOUT,
        rod: getRandomElement(MOCK_RODS), reel: getRandomElement(MOCK_REELS),
        line: getRandomElement(MOCK_LINES), hook: getRandomElement(MOCK_HOOK_SIZES),
        feeder: getRandomElement(MOCK_FEEDER_TYPES), bait: getRandomElement(MOCK_BAITS),
        groundbait: getRandomElement(MOCK_GROUNDBAITS), additive: getRandomElement(MOCK_ADDITIVES),
        feederTip: getRandomElement(MOCK_FEEDER_TIPS), castingDistance: getRandomElement(MOCK_CASTING_DISTANCES),
        castingInterval: getRandomElement(MOCK_CASTING_INTERVALS), venueFish
    };

    return {
        rod: pickTactic(targetFish.preferredRods, MOCK_RODS),
        reel: pickTactic(targetFish.preferredReels, MOCK_REELS),
        line: pickTactic(targetFish.preferredLines, MOCK_LINES),
        hook: pickTactic(targetFish.preferredHooks, MOCK_HOOK_SIZES),
        feeder: pickTactic(targetFish.preferredFeeders, MOCK_FEEDER_TYPES),
        bait: pickTactic(targetFish.preferredBaits, MOCK_BAITS),
        groundbait: pickTactic(targetFish.preferredGroundbaits, MOCK_GROUNDBAITS),
        additive: pickTactic(targetFish.preferredAdditives, MOCK_ADDITIVES),
        feederTip: pickTactic(targetFish.preferredFeederTips, MOCK_FEEDER_TIPS),
        castingDistance: pickTactic(targetFish.preferredDistance, MOCK_CASTING_DISTANCES),
        castingInterval: pickTactic(targetFish.preferredIntervals, MOCK_CASTING_INTERVALS),
        venueFish
    };
};

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Sub-component for a single bar in the standings chart to prevent unnecessary re-renders.
 */
const StandingBar = memo(({ 
    id, 
    height, 
    isPlayer, 
    isCatching, 
    onScrollRequest 
}: { 
    id: string, 
    height: number, 
    isPlayer: boolean, 
    isCatching: boolean, 
    onScrollRequest: (id: string) => void 
}) => {
    return (
        <div className="flex flex-col justify-end items-center gap-1 flex-1 min-w-0 h-full">
            <button 
                onClick={() => onScrollRequest(id)} 
                className={`relative w-full transition-[height,background-color,transform] duration-200 ease-out rounded-t-small border-t border-x border-white/20 transform-gpu will-change-[height] ${
                    isPlayer 
                        ? 'bg-primary z-20 shadow-[0_-4px_12px_rgba(30,58,138,0.3)]' 
                        : 'bg-slate-400 z-10'
                } ${isCatching ? 'brightness-125 scale-y-110 origin-bottom' : ''}`} 
                style={{ height: `${Math.max(height, 8)}%` }}
            />
        </div>
    );
});

StandingBar.displayName = 'StandingBar';

export const MatchUIScreen: React.FC<MatchUIScreenProps> = ({ user, playerLoadout, onMatchEnd, participantsOverride }) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
    const [playerCatchTimestamps, setPlayerCatchTimestamps] = useState<number[]>([]);
    const [catchingIds, setCatchingIds] = useState<Set<string>>(new Set());
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const isLiveMode = !!(participantsOverride && participantsOverride.length > 0);
    
    const [participants, setParticipants] = useState<MatchParticipant[]>(() => {
        const activePlayerLoadout = { 
            ...DEFAULT_LOADOUT, 
            ...playerLoadout 
        };

        const mainPlayer: MatchParticipant = {
            id: user.id, 
            name: user.displayName, 
            isBot: false, 
            loadout: activePlayerLoadout, 
            totalWeight: 0, 
            catchStreak: 0, 
            lastCatchTime: Date.now(),
            country: user.country,
            avatar: user.avatar
        };

        if (isLiveMode) {
            const otherHumans = participantsOverride!
                .filter(lp => lp.id !== user.id)
                .slice(0, MAX_PARTICIPANTS - 1)
                .map(lp => ({
                    id: lp.id,
                    name: lp.displayName,
                    isBot: false, 
                    loadout: generateCompetitiveLoadout(activePlayerLoadout.venueFish), 
                    totalWeight: 0,
                    catchStreak: 0,
                    lastCatchTime: Date.now(),
                    country: lp.country,
                    avatar: lp.avatar
                }));
            return [mainPlayer, ...otherHumans];
        } else {
            const PRACTICE_BOTS = [
                "Benjamin Sabo", "George Sekley", "Andrew Georgio", "Michael Espander",
                "Maxwell Lufton", "Paul Hanley", "John Novak", "Anson Raymond",
                "Felix Sherman", "James O’Harris", "Adam Eldridge", "Joseph Konrad",
                "Steven Ringwood", "Matthew Sivens"
            ];
            const bots = PRACTICE_BOTS.slice(0, MAX_PARTICIPANTS - 1).map((name, i) => ({
                id: `bot_${i}`, 
                name: name, 
                isBot: true, 
                loadout: generateCompetitiveLoadout(activePlayerLoadout.venueFish), 
                totalWeight: 0, 
                catchStreak: 0, 
                lastCatchTime: Date.now()
            }));
            return [mainPlayer, ...bots];
        }
    });

    const participantsRef = useRef(participants);
    useEffect(() => { participantsRef.current = participants; }, [participants]);

    useEffect(() => {
        if (timeLeft <= 0) {
            const standings = [...participantsRef.current].sort((a,b) => b.totalWeight - a.totalWeight);
            const playerRank = standings.findIndex(p => p.id === user.id) + 1;
            const winnings = calculateWinnings(playerRank, isLiveMode);

            onMatchEnd({
                playerWeight: standings.find(s => s.id === user.id)?.totalWeight || 0,
                opponentWeight: standings[0].totalWeight,
                eurosEarned: winnings, 
                standings,
                isLive: isLiveMode
            });
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, onMatchEnd, isLiveMode, user.id]);

    useEffect(() => {
        // Slow down catch simulation rate: 2500ms for Practice, 1200ms for Live
        const simInterval = isLiveMode ? 1200 : 2500;
        
        const sim = setInterval(() => {
            setParticipants(prev => {
                let someCaught = false;
                const newParticipants = prev.map(p => {
                    const eff = calculateEfficiency(p.loadout);
                    
                    /**
                     * Catch probability refined to be highly dependent on tactics (eff).
                     * Low efficiency results in very rare bites.
                     * High efficiency rewards the player with consistent action.
                     */
                    const baseChance = p.isBot ? 0.04 : 0.06;
                    const bonusChance = p.isBot ? 0.14 : 0.18;
                    const catchChance = baseChance + (Math.pow(eff, 1.5) * bonusChance);
                    
                    if (Math.random() < catchChance) {
                        someCaught = true;
                        const weight = parseFloat((Math.random() * 2.5 + 0.1).toFixed(2));
                        if (p.id === user.id) setPlayerCatchTimestamps(ts => [...ts, Date.now()]);
                        
                        // Mark as catching for visual feedback
                        setCatchingIds(prevSet => new Set(prevSet).add(p.id));
                        setTimeout(() => {
                            setCatchingIds(prevSet => {
                                const newSet = new Set(prevSet);
                                newSet.delete(p.id);
                                return newSet;
                            });
                        }, 400);

                        return { ...p, totalWeight: p.totalWeight + weight, lastCatchTime: Date.now() };
                    }
                    return p;
                });
                return someCaught ? newParticipants : prev;
            });
        }, simInterval); 
        return () => clearInterval(sim);
    }, [user.id, isLiveMode]);

    const catchTrend = useMemo(() => {
        const now = Date.now();
        const windowSize = 60000;
        const recent = playerCatchTimestamps.filter(ts => ts >= now - windowSize).length;
        const previous = playerCatchTimestamps.filter(ts => ts >= now - (windowSize * 2) && ts < now - windowSize).length;
        return recent > previous ? 'rising' : recent < previous ? 'falling' : 'stable';
    }, [playerCatchTimestamps]);

    const maxWeight = useMemo(() => {
        const m = Math.max(...participants.map(p => p.totalWeight));
        return m > 0 ? m : 1.0;
    }, [participants]);

    const scrollToParticipant = (participantId: string) => {
        if (!tableContainerRef.current) return;
        const idx = participants.findIndex(p => p.id === participantId);
        if (idx !== -1) {
            const targetScroll = Math.max(0, (idx - 1) * COL_WIDTH);
            tableContainerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
        }
    };

    const TACTICS_FIELDS: { label: string, field: keyof Loadout, options: string[] }[] = [
        { label: t('match.tackle.rod'), field: 'rod', options: user.inventory.filter(i => i.type === 'Rod').map(i => i.id) },
        { label: t('match.tackle.reel'), field: 'reel', options: user.inventory.filter(i => i.type === 'Reel').map(i => i.id) },
        { label: t('match.tackle.line'), field: 'line', options: user.inventory.filter(i => i.type === 'Line').map(i => i.id) },
        { label: t('match.tackle.hook'), field: 'hook', options: user.inventory.filter(i => i.type === 'Hook').map(i => i.id) },
        { label: t('match.tackle.feeder'), field: 'feeder', options: user.inventory.filter(i => i.type === 'Feeder').map(i => i.id) },
        { label: t('match.tackle.bait'), field: 'bait', options: user.inventory.filter(i => i.type === 'Bait').map(i => i.id) },
        { label: t('match.tackle.groundbait'), field: 'groundbait', options: user.inventory.filter(i => i.type === 'Groundbait').map(i => i.id) },
        { label: t('match.tackle.additive'), field: 'additive', options: user.inventory.filter(i => i.type === 'Additive').map(i => i.id) },
        { label: t('match.tackle.feedertip'), field: 'feederTip', options: user.inventory.filter(i => i.id.startsWith('acc_qt')).map(i => {
            const numeric = i.id.replace('acc_qt', '');
            return `${numeric.slice(0, 1)}.${numeric.slice(1)}oz`;
        }) },
        { label: t('match.tackle.distance'), field: 'castingDistance', options: MOCK_CASTING_DISTANCES },
        { label: t('match.tackle.interval'), field: 'castingInterval', options: MOCK_CASTING_INTERVALS },
    ];

    const getOptionLabel = (field: string, opt: string) => {
        if (!opt) return '-';
        if (opt.includes('_')) return t(`item.name.${opt}`);
        if (field === 'feederTip') return t(`opt.tip.${opt}`);
        
        const paramKeys: Record<string, string> = {
            'Short (20m)': 'opt.dist.short',
            'Medium (40m)': 'opt.dist.medium',
            'Long (60m)': 'opt.dist.long',
            'Extreme (80m)': 'opt.dist.extreme',
            'Frequent (2 mins)': 'opt.int.frequent',
            'Regular (5 mins)': 'opt.int.regular',
            'Patient (10 mins)': 'opt.int.patient'
        };
        
        if (paramKeys[opt]) return t(paramKeys[opt]);
        if (opt.startsWith('opt.')) return t(opt);
        
        return opt;
    };

    const updatePlayerTactic = (field: keyof Loadout, value: string) => {
        setParticipants(prev => prev.map(p => {
            if (p.id === user.id) {
                const newLoadout = { ...p.loadout, [field]: value };
                saveActiveLoadout(newLoadout);
                return { ...p, loadout: newLoadout };
            }
            return p;
        }));
    };

    const currentRank = [...participants].sort((a,b) => b.totalWeight - a.totalWeight).findIndex(p => p.id === user.id) + 1;

    // Determine if any catch is active for the dynamic background
    const isAnyCatching = catchingIds.size > 0;

    return (
        <div className="flex flex-col h-screen bg-white text-onSurface overflow-hidden select-none">
            <div className="bg-slate-50 border-b border-outline px-4 py-3 flex flex-col gap-2 flex-shrink-0">
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center">
                        <p className="text-[7px] font-bold text-onSurfaceVariant mb-0.5">{toSentenceCase(t('match.ui.position'))}</p>
                        <p className="text-xl font-black text-primary leading-none">#{currentRank}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-[7px] font-bold text-onSurfaceVariant mb-0.5">{toSentenceCase(t('match.ui.trend'))}</p>
                        <span className={`text-[9px] font-black tracking-tight ${catchTrend === 'rising' ? 'text-green-700' : catchTrend === 'falling' ? 'text-red-700' : 'text-yellow-700'}`}>
                            {t(`match.ui.trend_${catchTrend}`)}
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-[7px] font-bold text-onSurfaceVariant mb-0.5">{toSentenceCase(t('match.ui.time'))}</p>
                        <p className="text-xl font-black text-primary font-mono leading-none">{formatTime(timeLeft)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 border-y border-outline flex flex-col flex-shrink-0">
                <div className="px-4 pt-3">
                    <span className="text-[9px] font-black text-onSurfaceVariant tracking-tight">{toSentenceCase(t('match.ui.live_standings'))}</span>
                </div>
                
                <div className="flex flex-col items-center pb-4">
                    <div className={`flex justify-between gap-1 h-40 w-full overflow-hidden pb-1 pt-4 px-4 transition-colors duration-300 ease-in-out shadow-inner ${isAnyCatching ? 'bg-green-100/40' : 'bg-blue-50/40'}`}>
                        {participants.map((p) => {
                            const h = (p.totalWeight / maxWeight) * 100;
                            return (
                                <StandingBar 
                                    key={p.id}
                                    id={p.id}
                                    height={h}
                                    isPlayer={p.id === user.id}
                                    isCatching={catchingIds.has(p.id)}
                                    onScrollRequest={scrollToParticipant}
                                />
                            );
                        })}
                    </div>
                    
                    <div className="flex flex-col items-center gap-1.5 mt-2 px-6 w-full">
                        <div className="flex justify-center gap-12 w-full">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 bg-primary rounded-small"></div>
                                <span className="text-[8px] font-bold text-primary">You</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 bg-slate-400 rounded-small"></div>
                                <span className="text-[8px] font-bold text-onSurfaceVariant">Opponents</span>
                            </div>
                        </div>
                        <p className="text-[8px] font-medium text-onSurfaceVariant/70 italic mt-1">
                            Tap on a bar to scroll to the player's tactics
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-grow flex flex-col overflow-hidden relative border-t border-outline">
                <div ref={tableContainerRef} className="flex-grow overflow-auto custom-scrollbar snap-x snap-mandatory scroll-pl-[130px]">
                    <table className="border-separate border-spacing-0 w-max min-w-full table-fixed">
                        <thead>
                            <tr className="h-14">
                                {participants.map((p, idx) => {
                                    const isCatching = catchingIds.has(p.id);
                                    return (
                                        <th 
                                            key={`header-${p.id}`} 
                                            className={`sticky top-0 border-b border-r border-outline px-2 text-center transition-all duration-200 ${idx === 0 ? 'left-0 z-50 bg-slate-50 shadow-[2px_0_5px_rgba(0,0,0,0.05)]' : 'z-40 bg-slate-50'} ${isCatching ? 'bg-green-100' : ''}`} 
                                            style={{ width: COL_WIDTH }}
                                        >
                                            <p className="text-[9px] font-black truncate text-primary leading-tight tracking-tight">{toTitleCase(p.name)}</p>
                                            <p className="text-[11px] font-black text-secondary">{p.totalWeight.toFixed(2)} {t('common.kg')}</p>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {TACTICS_FIELDS.map((f) => (
                                <tr key={`row-${f.field}`} className={ROW_HEIGHT_CLASS}>
                                    {participants.map((p, idx) => {
                                        const isMainPlayer = p.id === user.id;
                                        const fieldOptions = Array.from(new Set([p.loadout[f.field] as string, ...(isMainPlayer ? f.options : [])])).sort();
                                        
                                        return (
                                            <td 
                                                key={`cell-${p.id}-${f.field}`} 
                                                className={`border-b border-r border-outline px-2 text-center snap-start ${idx === 0 ? 'sticky left-0 z-30 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.05)]' : 'bg-white'}`} 
                                                style={{ width: COL_WIDTH }}
                                            >
                                                <div className="relative h-full flex items-center justify-center p-1">
                                                    <label className="absolute -top-1.5 left-1 px-1 text-[6px] font-black text-onSurfaceVariant/50 z-10 leading-none bg-white/90 rounded-sm">{toSentenceCase(f.label)}</label>
                                                    <div className={`w-full h-[28px] border border-outline rounded-small bg-white flex items-center overflow-hidden transition-all ${isMainPlayer ? 'border-primary/40' : ''}`}>
                                                        {isMainPlayer ? (
                                                            <select 
                                                                value={p.loadout[f.field] as string}
                                                                onChange={(e) => updatePlayerTactic(f.field, e.target.value)}
                                                                className="w-full h-full bg-transparent text-[9px] px-1 focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.6rem_0.6rem] bg-[right_0.1rem_center] bg-no-repeat pr-4"
                                                            >
                                                                {fieldOptions.map((opt, optIdx) => <option key={`${opt}-${optIdx}-${f.field}`} value={opt}>{getOptionLabel(f.field, opt)}</option>)}
                                                            </select>
                                                        ) : (
                                                            <span className="w-full text-[9px] text-onSurfaceVariant font-medium truncate px-1 text-center">
                                                                {getOptionLabel(f.field, p.loadout[f.field] as string)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
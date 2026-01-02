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

const calculateEfficiency = (loadout: Loadout): number => {
    if (!loadout.venueFish || !loadout.venueFish.dominant) return 0.5;
    
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

export const MatchUIScreen: React.FC<MatchUIScreenProps> = ({ user, playerLoadout, onMatchEnd, participantsOverride }) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
    const [lastCatchId, setLastCatchId] = useState<string | null>(null);
    const [playerCatchTimestamps, setPlayerCatchTimestamps] = useState<number[]>([]);
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
        const sim = setInterval(() => {
            setParticipants(prev => {
                return prev.map(p => {
                    const eff = calculateEfficiency(p.loadout);
                    // Increased catch rates to make real-time bar updates more visible
                    const catchChance = p.isBot ? (0.08 + (eff * 0.18)) : (0.10 + (eff * 0.22));
                    
                    if (Math.random() < catchChance) {
                        const weight = parseFloat((Math.random() * 2.5 + 0.1).toFixed(2));
                        setLastCatchId(p.id);
                        if (p.id === user.id) setPlayerCatchTimestamps(ts => [...ts, Date.now()]);
                        setTimeout(() => setLastCatchId(null), 800);
                        return { ...p, totalWeight: p.totalWeight + weight, lastCatchTime: Date.now() };
                    }
                    return p;
                });
            });
        }, 1200); 
        return () => clearInterval(sim);
    }, [user.id]);

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

    return (
        <div className="flex flex-col h-screen bg-white text-onSurface overflow-hidden select-none">
            <div className="bg-slate-50 border-b border-outline px-4 py-3 flex flex-col gap-2 flex-shrink-0">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-onSurfaceVariant tracking-tight">{toSentenceCase(t('match.ui.session'))}</span>
                </div>
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
                <div className="px-4 pt-3 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-onSurfaceVariant tracking-tight">{toSentenceCase(t('match.ui.live_standings'))}</span>
                    </div>
                </div>
                
                <div className="flex flex-col items-center pb-3">
                    <div className="flex items-end justify-between gap-px h-16 w-full overflow-hidden pb-1 pt-4">
                        {participants.map((p) => {
                            const h = (p.totalWeight / maxWeight) * 100;
                            const isPlayer = p.id === user.id;
                            return (
                                <div key={p.id} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                                    <button 
                                        onClick={() => scrollToParticipant(p.id)} 
                                        className={`relative w-full overflow-hidden transition-all duration-300 ease-out rounded-t-[1px] ${isPlayer ? 'bg-primary z-20 shadow-[0_-2px_6px_rgba(30,58,138,0.2)]' : 'bg-slate-300 z-10'} ${lastCatchId === p.id ? 'brightness-125 scale-y-110 shadow-primary/20' : ''}`} 
                                        style={{ height: `${Math.max(h, 4)}%` }}
                                    />
                                    {isPlayer && <div className="w-1 h-1 bg-primary rounded-full" />}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="flex flex-col items-center gap-1.5 mt-2 px-6 w-full">
                        <div className="flex justify-center gap-10 w-full">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-primary rounded-full shadow-sm"></div>
                                <span className="text-[7px] font-bold text-primary">{toSentenceCase('Your standings')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-slate-300 rounded-full shadow-sm"></div>
                                <span className="text-[7px] font-bold text-onSurfaceVariant">{toSentenceCase('Opponents')}</span>
                            </div>
                        </div>
                        <p className="text-[8px] text-onSurfaceVariant/80 font-medium text-center px-4 italic mt-1 leading-snug">
                            Adjust your tactics to improve your catch efficiency. The bars represent total catch weight relative to the leader.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-grow flex flex-col overflow-hidden relative border-t border-outline mt-2">
                <div ref={tableContainerRef} className="flex-grow overflow-auto custom-scrollbar snap-x snap-mandatory scroll-pl-[130px]">
                    <table className="border-separate border-spacing-0 w-max min-w-full table-fixed">
                        <thead>
                            <tr className="h-14">
                                {participants.map((p, idx) => (
                                    <th 
                                        key={p.id} 
                                        className={`sticky top-0 border-b border-r border-outline px-2 text-center transition-all ${idx === 0 ? 'left-0 z-50 bg-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)]' : 'z-40 bg-slate-100'} ${lastCatchId === p.id ? 'bg-green-100' : ''}`} 
                                        style={{ width: COL_WIDTH }}
                                    >
                                        <p className="text-[9px] font-black truncate text-primary leading-tight tracking-tight">{toTitleCase(p.name)}</p>
                                        <p className="text-[11px] font-black text-secondary">{p.totalWeight.toFixed(2)} {t('common.kg')}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {TACTICS_FIELDS.map((f) => (
                                <tr key={f.field} className={ROW_HEIGHT_CLASS}>
                                    {participants.map((p, idx) => {
                                        const isMainPlayer = p.id === user.id;
                                        // Ensure unique options only in the dropdown by combining current selection with inventory
                                        const fieldOptions = Array.from(new Set([p.loadout[f.field] as string, ...(isMainPlayer ? f.options : [])])).sort();
                                        
                                        return (
                                            <td 
                                                key={`${p.id}-${f.field}`} 
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
                                                                {fieldOptions.map(opt => <option key={opt} value={opt}>{getOptionLabel(f.field, opt)}</option>)}
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
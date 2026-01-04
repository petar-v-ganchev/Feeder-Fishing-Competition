
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
import { HapticService } from '../services/hapticService';

interface MatchUIScreenProps {
  user: User;
  playerLoadout: Loadout;
  onMatchEnd: (result: MatchResult) => void;
  participantsOverride?: LiveParticipant[]; 
}

const MATCH_DURATION = 120; 
const COL_WIDTH = 130; 
const ROW_HEIGHT_CLASS = 'h-[60px]'; 
const MAX_PARTICIPANTS = 15;

const calculateEfficiency = (loadout: Loadout): number => {
    if (!loadout.venueFish || !loadout.venueFish.dominant) return 0.5;
    const targetFish = MOCK_FISH_SPECIES.find(f => `${f.variant} ${f.name}` === loadout.venueFish?.dominant);
    if (!targetFish) return 0.5;

    let totalPoints = 0;
    const weights = { bait: 4, groundbait: 4, hook: 3, distance: 2, interval: 1, feeder: 1, feederTip: 1, rod: 1, reel: 1, line: 1, additive: 1 };

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

    return totalPoints / Object.values(weights).reduce((a, b) => a + b, 0);
};

const calculateWinnings = (rank: number, isLive: boolean): number => {
    const basePrize = isLive ? 500 : 100;
    if (rank === 1) return basePrize;
    if (rank === 2) return Math.floor(basePrize * 0.6);
    if (rank === 3) return Math.floor(basePrize * 0.4);
    return Math.max(5, Math.floor(basePrize * 0.05));
};

const generateCompetitiveLoadout = (venueFish: Loadout['venueFish']): Loadout => {
    return { ...DEFAULT_LOADOUT, rod: MOCK_RODS[0], reel: MOCK_REELS[0], line: MOCK_LINES[0], hook: MOCK_HOOK_SIZES[0], feeder: MOCK_FEEDER_TYPES[0], bait: MOCK_BAITS[0], groundbait: MOCK_GROUNDBAITS[0], additive: MOCK_ADDITIVES[0], feederTip: MOCK_FEEDER_TIPS[0], castingDistance: MOCK_CASTING_DISTANCES[0], castingInterval: MOCK_CASTING_INTERVALS[0], venueFish };
};

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const StandingBar = memo(({ id, height, isPlayer, isCatching, onScrollRequest }: { id: string, height: number, isPlayer: boolean, isCatching: boolean, onScrollRequest: (id: string) => void }) => (
    <div className="flex flex-col justify-end items-center gap-1 flex-1 min-w-0 h-full">
        <button 
            onClick={() => { HapticService.light(); onScrollRequest(id); }} 
            className={`relative w-full transition-[height,background-color,transform] duration-300 ease-out rounded-t-[4px] transform-gpu will-change-[height] ${isPlayer ? 'bg-primary z-20 shadow-lg' : 'bg-slate-300 z-10'} ${isCatching ? 'brightness-125 scale-y-110 origin-bottom' : ''}`} 
            style={{ height: `${Math.max(height, 5)}%` }}
        />
    </div>
));

StandingBar.displayName = 'StandingBar';

export const MatchUIScreen: React.FC<MatchUIScreenProps> = ({ user, playerLoadout, onMatchEnd, participantsOverride }) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
    const [playerCatchTimestamps, setPlayerCatchTimestamps] = useState<number[]>([]);
    const [catchingIds, setCatchingIds] = useState<Set<string>>(new Set());
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const isLiveMode = !!(participantsOverride && participantsOverride.length > 0);
    const [participants, setParticipants] = useState<MatchParticipant[]>(() => {
        const mainPlayer: MatchParticipant = { id: user.id, name: user.displayName, isBot: false, loadout: { ...DEFAULT_LOADOUT, ...playerLoadout }, totalWeight: 0, catchStreak: 0, lastCatchTime: Date.now(), country: user.country, avatar: user.avatar };
        if (isLiveMode) {
            return [mainPlayer, ...participantsOverride!.filter(lp => lp.id !== user.id).slice(0, 14).map(lp => ({ id: lp.id, name: lp.displayName, isBot: false, loadout: generateCompetitiveLoadout(mainPlayer.loadout.venueFish), totalWeight: 0, catchStreak: 0, lastCatchTime: Date.now(), country: lp.country, avatar: lp.avatar }))];
        }
        return [mainPlayer, ...["Ben S.", "George S.", "Andy G.", "Mike E.", "Max L.", "Paul H.", "John N.", "Anson R.", "Felix S.", "James O.", "Adam E.", "Joe K.", "Steve R.", "Matt S."].map((name, i) => ({ id: `bot_${i}`, name: name, isBot: true, loadout: generateCompetitiveLoadout(mainPlayer.loadout.venueFish), totalWeight: 0, catchStreak: 0, lastCatchTime: Date.now() }))];
    });

    const participantsRef = useRef(participants);
    useEffect(() => { participantsRef.current = participants; }, [participants]);

    useEffect(() => {
        if (timeLeft <= 0) {
            const standings = [...participantsRef.current].sort((a,b) => b.totalWeight - a.totalWeight);
            const playerRank = standings.findIndex(p => p.id === user.id) + 1;
            onMatchEnd({ playerWeight: standings.find(s => s.id === user.id)?.totalWeight || 0, opponentWeight: standings[0].totalWeight, eurosEarned: calculateWinnings(playerRank, isLiveMode), standings, isLive: isLiveMode });
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, onMatchEnd, isLiveMode, user.id]);

    useEffect(() => {
        const simInterval = isLiveMode ? 1200 : 2500;
        const sim = setInterval(() => {
            setParticipants(prev => {
                let someCaught = false;
                const nextParticipants = prev.map(p => {
                    const eff = calculateEfficiency(p.loadout);
                    const baseChance = p.isBot ? 0.04 : 0.06;
                    const bonusChance = p.isBot ? 0.14 : 0.18;
                    const catchChance = baseChance + (Math.pow(eff, 1.5) * bonusChance);
                    
                    if (Math.random() < catchChance) {
                        someCaught = true;
                        const weight = parseFloat((Math.random() * 2.5 + 0.1).toFixed(2));
                        if (p.id === user.id) {
                            setPlayerCatchTimestamps(ts => [...ts, Date.now()]);
                            HapticService.heavy();
                        }
                        setCatchingIds(prevSet => { const ns = new Set(prevSet); ns.add(p.id); return ns; });
                        setTimeout(() => { setCatchingIds(ps => { const ns = new Set(ps); ns.delete(p.id); return ns; }); }, 600);
                        return { ...p, totalWeight: p.totalWeight + weight, lastCatchTime: Date.now() };
                    }
                    return p;
                });
                return someCaught ? nextParticipants : prev;
            });
        }, simInterval); 
        return () => clearInterval(sim);
    }, [user.id, isLiveMode]);

    const catchTrend = useMemo(() => {
        const now = Date.now();
        const recent = playerCatchTimestamps.filter(ts => ts >= now - 60000).length;
        const previous = playerCatchTimestamps.filter(ts => ts >= now - 120000 && ts < now - 60000).length;
        return recent > previous ? 'rising' : recent < previous ? 'falling' : 'stable';
    }, [playerCatchTimestamps]);

    const maxWeight = useMemo(() => Math.max(1.0, ...participants.map(p => p.totalWeight)), [participants]);
    const scrollToParticipant = (id: string) => {
        if (!tableContainerRef.current) return;
        const idx = participants.findIndex(p => p.id === id);
        if (idx !== -1) tableContainerRef.current.scrollTo({ left: Math.max(0, (idx - 1) * COL_WIDTH), behavior: 'smooth' });
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
        { label: t('match.tackle.feedertip'), field: 'feederTip', options: user.inventory.filter(i => i.id.startsWith('acc_qt')).map(i => `${i.id.replace('acc_qt', '').slice(0, 1)}.${i.id.replace('acc_qt', '').slice(1)}oz`) },
        { label: t('match.tackle.distance'), field: 'castingDistance', options: MOCK_CASTING_DISTANCES },
        { label: t('match.tackle.interval'), field: 'castingInterval', options: MOCK_CASTING_INTERVALS },
    ];

    const currentRank = [...participants].sort((a,b) => b.totalWeight - a.totalWeight).findIndex(p => p.id === user.id) + 1;

    return (
        <div className="flex flex-col h-screen bg-white text-onSurface overflow-hidden select-none animate-reveal">
            {/* Optimized Notch-Safe Header with Centered Timing */}
            <div className="bg-white border-b border-outline px-6 pb-4 pt-[var(--notch-spacing)] flex flex-col gap-1 flex-shrink-0">
                <div className="flex items-end h-14 relative">
                    <div className="flex flex-col z-10">
                        <p className="text-[10px] font-bold text-onSurfaceVariant uppercase tracking-wider leading-none mb-1">{t('match.ui.position')}</p>
                        <p className="text-3xl font-black text-primary leading-none">#{currentRank}</p>
                    </div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
                        <p className="text-[10px] font-bold text-onSurfaceVariant uppercase tracking-wider leading-none mb-1">{t('match.ui.time')}</p>
                        <p className="text-2xl font-black text-primary leading-none font-mono">{formatTime(timeLeft)}</p>
                    </div>
                    
                    <div className="flex flex-col items-end ml-auto z-10">
                        <p className="text-[10px] font-bold text-onSurfaceVariant uppercase tracking-wider leading-none mb-1">{t('match.ui.trend')}</p>
                        <p className={`text-sm font-black uppercase ${catchTrend === 'rising' ? 'text-green-600' : catchTrend === 'falling' ? 'text-secondary' : 'text-amber-500'}`}>{t(`match.ui.trend_${catchTrend}`)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 border-b border-outline flex flex-col flex-shrink-0">
                <div className={`flex justify-between gap-1 h-32 w-full overflow-hidden pb-1 pt-4 px-6 transition-colors duration-300 ${catchingIds.size > 0 ? 'bg-green-50' : 'bg-slate-50'}`}>
                    {participants.map((p) => (
                        <StandingBar 
                            key={p.id}
                            id={p.id}
                            height={(p.totalWeight / maxWeight) * 100}
                            isPlayer={p.id === user.id}
                            isCatching={catchingIds.has(p.id)}
                            onScrollRequest={scrollToParticipant}
                        />
                    ))}
                </div>
            </div>

            <div className="flex-grow flex flex-col overflow-hidden relative border-t border-outline">
                <div ref={tableContainerRef} className="flex-grow overflow-auto custom-scrollbar snap-x snap-mandatory">
                    <table className="border-separate border-spacing-0 w-max min-w-full table-fixed">
                        <thead>
                            <tr className="h-16">
                                {participants.map((p, idx) => (
                                    <th key={p.id} className={`sticky top-0 border-b border-r border-outline px-4 text-center transition-all ${idx === 0 ? 'left-0 z-50 bg-white/95 backdrop-blur-md shadow-sm' : 'z-40 bg-white'} ${catchingIds.has(p.id) ? 'bg-green-100' : ''}`} style={{ width: COL_WIDTH }}>
                                        <p className="text-[10px] font-black truncate text-primary uppercase tracking-tight">{p.name}</p>
                                        <p className="text-lg font-black text-secondary leading-none mt-1">{p.totalWeight.toFixed(2)}<span className="text-[10px] ml-0.5">{t('common.kg')}</span></p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {TACTICS_FIELDS.map((f) => (
                                <tr key={f.field} className={ROW_HEIGHT_CLASS}>
                                    {participants.map((p, idx) => {
                                        const isMainPlayer = p.id === user.id;
                                        const currentVal = p.loadout[f.field] as string;
                                        return (
                                            <td key={`${p.id}-${f.field}`} className={`border-b border-r border-outline px-2 text-center snap-start ${idx === 0 ? 'sticky left-0 z-30 bg-white shadow-sm' : 'bg-white'}`} style={{ width: COL_WIDTH }}>
                                                <div className="relative h-full flex items-center justify-center p-1">
                                                    <label className="absolute top-1 left-2 text-[8px] font-black text-onSurfaceVariant/40 uppercase leading-none">{f.label}</label>
                                                    <div className={`w-full h-[36px] border border-outline rounded-ios bg-slate-50 flex items-center overflow-hidden ${isMainPlayer ? 'border-primary/30 ring-1 ring-primary/10' : ''}`}>
                                                        {isMainPlayer ? (
                                                            <select 
                                                                value={currentVal}
                                                                onChange={(e) => { HapticService.medium(); updatePlayerTactic(f.field, e.target.value); }}
                                                                className="w-full h-full bg-transparent text-[11px] font-bold px-2 focus:outline-none appearance-none"
                                                            >
                                                                {f.options.map(opt => <option key={opt} value={opt}>{opt.includes('_') ? t(`item.name.${opt}`) : opt}</option>)}
                                                            </select>
                                                        ) : (
                                                            <span className="w-full text-[10px] text-onSurfaceVariant font-bold truncate px-2">{currentVal.includes('_') ? t(`item.name.${currentVal}`) : currentVal}</span>
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

    function updatePlayerTactic(field: keyof Loadout, value: string) {
        setParticipants(prev => prev.map(p => {
            if (p.id === user.id) {
                const newLoadout = { ...p.loadout, [field]: value };
                saveActiveLoadout(newLoadout);
                return { ...p, loadout: newLoadout };
            }
            return p;
        }));
    }
};

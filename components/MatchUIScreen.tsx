import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { MatchResult, User, Loadout, MatchParticipant, VenueCondition, GameItem } from '../types';
import {
    MOCK_FISH_SPECIES,
    MOCK_SHOP_ITEMS,
    MOCK_BAITS,
    MOCK_HOOK_SIZES,
    MOCK_GROUNDBAITS,
    MOCK_FEEDER_TIPS,
    MOCK_CASTING_DISTANCES,
    MOCK_CASTING_INTERVALS,
    DEFAULT_LOADOUT,
    type FishSpecies
} from '../constants';
import { type LiveParticipant } from '../services/liveMatchService';
import { useTranslation } from '../i18n/LanguageContext';


const MOCK_BOT_NAMES = [
  'FishMasterFlex', 'RiverKing', 'CastingQueen', 'TheBaiter', 'ReelDeal', 
  'WaterWhisperer', 'LureLord', 'SilentStriker', 'DepthDweller', 'PikePro', 
  'TackleTitan', 'BobberBoss', 'HookedHero', 'MarinaMaverick'
];

interface MatchUIScreenProps {
  user: User;
  playerLoadout: Loadout;
  onMatchEnd: (result: MatchResult) => void;
  participantsOverride?: LiveParticipant[];
}

interface CatchEvent {
    id: string;
    weight: number;
    isBigFish: boolean;
    expiresAt: number;
}

const MATCH_DURATION = 90;
const SIMULATION_TICK_RATE = 1000;

const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const LiveFeedTicker: React.FC<{ message: string | null }> = ({ message }) => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center gap-2 h-6 px-2 bg-black/20 rounded mb-1 border border-gray-800/50">
            <p className="text-[9px] text-gray-500 tracking-wider flex-shrink-0 font-bold">{t('match.ui.feed')}</p>
            <p className={`text-[10px] font-bold whitespace-nowrap overflow-hidden text-ellipsis ${message ? 'text-yellow-300' : 'text-yellow-300/30'}`}>
                {message || 'Waiting for events...'}
            </p>
        </div>
    );
};

interface StandingsVisualizerProps {
    participants: MatchParticipant[];
    leaderId: string | null;
    onParticipantSelect: (participantId: string) => void;
}

const StandingsVisualizer: React.FC<StandingsVisualizerProps> = ({ participants, leaderId, onParticipantSelect }) => {
    const maxWeight = useMemo(() => {
        if (participants.length === 0) return 1;
        const max = Math.max(...participants.map(p => p.totalWeight));
        return max > 0 ? max : 1;
    }, [participants]);

    return (
        <div className="w-full h-10 bg-gray-950/50 rounded flex items-end justify-between p-0.5 gap-0.5" aria-label="Standings visualization">
            {participants.map(p => {
                const heightPercentage = (p.totalWeight / maxWeight) * 100;
                const isLeader = p.id === leaderId;

                const barClasses = [
                    'w-full',
                    'rounded-t-[1px]',
                    'transition-all',
                    'duration-500',
                    'ease-out',
                    p.id.includes('bot') ? 'bg-gray-700' : 'bg-blue-500',
                    isLeader ? 'shadow-[0_0_4px_rgba(250,204,21,0.6)]' : ''
                ].join(' ');

                return (
                    <div
                        key={p.id}
                        onClick={() => onParticipantSelect(p.id)}
                        className={barClasses + " cursor-pointer hover:opacity-80"}
                        style={{ height: `${Math.max(heightPercentage, 4)}%` }}
                        title={`${p.name}: ${p.totalWeight.toFixed(2)} kg`}
                        role="button"
                        tabIndex={0}
                    ></div>
                );
            })}
        </div>
    );
};

const CatchAnimation: React.FC<{ weight: number; isBigFish: boolean }> = ({ weight, isBigFish }) => {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-0 h-0 flex items-center justify-center">
            <div 
                className={`px-1.5 py-0.5 rounded animate-catch-float whitespace-nowrap border
                            ${isBigFish ? 'bg-yellow-500 text-white border-yellow-300 shadow-lg shadow-yellow-500/50' : 'bg-green-600 text-white border-green-400 shadow-lg shadow-green-500/50'}`}
            >
                <span className="font-black text-xs">+{weight.toFixed(2)}kg</span>
            </div>
        </div>
    );
};

const getDetailedEfficiency = (loadout: Loadout, species: FishSpecies) => {
    let biteScore = 0;
    const biteChecks = 9;
    
    if (species.preferredHooks.some(h => loadout.hook.includes(h))) biteScore++;
    if (species.preferredLines.some(l => loadout.line.includes(l))) biteScore++;
    if (species.preferredFeeders.some(f => loadout.feeder.includes(f))) biteScore++;
    if (species.preferredFeederTips.includes(loadout.feederTip)) biteScore++;
    if (species.preferredBaits.some(b => loadout.bait.includes(b))) biteScore++;
    if (species.preferredGroundbaits.some(g => loadout.groundbait.includes(g))) biteScore++;
    if (species.preferredAdditives.some(a => loadout.additive.includes(a))) biteScore++;
    if (species.preferredDistance.includes(loadout.castingDistance)) biteScore++;
    if (species.preferredIntervals.includes(loadout.castingInterval)) biteScore++;

    let weightScore = 0;
    const weightChecks = 4;
    if (species.preferredRods.some(r => loadout.rod.includes(r))) weightScore++;
    if (species.preferredReels.some(rl => loadout.reel.includes(rl))) weightScore++;
    if (species.preferredHooks.some(h => loadout.hook.includes(h))) weightScore++;
    if (species.preferredBaits.some(b => loadout.bait.includes(b))) weightScore++;

    const biteEff = biteScore / biteChecks;
    const weightEff = weightScore / weightChecks;
    
    return {
        biteEfficiency: biteEff,
        weightEfficiency: weightEff,
        aggregateEfficiency: (biteEff + weightEff) / 2
    };
};


export const MatchUIScreen: React.FC<MatchUIScreenProps> = ({ user, playerLoadout, onMatchEnd, participantsOverride }) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
    const [participants, setParticipants] = useState<MatchParticipant[]>([]);
    const [venueCondition, setVenueCondition] = useState<VenueCondition | null>(null);
    const [liveFeedMessage, setLiveFeedMessage] = useState<string | null>(null);
    const [catchEvents, setCatchEvents] = useState<Map<string, CatchEvent>>(new Map());
    const [tacticalEfficiency, setTacticalEfficiency] = useState(0);
    
    const participantsRef = useRef(participants);
    const catchEventsRef = useRef<Map<string, CatchEvent>>(new Map());
    const biteTimers = useRef<Map<string, number>>(new Map());
    const botColumnRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

    useEffect(() => {
        participantsRef.current = participants;
    }, [participants]);

    useEffect(() => {
        const conditions: VenueCondition[] = ['Clear Water', 'Murky Water', 'Warm Weather', 'Cool Weather'];
        setVenueCondition(getRandom(conditions));
    }, []);
    
    const handleMatchEndInternal = useCallback(() => {
        const finalStandings = [...participantsRef.current].sort((a, b) => b.totalWeight - a.totalWeight);
        const playerRank = finalStandings.findIndex(p => p.id === user.id) + 1;
        
        let eurosEarned = 50;
        if (playerRank === 1) eurosEarned = 250;
        else if (playerRank === 2) eurosEarned = 200;
        else if (playerRank === 3) eurosEarned = 150;
        else if (playerRank === 4) eurosEarned = 100;

        const player = finalStandings.find(p => p.id === user.id);
        const opponent = finalStandings.find(p => p.id !== user.id);

        if (player) {
            const result: MatchResult = {
                playerWeight: player.totalWeight,
                opponentWeight: opponent ? opponent.totalWeight : 0,
                eurosEarned,
                standings: finalStandings,
                isLive: !!participantsOverride && participantsOverride.length > 0
            };
            onMatchEnd(result);
        }
    }, [onMatchEnd, user.id, participantsOverride]);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleMatchEndInternal();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, handleMatchEndInternal]);

    useEffect(() => {
        if (!venueCondition) return;

        const player: MatchParticipant = {
            id: user.id,
            name: user.displayName,
            isBot: false,
            loadout: playerLoadout,
            totalWeight: 0,
            catchStreak: 0,
            lastCatchTime: 0,
            avatar: user.avatar,
            country: user.country
        };
        
        let initialParticipants: MatchParticipant[] = [];

        if (participantsOverride && participantsOverride.length > 0) {
            initialParticipants = participantsOverride.map(p => {
                if (p.id === user.id) return player;
                return {
                    id: p.id,
                    name: p.displayName,
                    isBot: false,
                    loadout: { ...playerLoadout },
                    totalWeight: 0,
                    catchStreak: 0,
                    lastCatchTime: 0,
                    avatar: p.avatar,
                    country: p.country
                };
            });
        } else {
            const usedNames = new Set([user.displayName]);
            const bots: MatchParticipant[] = Array.from({ length: 9 }).map((_, i) => {
                let botName;
                do { botName = getRandom(MOCK_BOT_NAMES); } while (usedNames.has(botName));
                usedNames.add(botName);

                const randomSpecies = getRandom(MOCK_FISH_SPECIES);
                const botLoadout = { ...playerLoadout };
                botLoadout.bait = 'bt_mag';
                botLoadout.hook = 'hook_b16';
                botLoadout.groundbait = 'gb_roach';
                botLoadout.rod = 'rod_p330';
                botLoadout.feederTip = getRandom(randomSpecies.preferredFeederTips);

                return {
                    id: `bot_${i}`,
                    name: botName,
                    isBot: true,
                    loadout: botLoadout, 
                    totalWeight: 0,
                    catchStreak: 0,
                    lastCatchTime: 0,
                };
            });
            initialParticipants = [player, ...bots];
        }
        
        initialParticipants.forEach(p => biteTimers.current.set(p.id, 2 + Math.random() * 8));
        setParticipants(initialParticipants);
    }, [user, playerLoadout, venueCondition, participantsOverride]);

    useEffect(() => {
        if (participants.length === 0 || timeLeft <= 0) return;

        const simulationTimer = setInterval(() => {
            const currentParticipants = participantsRef.current;
            if (currentParticipants.length === 0) return;

            const now = Date.now();
            const activeEvents = catchEventsRef.current;
            for (const [key, event] of activeEvents.entries()) {
                if (now > event.expiresAt) activeEvents.delete(key);
            }

            let newLiveFeedMessage = '';
            const sortedBefore = [...currentParticipants].sort((a, b) => b.totalWeight - a.totalWeight);
            const leaderBefore = sortedBefore[0];

            let latestPlayerAggrEff = 0;

            const updatedParticipants = currentParticipants.map(p => {
                let currentLoadout = { ...p.loadout };
                
                const venue = p.loadout.venueFish;
                const isDominant = Math.random() < 0.7;
                const speciesFullName = (venue && isDominant) ? venue.dominant : (venue?.secondary || 'Small Roach');
                
                const fish = MOCK_FISH_SPECIES.find(s => `${s.variant} ${s.name}` === speciesFullName) || MOCK_FISH_SPECIES[0];

                const { biteEfficiency, weightEfficiency, aggregateEfficiency } = getDetailedEfficiency(currentLoadout, fish);
                if (p.id === user.id) latestPlayerAggrEff = aggregateEfficiency;

                let timer = biteTimers.current.get(p.id) || 10;
                timer -= 1;
                
                let weightGained = 0;
                let newCatchStreak = p.catchStreak;
                let newLastCatchTime = now;

                if (timer <= 0) {
                    const floorWeight = fish.minWeight + (fish.maxWeight - fish.minWeight) * (weightEfficiency * 0.5);
                    const weight = parseFloat((floorWeight + Math.random() * (fish.maxWeight - floorWeight)).toFixed(2));
                    
                    weightGained = weight;
                    newCatchStreak += 1;
                    const isBigFish = weight > fish.maxWeight * 0.8;
                    
                    activeEvents.set(p.id, { id: `${p.id}_${now}`, weight, isBigFish, expiresAt: now + 2500 });
                    if (isBigFish && p.id !== user.id) newLiveFeedMessage = t('match.ui.trophy_landed', { name: p.name });
                    if (isBigFish && p.id === user.id) newLiveFeedMessage = t('match.ui.you_caught');

                    timer = (45 - (biteEfficiency * 40)) * (0.8 + Math.random() * 0.4);
                } 

                biteTimers.current.set(p.id, timer);
                return { 
                    ...p, 
                    loadout: currentLoadout, 
                    totalWeight: p.totalWeight + weightGained, 
                    catchStreak: newCatchStreak,
                    lastCatchTime: newLastCatchTime 
                };
            });

            const sortedAfter = [...updatedParticipants].sort((a,b) => b.totalWeight - a.totalWeight);
            const leaderAfter = sortedAfter[0];
            
            if (leaderAfter && leaderBefore && leaderAfter.id !== leaderBefore.id && leaderAfter.totalWeight > 0) {
                newLiveFeedMessage = t('match.ui.leader_takes_lead', { name: leaderAfter.name });
            }

            if (newLiveFeedMessage) setLiveFeedMessage(newLiveFeedMessage);
            setCatchEvents(new Map(activeEvents));
            setParticipants(updatedParticipants);
            setTacticalEfficiency(latestPlayerAggrEff);
        }, SIMULATION_TICK_RATE);

        return () => clearInterval(simulationTimer);
    }, [participants.length, user.id, t]);

    const handleLoadoutChange = (field: keyof Loadout, value: string) => {
        setParticipants(prev => prev.map(p => p.id === user.id ? { ...p, loadout: { ...p.loadout, [field]: value } } : p));
    };

    const handleParticipantSelect = useCallback((participantId: string) => {
        const botElement = botColumnRefs.current.get(participantId);
        if (botElement) botElement.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }, []);
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const player = participants.find(p => p.id === user.id);
    const others = participants.filter(p => p.id !== user.id);
    const playerRank = useMemo(() => {
        if (!participants.length) return 0;
        const sorted = [...participants].sort((a, b) => b.totalWeight - a.totalWeight);
        return sorted.findIndex(p => p.id === user.id) + 1;
    }, [participants, user.id]);

    const parameters = useMemo(() => {
        const getInventoryOptions = (type: GameItem['type']) => {
            return user.inventory.filter(i => i.type === type).map(i => ({ label: t(`item.name.${i.id}`), value: i.id }));
        };
        
        return [
            { key: 'rod', label: t('match.tackle.rod'), options: getInventoryOptions('Rod') },
            { key: 'reel', label: t('match.tackle.reel'), options: getInventoryOptions('Reel') },
            { key: 'line', label: t('match.tackle.line'), options: getInventoryOptions('Line') },
            { key: 'hook', label: t('match.tackle.hook'), options: getInventoryOptions('Hook') },
            { key: 'feeder', label: t('match.tackle.feeder'), options: getInventoryOptions('Feeder') },
            { key: 'additive', label: t('match.tackle.additive'), options: getInventoryOptions('Additive') },
            { key: 'bait', label: t('match.tackle.bait'), options: getInventoryOptions('Bait') },
            { key: 'groundbait', label: t('match.tackle.groundbait'), options: getInventoryOptions('Groundbait') },
            { key: 'feederTip', label: t('match.tackle.feedertip'), options: MOCK_FEEDER_TIPS.map(opt => ({label: opt, value: opt})) },
            { key: 'castingDistance', label: t('match.tackle.distance'), options: MOCK_CASTING_DISTANCES.map(opt => ({label: opt, value: opt})) },
            { key: 'castingInterval', label: t('match.tackle.interval'), options: MOCK_CASTING_INTERVALS.map(opt => ({label: opt, value: opt})) },
        ];
    }, [user.inventory, t]);

    if (!player) return null;

    const sortedParticipants = [...participants].sort((a, b) => b.totalWeight - a.totalWeight);
    const leaderId = sortedParticipants[0]?.totalWeight > 0 ? sortedParticipants[0]?.id : null;

    const renderColumnContent = (p: MatchParticipant) => {
        const isPlayer = p.id === user.id;
        const isLeader = p.id === leaderId;

        return (
            <>
                <div className="h-10 text-center border-b pb-0.5 mb-0.5 flex-shrink-0 flex flex-col justify-center bg-black/10 rounded-t" style={{borderColor: isPlayer ? 'rgba(59, 130, 246, 0.4)' : 'rgba(55, 65, 81, 0.8)'}}>
                    <p className="font-bold text-[9px] leading-tight flex items-center justify-center max-w-full px-1">
                        {isLeader && <span className="text-yellow-400 mr-0.5 text-[10px]">👑</span>}
                        <span className="truncate">{p.name}</span>
                        {!p.isBot && !isPlayer && <span className="ml-1 text-[7px] bg-red-600 text-white px-1 rounded-sm">LIVE</span>}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                        <p className={`text-[11px] font-black leading-none ${isPlayer ? 'text-blue-300' : 'text-gray-200'}`}>
                            {p.totalWeight === 0 ? '0.00 kg' : `${p.totalWeight.toFixed(2)} kg`}
                        </p>
                    </div>
                </div>
                <div className="flex-grow flex flex-col min-h-0 overflow-hidden bg-gray-900/20">
                    {parameters.map(param => (
                        <div key={param.key} className="h-[27px] flex flex-col justify-center px-1 border-b border-gray-800/10 last:border-0 flex-shrink-0">
                            <label className="text-[6.5px] text-gray-500 font-bold Seaing-none mb-0.5 truncate" title={param.label}>
                                {param.label}
                            </label>
                            <div className="w-full flex items-center">
                                {isPlayer ? (
                                    <select
                                        value={player.loadout[param.key as keyof Loadout] as string}
                                        onChange={(e) => handleLoadoutChange(param.key as keyof Loadout, e.target.value)}
                                        className="w-full h-[15px] px-1 bg-gray-700 border border-gray-600 rounded-[2px] text-[8px] appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 leading-none truncate"
                                    >
                                        {param.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                ) : (
                                    <div className="w-full h-[15px] px-1 flex items-center bg-gray-900/30 border border-gray-700/50 rounded-[2px] overflow-hidden">
                                        <span className="truncate text-[8px] text-gray-400 font-medium leading-none">
                                            {(() => {
                                                const val = p.loadout[param.key as keyof Loadout]?.toString() || '';
                                                // Support both new 'bt_' format and legacy 'bait_' / 'rod_' numeric formats
                                                const needsTranslation = /^(rod|reel|line|hook|fdr|bt|gb|ad|bait|acc)_/.test(val);
                                                return needsTranslation ? t(`item.name.${val}`) : val;
                                            })()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className="p-1 max-w-4xl mx-auto flex flex-col h-screen overflow-hidden bg-gray-950">
            <header className="mb-1 p-1 bg-gray-900 rounded border border-gray-800 flex-shrink-0">
                <div className="flex justify-between items-center w-full mb-1 text-center px-2">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-start">
                            <span className="text-[7px] text-gray-500 font-bold uppercase">{t('match.ui.position')}</span>
                            <span className="text-xs font-black text-blue-400">{playerRank}/{participants.length}</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[7px] text-gray-500 font-bold uppercase">{t('match.ui.time')}</span>
                            <span className="text-xs font-black text-red-400">{formatTime(timeLeft)}</span>
                        </div>
                        {participantsOverride && participantsOverride.length > 0 && (
                            <div className="hidden sm:flex flex-col items-start">
                                <span className="text-[7px] text-red-500 font-bold uppercase">{t('live.status')}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <span className="text-[7px] text-gray-500 font-bold uppercase">{t('match.ui.tactical')}</span>
                        <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-0.5">
                            <div 
                                className={`h-full transition-all duration-500 ${tacticalEfficiency > 0.7 ? 'bg-green-500' : tacticalEfficiency > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${tacticalEfficiency * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-[8px] font-black mt-0.5 text-gray-300">{(tacticalEfficiency * 100).toFixed(0)}%</span>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-1">
                    <LiveFeedTicker message={liveFeedMessage} />
                    <StandingsVisualizer participants={participants} leaderId={leaderId} onParticipantSelect={handleParticipantSelect} />
                </div>
            </header>
            
            <div className="flex-grow flex gap-1 overflow-hidden min-h-0 pb-1">
                <div className="flex-shrink-0 w-[140px] h-full rounded-md flex flex-col bg-blue-900/10 border border-blue-600/30 relative shadow-lg">
                    {renderColumnContent(player)}
                    {catchEvents.get(player.id) && <CatchAnimation key={catchEvents.get(player.id)!.id} {...catchEvents.get(player.id)!} />}
                </div>

                <div className="flex-grow overflow-x-auto whitespace-nowrap snap-x snap-mandatory flex gap-1 custom-scrollbar">
                    {others.map((p) => (
                        <div 
                            key={p.id} 
                            ref={(el) => el ? botColumnRefs.current.set(p.id, el) : botColumnRefs.current.delete(p.id)} 
                            className={`w-[115px] h-full flex-shrink-0 rounded-md flex flex-col ${p.isBot ? 'bg-gray-900 border-gray-800' : 'bg-red-900/10 border-red-500/30'} border snap-start relative`}
                        >
                            {renderColumnContent(p)}
                            {catchEvents.get(p.id) && <CatchAnimation key={catchEvents.get(p.id)!.id} {...catchEvents.get(p.id)!} />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
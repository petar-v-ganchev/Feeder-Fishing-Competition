import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { MatchResult, User, Loadout, MatchParticipant, VenueCondition, GameItem } from '../types';
import {
    MOCK_FISH_SPECIES,
    MOCK_SHOP_ITEMS,
    MOCK_FEEDER_TIPS,
    MOCK_CASTING_DISTANCES,
    MOCK_CASTING_INTERVALS,
    DEFAULT_LOADOUT
} from '../constants';


const MOCK_BOT_NAMES = [
  'FishMasterFlex', 'RiverKing', 'CastingQueen', 'TheBaiter', 'ReelDeal', 
  'WaterWhisperer', 'LureLord', 'SilentStriker', 'DepthDweller', 'PikePro', 
  'TackleTitan', 'BobberBoss', 'HookedHero', 'MarinaMaverick'
];

interface MatchUIScreenProps {
  user: User;
  playerLoadout: Loadout;
  onMatchEnd: (result: MatchResult) => void;
}

interface CatchEvent {
    id: string;
    weight: number;
    isBigFish: boolean;
    expiresAt: number;
}

const MATCH_DURATION = 90;
const SIMULATION_TICK_RATE = 1000;
const TREND_TIMEOUT = 15000; // 15 seconds to be considered "Hot"

const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const LiveFeedTicker: React.FC<{ message: string | null }> = ({ message }) => {
    return (
        <div className="flex items-center gap-2 h-6 px-2 bg-black/20 rounded mb-1 border border-gray-800/50">
            <p className="text-[9px] text-gray-500 tracking-wider flex-shrink-0 font-bold">Feed:</p>
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
                const isPlayer = !p.isBot;
                const isLeader = p.id === leaderId;

                const barClasses = [
                    'w-full',
                    'rounded-t-[1px]',
                    'transition-all',
                    'duration-500',
                    'ease-out',
                    isPlayer ? 'bg-blue-500' : 'bg-gray-700 cursor-pointer hover:bg-gray-600',
                    isLeader ? 'shadow-[0_0_4px_rgba(250,204,21,0.6)]' : ''
                ].join(' ');

                return (
                    <div
                        key={p.id}
                        onClick={() => !isPlayer && onParticipantSelect(p.id)}
                        className={barClasses}
                        style={{ height: `${Math.max(heightPercentage, 4)}%` }}
                        title={`${p.name}: ${p.totalWeight.toFixed(2)} kg`}
                        role={!isPlayer ? 'button' : undefined}
                        tabIndex={!isPlayer ? 0 : -1}
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


export const MatchUIScreen: React.FC<MatchUIScreenProps> = ({ user, playerLoadout, onMatchEnd }) => {
    const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
    const [participants, setParticipants] = useState<MatchParticipant[]>([]);
    const [venueCondition, setVenueCondition] = useState<VenueCondition | null>(null);
    const [liveFeedMessage, setLiveFeedMessage] = useState<string | null>(null);
    const [catchEvents, setCatchEvents] = useState<Map<string, CatchEvent>>(new Map());
    
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
    
    const optimalLoadout = useMemo(() => {
        const getShopItemNames = (type: GameItem['type']) => MOCK_SHOP_ITEMS.filter(i => i.type === type).map(i => i.name);

        let optimal: Loadout = {
            rod: getRandom(getShopItemNames('Rod')),
            reel: getRandom(getShopItemNames('Reel')),
            line: getRandom(getShopItemNames('Line')),
            hook: getRandom(getShopItemNames('Hook')),
            feeder: getRandom(getShopItemNames('Feeder')),
            bait: getRandom(getShopItemNames('Bait')),
            groundbait: getRandom(getShopItemNames('Groundbait')),
            additive: getRandom(getShopItemNames('Additive')),
            feederTip: getRandom(MOCK_FEEDER_TIPS),
            castingDistance: getRandom(MOCK_CASTING_DISTANCES),
            castingInterval: getRandom(MOCK_CASTING_INTERVALS),
        };

        if (venueCondition === 'Murky Water') {
            optimal.groundbait = 'Fishmeal Mix';
            optimal.hook = 'Size 14 Barbless Hooks (x10)';
        } else if (venueCondition === 'Clear Water') {
            optimal.bait = 'Maggots';
            optimal.hook = 'Size 18 Barbless Hooks (x10)';
        }
        return optimal;
    }, [venueCondition]);

    const handleMatchEnd = useCallback(() => {
        const finalStandings = [...participantsRef.current].sort((a, b) => b.totalWeight - a.totalWeight);
        const player = finalStandings.find(p => !p.isBot);
        const opponent = finalStandings.find(p => p.isBot);
        
        const playerRank = finalStandings.findIndex(p => !p.isBot) + 1;
        
        let eurosEarned = 50;
        if (playerRank === 1) eurosEarned = 250;
        else if (playerRank === 2) eurosEarned = 200;
        else if (playerRank === 3) eurosEarned = 150;
        else if (playerRank === 4) eurosEarned = 100;

        if (player) {
            const result: MatchResult = {
                playerWeight: player.totalWeight,
                opponentWeight: opponent ? opponent.totalWeight : 0,
                eurosEarned,
                standings: finalStandings,
            };
            onMatchEnd(result);
        }
    }, [onMatchEnd]);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleMatchEnd();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, handleMatchEnd]);

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
        };
        
        const usedNames = new Set([user.displayName]);
        const bots: MatchParticipant[] = Array.from({ length: 9 }).map((_, i) => {
            let botName;
            do { botName = getRandom(MOCK_BOT_NAMES); } while (usedNames.has(botName));
            usedNames.add(botName);

            const botLoadout = { ...optimalLoadout };
            if (Math.random() < 0.5) botLoadout.hook = getRandom(MOCK_SHOP_ITEMS.filter(i => i.type === 'Hook').map(i => i.name));
            if (Math.random() < 0.5) botLoadout.bait = getRandom(MOCK_SHOP_ITEMS.filter(i => i.type === 'Bait').map(i => i.name));

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
        
        const allParticipants = [player, ...bots];
        allParticipants.forEach(p => biteTimers.current.set(p.id, 2 + Math.random() * 8));
        setParticipants(allParticipants);
    }, [user, playerLoadout, venueCondition, optimalLoadout]);

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

            const updatedParticipants = currentParticipants.map(p => {
                let currentLoadout = { ...p.loadout };

                if (p.isBot && Math.random() < 0.05) {
                    const keys = Object.keys(currentLoadout) as Array<keyof Loadout>;
                    const paramToChange = getRandom(keys);
                    const options = MOCK_SHOP_ITEMS.filter(i => i.type.toLowerCase() === paramToChange).map(i => i.name);
                    if (options.length > 0) currentLoadout[paramToChange] = getRandom(options);
                }
                
                const score = Object.keys(currentLoadout).reduce((acc, key) => 
                    currentLoadout[key as keyof Loadout] === optimalLoadout[key as keyof Loadout] ? acc + 1 : acc, 0);

                const scoreRatio = score / 11;
                let timer = biteTimers.current.get(p.id) || 10;
                timer -= 1;
                
                let weightGained = 0;
                let newCatchStreak = p.catchStreak;
                let newLastCatchTime = p.lastCatchTime;

                if (timer <= 0) {
                    const fish = getRandom(MOCK_FISH_SPECIES);
                    const weight = parseFloat((fish.minWeight + Math.random() * (fish.maxWeight - fish.minWeight)).toFixed(2));
                    weightGained = weight;
                    newCatchStreak += 1;
                    newLastCatchTime = now;
                    const isBigFish = weight > fish.maxWeight * 0.9;
                    activeEvents.set(p.id, { id: `${p.id}_${now}`, weight, isBigFish, expiresAt: now + 2500 });
                    if (isBigFish) newLiveFeedMessage = `${p.name} landed a huge ${fish.name}!`;
                    timer = 50 - (scoreRatio * 45);
                    timer *= (0.9 + Math.random() * 0.2);
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
                newLiveFeedMessage = `👑 ${leaderAfter.name} takes the lead!`;
            }

            if (newLiveFeedMessage) setLiveFeedMessage(newLiveFeedMessage);
            setCatchEvents(new Map(activeEvents));
            setParticipants(updatedParticipants);
        }, SIMULATION_TICK_RATE);

        return () => clearInterval(simulationTimer);
    }, [participants.length, optimalLoadout]);

    const handleLoadoutChange = (field: keyof Loadout, value: string) => {
        setParticipants(prev => prev.map(p => !p.isBot ? { ...p, loadout: { ...p.loadout, [field]: value } } : p));
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

    const player = participants.find(p => !p.isBot);
    const bots = participants.filter(p => p.isBot);
    const playerRank = useMemo(() => {
        if (!participants.length) return 0;
        const sorted = [...participants].sort((a, b) => b.totalWeight - a.totalWeight);
        return sorted.findIndex(p => !p.isBot) + 1;
    }, [participants]);

    const parameters = useMemo(() => {
        const getInventoryOptions = (type: GameItem['type']) => {
            const items = user.inventory.filter(i => i.type === type).map(i => i.name);
            return items.length > 0 ? items : [DEFAULT_LOADOUT[type.toLowerCase() as keyof Loadout] || 'None'];
        };
        
        return [
            { key: 'rod', label: 'Rod', options: getInventoryOptions('Rod') },
            { key: 'reel', label: 'Reel', options: getInventoryOptions('Reel') },
            { key: 'line', label: 'Line', options: getInventoryOptions('Line') },
            { key: 'hook', label: 'Hook', options: getInventoryOptions('Hook') },
            { key: 'feeder', label: 'Feeder', options: getInventoryOptions('Feeder') },
            { key: 'additive', label: 'Add', options: getInventoryOptions('Additive') },
            { key: 'bait', label: 'Bait', options: getInventoryOptions('Bait') },
            { key: 'groundbait', label: 'G.Bt', options: getInventoryOptions('Groundbait') },
            { key: 'feederTip', label: 'Tip', options: MOCK_FEEDER_TIPS },
            { key: 'castingDistance', label: 'Dist', options: MOCK_CASTING_DISTANCES },
            { key: 'castingInterval', label: 'Int', options: MOCK_CASTING_INTERVALS },
        ];
    }, [user.inventory]);

    if (!player) return null;

    const sortedParticipants = [...participants].sort((a, b) => b.totalWeight - a.totalWeight);
    const leaderId = sortedParticipants[0]?.totalWeight > 0 ? sortedParticipants[0]?.id : null;

    const renderColumnContent = (p: MatchParticipant) => {
        const isPlayer = !p.isBot;
        const isLeader = p.id === leaderId;

        return (
            <>
                <div className="h-10 text-center border-b pb-0.5 mb-0.5 flex-shrink-0 flex flex-col justify-center bg-black/10 rounded-t" style={{borderColor: isPlayer ? 'rgba(59, 130, 246, 0.4)' : 'rgba(55, 65, 81, 0.8)'}}>
                    <p className="font-bold text-[9px] leading-tight flex items-center justify-center max-w-full px-1">
                        {isLeader && <span className="text-yellow-400 mr-0.5 text-[10px]">👑</span>}
                        <span className="truncate">{p.name}</span>
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
                            <label className="text-[6.5px] text-gray-500 font-bold leading-none mb-0.5 truncate" title={param.label}>
                                {param.label}
                            </label>
                            <div className="w-full flex items-center">
                                {isPlayer ? (
                                    <select
                                        value={player.loadout[param.key as keyof Loadout]}
                                        onChange={(e) => handleLoadoutChange(param.key as keyof Loadout, e.target.value)}
                                        className="w-full h-[15px] px-1 bg-gray-700 border border-gray-600 rounded-[2px] text-[8px] appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 leading-none truncate"
                                    >
                                        {param.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <div className="w-full h-[15px] px-1 flex items-center bg-gray-900/30 border border-gray-700/50 rounded-[2px] overflow-hidden">
                                        <span className="truncate text-[8px] text-gray-400 font-medium leading-none">{p.loadout[param.key as keyof Loadout]}</span>
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
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-500 font-bold">Pos:</span>
                        <span className="text-xs font-black text-blue-400">{playerRank}/{participants.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-500 font-bold">Time:</span>
                        <span className="text-xs font-black text-red-400">{formatTime(timeLeft)}</span>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-1">
                    <LiveFeedTicker message={liveFeedMessage} />
                    <StandingsVisualizer participants={participants} leaderId={leaderId} onParticipantSelect={handleParticipantSelect} />
                </div>
            </header>
            
            <div className="flex-grow flex gap-1 overflow-hidden min-h-0 pb-1">
                {/* Player Column - Fixed */}
                <div className="flex-shrink-0 w-[140px] h-full rounded-md flex flex-col bg-blue-900/10 border border-blue-600/30 relative shadow-lg">
                    {renderColumnContent(player)}
                    {catchEvents.get(player.id) && <CatchAnimation key={catchEvents.get(player.id)!.id} {...catchEvents.get(player.id)!} />}
                </div>

                {/* Opponents Columns - Horizontal Scroll */}
                <div className="flex-grow overflow-x-auto whitespace-nowrap snap-x snap-mandatory flex gap-1 custom-scrollbar">
                    {bots.map((p) => (
                        <div 
                            key={p.id} 
                            ref={(el) => el ? botColumnRefs.current.set(p.id, el) : botColumnRefs.current.delete(p.id)} 
                            className="w-[115px] h-full flex-shrink-0 rounded-md flex flex-col bg-gray-900 border border-gray-800 snap-start relative"
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
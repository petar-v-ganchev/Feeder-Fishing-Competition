
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { MatchResult, User, Loadout, MatchParticipant, VenueCondition, GameItem } from '../types';
import {
    MOCK_FISH_SPECIES,
    MOCK_RODS,
    MOCK_BAITS,
    MOCK_GROUNDBAITS,
    MOCK_HOOK_SIZES,
    MOCK_FEEDER_TYPES,
    MOCK_FEEDER_TIPS,
    MOCK_CASTING_DISTANCES,
    MOCK_CASTING_INTERVALS,
    DEFAULT_LOADOUT
} from '../constants';


// Using player names from leaderboard mock data for bots
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

const MATCH_DURATION = 90; // 90 seconds
const SIMULATION_TICK_RATE = 1000; // 1 second updates for smoother timer logic

// Helper to get a random element from an array
const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const LiveFeedTicker: React.FC<{ message: string | null }> = ({ message }) => {
    return (
        <div className="flex items-center gap-2 h-10 px-2 bg-black/20 rounded mb-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider flex-shrink-0 font-semibold">LIVE FEED:</p>
            <p className={`text-sm font-bold whitespace-nowrap overflow-hidden text-ellipsis ${message ? 'text-yellow-300' : 'text-yellow-300/50'}`}>
                {message || 'Waiting for match events...'}
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
        if (participants.length === 0) return 1; // Default to 1 to avoid division by zero
        const max = Math.max(...participants.map(p => p.totalWeight));
        return max > 0 ? max : 1;
    }, [participants]);

    return (
        <div className="w-full h-20 bg-gray-900/50 rounded-md flex items-end justify-between p-0.5 gap-0.5 mt-1" aria-label="Real-time match standings visualization">
            {participants.map(p => {
                const heightPercentage = (p.totalWeight / maxWeight) * 100;
                const isPlayer = !p.isBot;
                const isLeader = p.id === leaderId;

                const barClasses = [
                    'w-full',
                    'rounded-t-sm',
                    'transition-all',
                    'duration-500',
                    'ease-out',
                    isPlayer ? 'bg-blue-500' : 'bg-gray-600 cursor-pointer hover:bg-gray-500',
                    isLeader ? 'shadow-[0_0_6px_1px_rgba(250,204,21,0.7)]' : ''
                ].join(' ');

                return (
                    <div
                        key={p.id}
                        onClick={() => !isPlayer && onParticipantSelect(p.id)}
                        className={barClasses}
                        style={{ height: `${Math.max(heightPercentage, 2)}%` }} // min height of 2% to be visible
                        title={`${p.name}: ${p.totalWeight.toFixed(2)} kg`}
                        role={!isPlayer ? 'button' : undefined}
                        tabIndex={!isPlayer ? 0 : -1}
                        aria-label={!isPlayer ? `Scroll to ${p.name}'s column` : undefined}
                    ></div>
                );
            })}
        </div>
    );
};

const CatchAnimation: React.FC<{ weight: number; isBigFish: boolean }> = ({ weight, isBigFish }) => {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none w-0 h-0 flex items-center justify-center">
            <div 
                className={`p-2 rounded-lg animate-catch-float whitespace-nowrap
                            ${isBigFish ? 'bg-yellow-500/80 text-white shadow-lg shadow-yellow-500/50' : 'bg-green-500/80 text-white shadow-lg shadow-green-500/50'}`}
            >
                <span className="font-bold text-lg">+{weight.toFixed(2)}kg</span>
            </div>
        </div>
    );
};


export const MatchUIScreen: React.FC<MatchUIScreenProps> = ({ user, playerLoadout, onMatchEnd }) => {
    const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
    const [participants, setParticipants] = useState<MatchParticipant[]>([]);
    const [venueCondition, setVenueCondition] = useState<VenueCondition | null>(null);
    const [liveFeedMessage, setLiveFeedMessage] = useState<string | null>(null);
    const [playerPositionHistory, setPlayerPositionHistory] = useState<number[]>([]);
    const [catchEvents, setCatchEvents] = useState<Map<string, CatchEvent>>(new Map());
    
    const participantsRef = useRef(participants);
    const catchEventsRef = useRef<Map<string, CatchEvent>>(new Map());
    const biteTimers = useRef<Map<string, number>>(new Map());
    const botsContainerRef = useRef<HTMLDivElement>(null);
    const botColumnRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

    useEffect(() => {
        participantsRef.current = participants;
    }, [participants]);

    useEffect(() => {
        const conditions: VenueCondition[] = ['Clear Water', 'Murky Water', 'Warm Weather', 'Cool Weather'];
        setVenueCondition(getRandom(conditions));
    }, []);
    
    const optimalLoadout = useMemo(() => {
        if (!venueCondition) return DEFAULT_LOADOUT;

        let optimal: Loadout = {
            rod: getRandom(MOCK_RODS),
            bait: getRandom(MOCK_BAITS),
            groundbait: getRandom(MOCK_GROUNDBAITS),
            hookSize: getRandom(MOCK_HOOK_SIZES),
            feederType: getRandom(MOCK_FEEDER_TYPES),
            feederTip: getRandom(MOCK_FEEDER_TIPS),
            castingDistance: getRandom(MOCK_CASTING_DISTANCES),
            castingInterval: getRandom(MOCK_CASTING_INTERVALS),
        };

        switch (venueCondition) {
            case 'Murky Water':
                optimal.groundbait = getRandom(['Fishmeal Mix', 'Spicy Feeder Mix', 'Hemp Seed Mix']);
                optimal.hookSize = getRandom(['14', '12']);
                break;
            case 'Clear Water':
                optimal.bait = getRandom(['Maggots', 'Worms', 'Bread Flake']);
                optimal.hookSize = getRandom(['18', '16']);
                break;
        }
        return optimal;
    }, [venueCondition]);

    const handleMatchEnd = useCallback(() => {
        const finalStandings = [...participantsRef.current].sort((a, b) => b.totalWeight - a.totalWeight);
        const player = finalStandings.find(p => !p.isBot);
        const opponent = finalStandings.find(p => p.isBot); // simplified for 1v1
        
        const playerRank = finalStandings.findIndex(p => !p.isBot) + 1;
        const eurosEarned = playerRank === 1 ? 250 : 50;

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

    // Timer effect
    useEffect(() => {
        if (timeLeft <= 0) {
            handleMatchEnd();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, handleMatchEnd]);

    // Initialize participants
    useEffect(() => {
        if (!venueCondition) return;

        const player: MatchParticipant = {
            id: user.id,
            name: user.displayName,
            isBot: false,
            loadout: playerLoadout,
            totalWeight: 0,
            catchStreak: 0,
        };
        
        // Generate unique bot names
        const usedNames = new Set([user.displayName]);
        const bots: MatchParticipant[] = Array.from({ length: 9 }).map((_, i) => {
            let botName;
            do {
                botName = getRandom(MOCK_BOT_NAMES);
            } while (usedNames.has(botName));
            usedNames.add(botName);

            // Start bots with the optimal loadout, but randomize 3 parameters so they aren't perfect.
            // This ensures they don't get a perfect 8/8 score and 5s catch time instantly.
            const botLoadout = { ...optimalLoadout };
            if (Math.random() < 0.7) botLoadout.hookSize = getRandom(MOCK_HOOK_SIZES);
            if (Math.random() < 0.7) botLoadout.castingDistance = getRandom(MOCK_CASTING_DISTANCES);
            if (Math.random() < 0.7) botLoadout.bait = getRandom(MOCK_BAITS);

            return {
                id: `bot_${i}`,
                name: botName,
                isBot: true,
                loadout: botLoadout, 
                totalWeight: 0,
                catchStreak: 0,
            };
        });
        
        const allParticipants = [player, ...bots];

        // Initialize bite timers with random staggered starts between 2s and 10s
        allParticipants.forEach(p => {
             biteTimers.current.set(p.id, 2 + Math.random() * 8);
        });

        setParticipants(allParticipants);
    }, [user, playerLoadout, venueCondition, optimalLoadout]);

    // Simulation tick effect
    useEffect(() => {
        if (participants.length === 0 || timeLeft <= 0) return;

        const simulationTimer = setInterval(() => {
            const currentParticipants = participantsRef.current;
            if (currentParticipants.length === 0) return;

            // Manage active catch animations
            const now = Date.now();
            const activeEvents = catchEventsRef.current;
            for (const [key, event] of activeEvents.entries()) {
                if (now > event.expiresAt) {
                    activeEvents.delete(key);
                }
            }

            let newLiveFeedMessage = '';
            
            const sortedBefore = [...currentParticipants].sort((a, b) => b.totalWeight - a.totalWeight);
            const leaderBefore = sortedBefore[0];
            const top3Before = new Set(sortedBefore.slice(0, 3).map(p => p.id));

            const updatedParticipants = currentParticipants.map(p => {
                let currentLoadout = { ...p.loadout }; // Use a mutable copy for this tick

                // BOT AI: Occasionally change parameters
                if (p.isBot) {
                    const BOT_ADAPT_CHANCE = 0.05; // 5% chance per second to adapt
                    if (Math.random() < BOT_ADAPT_CHANCE) {
                        const paramToChange = getRandom(Object.keys(currentLoadout).filter(k => k !== 'rod') as Array<keyof Loadout>);
                        
                        let options: string[] = [];
                        switch (paramToChange) {
                            case 'bait': options = MOCK_BAITS; break;
                            case 'groundbait': options = MOCK_GROUNDBAITS; break;
                            case 'hookSize': options = MOCK_HOOK_SIZES; break;
                            case 'feederType': options = MOCK_FEEDER_TYPES; break;
                            case 'feederTip': options = MOCK_FEEDER_TIPS; break;
                            case 'castingDistance': options = MOCK_CASTING_DISTANCES; break;
                            case 'castingInterval': options = MOCK_CASTING_INTERVALS; break;
                        }

                        if (options.length > 1) {
                            const availableOptions = options.filter(o => o !== currentLoadout[paramToChange]);
                            if (availableOptions.length > 0) {
                                currentLoadout[paramToChange] = getRandom(availableOptions);
                            }
                        }
                    }
                }
                
                // Calculate match score (0 to 8)
                const score = Object.keys(currentLoadout).reduce((acc, key) => {
                    if (currentLoadout[key as keyof Loadout] === optimalLoadout[key as keyof Loadout]) {
                        return acc + 1;
                    }
                    return acc;
                }, 0);

                const totalParams = 8;
                const scoreRatio = score / totalParams; // 0.0 to 1.0

                // Decrement bite timer
                let timer = biteTimers.current.get(p.id) || 10;
                timer -= (SIMULATION_TICK_RATE / 1000); // Reduce by tick rate in seconds
                
                let weightGained = 0;
                let newCatchStreak = p.catchStreak;

                if (timer <= 0) {
                    // CATCH EVENT
                    const fish = getRandom(MOCK_FISH_SPECIES);
                    const weight = parseFloat((fish.minWeight + Math.random() * (fish.maxWeight - fish.minWeight)).toFixed(2));
                    weightGained = weight;
                    newCatchStreak += 1;
                    
                    const isBigFish = weight > fish.maxWeight * 0.9;
                    
                    // Add new catch event with expiration
                    const eventId = `${p.id}_${now}`;
                    activeEvents.set(p.id, { 
                        id: eventId, 
                        weight, 
                        isBigFish, 
                        expiresAt: now + 2500 // Animation duration 2.5s
                    });
                    
                    if (isBigFish) { // Top 10% of its species weight
                        newLiveFeedMessage = `🚨 ${p.name} just landed a huge ${fish.name}!`;
                    }

                    // Reset Timer based on Score
                    // Perfect Loadout (Score 8/8) -> ~5 seconds
                    // Worst Loadout (Score 0/8) -> ~50 seconds
                    // Linear interpolation: Wait = 50 - (Ratio * 45)
                    const baseTime = 50 - (scoreRatio * 45);
                    
                    // Add variance (+/- 10%) so it feels natural
                    const variance = 0.9 + (Math.random() * 0.2); 
                    timer = baseTime * variance;
                } 

                biteTimers.current.set(p.id, timer);

                return {
                    ...p,
                    loadout: currentLoadout, // Save the potentially updated loadout
                    totalWeight: p.totalWeight + weightGained,
                    catchStreak: newCatchStreak,
                };
            });

            // After all participants are updated, check for rank changes.
            const sortedAfter = [...updatedParticipants].sort((a,b) => b.totalWeight - a.totalWeight);
            const leaderAfter = sortedAfter[0];
            
            // Check for new leader, if it's not the same as before
            if (leaderAfter && leaderBefore && leaderAfter.id !== leaderBefore.id && leaderAfter.totalWeight > 0) {
                newLiveFeedMessage = `👑 ${leaderAfter.name} takes the lead!`;
            } else if (!newLiveFeedMessage) { // Only check this if no other message
                // Check for players entering top 3
                const newTop3Players = sortedAfter.slice(0, 3).filter(p => !top3Before.has(p.id) && p.totalWeight > 0);
                if (newTop3Players.length > 0) {
                    const player = newTop3Players[0];
                    newLiveFeedMessage = `🔥 ${player.name} has entered the top 3!`;
                }
            }

            // --- TACTICAL HINT LOGIC ---
            // Reduced chance because tick rate is higher now (1s vs 5s)
            const HINT_CHANCE = 0.05; // 5% chance per tick
            if (!newLiveFeedMessage && Math.random() < HINT_CHANCE) {
                const player = updatedParticipants.find(p => !p.isBot);
                const playerRank = sortedAfter.findIndex(p => !p.isBot) + 1;

                // Only give hints if player is not doing well (e.g., outside top 3)
                if (player && playerRank > 3) {
                    const top3Competitors = sortedAfter.slice(0, 3).filter(p => p.isBot);
                    
                    if (top3Competitors.length > 0) {
                        const competitorToCopy = getRandom(top3Competitors);
                        const playerLoadout = player.loadout;
                        const competitorLoadout = competitorToCopy.loadout;
                        
                        const differentParams = (Object.keys(playerLoadout) as Array<keyof Loadout>)
                            .filter(key => key !== 'rod' && playerLoadout[key] !== competitorLoadout[key]);

                        if (differentParams.length > 0) {
                            const paramToSuggest = getRandom(differentParams);
                            const suggestedValue = competitorLoadout[paramToSuggest];
                            
                             const paramFriendlyNames: Record<keyof Loadout, string> = {
                                rod: 'rod', bait: 'bait', groundbait: 'groundbait', hookSize: 'hook size',
                                feederType: 'feeder type', feederTip: 'feeder tip', 
                                castingDistance: 'casting distance', castingInterval: 'casting interval',
                            };
                            
                            const friendlyName = paramFriendlyNames[paramToSuggest];
                            newLiveFeedMessage = `💡 Hint: Try switching your ${friendlyName} to ${suggestedValue}.`;
                        }
                    }
                }
            }
            
            if (newLiveFeedMessage) {
                setLiveFeedMessage(newLiveFeedMessage);
            }

            const playerRankAfter = sortedAfter.findIndex(p => !p.isBot) + 1;

            setCatchEvents(new Map(activeEvents));
            setParticipants(updatedParticipants);
            if (playerRankAfter > 0) {
                setPlayerPositionHistory(prev => [...prev, playerRankAfter]);
            }
        }, SIMULATION_TICK_RATE);

        return () => clearInterval(simulationTimer);
    }, [participants.length, optimalLoadout]);

    const handleLoadoutChange = (field: keyof Loadout, value: string) => {
        setParticipants(prev => prev.map(p => {
            if (!p.isBot) {
                return { ...p, loadout: { ...p.loadout, [field]: value } };
            }
            return p;
        }));
    };

    const handleParticipantSelect = useCallback((participantId: string) => {
        const botElement = botColumnRefs.current.get(participantId);
        if (botElement) {
            botElement.scrollIntoView({
                behavior: 'smooth',
                inline: 'start',
                block: 'nearest',
            });
        }
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

    const allWeightsZero = useMemo(() => {
        return participants.every(p => p.totalWeight === 0);
    }, [participants]);

    const positionTrend = useMemo(() => {
        const history = playerPositionHistory;
        if (history.length < 2 || allWeightsZero) {
            return { text: 'Holding', icon: '↔️', color: 'text-gray-400' };
        }

        const lastPos = history[history.length - 1];
        const secondLastPos = history[history.length - 2];
        const direction = Math.sign(lastPos - secondLastPos);

        if (direction === 0) {
            return { text: 'Holding', icon: '↔️', color: 'text-gray-400' };
        }
        
        let trendCount = 0;
        for (let i = history.length - 1; i > 0; i--) {
            const current = history[i];
            const previous = history[i - 1];
            if (Math.sign(current - previous) === direction) {
                trendCount++;
            } else {
                break;
            }
        }

        if (trendCount === 0) {
           return { text: 'Holding', icon: '↔️', color: 'text-gray-400' };
        }
        
        if (direction === -1) { // Rank decreased (e.g., 5 -> 4), so position is UP
            return { text: `Climbing`, icon: '🔼', color: 'text-green-400' };
        }
        
        if (direction === 1) { // Rank increased (e.g., 4 -> 5), so position is DOWN
            return { text: `Dropping`, icon: '🔽', color: 'text-red-400' };
        }

        return { text: 'Holding', icon: '↔️', color: 'text-gray-400' };
    }, [playerPositionHistory, allWeightsZero]);

    const parameters = useMemo(() => {
        const availableRods = user.inventory.filter(i => i.type === 'Rod').map(i => i.name);
        const availableBaits = user.inventory.filter(i => i.type === 'Bait').map(i => i.name);
        const availableGroundbaits = user.inventory.filter(i => i.type === 'Groundbait').map(i => i.name);
        
        return [
            { key: 'rod', label: 'Feeder Rod', options: availableRods.length > 0 ? availableRods : [playerLoadout.rod] },
            { key: 'bait', label: 'Bait', options: availableBaits.length > 0 ? availableBaits : [playerLoadout.bait] },
            { key: 'groundbait', label: 'Groundbait', options: availableGroundbaits.length > 0 ? availableGroundbaits : [playerLoadout.groundbait] },
            { key: 'hookSize', label: 'Hook Size', options: MOCK_HOOK_SIZES },
            { key: 'feederType', label: 'Feeder Type', options: MOCK_FEEDER_TYPES },
            { key: 'feederTip', label: 'Feeder Tip', options: MOCK_FEEDER_TIPS },
            { key: 'castingDistance', label: 'Casting Distance', options: MOCK_CASTING_DISTANCES },
            { key: 'castingInterval', label: 'Casting Interval', options: MOCK_CASTING_INTERVALS },
        ];
    }, [user.inventory, playerLoadout]);

    if (!player) {
        return <div className="min-h-screen flex items-center justify-center"><p>Loading Match...</p></div>;
    }

    const sortedParticipants = [...participants].sort((a, b) => b.totalWeight - a.totalWeight);
    const leaderId = sortedParticipants[0]?.totalWeight > 0 ? sortedParticipants[0]?.id : null;

    const renderColumnContent = (p: MatchParticipant) => {
        const isPlayer = !p.isBot;
        const isLeader = p.id === leaderId;
        
        // Very compact heights to completely eliminate scrollbars
        const HEADER_HEIGHT = "h-14"; 
        const ROW_HEIGHT = "h-[45px]"; 

        return (
            <>
                <div className={`${HEADER_HEIGHT} text-center border-b pb-0.5 mb-0.5 flex-shrink-0 flex flex-col justify-center`} style={{borderColor: isPlayer ? 'rgba(59, 130, 246, 0.5)' : 'rgba(55, 65, 81, 1)'}}>
                    <div className="h-5 flex items-center justify-center">
                        <p className="font-bold text-xs leading-tight flex items-center justify-center max-w-full px-1">
                           {isLeader && <span title="Current Leader" className="text-yellow-400 mr-1 text-sm">👑</span>}
                           <span className="truncate block">{p.name}</span>
                        </p>
                    </div>
                    <p className={`text-base font-bold mt-0.5 ${isPlayer ? 'text-blue-300' : ''}`}>
                        {p.totalWeight === 0 ? 'Blank' : `${p.totalWeight.toFixed(2)} kg`}
                    </p>
                </div>

                <div className="overflow-y-auto flex-grow pr-1 custom-scrollbar">
                    {parameters.map(param => (
                        <div key={param.key} className={`${ROW_HEIGHT} flex flex-col justify-end pb-0.5 border-b border-gray-700/30`}>
                            <label className="text-[9px] text-gray-500 block truncate leading-none uppercase tracking-wide">{param.label}</label>
                            {isPlayer ? (
                                <select
                                    value={player.loadout[param.key as keyof Loadout]}
                                    onChange={(e) => handleLoadoutChange(param.key as keyof Loadout, e.target.value)}
                                    className="w-full h-7 pl-1 pr-4 bg-gray-700 border border-gray-600 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 0.25rem center',
                                        backgroundSize: '0.65em auto'
                                    }}
                                >
                                    {param.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            ) : (
                                <div className="w-full h-7 px-1 flex items-center bg-gray-900/50 border border-gray-600 rounded">
                                     <span className="truncate text-[11px] text-gray-300">{p.loadout[param.key as keyof Loadout]}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </>
        );
    };

    const playerCatchEvent = catchEvents.get(player.id);
    const playerColumnClasses = `w-40 h-full rounded-lg p-2 flex flex-col bg-blue-900/50 border-2 transition-all duration-300 relative ${
        playerCatchEvent ? (playerCatchEvent.isBigFish ? 'border-yellow-400' : 'border-green-400') : 'border-blue-600'
    }`;

    return (
        <div className="p-2 max-w-4xl mx-auto flex flex-col h-screen overflow-hidden">
            <header className="mb-1 p-1 bg-gray-800/50 rounded-lg flex-shrink-0">
                <div className="flex justify-between items-center w-full mb-1 text-center">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Position</p>
                        <p className="text-sm font-bold">
                           {allWeightsZero ? '-' : (playerRank > 0 ? `${playerRank} / ${participants.length}` : 'N/A')}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Trend</p>
                        <p className={`text-sm font-bold flex items-center justify-center gap-1 ${positionTrend.color}`}>
                            <span>{positionTrend.icon}</span>
                            <span>{positionTrend.text}</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Time Left</p>
                        <p className="text-sm font-bold">{formatTime(timeLeft)}</p>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-1">
                    <LiveFeedTicker message={liveFeedMessage} />
                    <StandingsVisualizer participants={participants} leaderId={leaderId} onParticipantSelect={handleParticipantSelect} />
                </div>
            </header>

            <div className="flex-grow flex overflow-hidden">
                {/* Player Column (Fixed) */}
                <div className="flex-shrink-0 p-1 pr-0 h-full">
                    <div className={playerColumnClasses}>
                        {renderColumnContent(player)}
                        {playerCatchEvent && <CatchAnimation key={playerCatchEvent.id} {...playerCatchEvent} />}
                    </div>
                </div>

                {/* Bots Container (Scrollable) */}
                <div ref={botsContainerRef} className="flex-grow overflow-x-auto whitespace-nowrap snap-x snap-mandatory scroll-smooth scroll-pl-2">
                    <div className="inline-flex space-x-2 h-full p-1">
                        {bots.map((p) => {
                            const botCatchEvent = catchEvents.get(p.id);
                            const botColumnClasses = `w-40 h-full flex-shrink-0 rounded-lg p-2 flex flex-col bg-gray-800 border-2 transition-all duration-300 snap-start relative ${
                                botCatchEvent ? (botCatchEvent.isBigFish ? 'border-yellow-400' : 'border-green-400') : 'border-gray-700'
                            }`;
                            return (
                                <div 
                                    key={p.id} 
                                    ref={(el) => {
                                        if (el) {
                                            botColumnRefs.current.set(p.id, el);
                                        } else {
                                            botColumnRefs.current.delete(p.id);
                                        }
                                    }}
                                    className={botColumnClasses}>
                                    {renderColumnContent(p)}
                                    {botCatchEvent && <CatchAnimation key={botCatchEvent.id} {...botCatchEvent} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

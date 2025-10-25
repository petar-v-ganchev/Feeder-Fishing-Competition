

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

const MATCH_DURATION = 90; // 90 seconds
const SIMULATION_TICK_RATE = 5000; // 5 seconds

// Helper to get a random element from an array
const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const LiveFeedTicker: React.FC<{ message: string | null }> = ({ message }) => {
    if (!message) {
        return (
            <div className="p-2 rounded-lg">
                <p className="text-sm text-yellow-300/50 whitespace-nowrap">Waiting for match events...</p>
            </div>
        );
    }

    return (
        <div className="p-2 rounded-lg overflow-hidden">
            <p className="text-sm text-yellow-300 whitespace-nowrap">
                <span className="font-bold mr-2">LIVE:</span>{message}
            </p>
        </div>
    );
};


export const MatchUIScreen: React.FC<MatchUIScreenProps> = ({ user, playerLoadout, onMatchEnd }) => {
    const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
    const [participants, setParticipants] = useState<MatchParticipant[]>([]);
    const [venueCondition, setVenueCondition] = useState<VenueCondition | null>(null);
    const [liveFeedMessage, setLiveFeedMessage] = useState<string | null>(null);
    
    const participantsRef = useRef(participants);
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
        const coinsEarned = playerRank === 1 ? 250 : 50;

        if (player) {
            const result: MatchResult = {
                playerWeight: player.totalWeight,
                opponentWeight: opponent ? opponent.totalWeight : 0,
                coinsEarned,
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

            return {
                id: `bot_${i}`,
                name: botName,
                isBot: true,
                loadout: optimalLoadout, // Bots start with a very good loadout
                totalWeight: 0,
                catchStreak: 0,
            };
        });
        
        setParticipants([player, ...bots]);
    }, [user, playerLoadout, venueCondition, optimalLoadout]);

    // Simulation tick effect
    useEffect(() => {
        if (participants.length === 0 || timeLeft <= 0) return;

        const simulationTimer = setInterval(() => {
            setParticipants(prevParticipants => {
                if (prevParticipants.length === 0) return prevParticipants;

                let newLiveFeedMessage = '';
                
                const sortedBefore = [...prevParticipants].sort((a, b) => b.totalWeight - a.totalWeight);
                const leaderBefore = sortedBefore[0];
                const top3Before = new Set(sortedBefore.slice(0, 3).map(p => p.id));

                const updatedParticipants = prevParticipants.map(p => {
                    let currentLoadout = { ...p.loadout }; // Use a mutable copy for this tick

                    // BOT AI: Occasionally change parameters
                    if (p.isBot) {
                        const BOT_ADAPT_CHANCE = 0.15; // 15% chance to adapt
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
                    
                    const score = Object.keys(currentLoadout).reduce((acc, key) => {
                        if (currentLoadout[key as keyof Loadout] === optimalLoadout[key as keyof Loadout]) {
                            return acc + 1;
                        }
                        return acc;
                    }, 0);

                    // Higher score = higher chance to catch a fish
                    const catchChance = p.isBot ? 0.65 : score / Object.keys(currentLoadout).length * 0.8;
                    const didCatch = Math.random() < catchChance;
                    
                    let weightGained = 0;
                    let newCatchStreak = p.catchStreak;

                    if (didCatch) {
                        const fish = getRandom(MOCK_FISH_SPECIES);
                        const weight = parseFloat((fish.minWeight + Math.random() * (fish.maxWeight - fish.minWeight)).toFixed(2));
                        weightGained = weight;
                        newCatchStreak += 1;
                        
                        // Check for big fish event
                        if (weight > fish.maxWeight * 0.9) { // Top 10% of its species weight
                            newLiveFeedMessage = `🚨 ${p.name} just landed a huge ${fish.name}!`;
                        }
                    } else {
                         newCatchStreak = 0;
                    }

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
                if (leaderAfter && leaderBefore && leaderAfter.id !== leaderBefore.id) {
                    newLiveFeedMessage = `👑 ${leaderAfter.name} takes the lead!`;
                } else { // Only check this if there's no new leader, to avoid overwriting message
                    // Check for players entering top 3
                    const newTop3Players = sortedAfter.slice(0, 3).filter(p => !top3Before.has(p.id));
                    if (newTop3Players.length > 0) {
                        const player = newTop3Players[0];
                        newLiveFeedMessage = `🔥 ${player.name} has entered the top 3!`;
                    }
                }
                
                if (newLiveFeedMessage) {
                    setLiveFeedMessage(newLiveFeedMessage);
                }

                return updatedParticipants;
            });
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
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const availableRods = user.inventory.filter(i => i.type === 'Rod').map(i => i.name);
    const availableBaits = user.inventory.filter(i => i.type === 'Bait').map(i => i.name);
    const availableGroundbaits = user.inventory.filter(i => i.type === 'Groundbait').map(i => i.name);
    
    const player = participants.find(p => !p.isBot);
    const bots = participants.filter(p => p.isBot);

    if (!player) {
        return <div className="min-h-screen flex items-center justify-center"><p>Loading Match...</p></div>;
    }

    const parameters: { key: keyof Loadout; label: string; options: string[] }[] = [
        { key: 'rod', label: 'Feeder Rod', options: availableRods },
        { key: 'bait', label: 'Bait', options: availableBaits },
        { key: 'groundbait', label: 'Groundbait', options: availableGroundbaits },
        { key: 'hookSize', label: 'Hook Size', options: MOCK_HOOK_SIZES },
        { key: 'feederType', label: 'Feeder Type', options: MOCK_FEEDER_TYPES },
        { key: 'feederTip', label: 'Feeder Tip', options: MOCK_FEEDER_TIPS },
        { key: 'castingDistance', label: 'Casting Distance', options: MOCK_CASTING_DISTANCES },
        { key: 'castingInterval', label: 'Casting Interval', options: MOCK_CASTING_INTERVALS },
    ];

    const sortedParticipants = [...participants].sort((a, b) => b.totalWeight - a.totalWeight);
    const leaderId = sortedParticipants[0]?.id;

    const renderColumnContent = (p: MatchParticipant) => {
        const isPlayer = !p.isBot;
        const isLeader = p.id === leaderId;
        return (
            <>
                <div className="text-center border-b pb-2 mb-2 flex-shrink-0" style={{borderColor: isPlayer ? 'rgba(59, 130, 246, 0.5)' : 'rgba(55, 65, 81, 1)'}}>
                    <p className="font-bold text-lg leading-tight flex items-center justify-center">
                       {isLeader && <span title="Current Leader" className="text-yellow-400 mr-1">👑</span>}
                       <span className="truncate">{p.name}</span>
                    </p>
                    <p className={`text-xl font-bold ${isPlayer ? 'text-blue-300' : ''}`}>
                        {isPlayer 
                            ? (p.totalWeight === 0 ? 'Blank' : `${p.totalWeight.toFixed(2)} kg`) 
                            : (p.totalWeight < 1 ? 'Blank' : `${Math.floor(p.totalWeight)}+ kg`)}
                    </p>
                </div>

                <div className="overflow-y-auto flex-grow pr-1">
                    {parameters.map(param => (
                        <div key={param.key} className="mb-2 text-left">
                            <label className="text-xs text-gray-400 block truncate">{param.label}</label>
                            {isPlayer ? (
                                <select
                                    value={player.loadout[param.key]}
                                    onChange={(e) => handleLoadoutChange(param.key, e.target.value)}
                                    className="w-full p-1 bg-gray-700 border border-gray-600 rounded text-base focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    {param.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            ) : (
                                <p className="p-1 bg-gray-900/50 rounded truncate text-base">{p.loadout[param.key]}</p>
                            )}
                        </div>
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className="p-2 md:p-4 max-w-4xl mx-auto flex flex-col h-screen">
            <header className="flex justify-between items-center mb-4 p-2 bg-gray-800/50 rounded-lg">
                <div className="flex-1 overflow-hidden">
                    <LiveFeedTicker message={liveFeedMessage} />
                </div>
                <div className="text-right pl-4">
                    <p className="text-sm text-gray-400">Time Left</p>
                    <p className="text-2xl font-bold">{formatTime(timeLeft)}</p>
                </div>
            </header>

            <div className="flex-grow flex overflow-hidden">
                {/* Player Column (Fixed) */}
                <div className="flex-shrink-0 p-2 pr-0">
                    <div className="w-40 h-full rounded-lg p-2 flex flex-col bg-blue-900/50 border border-blue-600">
                        {renderColumnContent(player)}
                    </div>
                </div>

                {/* Bots Container (Scrollable) */}
                <div className="flex-grow overflow-x-auto whitespace-nowrap snap-x snap-mandatory scroll-smooth scroll-pl-2">
                    <div className="inline-flex space-x-2 h-full p-2">
                        {bots.map((p) => (
                            <div key={p.id} className="w-40 flex-shrink-0 rounded-lg p-2 flex flex-col bg-gray-800 border border-gray-700 snap-start">
                                {renderColumnContent(p)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

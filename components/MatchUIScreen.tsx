import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { MatchResult, User, Loadout, MatchParticipant } from '../types';
import { 
    MOCK_FEEDER_TIPS, 
    MOCK_CASTING_DISTANCES, 
    MOCK_CASTING_INTERVALS 
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

// Explicit widths for the grid
const LABEL_WIDTH_PX = '90px';
const COL_WIDTH_PX = '115px';
const ROW_HEIGHT = 'h-[38px]';

export const MatchUIScreen: React.FC<MatchUIScreenProps> = ({ user, playerLoadout, onMatchEnd, participantsOverride }) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
    const [participants, setParticipants] = useState<MatchParticipant[]>([]);
    const [tacticalEff, setTacticalEff] = useState(0.5);
    
    const participantsRef = useRef(participants);
    const initializedRef = useRef(false);

    useEffect(() => { participantsRef.current = participants; }, [participants]);

    // Calculate owned items for the player's dropdowns
    const ownedRods = useMemo(() => user.inventory.filter(i => i.type === 'Rod').map(i => i.id), [user.inventory]);
    const ownedReels = useMemo(() => user.inventory.filter(i => i.type === 'Reel').map(i => i.id), [user.inventory]);
    const ownedLines = useMemo(() => user.inventory.filter(i => i.type === 'Line').map(i => i.id), [user.inventory]);
    const ownedHooks = useMemo(() => user.inventory.filter(i => i.type === 'Hook').map(i => i.id), [user.inventory]);
    const ownedFeeders = useMemo(() => user.inventory.filter(i => i.type === 'Feeder').map(i => i.id), [user.inventory]);
    const ownedBaits = useMemo(() => user.inventory.filter(i => i.type === 'Bait').map(i => i.id), [user.inventory]);
    const ownedGroundbaits = useMemo(() => user.inventory.filter(i => i.type === 'Groundbait').map(i => i.id), [user.inventory]);
    const ownedAdditives = useMemo(() => user.inventory.filter(i => i.type === 'Additive').map(i => i.id), [user.inventory]);
    
    const ownedTips = useMemo(() => {
        const tips = MOCK_FEEDER_TIPS.filter(tip => {
            const id = `acc_qt${tip.replace('.', '').replace('oz', '')}`;
            return user.inventory.some(i => i.id === id);
        });
        if (playerLoadout.feederTip && !tips.includes(playerLoadout.feederTip)) {
            tips.push(playerLoadout.feederTip);
        }
        return tips;
    }, [user.inventory, playerLoadout.feederTip]);

    // Initialize participants only once per mount
    useEffect(() => {
        if (initializedRef.current) return;
        
        const p: MatchParticipant = {
            id: user.id, 
            name: user.displayName, 
            isBot: false, 
            loadout: { ...playerLoadout }, 
            totalWeight: 0, 
            catchStreak: 0, 
            lastCatchTime: 0
        };
        
        const bots = FIPSED_PRO_NAMES.map((name, i) => ({
            id: `bot_${i}`, 
            name: name, 
            isBot: true, 
            loadout: { ...playerLoadout }, 
            totalWeight: 0, 
            catchStreak: 0, 
            lastCatchTime: 0
        }));
        
        setParticipants([p, ...bots]);
        initializedRef.current = true;
    }, [user, playerLoadout]);

    // Match loop
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
        
        const sim = setInterval(() => {
            setParticipants(prev => prev.map(p => {
                const catchChance = p.id === user.id ? 0.05 : 0.04;
                if (Math.random() < catchChance) {
                    const weight = parseFloat((Math.random() * 1.5).toFixed(2));
                    return { ...p, totalWeight: p.totalWeight + weight };
                }
                return p;
            }));
            setTacticalEff(0.3 + Math.random() * 0.7);
        }, 3000);

        // Bot tactic simulation to keep the table "Live"
        const botTacticSim = setInterval(() => {
            setParticipants(prev => prev.map(p => {
                if (!p.isBot) return p;
                if (Math.random() > 0.15) return p; 
                
                const fields: (keyof Loadout)[] = ['castingDistance', 'castingInterval', 'feederTip', 'bait'];
                const field = fields[Math.floor(Math.random() * fields.length)];
                let newVal = p.loadout[field];
                
                if (field === 'castingDistance') newVal = MOCK_CASTING_DISTANCES[Math.floor(Math.random() * MOCK_CASTING_DISTANCES.length)];
                if (field === 'castingInterval') newVal = MOCK_CASTING_INTERVALS[Math.floor(Math.random() * MOCK_CASTING_INTERVALS.length)];
                if (field === 'feederTip') newVal = MOCK_FEEDER_TIPS[Math.floor(Math.random() * MOCK_FEEDER_TIPS.length)];
                
                return { ...p, loadout: { ...p.loadout, [field]: newVal } };
            }));
        }, 4000);

        return () => { 
            clearInterval(timer); 
            clearInterval(sim); 
            clearInterval(botTacticSim);
        };
    }, [timeLeft, onMatchEnd, participantsOverride, user.id]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const updatePlayerTactic = (field: keyof Loadout, value: string) => {
        setParticipants(prev => prev.map(p => 
            p.id === user.id 
                ? { ...p, loadout: { ...p.loadout, [field]: value } }
                : p
        ));
    };

    const sortedParticipants = [...participants].sort((a,b) => b.totalWeight - a.totalWeight);
    const rank = sortedParticipants.findIndex(s => s.id === user.id) + 1;

    // Define tactical fields for the rows
    const TACTICS_FIELDS: { label: string, field: keyof Loadout, options?: string[] }[] = [
        { label: t('match.tackle.rod'), field: 'rod', options: ownedRods },
        { label: t('match.tackle.reel'), field: 'reel', options: ownedReels },
        { label: t('match.tackle.line'), field: 'line', options: ownedLines },
        { label: t('match.tackle.hook'), field: 'hook', options: ownedHooks },
        { label: t('match.tackle.feeder'), field: 'feeder', options: ownedFeeders },
        { label: t('match.tackle.bait'), field: 'bait', options: ownedBaits },
        { label: t('match.tackle.groundbait'), field: 'groundbait', options: ownedGroundbaits },
        { label: t('match.tackle.additive'), field: 'additive', options: ownedAdditives },
        { label: t('match.tackle.feedertip'), field: 'feederTip', options: ownedTips },
        { label: t('match.tackle.distance'), field: 'castingDistance', options: MOCK_CASTING_DISTANCES },
        { label: t('match.tackle.interval'), field: 'castingInterval', options: MOCK_CASTING_INTERVALS },
    ];

    const player = participants.find(p => !p.isBot);
    const bots = participants.filter(p => p.isBot);

    return (
        <div className="flex flex-col h-screen bg-white text-onSurface overflow-hidden select-none">
            {/* Stats Summary Card */}
            <div className="mx-4 my-4 bg-slate-50 rounded-medium shadow-md border border-outline flex-shrink-0">
                <div className="grid grid-cols-3 gap-px bg-outline/20 overflow-hidden rounded-medium">
                    <div className="bg-slate-50 text-center py-3 flex flex-col justify-center border-r border-outline/20">
                        <p className="text-[9px] font-bold text-onSurfaceVariant uppercase tracking-wider leading-none mb-1.5">{t('match.ui.position')}</p>
                        <p className="text-2xl font-black text-primary leading-none">#{rank}</p>
                    </div>
                    
                    <div className="bg-slate-50 text-center py-3 flex flex-col justify-center items-center px-2">
                        <p className="text-[8px] font-bold text-onSurfaceVariant uppercase tracking-wider leading-none mb-2.5">{t('match.ui.tactical')}</p>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner mb-1.5">
                            <div 
                                className="bg-primary h-full transition-all duration-700 ease-out" 
                                style={{ width: `${tacticalEff * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-[9px] font-black text-primary leading-none">{(tacticalEff * 100).toFixed(0)}%</p>
                    </div>

                    <div className="bg-slate-50 text-center py-3 flex flex-col justify-center border-l border-outline/20">
                        <p className="text-[9px] font-bold text-onSurfaceVariant uppercase tracking-wider leading-none mb-1.5">{t('match.ui.time')}</p>
                        <p className="text-2xl font-black text-primary font-mono leading-none">{formatTime(timeLeft)}</p>
                    </div>
                </div>
            </div>

            {/* Main Interactive Table - Split Layout */}
            <div className="flex-grow overflow-hidden flex flex-col">
                <div className="flex-grow flex overflow-hidden border-t border-outline relative">
                    
                    {/* FIXED Column Group: Labels + Player */}
                    <div className="flex-shrink-0 z-20 bg-white border-r border-outline shadow-[6px_0_12px_rgba(0,0,0,0.1)] overflow-hidden">
                        <table className="border-collapse table-fixed" style={{ width: `calc(${LABEL_WIDTH_PX} + ${COL_WIDTH_PX})` }}>
                            <thead className="bg-slate-100 border-b-2 border-primary/20">
                                <tr className="h-16">
                                    <th className="px-3 py-4 text-[10px] font-black text-primary uppercase text-left align-middle" style={{ width: LABEL_WIDTH_PX }}>
                                        {t('match.ui.live_standings')}
                                    </th>
                                    {player && (
                                        <th 
                                            style={{ width: COL_WIDTH_PX }}
                                            className="px-3 py-3 border-l border-outline text-center bg-blue-50/50"
                                        >
                                            <p className="text-[11px] font-black truncate max-w-[100px] mx-auto text-primary">
                                                {t('common.you') || player.name}
                                            </p>
                                            <p className="text-sm font-bold text-secondary mt-1">
                                                {player.totalWeight.toFixed(2)} kg
                                            </p>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {TACTICS_FIELDS.map(f => (
                                    <tr key={f.field} className={`border-b border-outline ${ROW_HEIGHT} hover:bg-slate-50 transition-colors`}>
                                        <td className="px-3 py-2 text-[10px] font-bold text-onSurfaceVariant uppercase tracking-tight whitespace-nowrap bg-white truncate" style={{ width: LABEL_WIDTH_PX }}>
                                            {f.label}
                                        </td>
                                        {player && (
                                            <td 
                                                style={{ width: COL_WIDTH_PX }}
                                                className="px-2 py-1.5 border-l border-outline text-center bg-blue-50/20"
                                            >
                                                <select 
                                                    value={player.loadout[f.field] as string}
                                                    onChange={(e) => updatePlayerTactic(f.field, e.target.value)}
                                                    className="w-full bg-white border border-outline rounded-small text-[10px] py-1 px-1 focus:outline-none focus:ring-1 focus:ring-primary font-bold shadow-sm"
                                                >
                                                    {f.options?.map(opt => (
                                                        <option key={opt} value={opt}>
                                                            {opt.includes('_') ? t(`item.name.${opt}`) : opt}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* SCROLLABLE Area: All Bots side-by-side */}
                    <div className="flex-grow overflow-x-auto custom-scrollbar bg-white">
                        <table className="border-collapse table-auto">
                            <thead className="bg-slate-100 border-b-2 border-primary/20">
                                <tr className="h-16">
                                    {bots.map((p) => (
                                        <th 
                                            key={p.id} 
                                            style={{ minWidth: COL_WIDTH_PX, width: COL_WIDTH_PX }}
                                            className="px-3 py-3 border-r border-outline text-center"
                                        >
                                            <p className="text-[11px] font-black truncate max-w-[100px] mx-auto text-onSurface">
                                                {p.name}
                                            </p>
                                            <p className="text-sm font-bold text-secondary mt-1">
                                                {p.totalWeight.toFixed(2)} kg
                                            </p>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {TACTICS_FIELDS.map(f => (
                                    <tr key={f.field} className={`border-b border-outline ${ROW_HEIGHT} hover:bg-slate-50 transition-colors`}>
                                        {bots.map((p) => (
                                            <td 
                                                key={p.id} 
                                                style={{ width: COL_WIDTH_PX }}
                                                className="px-2 py-1.5 border-r border-outline text-center"
                                            >
                                                <span className="text-[10px] font-bold text-onSurface/70 truncate block max-w-[100px] mx-auto">
                                                    {p.loadout[f.field]?.toString().includes('_') 
                                                        ? t(`item.name.${p.loadout[f.field] as string}`) 
                                                        : p.loadout[f.field]}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
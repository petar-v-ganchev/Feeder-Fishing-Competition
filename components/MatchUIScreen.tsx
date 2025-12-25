
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

export const MatchUIScreen: React.FC<MatchUIScreenProps> = ({ user, playerLoadout, onMatchEnd, participantsOverride }) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
    const [participants, setParticipants] = useState<MatchParticipant[]>([]);
    const [lastCatch, setLastCatch] = useState<{weight: number, species: string} | null>(null);
    const [tacticalEff, setTacticalEff] = useState(0.5);
    
    const participantsRef = useRef(participants);
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
        return tips.length > 0 ? tips : [playerLoadout.feederTip];
    }, [user.inventory, playerLoadout.feederTip]);

    // Initialize participants
    useEffect(() => {
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
                    if (p.id === user.id) {
                        setLastCatch({ weight, species: 'Roach' });
                        setTimeout(() => setLastCatch(null), 3000);
                    }
                    return { ...p, totalWeight: p.totalWeight + weight };
                }
                return p;
            }));
            setTacticalEff(0.3 + Math.random() * 0.7);
        }, 3000);

        return () => { clearInterval(timer); clearInterval(sim); };
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

    const sorted = [...participants].sort((a,b) => b.totalWeight - a.totalWeight);
    const rank = sorted.findIndex(s => s.id === user.id) + 1;

    // Helper to render table cells
    const renderTacticRow = (label: string, field: keyof Loadout, options?: string[]) => {
        return (
            <tr className="border-b border-outline hover:bg-slate-50 transition-colors">
                <td className="sticky left-0 z-20 bg-white border-r border-outline px-3 py-2 text-[10px] font-bold text-onSurfaceVariant uppercase tracking-tight whitespace-nowrap min-w-[100px]">
                    {label}
                </td>
                {participants.map((p) => {
                    const isPlayer = p.id === user.id;
                    return (
                        <td 
                            key={p.id} 
                            className={`px-2 py-1.5 border-r border-outline min-w-[130px] text-center snap-start scroll-ml-[230px]
                                ${isPlayer ? 'sticky left-[100px] z-20 bg-slate-50 shadow-[2px_0_5px_rgba(0,0,0,0.05)]' : ''}`}
                        >
                            {isPlayer ? (
                                <select 
                                    value={p.loadout[field] as string}
                                    onChange={(e) => updatePlayerTactic(field, e.target.value)}
                                    className="w-full bg-white border border-outline rounded-small text-[10px] py-1 px-1 focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                                >
                                    {options?.map(opt => (
                                        <option key={opt} value={opt}>
                                            {opt.includes('_') ? t(`item.name.${opt}`) : opt}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className="text-[10px] font-medium text-onSurface/70 truncate block max-w-[110px] mx-auto">
                                    {p.loadout[field]?.toString().includes('_') 
                                        ? t(`item.name.${p.loadout[field] as string}`) 
                                        : p.loadout[field]}
                                </span>
                            )}
                        </td>
                    );
                })}
            </tr>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-white text-onSurface overflow-hidden">
            {/* Countdown and Rank Header */}
            <div className="bg-slate-50 border-b border-outline p-4 grid grid-cols-2 gap-px shadow-sm flex-shrink-0">
                <div className="text-center border-r border-outline">
                    <p className="text-[10px] font-bold text-onSurfaceVariant uppercase tracking-wider">{t('match.ui.position')}</p>
                    <p className="text-3xl font-black text-primary">#{rank}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-bold text-onSurfaceVariant uppercase tracking-wider">{t('match.ui.time')}</p>
                    <p className="text-3xl font-black text-primary font-mono">{formatTime(timeLeft)}</p>
                </div>
            </div>

            {/* Main Interactive Table - Full Width */}
            <div className="flex-grow overflow-hidden flex flex-col">
                <div className="flex-grow overflow-x-auto overflow-y-auto bg-white custom-scrollbar relative snap-x snap-mandatory">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="sticky top-0 z-30 bg-slate-100 border-b-2 border-primary/20">
                                <th className="sticky left-0 z-40 bg-slate-100 border-r border-outline px-3 py-4 text-[10px] font-black text-primary uppercase text-left min-w-[100px]">
                                    {t('match.ui.live_standings')}
                                </th>
                                {participants.map((p) => {
                                    const isPlayer = p.id === user.id;
                                    return (
                                        <th 
                                            key={p.id} 
                                            className={`px-3 py-3 border-r border-outline min-w-[130px] text-center snap-start scroll-ml-[230px]
                                                ${isPlayer ? 'sticky left-[100px] z-40 bg-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)]' : ''}`}
                                        >
                                            <p className={`text-[11px] font-black truncate max-w-[110px] mx-auto ${isPlayer ? 'text-primary' : 'text-onSurface'}`}>
                                                {p.name}
                                            </p>
                                            <p className="text-sm font-bold text-secondary mt-1">
                                                {p.totalWeight.toFixed(2)} kg
                                            </p>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="text-[10px]">
                            {renderTacticRow(t('match.tackle.rod'), 'rod', ownedRods)}
                            {renderTacticRow(t('match.tackle.reel'), 'reel', ownedReels)}
                            {renderTacticRow(t('match.tackle.line'), 'line', ownedLines)}
                            {renderTacticRow(t('match.tackle.hook'), 'hook', ownedHooks)}
                            {renderTacticRow(t('match.tackle.feeder'), 'feeder', ownedFeeders)}
                            {renderTacticRow(t('match.tackle.bait'), 'bait', ownedBaits)}
                            {renderTacticRow(t('match.tackle.groundbait'), 'groundbait', ownedGroundbaits)}
                            {renderTacticRow(t('match.tackle.additive'), 'additive', ownedAdditives)}
                            {renderTacticRow(t('match.tackle.feedertip'), 'feederTip', ownedTips)}
                            {renderTacticRow(t('match.tackle.distance'), 'castingDistance', MOCK_CASTING_DISTANCES)}
                            {renderTacticRow(t('match.tackle.interval'), 'castingInterval', MOCK_CASTING_INTERVALS)}
                        </tbody>
                    </table>
                </div>

                {/* Catch Notification Overlay - Positioned within container */}
                <div className="h-16 flex items-center justify-center bg-white border-t border-outline flex-shrink-0">
                    {lastCatch ? (
                        <div className="animate-catch-event text-center bg-secondary/5 border border-secondary/20 px-6 py-2 rounded-full">
                            <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{t('match.ui.caught')}</p>
                            <p className="text-xl font-black text-primary">+{lastCatch.weight}kg {lastCatch.species}</p>
                        </div>
                    ) : (
                        <p className="text-xs font-semibold text-onSurfaceVariant italic opacity-40">{t('match.ui.waiting')}</p>
                    )}
                </div>
            </div>

            {/* Tactical Footer */}
            <footer className="bg-slate-50 border-t border-outline p-4 flex flex-col gap-2 flex-shrink-0">
                <div className="flex justify-between items-center text-[10px] font-bold text-onSurfaceVariant uppercase tracking-wider">
                    <span>{t('match.ui.tactical')}</span>
                    <span className="text-primary">{(tacticalEff * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className="bg-primary h-full transition-all duration-500" 
                        style={{ width: `${tacticalEff * 100}%` }}
                    ></div>
                </div>
            </footer>
        </div>
    );
};

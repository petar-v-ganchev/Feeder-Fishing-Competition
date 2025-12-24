import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { MatchResult, User, Loadout, MatchParticipant, VenueCondition, GameItem } from '../types';
import { MOCK_FISH_SPECIES, type FishSpecies } from '../constants';
import { type LiveParticipant } from '../services/liveMatchService';
import { useTranslation } from '../i18n/LanguageContext';
import { Card } from './common/Card';

interface MatchUIScreenProps {
  user: User;
  playerLoadout: Loadout;
  onMatchEnd: (result: MatchResult) => void;
  participantsOverride?: LiveParticipant[];
}

const MATCH_DURATION = 90;

export const MatchUIScreen: React.FC<MatchUIScreenProps> = ({ user, playerLoadout, onMatchEnd, participantsOverride }) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
    const [participants, setParticipants] = useState<MatchParticipant[]>([]);
    const [lastCatch, setLastCatch] = useState<{weight: number, species: string} | null>(null);
    const [tacticalEff, setTacticalEff] = useState(0.5);
    
    const participantsRef = useRef(participants);
    useEffect(() => { participantsRef.current = participants; }, [participants]);

    useEffect(() => {
        const p: MatchParticipant = {
            id: user.id, name: user.displayName, isBot: false, loadout: playerLoadout, totalWeight: 0, catchStreak: 0, lastCatchTime: 0
        };
        const bots = Array.from({ length: 5 }).map((_, i) => ({
            id: `bot_${i}`, name: `BOT_${i}`, isBot: true, loadout: playerLoadout, totalWeight: 0, catchStreak: 0, lastCatchTime: 0
        }));
        setParticipants([p, ...bots]);
    }, [user, playerLoadout]);

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
                const catchChance = p.id === user.id ? 0.15 : 0.1;
                if (Math.random() < catchChance) {
                    const weight = parseFloat((Math.random() * 2).toFixed(2));
                    if (p.id === user.id) setLastCatch({ weight, species: 'Roach' });
                    return { ...p, totalWeight: p.totalWeight + weight };
                }
                return p;
            }));
            setTacticalEff(Math.random());
        }, 2000);
        return () => { clearInterval(timer); clearInterval(sim); };
    }, [timeLeft]);

    const player = participants.find(p => p.id === user.id);
    const sorted = [...participants].sort((a,b) => b.totalWeight - a.totalWeight);
    const rank = sorted.findIndex(s => s.id === user.id) + 1;

    return (
        <div className="flex flex-col h-screen bg-slate-100 text-onSurface overflow-hidden">
            {/* Scoreboard Bar */}
            <header className="bg-primary text-white p-4 grid grid-cols-2 gap-px shadow-md">
                <div className="text-center border-r border-white/20">
                    <p className="text-[10px] font-bold opacity-60">{t('match.ui.position')}</p>
                    <p className="text-3xl font-bold">#{rank}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-bold opacity-60">{t('match.ui.time')}</p>
                    <p className="text-3xl font-bold">{timeLeft}s</p>
                </div>
            </header>

            <div className="p-4 flex flex-col gap-4 flex-grow overflow-hidden">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-3">
                    <Card variant="elevated" className="py-3 text-center border-b-2 border-b-secondary">
                        <p className="text-[10px] font-bold text-onSurfaceVariant">{t('match.ui.total')}</p>
                        <p className="text-xl font-bold text-primary">{player?.totalWeight.toFixed(2)} kg</p>
                    </Card>
                    <Card variant="elevated" className="py-3 text-center">
                        <p className="text-[10px] font-bold text-onSurfaceVariant">{t('match.ui.lure')}</p>
                        <p className="text-xl font-bold text-secondary">{playerLoadout.bait.split('_')[1]?.toLowerCase() || 'mag'}</p>
                    </Card>
                </div>

                {/* Standings Table */}
                <div className="flex-grow flex flex-col min-h-0 bg-white rounded-medium shadow-sm border border-outline overflow-hidden">
                    <div className="bg-slate-50 border-b border-outline px-4 py-2 flex justify-between">
                        <span className="text-[10px] font-bold text-onSurfaceVariant">{t('match.ui.live_standings')}</span>
                        <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span> Live
                        </span>
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                        {sorted.map((p, i) => (
                            <div key={p.id} className={`flex justify-between items-center px-4 py-3 border-b border-slate-50 last:border-0 ${p.id === user.id ? 'bg-primary/5' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold w-4 ${p.id === user.id ? 'text-primary' : 'text-onSurfaceVariant'}`}>{i + 1}</span>
                                    <span className={`text-sm font-semibold ${p.id === user.id ? 'text-primary font-bold' : ''}`}>{p.name}</span>
                                </div>
                                <span className="text-sm font-bold text-primary">{p.totalWeight.toFixed(2)} kg</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Event Tracker */}
                <div className="h-24 flex items-center justify-center bg-white border border-outline rounded-medium overflow-hidden">
                    {lastCatch ? (
                        <div className="animate-catch-event text-center">
                            <p className="text-[10px] font-black text-secondary mb-1">{t('match.ui.caught')}</p>
                            <p className="text-2xl font-bold text-primary">+{lastCatch.weight}kg {lastCatch.species}</p>
                        </div>
                    ) : (
                        <p className="text-xs font-semibold text-onSurfaceVariant italic">{t('match.ui.waiting')}</p>
                    )}
                </div>
            </div>

            {/* Tactical Footer */}
            <footer className="bg-slate-800 text-white p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                    <span>{t('match.ui.tactical')}</span>
                    <span>{(tacticalEff * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className="bg-secondary h-full transition-all duration-1000" 
                        style={{ width: `${tacticalEff * 100}%` }}
                    ></div>
                </div>
            </footer>
        </div>
    );
};
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Screen, type User } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Header } from './common/Header';
import { 
    getNextSessionTimestamp, 
    joinLiveSession, 
    leaveLiveSession, 
    subscribeToLiveParticipants,
    type LiveParticipant 
} from '../services/liveMatchService';
import { useTranslation } from '../i18n/LanguageContext';

const MAX_SESSION_PLAYERS = 15;

/**
 * Formats a string to Sentence case (e.g., "Hello world").
 * Forces the first character to uppercase and the rest to lowercase.
 */
const toSentenceCase = (str: string): string => {
    if (!str) return '';
    const s = str.trim();
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

/**
 * Formats a string to Title Case (e.g., "Hello World").
 */
const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

interface LiveMatchmakingScreenProps {
  user: User;
  onMatchFound: (participants: LiveParticipant[]) => void;
  onBack: () => void;
}

export const LiveMatchmakingScreen: React.FC<LiveMatchmakingScreenProps> = ({ user, onMatchFound, onBack }) => {
    const { t } = useTranslation();
    const [participants, setParticipants] = useState<LiveParticipant[]>([]);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [hasJoined, setHasJoined] = useState(false);
    const [currentSessionTime, setCurrentSessionTime] = useState<number>(() => getNextSessionTimestamp());
    const [showRescheduleMessage, setShowRescheduleMessage] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    // Sync participants and handle auto-start logic
    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, currentSessionTime - now);
            setTimeLeft(diff);

            if (diff <= 0) {
                const activeParticipants = participants.slice(0, MAX_SESSION_PLAYERS);
                const isUserIncluded = activeParticipants.some(p => p.id === user.id);

                if (activeParticipants.length >= 2 && isUserIncluded) {
                    clearInterval(timer);
                    onMatchFound(activeParticipants);
                } else if (activeParticipants.length >= 2 && !isUserIncluded && participants.length >= MAX_SESSION_PLAYERS) {
                    const nextOne = getNextSessionTimestamp();
                    const target = nextOne <= currentSessionTime ? currentSessionTime + 15 * 60 * 1000 : nextOne;
                    setCurrentSessionTime(target);
                    setStatusMessage(t('live.full'));
                    setTimeout(() => setStatusMessage(null), 5000);
                } else {
                    const nextOne = getNextSessionTimestamp();
                    const target = nextOne <= currentSessionTime ? currentSessionTime + 15 * 60 * 1000 : nextOne;
                    setCurrentSessionTime(target);
                    setShowRescheduleMessage(true);
                    setTimeout(() => setShowRescheduleMessage(false), 5000);
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [currentSessionTime, participants, onMatchFound, user.id, t]);

    // Handle auto-enrollment in the current session
    useEffect(() => {
        if (!user || !user.id) return;
        
        let isMounted = true;

        const enroll = async () => {
            try {
                await joinLiveSession(user.id, user, currentSessionTime);
            } catch (error) {
                console.error("Failed to enroll in live session:", error);
            }
        };

        enroll();

        const unsubscribe = subscribeToLiveParticipants(currentSessionTime, (updatedParticipants) => {
            if (isMounted) {
                setParticipants(updatedParticipants);
                setHasJoined(updatedParticipants.some(p => p.id === user.id));
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
            leaveLiveSession(user.id, currentSessionTime).catch(e => console.warn("Error leaving session:", e));
        };
    }, [currentSessionTime, user]);

    const formatCountdown = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const isSessionFull = !hasJoined && participants.length >= MAX_SESSION_PLAYERS;
    const userRank = participants.findIndex(p => p.id === user.id);
    const isWaitlisted = hasJoined && userRank >= MAX_SESSION_PLAYERS;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header title={toSentenceCase(t('live.title'))} onBack={onBack} />
            
            <div className="px-6 flex flex-col flex-grow pb-6">
                <Card className="mb-6 text-center border-primary shadow-lg bg-slate-50 relative overflow-hidden">
                    {(showRescheduleMessage || statusMessage) && (
                        <div className="absolute inset-0 bg-secondary/90 flex items-center justify-center p-4 z-10 animate-in fade-in zoom-in duration-300">
                           <p className="text-white text-[10px] font-black leading-tight uppercase italic text-center">
                                {statusMessage || t('live.rescheduled')}
                           </p>
                        </div>
                    )}
                    <p className="text-[10px] font-bold text-onSurfaceVariant mb-1">{toSentenceCase(t('live.next_session'))}</p>
                    <h2 className="text-5xl font-black text-primary mb-2 font-mono tracking-tighter">{formatCountdown(timeLeft)}</h2>
                    <div className="flex flex-col items-center">
                        <p className="text-[9px] text-primary font-bold opacity-60">
                            {toSentenceCase(t('live.scheduled'))} {new Date(currentSessionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </Card>

                <Card className="flex-grow mb-6 flex flex-col overflow-hidden bg-white border-outline">
                    <div className="flex justify-between items-center border-b border-outline pb-3 mb-4">
                        <h3 className="text-xs font-bold text-primary">{toSentenceCase(t('live.joined_anglers'))}</h3>
                        <div className="flex items-center gap-2">
                             <span className="text-[8px] font-black text-onSurfaceVariant/50 uppercase tracking-widest">{t('live.limit', { target: MAX_SESSION_PLAYERS.toString() })}: {MAX_SESSION_PLAYERS}</span>
                             <span className={`px-2 py-0.5 rounded-small text-[10px] font-bold ${participants.length >= 2 ? 'bg-green-600' : 'bg-secondary'} text-white shadow-sm`}>
                                {participants.length}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar pr-1">
                        {participants.length === 0 ? (
                             <div className="h-full flex items-center justify-center opacity-20 italic text-xs py-12">
                                {t('leaderboard.loading')}
                             </div>
                        ) : participants.map((p, idx) => {
                            const isIncluded = idx < MAX_SESSION_PLAYERS;
                            return (
                                <div key={p.id} className={`flex items-center gap-3 p-3 rounded-medium border transition-all ${p.id === user.id ? 'bg-primary/5 border-primary/20 scale-[1.02] shadow-sm' : 'bg-slate-50 border-outline opacity-80'} ${!isIncluded ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                                    {p.avatar && p.avatar.length === 1 ? (
                                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-inner">
                                            {p.avatar}
                                        </div>
                                    ) : (
                                        <img src={p.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-outline bg-white" />
                                    )}
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-primary leading-tight">{toTitleCase(p.displayName)}</p>
                                            {p.id === user.id && (
                                                <span className="bg-primary/20 text-primary text-[7px] font-black px-1 rounded-sm uppercase tracking-tighter">You</span>
                                            )}
                                        </div>
                                        <p className="text-[9px] font-bold text-onSurfaceVariant">{toSentenceCase(p.country)}</p>
                                    </div>
                                    {!isIncluded && (
                                        <span className="text-[8px] font-black text-secondary uppercase bg-secondary/10 px-1 rounded-sm">{t('live.waitlist')}</span>
                                    )}
                                    <div className={`w-1.5 h-1.5 rounded-full ${isIncluded ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <div className="flex flex-col gap-3">
                    <div className={`${isWaitlisted || isSessionFull ? 'bg-red-50 border-red-200' : 'bg-slate-100 border-outline'} border rounded-medium p-4 text-center transition-colors`}>
                        {isWaitlisted ? (
                            <p className="text-secondary font-black text-xs mb-1 uppercase tracking-tight">⚠️ {t('live.waitlist')} - You are on Waitlist</p>
                        ) : isSessionFull ? (
                            <p className="text-secondary font-black text-xs mb-1 uppercase tracking-tight">❌ {t('live.full')}</p>
                        ) : (
                            <p className="text-green-600 font-bold text-xs mb-1">✓ {toSentenceCase(t('live.enrolled'))}</p>
                        )}
                        <p className="text-[10px] text-onSurfaceVariant font-medium leading-relaxed italic">
                            {isWaitlisted || isSessionFull 
                                ? "If any angler leaves, you will move up. Otherwise, you'll be prioritized for the next slot."
                                : toSentenceCase(t('live.footer'))}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
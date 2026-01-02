import React, { useState, useEffect } from 'react';
import { type User } from '../types';
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
const MIN_PLAYERS_REQUIRED = 2;

/**
 * Formats a string to Sentence case (e.g., "Hello world").
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

    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, currentSessionTime - now);
            setTimeLeft(diff);

            if (diff <= 0) {
                // Determine eligible humans for this specific match window
                const eligibleParticipants = participants.slice(0, MAX_SESSION_PLAYERS);
                const humanCount = eligibleParticipants.length;
                const isUserIncluded = eligibleParticipants.some(p => p.id === user.id);

                // REQUIREMENT: At least 2 humans must be enrolled to start a live match
                if (humanCount >= MIN_PLAYERS_REQUIRED && isUserIncluded) {
                    clearInterval(timer);
                    onMatchFound(eligibleParticipants);
                } else if (humanCount >= MAX_SESSION_PLAYERS && !isUserIncluded) {
                    // Session is full and user didn't make the cut
                    const nextOne = getNextSessionTimestamp();
                    const target = nextOne <= currentSessionTime ? currentSessionTime + 15 * 60 * 1000 : nextOne;
                    setCurrentSessionTime(target);
                    setStatusMessage(toSentenceCase(t('live.full')));
                    setTimeout(() => setStatusMessage(null), 5000);
                } else {
                    // Not enough humans (less than 2) or user not ready - Reschedule
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
    const hasMinPlayers = participants.length >= MIN_PLAYERS_REQUIRED;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header title={toSentenceCase(t('live.title'))} onBack={onBack} />
            
            <div className="px-6 flex flex-col flex-grow pb-6">
                <Card className="mb-6 text-center border-primary shadow-lg bg-slate-50 relative overflow-hidden">
                    <p className="text-[10px] font-bold text-onSurfaceVariant mb-1">{toSentenceCase(t('live.next_session'))}</p>
                    <h2 className="text-5xl font-black text-primary mb-2 font-mono tracking-tighter">{formatCountdown(timeLeft)}</h2>
                    <div className="flex flex-col items-center">
                        {showRescheduleMessage || statusMessage ? (
                             <p className="text-[9px] text-secondary font-black animate-pulse">
                                {statusMessage || "Not enough players. Rescheduling session..."}
                             </p>
                        ) : (
                            <p className="text-[9px] text-primary font-bold opacity-60">
                                {toSentenceCase(t('live.scheduled'))} {new Date(currentSessionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        )}
                    </div>
                </Card>

                <Card className="flex-grow mb-6 flex flex-col overflow-hidden bg-white border-outline">
                    <div className="flex justify-between items-center border-b border-outline pb-3 mb-4">
                        <h3 className="text-xs font-bold text-primary">{toSentenceCase(t('live.joined_anglers'))}</h3>
                        <div className="flex items-center gap-2">
                             <span className="text-[8px] font-black text-onSurfaceVariant/50">Session limit: {MAX_SESSION_PLAYERS}</span>
                             <span className={`px-2 py-0.5 rounded-small text-[10px] font-bold ${hasMinPlayers ? 'bg-green-600' : 'bg-secondary'} text-white shadow-sm transition-colors`}>
                                {participants.length}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar pr-1">
                        {participants.length === 0 ? (
                             <div className="h-full flex items-center justify-center opacity-20 italic text-xs py-12">
                                {toSentenceCase(t('leaderboard.loading'))}
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
                                                <span className="bg-primary/20 text-primary text-[7px] font-black px-1 rounded-sm tracking-tighter">You</span>
                                            )}
                                        </div>
                                        <p className="text-[9px] font-bold text-onSurfaceVariant">{toSentenceCase(p.country)}</p>
                                    </div>
                                    {!isIncluded && (
                                        <span className="text-[8px] font-black text-secondary bg-secondary/10 px-1 rounded-sm">{toSentenceCase(t('live.waitlist'))}</span>
                                    )}
                                    <div className={`w-1.5 h-1.5 rounded-full ${isIncluded ? (hasMinPlayers ? 'bg-green-500 animate-pulse' : 'bg-amber-400') : 'bg-slate-300'}`}></div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <div className="flex flex-col gap-3">
                    <div className={`${isWaitlisted || isSessionFull ? 'bg-red-50 border-red-200' : 'bg-slate-100 border-outline'} border rounded-medium p-4 text-center transition-colors`}>
                        {isWaitlisted ? (
                            <p className="text-secondary font-black text-xs mb-1 tracking-tight">{toSentenceCase(`⚠️ ${t('live.waitlist')} - You are on waitlist`)}</p>
                        ) : isSessionFull ? (
                            <p className="text-secondary font-black text-xs mb-1 tracking-tight">{toSentenceCase(`❌ ${t('live.full')}`)}</p>
                        ) : (
                            <p className="text-green-600 font-bold text-xs mb-1">✓ {toSentenceCase(t('live.enrolled'))}</p>
                        )}
                        <p className="text-[10px] text-onSurfaceVariant font-medium leading-relaxed italic">
                            {isWaitlisted || isSessionFull 
                                ? "If any angler leaves, you will move up. Otherwise, you'll be prioritized for the next slot."
                                : "The match requires at least 2 humans to start. If the requirement isn't met by zero, the timer will reset."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
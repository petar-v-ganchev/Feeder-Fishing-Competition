import React, { useState, useEffect, useCallback } from 'react';
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

    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, currentSessionTime - now);
            setTimeLeft(diff);

            if (diff <= 0) {
                if (participants.length >= 2 && hasJoined) {
                    clearInterval(timer);
                    onMatchFound(participants);
                } else {
                    const nextOne = getNextSessionTimestamp();
                    const target = nextOne <= currentSessionTime ? currentSessionTime + 15 * 60 * 1000 : nextOne;
                    setCurrentSessionTime(target);
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [currentSessionTime, participants, hasJoined, onMatchFound]);

    useEffect(() => {
        if (!user || !user.id) return;
        
        let isMounted = true;

        const syncWithSession = async () => {
            try {
                await joinLiveSession(user.id, user, currentSessionTime);
            } catch (error) {
                console.error("Failed to join session:", error);
            }
        };

        syncWithSession();

        const unsubscribe = subscribeToLiveParticipants(currentSessionTime, (updatedParticipants) => {
            if (isMounted) {
                setParticipants(updatedParticipants);
                setHasJoined(updatedParticipants.some(p => p.id === user.id));
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
            // Using user.id directly in cleanup is safe as it's captured in closure
            leaveLiveSession(user.id, currentSessionTime).catch(e => console.warn("Error leaving session:", e));
        };
    }, [currentSessionTime, user]);

    const formatCountdown = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="p-4 max-md mx-auto flex flex-col min-h-screen">
            <Header title={t('live.title')} onBack={onBack} />
            
            <Card className="mb-6 text-center border-blue-500/50">
                <p className="text-gray-400 text-sm font-bold tracking-widest mb-1">{t('live.next_session')}</p>
                <h2 className="text-5xl font-black text-blue-400 mb-2 font-mono">{formatCountdown(timeLeft)}</h2>
                <div className="flex flex-col items-center">
                    <p className="text-[9px] text-blue-500 font-bold mt-1">
                        {t('live.scheduled')} {new Date(currentSessionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </Card>

            <Card className="flex-grow mb-6 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
                    <h3 className="font-bold">{t('live.joined_anglers')}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${participants.length >= 2 ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                        {participants.length} / {t('live.min_required')}
                    </span>
                </div>
                
                <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar">
                    {participants.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-2 bg-gray-900/50 rounded-lg border border-gray-700/30">
                            {p.avatar && p.avatar.startsWith('data:image/') ? (
                                <img src={p.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
                                    {p.avatar || p.displayName.charAt(0)}
                                </div>
                            )}
                            <div className="flex-grow">
                                <p className="text-sm font-bold leading-tight">{p.displayName}</p>
                                <p className="text-[10px] text-gray-500">{p.country}</p>
                            </div>
                            {p.id === user.id && (
                                <span className="text-[10px] font-bold text-blue-400 italic">You</span>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            <div className="space-y-3 text-center">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-green-400 font-bold mb-2 animate-pulse">✓ {t('live.enrolled')}</p>
                    <p className="text-[11px] text-gray-400">{t('live.footer')}</p>
                </div>
            </div>
        </div>
    );
};
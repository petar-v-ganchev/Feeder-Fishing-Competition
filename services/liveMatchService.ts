import { db } from './firebase';
import { 
    doc, 
    setDoc, 
    deleteDoc, 
    onSnapshot, 
    collection, 
    serverTimestamp,
    query,
    where
} from 'firebase/firestore';
import type { User } from '../types';

export interface LiveParticipant {
    id: string;
    displayName: string;
    avatar: string;
    country: string;
    joinedAt: any;
}

export const getNextSessionTimestamp = () => {
    const interval = 15 * 60 * 1000; // 15 minutes
    const now = Date.now();
    return Math.ceil(now / interval) * interval;
};

export async function joinLiveSession(userId: string, user: User, sessionTimestamp: number) {
    const sessionRef = doc(db, 'live_sessions', sessionTimestamp.toString());
    const participantRef = doc(collection(sessionRef, 'participants'), userId);
    
    await setDoc(participantRef, {
        id: userId,
        displayName: user.displayName,
        avatar: user.avatar,
        country: user.country,
        joinedAt: serverTimestamp()
    });
}

export async function leaveLiveSession(userId: string, sessionTimestamp: number) {
    const sessionRef = doc(db, 'live_sessions', sessionTimestamp.toString());
    const participantRef = doc(collection(sessionRef, 'participants'), userId);
    await deleteDoc(participantRef);
}

export function subscribeToLiveParticipants(sessionTimestamp: number, callback: (participants: LiveParticipant[]) => void) {
    const sessionRef = doc(db, 'live_sessions', sessionTimestamp.toString());
    const participantsCol = collection(sessionRef, 'participants');
    
    return onSnapshot(participantsCol, (snapshot) => {
        const participants: LiveParticipant[] = [];
        snapshot.forEach((doc) => {
            participants.push(doc.data() as LiveParticipant);
        });
        callback(participants);
    });
}
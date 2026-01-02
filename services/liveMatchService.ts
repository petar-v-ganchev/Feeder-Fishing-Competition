import { auth, db } from './firebase';
import { 
    doc, 
    setDoc, 
    deleteDoc, 
    onSnapshot, 
    collection, 
    serverTimestamp
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
    if (!auth.currentUser) {
        console.error("Join Session Blocked: No currentUser in Auth SDK");
        throw new Error("Authentication required for live session enrollment.");
    }

    const sessionRef = doc(db, 'live_sessions', sessionTimestamp.toString());
    const participantRef = doc(collection(sessionRef, 'participants'), userId);
    
    try {
        await setDoc(participantRef, {
            id: userId,
            displayName: user.displayName,
            avatar: user.avatar,
            country: user.country,
            joinedAt: serverTimestamp()
        });
    } catch (error: any) {
        console.group("Firestore Write Error (joinLiveSession)");
        console.error("User ID:", userId);
        console.error("Auth SDK UID:", auth.currentUser.uid);
        console.error("Code:", error.code);
        console.error("Message:", error.message);
        console.groupEnd();
        throw error;
    }
}

export async function leaveLiveSession(userId: string, sessionTimestamp: number) {
    if (!auth.currentUser) return;
    
    const sessionRef = doc(db, 'live_sessions', sessionTimestamp.toString());
    const participantRef = doc(collection(sessionRef, 'participants'), userId);
    try {
        await deleteDoc(participantRef);
    } catch (e) {
        console.warn("Silent failure leaving session:", e);
    }
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
    }, (error) => {
        console.group("Firestore Subscription Error");
        console.error("Code:", error.code);
        console.error("Message:", error.message);
        console.error("Auth State:", auth.currentUser ? `Logged in as ${auth.currentUser.uid}` : "Logged out");
        console.groupEnd();
    });
}
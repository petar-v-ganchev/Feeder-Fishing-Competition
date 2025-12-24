
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    deleteUser as deleteFirebaseAuthUser,
    sendPasswordResetEmail,
    verifyBeforeUpdateEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    runTransaction,
    writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User } from '../types';
import { MOCK_INVENTORY_ITEMS } from '../constants';

interface CompleteRegistrationParams {
    uid: string;
    displayName: string;
    email: string;
    country: string;
    language: string;
}

/**
 * Creates the user profile document in Firestore and a corresponding document
 * in the 'displayNames' collection to enforce uniqueness. This is done transactionally.
 */
export async function completeRegistration(params: CompleteRegistrationParams): Promise<User> {
    const { uid, displayName, email, country, language } = params;

    if (displayName.length < 3 || displayName.length > 15) {
        throw new Error("Display name must be between 3 and 15 characters.");
    }
    
    const lowerCaseName = displayName.toLowerCase();

    const newUser: User = {
        id: uid,
        displayName: displayName,
        email: email,
        avatar: displayName.charAt(0).toUpperCase(),
        country: country,
        language: language,
        euros: 1000,
        inventory: MOCK_INVENTORY_ITEMS,
        stats: {
            matchesPlayed: 0,
            wins: 0,
        },
    };

    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, "users", uid);
            const displayNameRef = doc(db, "displayNames", lowerCaseName);

            // Check for uniqueness inside the transaction to prevent race conditions.
            const displayNameDoc = await transaction.get(displayNameRef);
            if (displayNameDoc.exists()) {
                throw new Error("This display name is already taken. Please choose another.");
            }

            transaction.set(userRef, newUser);
            transaction.set(displayNameRef, { userId: uid });
        });
    } catch (error: any) {
        if (error.message.includes("display name is already taken")) {
            throw error;
        }
        throw new Error("Failed to create your user profile in the database. Please try again.");
    }
    
    return newUser;
}


interface LoginUserParams {
    email: string;
    password?: string;
}

export async function loginUser(params: LoginUserParams & { rememberMe: boolean }) {
    if (!params.password) {
        throw new Error("Password is required to log in.");
    }
    const persistenceType = params.rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistenceType);
    await signInWithEmailAndPassword(auth, params.email, params.password);
}


export async function getUserProfile(uid: string): Promise<User | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as User;
    } else {
        return null;
    }
}


export async function updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
    const userRef = doc(db, "users", uid);

    if (data.displayName && data.displayName.length > 0) {
        const newDisplayName = data.displayName;
        const newDisplayNameLower = newDisplayName.toLowerCase();

        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User document not found.");
            }
            const oldDisplayName = userDoc.data().displayName;
            const oldDisplayNameLower = oldDisplayName.toLowerCase();

            if (newDisplayNameLower !== oldDisplayNameLower) {
                const newDisplayNameRef = doc(db, 'displayNames', newDisplayNameLower);
                const newNameDoc = await transaction.get(newDisplayNameRef);
                
                if (newNameDoc.exists()) {
                     throw new Error("This display name is already taken. Please choose another.");
                }
                
                const oldDisplayNameRef = doc(db, 'displayNames', oldDisplayNameLower);
                transaction.delete(oldDisplayNameRef);
                transaction.set(newDisplayNameRef, { userId: uid });
            }
            
            transaction.update(userRef, data);
        });
    } else {
        await updateDoc(userRef, data);
    }
}


export async function deleteUserAccount(): Promise<void> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
        throw new Error("No user is currently signed in.");
    }
    
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        const displayNameLower = userData.displayName.toLowerCase();
        const displayNameRef = doc(db, 'displayNames', displayNameLower);

        const batch = writeBatch(db);
        batch.delete(userDocRef);
        batch.delete(displayNameRef);

        try {
            await batch.commit();
        } catch (dbError) {
             throw new Error("Could not delete your game data.");
        }
    }

    try {
        await deleteFirebaseAuthUser(firebaseUser);
    } catch (authError: any) {
        if (authError.code === 'auth/requires-recent-login') {
            throw new Error('Please log out and log in again to delete your account.');
        }
        throw new Error("Could not delete your authentication profile.");
    }
}

export async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
}

export async function updateUserEmail(newEmail: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No user is currently signed in.");
    }
    if (user.email?.toLowerCase() === newEmail.toLowerCase()) {
        return;
    }
    try {
        await verifyBeforeUpdateEmail(user, newEmail);
    } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
            throw new Error('Sensitive operation. Please re-login.');
        }
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email address is already in use.');
        }
        throw new Error('Failed to start email update process.');
    }
}

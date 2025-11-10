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
}

/**
 * Creates the user profile document in Firestore and a corresponding document
 * in the 'displayNames' collection to enforce uniqueness. This is done transactionally.
 * This is now the second step of registration, called from the CreateProfileScreen.
 */
export async function completeRegistration(params: CompleteRegistrationParams): Promise<User> {
    const { uid, displayName, email, country } = params;

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
        // Re-throw specific errors to be caught by the calling function (registerUser)
        if (error.message.includes("display name is already taken")) {
            throw error;
        }
        // Otherwise, throw a more generic error for other transaction failures.
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

    // If display name is being updated, handle the uniqueness logic transactionally.
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

            // Only perform uniqueness checks and display name lock changes if the name has actually changed (case-insensitively).
            if (newDisplayNameLower !== oldDisplayNameLower) {
                const newDisplayNameRef = doc(db, 'displayNames', newDisplayNameLower);
                const newNameDoc = await transaction.get(newDisplayNameRef);
                
                if (newNameDoc.exists()) {
                     throw new Error("This display name is already taken. Please choose another.");
                }
                
                // If we're here, the new name is available. We need to move the lock.
                const oldDisplayNameRef = doc(db, 'displayNames', oldDisplayNameLower);
                transaction.delete(oldDisplayNameRef);
                transaction.set(newDisplayNameRef, { userId: uid });
            }
            
            // Always update the user document itself. This handles case-only changes (e.g., "name" to "Name")
            // and updates other profile data that may have changed.
            transaction.update(userRef, data);
        });
    } else {
        // No display name change, just a simple update for other fields.
        await updateDoc(userRef, data);
    }
}


export async function deleteUserAccount(): Promise<void> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
        throw new Error("No user is currently signed in. This action requires authentication.");
    }
    
    console.log(`[Delete Flow] Starting account deletion for user: ${firebaseUser.uid}`);
    
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    // Fetch the user's profile first to know which display name document to delete.
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        console.warn(`[Delete Flow] User profile for ${firebaseUser.uid} not found. Proceeding to delete auth user only.`);
    } else {
        const userData = userDocSnap.data() as User;
        const displayNameLower = userData.displayName.toLowerCase();
        const displayNameRef = doc(db, 'displayNames', displayNameLower);

        // Use a batch write to delete both Firestore documents atomically.
        const batch = writeBatch(db);
        batch.delete(userDocRef);
        batch.delete(displayNameRef);

        try {
            await batch.commit();
            console.log(`[Delete Flow] Successfully deleted Firestore user profile and display name lock for user ${firebaseUser.uid}.`);
        } catch (dbError) {
             console.error(`[Delete Flow] Failed to delete Firestore data for user ${firebaseUser.uid}. Aborting account deletion.`, dbError);
             throw new Error("Could not delete your game data from the database. Please try again.");
        }
    }

    // After successfully deleting database records, delete the Firebase Auth user.
    try {
        await deleteFirebaseAuthUser(firebaseUser);
        console.log(`[Delete Flow] Successfully deleted Firebase Auth user: ${firebaseUser.uid}`);
    } catch (authError: any) {
        console.error(`[Delete Flow] CRITICAL: Successfully deleted Firestore data, but failed to delete Firebase Auth user ${firebaseUser.uid}.`, authError);
        if (authError.code === 'auth/requires-recent-login') {
            throw new Error('This is a sensitive security operation. Please log out and log in again to delete your account.');
        }
        throw new Error("Could not delete your authentication profile. Please contact support if this issue persists.");
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
        return; // No change needed
    }
    try {
        await verifyBeforeUpdateEmail(user, newEmail);
    } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
            throw new Error('This is a sensitive operation. Please log out and log in again before changing your email.');
        }
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email address is already in use by another account.');
        }
        console.error("Error updating email:", error);
        throw new Error('Failed to start email update process. Please try again.');
    }
}
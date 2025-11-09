import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    deleteUser as deleteFirebaseAuthUser,
} from 'firebase/auth';
import {
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    runTransaction,
    writeBatch
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
 * Creates a user in Firebase Authentication and then creates their profile in Firestore.
 * This function handles the complete registration flow, including cleanup on failure.
 */
export async function registerUser(email: string, password?: string, displayName?: string, country?: string) {
    if (!password || !displayName || !country) {
        throw new Error("All fields are required for registration.");
    }

    // 1. Create the auth user first
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // 2. Now, attempt to create the Firestore profile with a retry mechanism
    try {
        await firebaseUser.getIdToken(true); // Force token refresh before the first attempt

        const MAX_RETRIES = 3;
        const RETRY_DELAY_MS = 1000;
        let lastError: any;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                // The transaction to create the user profile and lock the display name
                await completeRegistration({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email!,
                    displayName,
                    country,
                });
                lastError = null; // Success, clear last error
                return; // Exit function on success
            } catch (error: any) {
                lastError = error;
                const errorCode = error.code;
                const errorMessage = (error.message || '').toLowerCase();
                // Only retry on the specific race-condition errors
                if (errorCode === 'permission-denied' || errorCode === 'unauthenticated' || errorMessage.includes('permission')) {
                    console.warn(`Attempt ${attempt} to create profile failed due to permissions (${errorCode}). Retrying...`);
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                } else {
                    // Not a permission error, don't retry (e.g., name taken)
                    throw error;
                }
            }
        }
        if (lastError) {
            throw lastError; // All retries failed
        }
    } catch (error) {
        // 3. If profile creation fails for any reason, clean up the auth user
        console.error("Profile creation failed, cleaning up auth user...", error);
        try {
            await deleteFirebaseAuthUser(firebaseUser);
        } catch (deleteError) {
            console.error("Critical: Failed to clean up orphaned auth user.", deleteError);
        }
        // Rethrow the original profile creation error to be shown to the user
        throw error;
    }
}


/**
 * Creates the user profile and display name lock in Firestore in a transaction.
 * This is called from the App.tsx onAuthStateChanged listener once the new user is authenticated.
 */
export async function completeRegistration(params: CompleteRegistrationParams): Promise<User> {
    const { uid, displayName, email, country } = params;

    if (displayName.length < 3 || displayName.length > 15) {
        throw new Error("Display name must be between 3 and 15 characters.");
    }

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
            const displayNameRef = doc(db, "displayNames", displayName.toLowerCase());
            const userRef = doc(db, "users", uid);

            const displayNameDoc = await transaction.get(displayNameRef);
            if (displayNameDoc.exists()) {
                throw new Error("This display name is already taken.");
            }
            
            transaction.set(userRef, newUser);
            transaction.set(displayNameRef, { userId: uid });
        });
        return newUser;
    } catch (error) {
        // Rethrow specific errors to be handled by the caller in App.tsx
        if (error instanceof Error) {
            throw error; 
        }
        // Generic fallback error
        throw new Error("Failed to create user profile. Please try again.");
    }
}


interface LoginUserParams {
    email: string;
    password?: string;
}

export async function loginUser(params: LoginUserParams) {
    if (!params.password) {
        throw new Error("Password is required to log in.");
    }
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


export async function updateUserProfile(uid: string, data: Partial<User>, oldData: User): Promise<void> {
    const userRef = doc(db, "users", uid);

    // If display name is not changing, just do a simple update.
    if (!data.displayName || data.displayName.toLowerCase() === oldData.displayName.toLowerCase()) {
        await updateDoc(userRef, data);
        return;
    }

    // If display name IS changing, use a transaction to ensure uniqueness.
    await runTransaction(db, async (transaction) => {
        const newDisplayName = data.displayName as string;
        const oldDisplayNameRef = doc(db, 'displayNames', oldData.displayName.toLowerCase());
        const newDisplayNameRef = doc(db, 'displayNames', newDisplayName.toLowerCase());
        
        const newNameDoc = await transaction.get(newDisplayNameRef);
        if (newNameDoc.exists()) {
            throw new Error("This display name is already taken.");
        }

        transaction.update(userRef, data);
        transaction.set(newDisplayNameRef, { userId: uid });
        transaction.delete(oldDisplayNameRef);
    });
}


export async function deleteUserAccount(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No user is currently signed in.");
    }
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    const displayName = userDocSnap.exists() ? (userDocSnap.data() as User).displayName : null;

    // Use a batch write to delete user doc and display name lock
    const batch = writeBatch(db);
    batch.delete(userDocRef);

    if (displayName) {
        const displayNameRef = doc(db, 'displayNames', displayName.toLowerCase());
        batch.delete(displayNameRef);
    }
    
    await batch.commit();

    // Finally, delete Firebase Auth user. This may require recent sign-in.
    await deleteFirebaseAuthUser(user);
}
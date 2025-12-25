
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
import type { User, GameItem } from '../types';
import { MOCK_INVENTORY_ITEMS, MOCK_SHOP_ITEMS } from '../constants';

const LEGACY_ID_MAP: Record<string, string> = {
    // Rods
    'rod_01': 'rod_p330',
    // Reels
    'reel_01': 'reel_p3500',
    // Lines
    'line_01': 'line_m22',
    // Hooks
    'hook_01': 'hook_b16',
    // Feeders
    'feeder_01': 'fdr_c20',
    // Groundbaits
    'groundbait_01': 'gb_roach',
    'groundbait_02': 'gb_bream',
    'groundbait_03': 'gb_carassio',
    'groundbait_04': 'gb_fm',
    // Baits
    'bait_01': 'bt_mag',
    'bait_02': 'bt_pin',
    'bait_03': 'bt_wor',
    'bait_04': 'bt_cor',
    'bait_05': 'bt_hmp',
    // Additives
    'additive_01': 'ad_mol',
    // Accessories
    'accessory_01': 'acc_knfm',
};

/**
 * Migrates old item IDs to new format to prevent translation misses.
 * This runs every time a profile is loaded to clean up any stale data in the cloud.
 */
function migrateUserData(user: User): User {
    let needsUpdate = false;
    const migratedInventory = user.inventory.map(item => {
        if (LEGACY_ID_MAP[item.id]) {
            needsUpdate = true;
            // Find the replacement item details from shop to maintain current metadata
            const replacement = MOCK_SHOP_ITEMS.find(i => i.id === LEGACY_ID_MAP[item.id]);
            return replacement || { ...item, id: LEGACY_ID_MAP[item.id] };
        }
        return item;
    });

    if (needsUpdate) {
        const updatedUser = { ...user, inventory: migratedInventory };
        // Silently update Firestore so migration only happens once
        updateUserProfile(user.id, { inventory: migratedInventory }).catch(console.error);
        return updatedUser;
    }
    return user;
}

interface CompleteRegistrationParams {
    uid: string;
    displayName: string;
    email: string;
    country: string;
    language: string;
}

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

// Fix: Destructured params to correctly access email, password and rememberMe
export async function loginUser(params: LoginUserParams & { rememberMe: boolean }) {
    const { email, password, rememberMe } = params;
    if (!password) {
        throw new Error("Password is required to log in.");
    }
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistenceType);
    await signInWithEmailAndPassword(auth, email, password);
}

export async function getUserProfile(uid: string): Promise<User | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return migrateUserData(docSnap.data() as User);
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

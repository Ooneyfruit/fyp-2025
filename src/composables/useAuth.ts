/**
 * Authentication and profile synchronisation composable.
 * Logic: manages user sessions and ensures Google profile data is persisted to Firestore.
 */
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
  type UserCredential
} from 'firebase/auth';
import {
  collection,
  doc,
  type DocumentReference,
  type DocumentSnapshot,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  type Unsubscribe,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { markRaw, type Ref, ref } from 'vue';

import { useToast } from '@/composables/useToast';
import { type UserProfile, UserProfileSchema } from '@/features/users/userTypes';
import { auth, db } from '@/services/firebase';
import { type Nullable } from '@/types/generic';

/**
 * Interface for the authentication composable return value.
 */
export interface AuthInterface {
  user: Ref<Nullable<UserProfile>>;
  isAuthReady: Ref<boolean>;
  authMessage: Ref<string>;
  login: () => Promise<UserCredential>;
  logout: () => Promise<void>;
}

/**
 * The global user state ref.
 */
export const user = ref<Nullable<UserProfile>>(null);

/**
 * Indicates if the initial authentication check has completed.
 */
export const isAuthReady = ref(false);

/**
 * Provides context on the current authentication phase for the UI.
 */
const authMessage = ref('Checking authentication...');

const provider = new GoogleAuthProvider();

/**
 * Internal listener for Firestore profile updates.
 */
let profileListener: Unsubscribe | null = null;

/**
 * Synchronises and overwrites the database profile image with the Google OAuth icon.
 * Logic: triggers only if the Google URL is new, facilitating a slow migration to real icons.
 * @param uid - User ID.
 * @param googleUrl - The photo URL from the Google provider.
 * @param currentUrl - The existing URL in Firestore.
 */
const syncProfileImage = async (
  uid: string,
  googleUrl: Nullable<string>,
  currentUrl?: string
): Promise<void> => {
  if (googleUrl && googleUrl !== currentUrl) {
    const userRef = doc(db, 'users', uid);
    try {
      // Overwrite the field to capture the high-quality Google icon.
      await updateDoc(userRef, {
        profile_image: googleUrl,
        last_sync: new Date().toISOString()
      });
    } catch {
      // Silent failure for background synchronisation to prevent UI disruption.
      return;
    }
  }
};

/**
 * Fetches practice and membership details for the user.
 * @param uid - The user's unique identifier.
 * @param practiceRef - The reference to the practice document.
 * @returns An object containing membership data and the practice name.
 */
const fetchPracticeDetails = async (uid: string, practiceRef: DocumentReference) => {
  const membershipId = `${uid}_${practiceRef.id}`;

  // Concurrent fetch for membership roles and practice details.
  const [mSnap, pSnap] = await Promise.all([
    getDoc(doc(db, 'practice_users', membershipId)),
    getDoc(practiceRef)
  ]);

  const mData = mSnap.exists() ? mSnap.data() : null;
  const practiceName = pSnap.exists() ? pSnap.data().name : 'Unknown Practice';

  return { mData, practiceName };
};

/**
 * Attempts to migrate an existing user document based on email address matching.
 * Logic: Checks if the user's email (or a gmail/googlemail variant) already exists.
 * If found, migrates the user document and their practice_users memberships to the new UUID.
 *
 * @param firebaseUser - The authenticated Firebase user.
 * @returns True if a migration was performed, false otherwise.
 */
const migrateUserByEmail = async (firebaseUser: FirebaseUser): Promise<boolean> => {
  if (!firebaseUser.email) return false;

  const emailsToCheck = [firebaseUser.email];
  if (firebaseUser.email.endsWith('@gmail.com')) {
    emailsToCheck.push(firebaseUser.email.replace('@gmail.com', '@googlemail.com'));
  } else if (firebaseUser.email.endsWith('@googlemail.com')) {
    emailsToCheck.push(firebaseUser.email.replace('@googlemail.com', '@gmail.com'));
  }

  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', 'in', emailsToCheck));
  const querySnapshot = await getDocs(q);

  const oldUserDoc = querySnapshot.docs[0];
  if (!oldUserDoc) {
    return false;
  }

  authMessage.value = 'Migrating account...';
  const oldUserData = oldUserDoc.data();

  const batch = writeBatch(db);

  // 1. Create the new user document with the new UUID.
  const newUserRef = doc(db, 'users', firebaseUser.uid);
  batch.set(newUserRef, oldUserData);

  // 2. Delete the old user document.
  batch.delete(oldUserDoc.ref);

  // 3. Migrate practice_users interstitial documents.
  const practiceUsersRef = collection(db, 'practice_users');
  const puQuery = query(practiceUsersRef, where('user', '==', oldUserDoc.ref));
  const puSnapshot = await getDocs(puQuery);

  for (const puDoc of puSnapshot.docs) {
    const puData = puDoc.data();
    const practiceRef = puData.practice as DocumentReference | undefined;

    if (practiceRef) {
      const newPuId = `${firebaseUser.uid}_${practiceRef.id}`;
      const newPuRef = doc(db, 'practice_users', newPuId);

      batch.set(newPuRef, {
        ...puData,
        user: newUserRef
      });
      batch.delete(puDoc.ref);
    }
  }

  await batch.commit();

  return true;
};

/**
 * Finds and sets a fallback practice for a user if their current one is invalid.
 * @param userSnap - The user's document snapshot.
 * @returns True if a fallback was found and set, otherwise false.
 */
const findAndSetFallbackPractice = async (userSnap: DocumentSnapshot): Promise<boolean> => {
  const puQuery = query(collection(db, 'practice_users'), where('user', '==', userSnap.ref));
  const puSnap = await getDocs(puQuery);

  if (puSnap.empty) {
    return false;
  }

  const fallbackDoc = puSnap.docs[0];
  if (fallbackDoc) {
    const practiceRef = fallbackDoc.data().practice as DocumentReference;
    await updateDoc(userSnap.ref, { current_practice: practiceRef });
    return true;
  }

  return false;
};

/**
 * Processes a non-existent user document, attempting migration if possible.
 * @param firebaseUser - The authenticated Firebase user.
 */
const handleMissingUserDoc = async (firebaseUser: FirebaseUser): Promise<void> => {
  try {
    const migrated = await migrateUserByEmail(firebaseUser);
    if (migrated) return; // The onSnapshot listener will trigger again with the new document.
  } catch {
    // Silent failure for migration logic to prevent UI disruption.
  }
  user.value = null;
  isAuthReady.value = true;
};

/**
 * Resolves the active practice context for a user, handling missing memberships.
 * @param firebaseUser - The authenticated Firebase user.
 * @param userSnap - The user's document snapshot.
 * @param practiceRef - The user's currently assigned practice reference.
 * @returns The practice details, or null if awaiting a fallback update.
 */
const resolvePracticeContext = async (
  firebaseUser: FirebaseUser,
  userSnap: DocumentSnapshot,
  practiceRef?: DocumentReference
) => {
  if (practiceRef) {
    const details = await fetchPracticeDetails(firebaseUser.uid, practiceRef);
    if (details.mData) return details;
  }

  const hasFallback = await findAndSetFallbackPractice(userSnap);
  if (hasFallback) return null;

  useToast().error('Contact dwy235@student.bham.ac.uk to be added to a practice');
  throw new Error('No valid practice memberships found.');
};

/**
 * Handles the successful retrieval of a user snapshot.
 * Logic: validates the user profile and merges it with practice context data.
 * @param userSnap - The Firestore document snapshot.
 * @param firebaseUser - The authenticated Firebase user.
 */
const handleUserSnapshot = async (
  userSnap: DocumentSnapshot,
  firebaseUser: FirebaseUser
): Promise<void> => {
  if (!userSnap.exists()) {
    await handleMissingUserDoc(firebaseUser);
    return;
  }

  const userData = userSnap.data();

  // Update the profile image if the Google provider version has changed.
  await syncProfileImage(firebaseUser.uid, firebaseUser.photoURL, userData.profile_image);

  const practiceRef = userData.current_practice as DocumentReference | undefined;

  try {
    const context = await resolvePracticeContext(firebaseUser, userSnap, practiceRef);
    if (!context) return; // Awaiting fallback document update snapshot.

    // Merge context data into a single profile object.
    const mergedProfile = {
      uid: firebaseUser.uid,
      ...userData,
      ...context.mData,
      practiceRef: practiceRef,
      activePracticeName: context.practiceName
    };

    const parsedResult = UserProfileSchema.safeParse(mergedProfile);

    // Validate the merged profile and update the global user state.
    // Use markRaw to prevent Vue from proxying Firestore references.
    user.value = parsedResult.success
      ? markRaw(parsedResult.data)
      : markRaw(mergedProfile as UserProfile);
  } catch {
    // Fallback to basic profile if membership or practice data is inaccessible.
    const fallback = {
      uid: firebaseUser.uid,
      ...userData,
      is_administrator: false,
      activePracticeName: 'Error'
    } as UserProfile;

    user.value = markRaw(fallback);
  } finally {
    isAuthReady.value = true;
  }
};

/**
 * Handles errors occurring during the snapshot listener.
 * Logic: ensures the app does not hang by setting the auth ready state.
 */
const handleSnapshotError = (): void => {
  // Handle snapshot errors by marking auth as ready to unblock the UI.
  isAuthReady.value = true;
};

/**
 * Starts a real-time listener for the user profile and practice context.
 * Logic: maps Firestore document data and membership state to the global user ref.
 * @param firebaseUser - The authenticated Firebase user.
 */
const startProfileListener = (firebaseUser: FirebaseUser): void => {
  // Clean up any existing listeners before establishing a new connection.
  profileListener?.();

  const userRef = doc(db, 'users', firebaseUser.uid);

  profileListener = onSnapshot(
    userRef,
    (snap) => handleUserSnapshot(snap, firebaseUser),
    handleSnapshotError
  );
};

/**
 * Global authentication observer.
 * Logic: triggers the profile listener on login and performs clean-up on logout.
 */
onAuthStateChanged(auth, (firebaseUser) => {
  authMessage.value = 'Checking authentication...';

  if (firebaseUser) {
    startProfileListener(firebaseUser);
    return;
  }

  // Handle logout: terminate active profile listeners and reset user state.
  profileListener?.();
  user.value = null;
  isAuthReady.value = true;
});

/**
 * Exported authentication interface.
 * @returns The reactive auth state and session management methods.
 */
export function useAuth(): AuthInterface {
  return {
    user,
    isAuthReady,
    authMessage,
    // Triggers the Google OAuth popup flow.
    login: async () => await signInWithPopup(auth, provider),
    // Terminates the session and cleans up active listeners.
    logout: async () => {
      profileListener?.();
      await signOut(auth);
    }
  };
}

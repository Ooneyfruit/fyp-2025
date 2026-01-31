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
  doc,
  type DocumentReference,
  type DocumentSnapshot,
  getDoc,
  onSnapshot,
  type Unsubscribe,
  updateDoc
} from 'firebase/firestore';
import { markRaw, type Ref, ref } from 'vue';

import { type UserProfile, UserProfileSchema } from '@/features/users/userTypes';
import { auth, db } from '@/services/firebase';
import { type Nullable } from '@/types/generic';

/**
 * Interface for the authentication composable return value.
 */
export interface AuthInterface {
  user: Ref<Nullable<UserProfile>>;
  isAuthReady: Ref<boolean>;
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

  const mData = mSnap.exists() ? mSnap.data() : { is_administrator: false, role: 'Guest' };
  const practiceName = pSnap.exists() ? pSnap.data().name : 'Unknown Practice';

  return { mData, practiceName };
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
    user.value = null;
    isAuthReady.value = true;
    return;
  }

  const userData = userSnap.data();

  // Update the profile image if the Google provider version has changed.
  await syncProfileImage(firebaseUser.uid, firebaseUser.photoURL, userData.profile_image);

  const practiceRef = userData.current_practice as DocumentReference | undefined;

  try {
    if (!practiceRef) {
      throw new Error('No practice context assigned.');
    }

    const { mData, practiceName } = await fetchPracticeDetails(firebaseUser.uid, practiceRef);

    // Merge context data into a single profile object.
    const mergedProfile = {
      uid: firebaseUser.uid,
      ...userData,
      ...mData,
      practiceRef: practiceRef,
      activePracticeName: practiceName
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
    // Triggers the Google OAuth popup flow.
    login: () => signInWithPopup(auth, provider),
    // Terminates the session and cleans up active listeners.
    logout: async () => {
      profileListener?.();
      await signOut(auth);
    }
  };
}

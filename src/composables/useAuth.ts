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
  getDoc,
  onSnapshot,
  type Unsubscribe,
  updateDoc} from 'firebase/firestore';
import { type Ref,ref } from 'vue';

import { type UserProfile,UserProfileSchema } from '@/features/users/userTypes';
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
 * Starts a real-time listener for the user profile and practice context.
 * Logic: maps Firestore document data and membership state to the global user ref.
 * @param firebaseUser - The authenticated Firebase user.
 */
const startProfileListener = (firebaseUser: FirebaseUser): void => {
  // Clean up any existing listeners before establishing a new connection.
  if (profileListener) {
    profileListener();
  }

  const userRef = doc(db, 'users', firebaseUser.uid);

  profileListener = onSnapshot(
    userRef,
    async (userSnap) => {
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

        const membershipId = `${firebaseUser.uid}_${practiceRef.id}`;

        // Concurrent fetch for membership roles and practice details.
        const [mSnap, pSnap] = await Promise.all([
          getDoc(doc(db, 'practice_users', membershipId)),
          getDoc(practiceRef)
        ]);

        const mData = mSnap.exists() ? mSnap.data() : { is_administrator: false, role: 'Guest' };
        const practiceName = pSnap.exists() ? pSnap.data().name : 'Unknown Practice';

        // Merge and Validate using Zod
        // We construct the object first, then parse it to ensure it matches the UserProfile type safely.
        const mergedProfile = {
          uid: firebaseUser.uid,
          ...userData,
          ...mData,
          practiceRef: practiceRef,
          activePracticeName: practiceName
        };

        const parsedResult = UserProfileSchema.safeParse(mergedProfile);

        if (parsedResult.success) {
          user.value = parsedResult.data;
        } else {
          console.warn('User profile validation failed:', parsedResult.error);
          // Fallback: cast to UserProfile to prevent app lockout, but log warning
          user.value = mergedProfile as UserProfile;
        }
      } catch (error) {
        console.error('Error constructing user profile:', error);
        // Fallback to basic profile if membership or practice data is inaccessible.
        user.value = {
          uid: firebaseUser.uid,
          ...userData,
          is_administrator: false,
          activePracticeName: 'Error'
        } as UserProfile;
      } finally {
        isAuthReady.value = true;
      }
    },
    (error) => {
      console.error('Profile snapshot error:', error);
      // Handle snapshot errors by marking auth as ready to unblock the UI.
      isAuthReady.value = true;
    }
  );
};

/**
 * Global authentication observer.
 * Logic: triggers the profile listener on login and performs clean-up on logout.
 */
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    startProfileListener(firebaseUser);
  } else {
    if (profileListener) {
      profileListener();
    }
    user.value = null;
    isAuthReady.value = true;
  }
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
      if (profileListener) {
        profileListener();
      }
      await signOut(auth);
    }
  };
}
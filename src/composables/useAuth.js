/**
 * Authentication and profile synchronisation composable.
 * Logic: manages user sessions and ensures Google profile data is persisted to Firestore.
 */

import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref } from 'vue';

import { auth, db } from '@/services/firebase';

/**
 * The global user state ref.
 * @type {import('vue').Ref<any>}
 */
export const user = ref(null);

/**
 * Indicates if the initial authentication check has completed.
 */
export const isAuthReady = ref(false);

const provider = new GoogleAuthProvider();

/**
 * Internal listener for Firestore profile updates.
 * Typed explicitly to resolve 'any' inference errors during unsubscription.
 * @type {import('firebase/firestore').Unsubscribe | null}
 */
let profileListener = null;

/**
 * Synchronises and overwrites the database profile image with the Google OAuth icon.
 * Logic: triggers only if the Google URL is new, facilitating a slow migration to real icons.
 * @param {string} uid - User ID.
 * @param {string | null} googleUrl - The photo URL from the Google provider.
 * @param {string} currentUrl - The existing URL in Firestore.
 * @returns {Promise<void>} Resolves when the update is complete or skipped.
 */
const syncProfileImage = async (uid, googleUrl, currentUrl) => {
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
 * @param {import('firebase/auth').User} firebaseUser - The authenticated Firebase user.
 * @returns {void}
 */
const startProfileListener = (firebaseUser) => {
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
      syncProfileImage(firebaseUser.uid, firebaseUser.photoURL, userData.profile_image);

      const practiceRef = userData.current_practice;

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

        user.value = {
          uid: firebaseUser.uid,
          ...userData,
          ...mData,
          practiceRef: practiceRef,
          activePracticeName: practiceName
        };
      } catch {
        // Fallback to basic profile if membership or practice data is inaccessible.
        user.value = {
          uid: firebaseUser.uid,
          ...userData,
          is_administrator: false,
          activePracticeName: 'Error'
        };
      } finally {
        isAuthReady.value = true;
      }
    },
    () => {
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
 * @returns {object} The reactive auth state and session management methods.
 */
export function useAuth() {
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

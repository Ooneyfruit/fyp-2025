/**
 * Authentication and Profile Synchronization Composable.
 * Logic: handles user sessions and ensures Google profile images are synced to Firestore.
 */

import { ref } from 'vue';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';

export const user = ref(null);
export const isAuthReady = ref(false);
const provider = new GoogleAuthProvider();

let profileListener = null;

/**
 * Synchronizes and overwrites the database profile image with the Google OAuth icon.
 * Logic: triggers only if the Google URL is new, facilitating a slow migration to real icons.
 * @param {string} uid - User ID.
 * @param {string} googleUrl - The photo URL from the Google provider.
 * @param {string} currentUrl - The existing URL in Firestore.
 */
const syncProfileImage = async (uid, googleUrl, currentUrl) => {
  if (googleUrl && googleUrl !== currentUrl) {
    const userRef = doc(db, "users", uid);
    try {
      // Overwrite the field to capture the high-quality Google icon
      await updateDoc(userRef, { 
        profile_image: googleUrl,
        last_sync: new Date().toISOString()
      });
    } catch (e) {
      console.warn("[useAuth] Failed to update profile image:", e.message);
    }
  }
};

/**
 * Starts a real-time listener for the user profile and practice context.
 * @param {Object} firebaseUser - The authenticated Firebase user.
 */
const startProfileListener = (firebaseUser) => {
  if (profileListener) profileListener(); 

  const userRef = doc(db, "users", firebaseUser.uid);
  
  profileListener = onSnapshot(userRef, async (userSnap) => {
    if (!userSnap.exists()) {
      user.value = null;
      isAuthReady.value = true;
      return;
    }

    const userData = userSnap.data();
    
    // Attempt to sync the profile image from the auth provider
    syncProfileImage(firebaseUser.uid, firebaseUser.photoURL, userData.profile_image);

    const practiceRef = userData.current_practice;

    try {
      if (!practiceRef) throw new Error("No practice context assigned.");

      const membershipId = `${firebaseUser.uid}_${practiceRef.id}`;
      
      // Concurrent fetch for membership and practice details
      const [mSnap, pSnap] = await Promise.all([
        getDoc(doc(db, "practice_users", membershipId)),
        getDoc(practiceRef)
      ]);

      const mData = mSnap.exists() ? mSnap.data() : { is_administrator: false, role: 'Guest' };
      const practiceName = pSnap.exists() ? pSnap.data().name : "Unknown Practice";

      user.value = {
        uid: firebaseUser.uid,
        ...userData,
        ...mData, 
        practiceRef: practiceRef,
        activePracticeName: practiceName 
      };
      
    } catch (e) {
      console.error("[useAuth] Context Update Failed:", e.message);
      user.value = { uid: firebaseUser.uid, ...userData, is_administrator: false, activePracticeName: 'Error' };
    } finally {
      isAuthReady.value = true;
    }
  }, (error) => {
    console.error("[useAuth] Listener Error:", error.message);
    isAuthReady.value = true;
  });
};

/**
 * Global authentication observer.
 */
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    startProfileListener(firebaseUser);
  } else {
    if (profileListener) profileListener();
    user.value = null;
    isAuthReady.value = true;
  }
});

/**
 * Exported auth interface.
 */
export function useAuth() {
  return { 
    user, 
    isAuthReady, 
    login: () => signInWithPopup(auth, provider),
    logout: async () => { 
      if (profileListener) profileListener();
      await signOut(auth); 
    }
  };
}
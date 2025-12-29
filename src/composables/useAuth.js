import { ref } from 'vue';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';

export const user = ref(null);
export const isAuthReady = ref(false);
const provider = new GoogleAuthProvider();

let profileListener = null;

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
    const practiceRef = userData.current_practice;

    try {
      if (!practiceRef) throw new Error("No practice context assigned.");

      const membershipId = `${firebaseUser.uid}_${practiceRef.id}`;
      // Fetch membership and practice metadata in parallel
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
        activePracticeName: practiceName // Contextual name for toasts
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

onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    startProfileListener(firebaseUser);
  } else {
    if (profileListener) profileListener();
    user.value = null;
    isAuthReady.value = true;
  }
});

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
import { ref } from 'vue';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';

export const user = ref(null);
export const isAuthReady = ref(false);
const provider = new GoogleAuthProvider();

let profileListener = null;

const startProfileListener = (firebaseUser) => {
  if (profileListener) profileListener(); // Clean up existing listener

  const userRef = doc(db, "users", firebaseUser.uid);
  
  // The error callback (second argument) prevents the infinite retry loop
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

      // Fetch membership for the current practice context
      const membershipId = `${firebaseUser.uid}_${practiceRef.id}`;
      const mSnap = await getDoc(doc(db, "practice_users", membershipId));
      const mData = mSnap.exists() ? mSnap.data() : { is_administrator: false, role: 'Guest' };

      user.value = {
        uid: firebaseUser.uid,
        ...userData,
        ...mData, // Permissions for the active practice
        practiceRef: practiceRef 
      };
      
      console.log(`Context Updated: ${user.value.name} | Active Practice: ${practiceRef.id}`);
    } catch (e) {
      console.error("Context Switch Failed:", e.message);
      // Fallback: set basic info even if practice-specific fetch fails
      user.value = { uid: firebaseUser.uid, ...userData, is_administrator: false };
    } finally {
      isAuthReady.value = true;
    }
  }, (error) => {
    // This stops the browser from looping on a permission error
    console.error("Firestore Listener Error:", error.message);
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
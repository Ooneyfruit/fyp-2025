import { ref } from 'vue';
import { auth, provider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const user = ref(null);
export const isAuthReady = ref(false);

const fetchUserProfile = async (firebaseUser) => {
  if (!firebaseUser) {
    user.value = null;
    return;
  }
  
  try {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    if (userDoc.exists()) {
      user.value = { ...firebaseUser, ...userDoc.data() };
    } else {
      user.value = firebaseUser;
    }
  } catch (e) {
    console.error("Error fetching user profile:", e);
    user.value = firebaseUser;
  }
};

onAuthStateChanged(auth, async (u) => {
  await fetchUserProfile(u);
  isAuthReady.value = true;
});

export function useAuth() {
  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    user.value = null;
  };

  return { user, isAuthReady, login, logout };
}
import { ref } from 'vue';
import { auth, provider } from '../firebase';
// CHANGE: Revert to signInWithPopup
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const user = ref(null);
const isAuthReady = ref(false);

onAuthStateChanged(auth, (u) => {
  user.value = u;
  isAuthReady.value = true;
});

export function useAuth() {
  const login = async () => {
    try {
      // CHANGE: Use Popup. It handles HTTP dev environments better.
      await signInWithPopup(auth, provider);
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    user.value = null;
  };

  return { 
    user, 
    isAuthReady, 
    login, 
    logout 
  };
}
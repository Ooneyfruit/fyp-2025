import { ref } from 'vue';
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// Global state (defined outside function to share state across components)
const user = ref(null);
const isAuthReady = ref(false);

// Initialize listener immediately
onAuthStateChanged(auth, (u) => {
  user.value = u;
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

  return { 
    user, 
    isAuthReady, 
    login, 
    logout 
  };
}
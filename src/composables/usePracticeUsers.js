import { ref, watch, onUnmounted } from 'vue';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import { user, isAuthReady } from './useAuth';

export function usePracticeUsers() {
  const users = ref([]);
  const loading = ref(true);
  let unsubscribe = null;

  const startSync = (practiceRef) => {
    loading.value = true;
    const q = query(collection(db, "practice_users"), where("practice", "==", practiceRef));
    
    unsubscribe = onSnapshot(q, async (snap) => {
      const promises = snap.docs.map(async (d) => {
        const intersect = d.data();
        const profileSnap = await getDoc(intersect.user);
        return { 
          id: d.id, 
          ...intersect, 
          profile: profileSnap.exists() ? profileSnap.data() : {} 
        };
      });
      users.value = await Promise.all(promises);
      loading.value = false;
    });
  };

  watch([isAuthReady, user], ([ready, u]) => {
    if (ready && u?.practiceRef) {
      startSync(u.practiceRef);
    }
  }, { immediate: true });

  onUnmounted(() => unsubscribe?.());

  return { users, loading };
}
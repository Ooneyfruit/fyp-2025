import { ref, watch, onUnmounted, computed } from 'vue';
import { db } from '../../../services/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { user as authUser } from '../../../composables/useAuth';

export function usePracticeUsers() {
  const memberships = ref([]); // Raw membership documents
  const profileStore = ref({}); // Reactive Map: UID -> Profile Data
  const isLoading = ref(true);
  
  let listListener = null;
  const profileListeners = new Map(); // UID -> Unsubscribe

  const startLiveSync = (practiceId) => {
    if (listListener) listListener();
    
    const practiceRef = doc(db, "practices", practiceId);
    const bridgeCol = collection(db, "practice_users");

    // DATA PROTECTION: 
    // If user is admin, fetch all users in the practice.
    // If not admin, fetch only their own record.
    let q;
    if (authUser.value?.is_administrator) {
      console.log("[usePracticeUsers] Admin Sync: Fetching all practice members.");
      q = query(bridgeCol, where("practice", "==", practiceRef));
    } else {
      console.log("[usePracticeUsers] User Sync: Restricted to self.");
      const userRef = doc(db, "users", authUser.value.uid);
      q = query(
        bridgeCol, 
        where("practice", "==", practiceRef),
        where("user", "==", userRef)
      );
    }

    listListener = onSnapshot(q, (snapshot) => {
      const snapshotUids = new Set();
      memberships.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      snapshot.docs.forEach((mDoc) => {
        const uid = mDoc.data().user.id;
        snapshotUids.add(uid);

        if (!profileListeners.has(uid)) {
          const unsub = onSnapshot(mDoc.data().user, (pSnap) => {
            if (pSnap.exists()) {
              profileStore.value[uid] = pSnap.data();
            }
          }, (err) => console.error(`[usePracticeUsers] Profile Error (${uid}):`, err.message));
          
          profileListeners.set(uid, unsub);
        }
      });

      // Cleanup listeners for users no longer in the result set
      profileListeners.forEach((unsub, uid) => {
        if (!snapshotUids.has(uid)) {
          unsub();
          profileListeners.delete(uid);
          delete profileStore.value[uid];
        }
      });

      isLoading.value = false;
    }, (err) => {
      console.error("[usePracticeUsers] Sync Error:", err.message);
      isLoading.value = false;
    });
  };

  const users = computed(() => {
    return memberships.value.map(m => ({
      ...m,
      profile: profileStore.value[m.user.id] || { name: 'Joining...' }
    })).sort((a, b) => (a.profile?.name || "").localeCompare(b.profile?.name || ""));
  });

  const cleanup = () => {
    if (listListener) listListener();
    profileListeners.forEach(u => u());
    profileListeners.clear();
  };

  onUnmounted(cleanup);

  // Watch for changes in either the Practice ID OR the Admin status
  watch(() => [authUser.value?.practiceRef?.id, authUser.value?.is_administrator], ([newId, isAdmin]) => {
    if (newId) {
      startLiveSync(newId);
    } else {
      memberships.value = [];
      cleanup();
    }
  }, { immediate: true });

  return { users, isLoading };
}
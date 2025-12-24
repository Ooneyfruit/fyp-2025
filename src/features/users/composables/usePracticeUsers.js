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
    console.log(`%c[usePracticeUsers] 🧪 HYPER-LOG: Starting Sync for ${practiceId}`, "color: cyan; font-weight: bold");
    
    if (listListener) listListener();
    
    const q = query(
      collection(db, "practice_users"),
      where("practice", "==", doc(db, "practices", practiceId))
    );

    listListener = onSnapshot(q, (snapshot) => {
      console.log(`[usePracticeUsers] 📥 Membership List Update: ${snapshot.docs.length} docs`);
      
      const snapshotUids = new Set();
      memberships.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      snapshot.docs.forEach((mDoc) => {
        const uid = mDoc.data().user.id;
        snapshotUids.add(uid);

        // ATTACH NESTED LISTENER: If we aren't already watching this specific user
        if (!profileListeners.has(uid)) {
          console.log(`[usePracticeUsers] 🛰️ Spawning Profile Listener: users/${uid}`);
          const unsub = onSnapshot(mDoc.data().user, (pSnap) => {
            if (pSnap.exists()) {
              console.log(`%c[usePracticeUsers] ✨ LIVE UPDATE: ${pSnap.data().name}`, "color: #ff00ff");
              profileStore.value[uid] = pSnap.data();
            }
          }, (err) => console.error(`[usePracticeUsers] ❌ Profile Error (${uid}):`, err.message));
          
          profileListeners.set(uid, unsub);
        }
      });

      // CLEANUP: If a user is removed from the practice, stop listening to their profile
      profileListeners.forEach((unsub, uid) => {
        if (!snapshotUids.has(uid)) {
          console.log(`[usePracticeUsers] ✂️ Removing Listener for user/${uid}`);
          unsub();
          profileListeners.delete(uid);
          delete profileStore.value[uid];
        }
      });

      isLoading.value = false;
    });
  };

  // THE REACTIVE JOIN: This re-runs whenever memberships OR profileStore changes
  const users = computed(() => {
    console.log("[usePracticeUsers] 🔄 Computed Join re-calculating...");
    return memberships.value.map(m => ({
      ...m,
      profile: profileStore.value[m.user.id] || { name: 'Joining...' }
    })).sort((a, b) => (a.profile?.name || "").localeCompare(b.profile?.name || ""));
  });

  const cleanup = () => {
    if (listListener) listListener();
    profileListeners.forEach(u => u());
    profileListeners.clear();
    console.log("[usePracticeUsers] 🧹 All Listeners Destroyed.");
  };

  onUnmounted(cleanup);

  watch(() => authUser.value?.practiceRef?.id, (newId) => {
    if (newId) startLiveSync(newId);
    else { memberships.value = []; cleanup(); }
  }, { immediate: true });

  return { users, isLoading };
}
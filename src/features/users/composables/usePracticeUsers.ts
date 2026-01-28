/* src/features/users/composables/usePracticeUsers.js */
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { computed, onUnmounted, ref, watch } from 'vue';

import { user as authUser } from '@/composables/useAuth';
import { db } from '@/services/firebase';

/**
 * Global cache management for user profiles.
 * Moving these outside the function body ensures data persists across practice switches.
 */
const globalProfileStore = ref({});
const profileListeners = new Map(); // UID -> { unsub: Function, count: number }

/**
 *
 */
export function usePracticeUsers() {
  const memberships = ref([]);
  const isLoading = ref(true);
  let listListener = null;

  /**
   * Increments the reference count and initializes a profile listener if needed.
   * @param userRef - the Firestore reference to the user document.
   */
  const attachProfileListener = (userRef) => {
    const uid = userRef.id;
    const existing = profileListeners.get(uid);

    if (existing) {
      // Logic: increase the reference count to prevent cleanup while this instance is active.
      existing.count++;
      return;
    }

    // Logic: establish a new real-time listener for the profile data.
    const unsub = onSnapshot(
      userRef,
      (pSnap) => {
        if (pSnap.exists()) {
          globalProfileStore.value[uid] = pSnap.data();
        }
      },
      (err) => console.error(`[usePracticeUsers] Profile Error (${uid}):`, err.message)
    );

    profileListeners.set(uid, { unsub, count: 1 });
  };

  /**
   * Decrements the reference count and destroys the listener if no longer required.
   * @param uid - the unique identifier for the user profile.
   */
  const detachProfileListener = (uid) => {
    const active = profileListeners.get(uid);
    if (!active) return;

    active.count--;

    if (active.count <= 0) {
      // Logic: kill the listener and remove data from memory when reference count reaches zero.
      active.unsub();
      profileListeners.delete(uid);
      delete globalProfileStore.value[uid];
    }
  };

  /**
   * Initiates real-time synchronization for practice memberships.
   * @param practiceId - the id of the practice to monitor.
   */
  const startLiveSync = (practiceId) => {
    if (listListener) listListener();

    const practiceRef = doc(db, 'practices', practiceId);
    const bridgeCol = collection(db, 'practice_users');

    // Logic: restrict data access based on the current user's administrative status.
    let q;
    if (authUser.value?.is_administrator) {
      q = query(bridgeCol, where('practice', '==', practiceRef));
    } else {
      const userRef = doc(db, 'users', authUser.value.uid);
      q = query(bridgeCol, where('practice', '==', practiceRef), where('user', '==', userRef));
    }

    listListener = onSnapshot(
      q,
      (snapshot) => {
        const newUids = new Set(snapshot.docs.map((d) => d.data().user.id));
        const oldUids = new Set(memberships.value.map((m) => m.user.id));

        // Performance: attach listeners for new users entering the set.
        for (const mDoc of snapshot.docs) {
          const userRef = mDoc.data().user;
          if (!oldUids.has(userRef.id)) {
            attachProfileListener(userRef);
          }
        }

        // Performance: detach listeners for users no longer present in the results.
        for (const uid of oldUids) {
          if (!newUids.has(uid)) {
            detachProfileListener(uid);
          }
        }

        memberships.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        isLoading.value = false;
      },
      (err) => {
        console.error('[usePracticeUsers] Sync Error:', err.message);
        isLoading.value = false;
      }
    );
  };

  /**
   * Aggregates membership data with profile information.
   * Logic: explicitly includes the document ID in the profile object for avatar detection.
   */
  const users = computed(() => {
    return memberships.value
      .map((m) => ({
        ...m,
        profile: {
          id: m.user.id,
          ...(globalProfileStore.value[m.user.id] || { name: 'Loading...' })
        }
      }))
      .sort((a, b) => (a.profile?.name || '').localeCompare(b.profile?.name || ''));
  });

  /**
   * Cleans up all active listeners associated with this instance.
   */
  const cleanup = () => {
    if (listListener) listListener();
    // Logic: ensure all profiles attached by this instance are detached correctly.
    for (const m of memberships.value) detachProfileListener(m.user.id);
    memberships.value = [];
  };

  onUnmounted(cleanup);

  // Synchronize the membership list whenever the active practice context or permissions change.
  watch(
    () => [authUser.value?.practiceRef?.id, authUser.value?.is_administrator],
    ([newId]) => {
      if (newId) {
        startLiveSync(newId);
      } else {
        cleanup();
      }
    },
    { immediate: true }
  );

  return { users, isLoading };
}

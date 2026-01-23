/**
 * Manages real-time synchronisation of practice users and efficient profile caching.
 * Handles membership lists and associated profile data with reference counting.
 */
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { computed, onUnmounted, ref, watch } from 'vue';

import { user as authUser } from '../../../composables/useAuth';
import { db } from '../../../services/firebase';

/**
 * Global cache management for user profiles.
 * Moving these outside the function body ensures data persists across practice switches.
 */
const globalProfileStore = ref({});

/**
 * Maps user IDs to their active listeners and reference counts.
 * Ensures we only have one active listener per user, regardless of how many components ask for it.
 * @type {Map<string, { unsubscribe: Function, count: number }>}
 */
const profileListeners = new Map();

/**
 * Composable for managing practice user memberships and profiles.
 * Handles real-time synchronisation of practice users and efficient profile caching.
 * @returns {object} The users list and loading state.
 */
export function usePracticeUsers() {
  const memberships = ref([]);
  const isLoading = ref(true);

  /**
   * Listener for the main membership list.
   * @type {Function|null}
   */
  let listListener = null;

  /**
   * Increments the reference count and initialises a profile listener if needed.
   * @param {object} userRef - The Firestore reference to the user document.
   */
  const attachProfileListener = (userRef) => {
    const uid = userRef.id;
    const existing = profileListeners.get(uid);

    // Increase the reference count to prevent cleanup while this instance is active.
    if (existing) {
      existing.count++;
      return;
    }

    // Establish a new real-time listener for the profile data.
    const unsubscribe = onSnapshot(
      userRef,
      (pSnap) => {
        // Update the global store whenever the user profile document changes.
        if (pSnap.exists()) {
          globalProfileStore.value[uid] = pSnap.data();
        }
      },
      (err) => console.error(`[usePracticeUsers] Profile Error (${uid}):`, err.message)
    );

    // Track the new listener and initialise its reference count.
    profileListeners.set(uid, { unsubscribe, count: 1 });
  };

  /**
   * Decrements the reference count and destroys the listener if no longer required.
   * @param {string} uid - The unique identifier for the user profile.
   */
  const detachProfileListener = (uid) => {
    const active = profileListeners.get(uid);
    if (!active) return;

    active.count--;

    // Kill the listener and remove data from memory when the reference count reaches zero.
    if (active.count <= 0) {
      active.unsubscribe();
      profileListeners.delete(uid);
      delete globalProfileStore.value[uid];
    }
  };

  /**
   * Initiates real-time synchronisation for practice memberships.
   * @param {string} practiceId - The id of the practice to monitor.
   */
  const startLiveSync = (practiceId) => {
    // Ensure any existing list listener is terminated before starting a new one.
    if (listListener) listListener();

    const practiceRef = doc(db, 'practices', practiceId);
    const bridgeCol = collection(db, 'practice_users');

    // Restrict data access based on the current user's administrative status.
    let q;
    if (authUser.value?.is_administrator) {
      q = query(bridgeCol, where('practice', '==', practiceRef));
    } else {
      const userRef = doc(db, 'users', authUser.value.uid);
      q = query(bridgeCol, where('practice', '==', practiceRef), where('user', '==', userRef));
    }

    // Listen for changes in the membership bridge collection.
    listListener = onSnapshot(
      q,
      (snapshot) => {
        const newUids = new Set(snapshot.docs.map((d) => d.data().user.id));
        const oldUids = new Set(memberships.value.map((m) => m.user.id));

        // Attach listeners for new users entering the membership set.
        for (const mDoc of snapshot.docs) {
          const userRef = mDoc.data().user;
          if (!oldUids.has(userRef.id)) {
            attachProfileListener(userRef);
          }
        }

        // Detach listeners for users no longer present in the membership results.
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
   * Includes the document ID in the profile object for avatar detection logic.
   */
  const users = computed(() => {
    return memberships.value
      .map((m) => ({
        ...m,
        profile: {
          id: m.user.id,
          // Merge real-time profile data or provide a fallback during initial load.
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
    // Ensure all individual profile listeners attached by this instance are detached correctly.
    for (const m of memberships.value) detachProfileListener(m.user.id);
    memberships.value = [];
  };

  onUnmounted(cleanup);

  // Synchronise the membership list whenever the active practice context or permissions change.
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

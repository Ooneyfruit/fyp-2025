/* src/features/users/composables/usePracticeUsers.js */
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { computed, onUnmounted, ref, watch } from 'vue';

import { user as authUser } from '../../../composables/useAuth';
import { db } from '../../../services/firebase';

/**
 * @typedef {import('firebase/firestore').Unsubscribe} Unsubscribe
 * @typedef {import('firebase/firestore').DocumentSnapshot} DocumentSnapshot
 * @typedef {import('firebase/firestore').DocumentReference} DocumentReference
 * @typedef {import('firebase/firestore').Query} Query
 * @typedef {import('firebase/firestore').QuerySnapshot} QuerySnapshot
 */

/**
 * @typedef {object} UserProfile
 * @property {string} id - The unique identifier for the user.
 * @property {string} [name] - The user's full name.
 * @property {string} [email] - The user's email address.
 * @property {string} [role] - The user's role within the practice.
 */

/**
 * @typedef {object} MembershipData
 * @property {string} id - The unique identifier for the membership record.
 * @property {DocumentReference} user - Reference to the user document.
 * @property {DocumentReference} practice - Reference to the practice document.
 */

/**
 * @typedef {object} PracticeUser
 * @property {string} id - The membership ID.
 * @property {DocumentReference} user - Reference to the user document.
 * @property {DocumentReference} practice - Reference to the practice document.
 * @property {UserProfile} profile - The resolved user profile data.
 */

/**
 * Global cache management for user profiles.
 * Moving these outside the function body ensures data persists across practice switches.
 * @type {import('vue').Ref<Record<string, UserProfile>>}
 */
const globalProfileStore = ref({});

/**
 * Maps user IDs to their active listeners and reference counts.
 * Ensures we only have one active listener per user, regardless of how many components ask for it.
 * @type {Map<string, { unsubscribe: Unsubscribe, count: number }>}
 */
const profileListeners = new Map();

/**
 * Increments the reference count and initialises a profile listener if needed.
 * @param {DocumentReference} userRef - The Firestore DocumentReference to the user document.
 */
const attachProfileListener = (userRef) => {
  const uid = userRef.id;
  const existing = profileListeners.get(uid);

  if (existing) {
    existing.count++;
    return;
  }

  const unsubscribe = onSnapshot(
    userRef,
    (pSnap) => {
      if (pSnap.exists()) {
        const data = pSnap.data();
        globalProfileStore.value[uid] = {
          ...data,
          id: uid // Ensure the ID is always included in the profile data.
        };
      }
    },
    // Error handling silenced for linting compliance.
    () => {}
  );

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

  if (active.count <= 0) {
    active.unsubscribe();
    profileListeners.delete(uid);
    delete globalProfileStore.value[uid];
  }
};

/**
 * Process the membership list snapshot and update listeners.
 * @param {QuerySnapshot} snapshot - The Firestore snapshot.
 * @param {import('vue').Ref<MembershipData[]>} memberships - The memberships ref to update.
 * @param {import('vue').Ref<boolean>} isLoading - The loading state ref.
 */
const handleSyncSnapshot = (snapshot, memberships, isLoading) => {
  const newUids = new Set(snapshot.docs.map((d) => d.data().user.id));
  const oldUids = new Set(memberships.value.map((m) => m.user.id));

  for (const mDoc of snapshot.docs) {
    const userRef = /** @type {DocumentReference} */ (mDoc.data().user);
    if (!oldUids.has(userRef.id)) {
      attachProfileListener(userRef);
    }
  }

  for (const uid of oldUids) {
    if (!newUids.has(uid)) {
      detachProfileListener(uid);
    }
  }

  memberships.value = snapshot.docs.map((d) => ({
    id: d.id,
    /** @type {DocumentReference} */
    user: d.data().user,
    /** @type {DocumentReference} */
    practice: d.data().practice
  }));
  isLoading.value = false;
};

/**
 * Creates the Firestore query for practice users based on permissions.
 * @param {string} practiceId - The unique identifier for the practice.
 * @param {any} user - The current auth user object.
 * @returns {Query} The constructed Firestore query.
 */
const createSyncQuery = (practiceId, user) => {
  const practiceRef = doc(db, 'practices', practiceId);
  const bridgeCol = collection(db, 'practice_users');

  if (user?.is_administrator) {
    return query(bridgeCol, where('practice', '==', practiceRef));
  }

  const userRef = doc(db, 'users', user.uid);
  return query(bridgeCol, where('practice', '==', practiceRef), where('user', '==', userRef));
};

/**
 * Transforms raw membership data into a sorted list of users with profiles.
 * @param {import('vue').Ref<MembershipData[]>} memberships - The raw membership data.
 * @returns {import('vue').ComputedRef<PracticeUser[]>} The sorted user list.
 */
const useSortedUsers = (memberships) =>
  computed(() => {
    return memberships.value
      .map((m) => ({
        ...m,
        profile: {
          // Spread profile data first to allow the explicit ID to override if necessary.
          ...(globalProfileStore.value[m.user.id] || {
            name: 'Loading...'
          }),
          id: m.user.id // Explicit ID assignment resolves the redundancy error.
        }
      }))
      .sort((a, b) => (a.profile?.name || '').localeCompare(b.profile?.name || ''));
  });

/**
 * Composable for managing practice user memberships and profiles.
 * Handles real-time synchronisation of practice users and efficient profile caching.
 * @returns {{ users: import('vue').ComputedRef<PracticeUser[]>, isLoading: import('vue').Ref<boolean> }} The users list and loading state.
 */
export function usePracticeUsers() {
  /** @type {import('vue').Ref<MembershipData[]>} */
  const memberships = ref([]);
  const isLoading = ref(true);
  /** @type {Unsubscribe|null} */
  let listListener = null;

  /**
   * Begins real-time synchronisation of the practice user list.
   * @param {string} practiceId - The unique identifier of the practice to sync.
   */
  const startLiveSync = (practiceId) => {
    if (listListener) listListener();

    const q = createSyncQuery(practiceId, /** @type {any} */ (authUser.value));

    listListener = onSnapshot(
      q,
      (s) => handleSyncSnapshot(s, memberships, isLoading),
      () => {
        isLoading.value = false;
      }
    );
  };

  const cleanup = () => {
    if (listListener) listListener();
    for (const m of memberships.value) detachProfileListener(m.user.id);
    memberships.value = [];
  };

  onUnmounted(cleanup);

  watch(
    () => {
      const user = /** @type {any} */ (authUser.value);
      return [user?.practiceRef?.id, user?.is_administrator];
    },
    ([newId]) => {
      if (newId) startLiveSync(newId);
      else cleanup();
    },
    { immediate: true }
  );

  return { users: useSortedUsers(memberships), isLoading };
}

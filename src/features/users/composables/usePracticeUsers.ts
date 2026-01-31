/**
 * Global cache management for user profiles.
 * Moving these outside the function body ensures data persists across practice switches.
 */
import {
  collection,
  doc,
  type DocumentReference,
  type DocumentSnapshot,
  type FirestoreError,
  onSnapshot,
  type Query,
  query,
  type QuerySnapshot,
  type Unsubscribe,
  where
} from 'firebase/firestore';
import { computed, markRaw, onUnmounted, ref, watch } from 'vue';

import { user as authUser } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import {
  type PracticeMembership,
  type PracticeUser,
  type UserProfile
} from '@/features/users/userTypes';
import { db } from '@/services/firebase';

// Define the shape of the global profile store
type ProfileStore = Record<string, UserProfile | undefined>;

const globalProfileStore = ref<ProfileStore>({});
const profileListeners = new Map<string, { unsub: Unsubscribe; count: number }>();

/**
 * A fallback profile object that satisfies the UserProfile interface.
 * Used when data is still loading to prevent TypeScript union errors.
 */
const LOADING_PROFILE: UserProfile = {
  uid: '',
  email: '',
  activePracticeName: '',
  is_administrator: false,
  name: 'Loading...',
  role: 'Unknown'
};

/**
 * Increments the reference count and initializes a profile listener if needed.
 * @param userRef - The Firestore reference to the user document.
 */
const attachProfileListener = (userRef: DocumentReference) => {
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
    (pSnap: DocumentSnapshot) => {
      if (pSnap.exists()) {
        // Use markRaw to prevent Proxying of Firestore objects (DataCloneError Fix)
        globalProfileStore.value[uid] = markRaw(pSnap.data() as UserProfile);
      }
    },
    (err: FirestoreError) => useToast().error(`Profile Error (${uid}): ${err.message}`)
  );

  profileListeners.set(uid, { unsub, count: 1 });
};

/**
 * Decrements the reference count and destroys the listener if no longer required.
 * @param uid - The unique identifier for the user profile.
 */
const detachProfileListener = (uid: string) => {
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
 * Generates the appropriate Firestore query based on user permissions.
 * @param practiceId - The ID of the practice to query.
 * @param currentUser - The currently authenticated user.
 * @returns The query object or null if criteria aren't met.
 */
const getPracticeQuery = (practiceId: string, currentUser: UserProfile | null): Query | null => {
  const practiceRef = doc(db, 'practices', practiceId);
  const bridgeCol = collection(db, 'practice_users');

  if (currentUser?.is_administrator) {
    return query(bridgeCol, where('practice', '==', practiceRef));
  }

  if (currentUser) {
    const userRef = doc(db, 'users', currentUser.uid);
    return query(bridgeCol, where('practice', '==', practiceRef), where('user', '==', userRef));
  }

  return null;
};

/**
 * Synchronizes listener attachments based on the new snapshot data.
 * @param snapshot - The latest query snapshot from Firestore.
 * @param currentMemberships - The current list of loaded memberships.
 * @returns The mapped list of membership objects.
 */
const processSnapshotUpdates = (
  snapshot: QuerySnapshot,
  currentMemberships: PracticeMembership[]
): PracticeMembership[] => {
  const newUids = new Set(snapshot.docs.map((d) => (d.data().user as DocumentReference).id));
  const oldUids = new Set(currentMemberships.map((m) => m.user.id));

  // Performance: attach listeners for new users entering the set.
  for (const mDoc of snapshot.docs) {
    const userRef = mDoc.data().user as DocumentReference;
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

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as PracticeMembership);
};

/**
 * Transforms raw membership data into a sorted list with profile details.
 * @param list - The list of raw practice memberships.
 * @returns The enriched and sorted user list.
 */
const resolveUserList = (list: PracticeMembership[]): PracticeUser[] => {
  return list
    .map((m) => {
      // Use the strongly typed LOADING_PROFILE fallback
      const profileData = globalProfileStore.value[m.user.id] || LOADING_PROFILE;
      return {
        ...m,
        profile: {
          id: m.user.id,
          ...profileData
        }
      };
    })
    .sort((a, b) => {
      const nameA = a.profile.name || '';
      const nameB = b.profile.name || '';
      return nameA.localeCompare(nameB);
    });
};

/**
 * Composable for managing the list of users within a practice.
 */
export function usePracticeUsers() {
  const memberships = ref<PracticeMembership[]>([]);
  const isLoading = ref(true);
  let listListener: Unsubscribe | null = null;
  const { error } = useToast();

  /**
   * Cleans up all active listeners associated with this instance.
   */
  const stopSync = () => {
    if (listListener) listListener();
    for (const m of memberships.value) detachProfileListener(m.user.id);
    memberships.value = [];
  };

  /**
   * Initiates real-time synchronization for practice memberships.
   * @param practiceId - The id of the practice to monitor.
   */
  const startSync = (practiceId: string) => {
    if (listListener) listListener();
    const q = getPracticeQuery(practiceId, authUser.value);

    if (!q) {
      isLoading.value = false;
      return;
    }

    listListener = onSnapshot(
      q,
      (snapshot) => {
        memberships.value = processSnapshotUpdates(snapshot, memberships.value);
        isLoading.value = false;
      },
      (err) => {
        error(`Sync Error: ${err.message}`);
        isLoading.value = false;
      }
    );
  };

  onUnmounted(stopSync);

  // Synchronize the membership list whenever the active practice context or permissions change.
  watch(
    () => [authUser.value?.practiceRef?.id, authUser.value?.is_administrator],
    ([newId]) => {
      if (newId && typeof newId === 'string') startSync(newId);
      else stopSync();
    },
    { immediate: true }
  );

  return {
    users: computed(() => resolveUserList(memberships.value)),
    isLoading
  };
}

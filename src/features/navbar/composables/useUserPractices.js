/**
 * Manages the list of practices associated with the current user.
 * Intended for use in the Navigation bar to allow context switching.
 */
import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { onUnmounted, ref, watch } from 'vue';

import { user as authUser } from '@/composables/useAuth';
import { db } from '@/services/firebase';

/**
 * Fetches the full practice details (name, etc.) for a list of membership docs.
 * @param {import('firebase/firestore').QueryDocumentSnapshot[]} bridgeDocs - The membership documents.
 * @returns {Promise<any[]>} The resolved practice objects.
 */
const fetchPracticeDetails = async (bridgeDocs) => {
  try {
    const lookups = bridgeDocs.map(async (d) => {
      const pRef = d.data().practice;
      const pSnap = await getDoc(pRef);
      return pSnap.exists()
        ? { id: pRef.id, ...pSnap.data() }
        : { id: pRef.id, name: 'Unknown Practice' };
    });
    const results = await Promise.all(lookups);
    // Sort alphabetically by practice name for the dropdown.
    // Mutating 'results' is safe here as it is a fresh local array.
    results.sort((a, b) => a.name.localeCompare(b.name));
    return results;
  } catch {
    return [];
  }
};

/**
 * Updates the user's 'current_practice' field in Firestore.
 * @param {string} practiceId - The target practice ID.
 */
const performSwitch = async (practiceId) => {
  // Validate the user and practice ID before attempting the write.
  if (!authUser.value?.uid || !practiceId) return;
  try {
    const userRef = doc(db, 'users', authUser.value.uid);
    const practiceRef = doc(db, 'practices', practiceId);
    await updateDoc(userRef, { current_practice: practiceRef });
  } catch {
    // Silently fail in production.
  }
};

/**
 * Composable for fetching user's practices and handling context switching.
 * @returns {{
 * practices: import('vue').Ref<any[]>,
 * handleSwitch: (practiceId: string) => Promise<void>,
 * isLoading: import('vue').Ref<boolean>
 * }} The practices list and switch handler.
 */
export function useUserPractices() {
  /** @type {import('vue').Ref<any[]>} */
  const practices = ref([]);
  const isLoading = ref(true);

  /** @type {import('firebase/firestore').Unsubscribe | null} */
  let bridgeListener = null;

  /**
   * Sets up the listener for the user's memberships.
   * @param {string} uid - The user ID to query.
   */
  const init = (uid) => {
    if (bridgeListener) bridgeListener();
    // Query the bridge collection to find all practices the user is a member of.
    const q = query(collection(db, 'practice_users'), where('user', '==', doc(db, 'users', uid)));

    bridgeListener = onSnapshot(
      q,
      async (snapshot) => {
        practices.value = await fetchPracticeDetails(snapshot.docs);
        isLoading.value = false;
      },
      () => {
        isLoading.value = false;
      }
    );
  };

  onUnmounted(() => {
    if (bridgeListener) bridgeListener();
    practices.value = [];
  });

  // Re-initialise the listener when the authenticated user changes.
  watch(
    () => authUser.value?.uid,
    (newUid) => {
      if (newUid) {
        init(newUid);
      } else {
        practices.value = [];
      }
    },
    { immediate: true }
  );

  return { practices, handleSwitch: performSwitch, isLoading };
}

/**
 * Manages the list of practices associated with the current user.
 * Intended for use in the Navigation bar to allow context switching.
 */
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  type QueryDocumentSnapshot,
  type Unsubscribe,
  updateDoc,
  where
} from 'firebase/firestore';
import { onUnmounted, type Ref, ref, watch } from 'vue';

import { user as authUser } from '@/composables/useAuth';
import { type PracticeSummary } from '@/features/navbar/navTypes';
import { db } from '@/services/firebase';

/**
 * Fetches the full practice details (name, etc.) for a list of membership docs.
 * @param bridgeDocs - The membership documents.
 * @returns The resolved practice objects.
 */
const fetchPracticeDetails = async (
  bridgeDocs: QueryDocumentSnapshot[]
): Promise<PracticeSummary[]> => {
  try {
    const lookups = bridgeDocs.map(async (d) => {
      const pRef = d.data().practice;
      const pSnap = await getDoc(pRef);

      if (pSnap.exists()) {
        const data = pSnap.data();
        return { id: pRef.id, ...(data as Record<string, unknown>) } as PracticeSummary;
      }

      return { id: pRef.id, name: 'Unknown Practice' } as PracticeSummary;
    });

    const results = await Promise.all(lookups);

    // Sort alphabetically by practice name for the dropdown.
    results.sort((a, b) => a.name.localeCompare(b.name));
    return results;
  } catch {
    return [];
  }
};

/**
 * Updates the user's 'current_practice' field in Firestore.
 * @param practiceId - The target practice ID.
 * @returns A promise that resolves when the update is complete.
 */
const performSwitch = async (practiceId: string): Promise<void> => {
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
 * Evaluates the current practice list to prevent ghost contexts mid-session.
 * @param currentPractices - The currently available practices.
 * @param activeId - The user's active practice ID.
 * @param loading - The loading state of the practices listener.
 */
const handleFallbackPractice = (
  currentPractices: PracticeSummary[] | undefined,
  activeId: string | undefined,
  loading: boolean
): void => {
  if (loading || !activeId || !currentPractices) return;

  const hasAccess = currentPractices.some((p) => p.id === activeId);
  const fallbackPractice = currentPractices[0];

  if (!hasAccess && fallbackPractice) {
    performSwitch(fallbackPractice.id);
  }
};

/**
 * Composable for fetching user's practices and handling context switching.
 * @returns An object containing the reactive practices list, switch handler, and loading state.
 */
export function useUserPractices(): {
  practices: Ref<PracticeSummary[]>;
  handleSwitch: (practiceId: string) => Promise<void>;
  isLoading: Ref<boolean>;
} {
  const practices = ref<PracticeSummary[]>([]);
  const isLoading = ref(true);

  let bridgeListener: Unsubscribe | null = null;

  /**
   * Cleans up the listener and resets the practices list.
   */
  const cleanup = () => {
    if (bridgeListener) bridgeListener();
    practices.value = [];
  };

  const init = (uid: string) => {
    cleanup();
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

  onUnmounted(cleanup);

  // Re-initialise the listener when the authenticated user changes.
  watch(
    () => authUser.value?.uid,
    (newUid) => (newUid ? init(newUid) : cleanup()),
    { immediate: true }
  );

  // Reactive fallback: handles access revocation mid-session to prevent ghost contexts.
  watch(
    () => [practices.value, authUser.value?.practiceRef?.id, isLoading.value],
    ([currentPractices, activeId, loading]) =>
      handleFallbackPractice(
        currentPractices as PracticeSummary[] | undefined,
        activeId as string | undefined,
        loading as boolean
      )
  );

  return { practices, handleSwitch: performSwitch, isLoading };
}

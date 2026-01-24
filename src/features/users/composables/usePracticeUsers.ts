/* src/features/users/composables/usePracticeUsers.ts */
import {
  collection,
  doc,
  type DocumentData,
  type DocumentReference,
  onSnapshot,
  type Query,
  query,
  type QuerySnapshot,
  type Unsubscribe,
  where} from 'firebase/firestore';
import { computed, type ComputedRef,onUnmounted, type Ref, ref, watch } from 'vue';

import { user as authUser } from '@/composables/useAuth';
import {
  type PracticeMembership,
  type PracticeUser,
  type UserProfile
} from '@/features/users/userTypes';
import { db } from '@/services/firebase';
import { type Dict,type Nullable } from '@/types/generic';

/**
 * Global cache management for user profiles.
 */
const globalProfileStore = ref<Dict<UserProfile>>({});

/**
 * Maps user IDs to their active listeners and reference counts.
 */
const profileListeners = new Map<string, { unsubscribe: Unsubscribe; count: number }>();

/**
 * Increments the reference count and initialises a profile listener if needed.
 * @param userRef
 */
const attachProfileListener = (userRef: DocumentReference): void => {
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
        const data = pSnap.data() as UserProfile;
        globalProfileStore.value[uid] = {
          ...data,
          uid // Ensure the ID is always included.
        };
      }
    },
    () => {
      // Error handling silenced for linting compliance.
    }
  );

  profileListeners.set(uid, { unsubscribe, count: 1 });
};

/**
 * Decrements the reference count and destroys the listener if no longer required.
 * @param uid
 */
const detachProfileListener = (uid: string): void => {
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
 * Processes the membership list snapshot and updates listeners.
 * @param snapshot
 * @param memberships
 * @param isLoading
 */
const handleSyncSnapshot = (
  snapshot: QuerySnapshot<DocumentData, DocumentData>,
  memberships: Ref<PracticeMembership[]>,
  isLoading: Ref<boolean>
): void => {
  const newUids = new Set(snapshot.docs.map((d) => (d.data().user as DocumentReference).id));
  const oldUids = new Set(memberships.value.map((m) => m.user.id));

  for (const mDoc of snapshot.docs) {
    const userRef = mDoc.data().user as DocumentReference;
    if (!oldUids.has(userRef.id)) {
      attachProfileListener(userRef);
    }
  }

  for (const uid of oldUids) {
    if (!newUids.has(uid)) {
      detachProfileListener(uid);
    }
  }

  memberships.value = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      user: data.user,
      practice: data.practice,
      role: data.role,
      start_date: data.start_date,
      end_date: data.end_date,
      is_administrator: !!data.is_administrator,
      is_employee: !!data.is_employee
    } as PracticeMembership;
  });
  isLoading.value = false;
};

/**
 * Creates the Firestore query for practice users based on permissions.
 * @param practiceId
 * @param user
 */
const createSyncQuery = (practiceId: string, user: Nullable<UserProfile>): Query => {
  const practiceRef = doc(db, 'practices', practiceId);
  const bridgeCol = collection(db, 'practice_users');

  if (user?.is_administrator) {
    return query(bridgeCol, where('practice', '==', practiceRef));
  }

  const uid = user?.uid || 'unknown';
  const userRef = doc(db, 'users', uid);
  return query(bridgeCol, where('practice', '==', practiceRef), where('user', '==', userRef));
};

/**
 * Transforms raw membership data into a sorted list of users with profiles.
 * @param memberships
 */
const useSortedUsers = (memberships: Ref<PracticeMembership[]>): ComputedRef<PracticeUser[]> =>
  computed(() => {
    return memberships.value
      .map((m) => {
        const profile =
          globalProfileStore.value[m.user.id] ||
          ({
            uid: m.user.id,
            email: '',
            activePracticeName: 'Loading...',
            is_administrator: false
          } as UserProfile);

        return {
          ...profile,
          role: m.role,
          status: 'active',
          is_employee: m.is_employee,
          start_date: m.start_date,
          end_date: m.end_date
        } as PracticeUser;
      })
      .sort((a, b) => (a.activePracticeName || '').localeCompare(b.activePracticeName || ''));
  });

/**
 * Composable for managing practice user memberships and profiles.
 */
export function usePracticeUsers(): {
  users: ComputedRef<PracticeUser[]>;
  isLoading: Ref<boolean>;
} {
  const memberships = ref<PracticeMembership[]>([]);
  const isLoading = ref(true);
  let listListener: Unsubscribe | null = null;

  const startLiveSync = (practiceId: string): void => {
    if (listListener) listListener();

    const q = createSyncQuery(practiceId, authUser.value);

    listListener = onSnapshot(
      q,
      (s) => handleSyncSnapshot(s, memberships, isLoading),
      () => {
        isLoading.value = false;
      }
    );
  };

  const cleanup = (): void => {
    if (listListener) listListener();
    for (const m of memberships.value) detachProfileListener(m.user.id);
    memberships.value = [];
  };

  onUnmounted(cleanup);

  watch(
    () => {
      const user = authUser.value;
      return [user?.practiceRef?.id, user?.is_administrator];
    },
    ([newId]) => {
      if (newId) startLiveSync(newId as string);
      else cleanup();
    },
    { immediate: true }
  );

  return { users: useSortedUsers(memberships), isLoading };
}

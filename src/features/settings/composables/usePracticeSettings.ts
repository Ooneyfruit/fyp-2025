/**
 * Logic for fetching and managing practice configuration settings.
 * Handles retrieval of subcollections and aggregation of staffing requirements.
 */
import {
  collection,
  type DocumentReference,
  onSnapshot,
  type QueryDocumentSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import { computed, markRaw, onUnmounted, type Ref, ref, watch } from 'vue';

import { useAuth } from '@/composables/useAuth';
import {
  type MinimumStaffConfig,
  type PracticeDetails,
  type PracticeRoleConfig,
  type SurgeryConfig
} from '@/features/settings/settingsTypes';

// --- Helper Functions (Module Scope) ---

const extractId = (val: unknown): string => {
  if (val && typeof val === 'object' && 'id' in val) {
    return (val as DocumentReference).id;
  }
  return String(val);
};

const mapStaffConfig = (docSnap: QueryDocumentSnapshot): MinimumStaffConfig => {
  const dData = docSnap.data();
  return {
    id: docSnap.id,
    ...dData,
    surgery_id: extractId(dData.surgery_id),
    role_id: extractId(dData.role_id)
  } as MinimumStaffConfig;
};

interface SettingsState {
  details: Ref<PracticeDetails>;
  surgeries: Ref<SurgeryConfig[]>;
  roles: Ref<PracticeRoleConfig[]>;
  minStaff: Ref<MinimumStaffConfig[]>;
}

/**
 * Initializes all real-time listeners for the practice.
 */
const startListeners = (pRef: DocumentReference, state: SettingsState): Unsubscribe[] => {
  const subs: Unsubscribe[] = [];

  const detailsSub = onSnapshot(pRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      state.details.value = {
        name: data.name || 'Unknown Practice',
        address: data.address || ''
      };
    }
  });

  const surgeriesSub = onSnapshot(collection(pRef, 'surgeries'), (snap) => {
    state.surgeries.value = snap.docs.map(
      (d) => markRaw({ id: d.id, ...d.data() }) as SurgeryConfig
    );
  });

  const rolesSub = onSnapshot(collection(pRef, 'roles'), (snap) => {
    state.roles.value = snap.docs.map(
      (d) => markRaw({ id: d.id, ...d.data() }) as PracticeRoleConfig
    );
  });

  const staffSub = onSnapshot(collection(pRef, 'minimum_operating_staff'), (snap) => {
    state.minStaff.value = snap.docs.map((d) => markRaw(mapStaffConfig(d)));
  });

  // Consolidated push to satisfy unicorn/no-array-push-push
  subs.push(detailsSub, surgeriesSub, rolesSub, staffSub);

  return subs;
};

// --- Composable ---

export function usePracticeSettings() {
  const { user } = useAuth();
  const isLoading = ref(true);
  const listeners: Unsubscribe[] = [];

  const details = ref<PracticeDetails>({ name: '', address: '' });
  const surgeries = ref<SurgeryConfig[]>([]);
  const roles = ref<PracticeRoleConfig[]>([]);
  const minStaff = ref<MinimumStaffConfig[]>([]);

  watch(
    () => user.value?.practiceRef,
    (newRef) => {
      for (const unsub of listeners) unsub();
      listeners.length = 0;

      if (newRef) {
        isLoading.value = true;
        const newSubs = startListeners(newRef, { details, surgeries, roles, minStaff });
        listeners.push(...newSubs);
        isLoading.value = false;
      }
    },
    { immediate: true }
  );

  onUnmounted(() => {
    for (const unsub of listeners) unsub();
  });

  const enrichedSurgeries = computed(() => {
    return surgeries.value.map((surgery) => {
      const row: Record<string, unknown> = { ...surgery };
      for (const role of roles.value) {
        const match = minStaff.value.find(
          (ms) => ms.surgery_id === surgery.id && ms.role_id === role.id
        );
        row[`role_${role.id}`] = match ? match.staff_count : 0;
      }
      return row;
    });
  });

  return { isLoading, details, roles, surgeries, enrichedSurgeries };
}

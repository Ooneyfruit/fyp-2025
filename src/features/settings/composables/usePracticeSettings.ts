/**
 * Logic for fetching and managing practice configuration settings.
 * Handles retrieval of subcollections and aggregation of staffing requirements.
 */
import {
  collection,
  type DocumentReference,
  getDoc,
  getDocs,
  type QueryDocumentSnapshot
} from 'firebase/firestore';
import { computed, markRaw, type Ref, ref, watch } from 'vue';

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

/**
 * Encapsulates the async fetching logic to reduce composable complexity.
 */
const performFetch = async (
  practiceRef: DocumentReference,
  state: {
    details: Ref<PracticeDetails>;
    surgeries: Ref<SurgeryConfig[]>;
    roles: Ref<PracticeRoleConfig[]>;
    minStaff: Ref<MinimumStaffConfig[]>;
  }
) => {
  const practiceSnap = await getDoc(practiceRef);
  if (practiceSnap.exists()) {
    const data = practiceSnap.data();
    state.details.value = {
      name: data.name || 'Unknown Practice',
      address: data.address || ''
    };
  }

  const [surgerySnap, roleSnap, staffSnap] = await Promise.all([
    getDocs(collection(practiceRef, 'surgeries')),
    getDocs(collection(practiceRef, 'roles')),
    getDocs(collection(practiceRef, 'minimum_operating_staff'))
  ]);

  state.surgeries.value = surgerySnap.docs.map(
    (d) => markRaw({ id: d.id, ...d.data() }) as SurgeryConfig
  );
  state.roles.value = roleSnap.docs.map(
    (d) => markRaw({ id: d.id, ...d.data() }) as PracticeRoleConfig
  );

  // Wrap callback to satisfy unicorn/no-array-callback-reference
  state.minStaff.value = staffSnap.docs.map((d) => markRaw(mapStaffConfig(d)));
};

/**
 * Pure function to compute the enriched grid data.
 */
const computeEnrichedSurgeries = (
  surgeries: SurgeryConfig[],
  roles: PracticeRoleConfig[],
  minStaff: MinimumStaffConfig[]
) => {
  return surgeries.map((surgery) => {
    const row: Record<string, unknown> = { ...surgery };
    for (const role of roles) {
      const match = minStaff.find((ms) => ms.surgery_id === surgery.id && ms.role_id === role.id);
      row[`role_${role.id}`] = match ? match.staff_count : 0;
    }
    return row;
  });
};

// --- Composable ---

/**
 * Composable to manage the state and data fetching for the settings view.
 * @returns Reactive state objects for practice details, surgeries, and roles.
 */
export function usePracticeSettings() {
  const { user } = useAuth();
  const isLoading = ref(true);
  const details = ref<PracticeDetails>({ name: '', address: '' });
  const surgeries = ref<SurgeryConfig[]>([]);
  const roles = ref<PracticeRoleConfig[]>([]);
  const minStaff = ref<MinimumStaffConfig[]>([]);

  const enrichedSurgeries = computed(() =>
    computeEnrichedSurgeries(surgeries.value, roles.value, minStaff.value)
  );

  watch(
    () => user.value?.practiceRef,
    async (newRef) => {
      if (!newRef) return;
      isLoading.value = true;
      try {
        await performFetch(newRef, { details, surgeries, roles, minStaff });
      } catch {
        // Silently fail in production.
      } finally {
        isLoading.value = false;
      }
    },
    { immediate: true }
  );

  return { isLoading, details, roles, surgeries, enrichedSurgeries };
}

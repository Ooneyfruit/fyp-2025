/**
 * Orchestrates the loading and filtering of rota-related data for the grid view.
 */
import { type DocumentReference } from 'firebase/firestore';
import { computed, ref, type ComputedRef, type Ref } from 'vue';

import { type UserProfile } from '@/features/users/userTypes';
import { fetchPracticeRoles, fetchPracticeSurgeries, fetchShifts } from '@/features/rota/rotaApi';
import { type PracticeRole, type PracticeSurgery, type Shift } from '@/features/rota/rotaTypes';
import { type Nullable } from '@/types/generic';

export interface RotaRow {
  id: string;
  role: PracticeRole;
  surgery: PracticeSurgery;
}

interface UseRotaDataReturn {
  flattenedRows: ComputedRef<RotaRow[]>;
  loadData: () => Promise<void>;
  getShiftsForSlot: (rId: string, sId: string, dIso: string) => Shift[];
}

/**
 * Helper to safely extract the ISO date string from a shift object.
 */
const getShiftDateIso = (shift: Shift): string | null => {
  if (!shift.date) {
    return null;
  }
  // Check for Firestore Timestamp 'toDate' method
  if ('toDate' in shift.date && typeof shift.date.toDate === 'function') {
    return shift.date.toDate().toISOString().split('T')[0];
  }
  // Fallback for Date objects or ISO strings if data is mocked/different.
  // We double cast via 'unknown' because TypeScript knows 'shift.date' is strictly 'Timestamp',
  // preventing direct casting to unrelated types like 'Date' or 'string'.
  return new Date(shift.date as unknown as Date | string).toISOString().split('T')[0];
};

/**
 * Helper to check if a reference matches an ID.
 */
const isRefMatch = (refObj: DocumentReference | undefined, targetId: string): boolean => {
  return refObj?.id === targetId || refObj?.path?.endsWith(targetId) || false;
};

/**
 * Filters the raw shifts array for a specific grid slot.
 */
const filterShifts = (shifts: Shift[], rId: string, sId: string, dIso: string): Shift[] => {
  return shifts.filter((s) => {
    const shiftDate = getShiftDateIso(s);
    if (shiftDate !== dIso) return false;

    const roleMatch = isRefMatch(s.role_id, rId);
    const surgeryMatch = isRefMatch(s.surgery_id, sId);

    return roleMatch && surgeryMatch;
  });
};

/**
 * Composable to manage the fetching and organisation of rota data.
 * @param userRef - Reactive Ref containing the current user profile.
 */
export function useRotaData(userRef: Ref<Nullable<UserProfile>>): UseRotaDataReturn {
  const practiceRoles = ref<PracticeRole[]>([]);
  const practiceSurgeries = ref<PracticeSurgery[]>([]);
  const rawShifts = ref<Shift[]>([]);
  const isLoading = ref(false);

  /**
   * Fetches required data collections concurrently.
   */
  const loadData = async (): Promise<void> => {
    if (!userRef.value?.practiceRef) return;
    isLoading.value = true;
    const practiceId = userRef.value.practiceRef.id;

    try {
      const [roles, surgeries, shifts] = await Promise.all([
        fetchPracticeRoles(practiceId),
        fetchPracticeSurgeries(practiceId),
        fetchShifts(practiceId)
      ]);
      practiceRoles.value = roles;
      practiceSurgeries.value = surgeries;
      rawShifts.value = shifts;
    } catch (error) {
      console.error('Failed to load rota data', error);
    } finally {
      isLoading.value = false;
    }
  };

  const flattenedRows = computed(() => {
    const rows: RotaRow[] = [];
    for (const role of practiceRoles.value) {
      for (const surgery of practiceSurgeries.value) {
        rows.push({ id: `${role.id}_${surgery.id}`, role, surgery });
      }
    }
    return rows;
  });

  return {
    flattenedRows,
    loadData,
    getShiftsForSlot: (r: string, s: string, d: string) => filterShifts(rawShifts.value, r, s, d)
  };
}

/**
 * Orchestrates the loading and filtering of rota-related data for the grid view.
 * Logic: centrally manages state for roles, surgeries, and shifts.
 * Decomposed to satisfy line-count limits and improve type safety.
 */
import { type DocumentReference, Timestamp } from 'firebase/firestore';
import { computed, type Ref, ref } from 'vue';

import { fetchPracticeRoles, fetchPracticeSurgeries, fetchShifts } from '@/features/rota/rotaApi';
import type { PracticeRole, PracticeSurgery, Shift, ShiftInput } from '@/features/rota/rotaTypes';
import type { UserProfile } from '@/features/users/userTypes';

/**
 * Interface representing a flattened row in the rota grid.
 * Combines a role and a surgery for iteration.
 */
export interface RotaRow {
  id: string;
  role: PracticeRole;
  surgery: PracticeSurgery;
}

/**
 * Helper to safely extract the ISO date string from a shift object.
 * @param shift - The shift object or input DTO.
 * @returns The ISO date string (YYYY-MM-DD) or null.
 */
const getShiftDateIso = (shift: Shift | ShiftInput): string | null => {
  if (!shift.date) {
    return null;
  }

  // Check if the date is a Firestore Timestamp (has a toDate method)
  if (shift.date instanceof Timestamp) {
    return shift.date.toDate().toISOString().split('T')[0];
  }

  // Handle standard JS Date objects
  if (shift.date instanceof Date) {
    return shift.date.toISOString().split('T')[0];
  }

  // Fallback for string dates
  return new Date(shift.date).toISOString().split('T')[0];
};

/**
 * Helper to check if a reference matches an ID.
 * @param refObj - The reference object (role_id or surgery_id).
 * @param targetId - The ID to match against.
 * @returns True if matched.
 */
const isRefMatch = (refObj: DocumentReference | null | undefined, targetId: string): boolean => {
  return refObj?.id === targetId || refObj?.path?.endsWith(targetId) || false;
};

/**
 * Filters the raw shifts array for a specific grid slot.
 * @param shifts - The complete collection of shifts.
 * @param rId - Target role ID.
 * @param sId - Target surgery ID.
 * @param dIso - Target date (YYYY-MM-DD).
 * @returns Matching shifts.
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
 * @returns The rota data state and helper methods.
 */
export function useRotaData(userRef: Ref<UserProfile | null>) {
  const practiceRoles = ref<PracticeRole[]>([]);
  const practiceSurgeries = ref<PracticeSurgery[]>([]);
  const rawShifts = ref<Shift[]>([]);
  const isLoading = ref(false);

  /**
   * Fetches required data collections concurrently.
   */
  const loadData = async () => {
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
    } catch {
      // Logic: Silently handle errors or use a global toast service.
    } finally {
      isLoading.value = false;
    }
  };

  return {
    flattenedRows: computed<RotaRow[]>(() => {
      const rows: RotaRow[] = [];
      for (const role of practiceRoles.value) {
        for (const surgery of practiceSurgeries.value) {
          rows.push({ id: `${role.id}_${surgery.id}`, role, surgery });
        }
      }
      return rows;
    }),
    loadData,
    getShiftsForSlot: (r: string, s: string, d: string) => filterShifts(rawShifts.value, r, s, d)
  };
}

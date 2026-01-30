/**
 * Rota data management composable.
 * Logic: Fetches and manages state for practice roles, surgeries, and shifts.
 * Includes data flattening for grid display.
 */

import { computed, type Ref, ref } from 'vue';

import { fetchPracticeRoles, fetchPracticeSurgeries, fetchShifts } from '@/features/rota/rotaApi';
import type { PracticeRole, PracticeSurgery, Shift } from '@/features/rota/rotaTypes';
import type { UserProfile } from '@/features/users/userTypes';
import type { Nullable } from '@/types/generic';

/**
 * Interface representing a grid row definition.
 * Includes index signature '[key: string]: unknown' to be compatible with
 * BaseTable and RotaGrid which treat rows as generic records.
 */
export interface RotaRow {
  [key: string]: unknown;
  id: string;
  role: PracticeRole;
  surgery: PracticeSurgery;
}

/**
 * Extracts a YYYY-MM-DD string from a shift date object.
 * Logic: Handles both Firestore Timestamps and standard Date objects.
 * @param dateVal - The date object from the shift.
 * @returns The ISO date string or null if invalid.
 */
const getShiftIsoDate = (dateVal: unknown): string | null => {
  if (!dateVal) return null;
  // Check for Firestore Timestamp 'toDate' method
  if (typeof (dateVal as { toDate: () => Date }).toDate === 'function') {
    return (dateVal as { toDate: () => Date }).toDate().toISOString().split('T')[0];
  }
  // Fallback for Date objects or strings
  return new Date(dateVal as string | Date).toISOString().split('T')[0];
};

/**
 * Helper to check if a document reference matches a given ID string.
 * Reduces cyclomatic complexity in the main filter function.
 * @param ref - The document reference from the shift.
 * @param targetId - The ID to match against.
 */
const matchesRef = (ref: Shift['role_id'], targetId: string): boolean => {
  if (!ref) return false;
  return ref.id === targetId || ref.path?.endsWith(targetId) || false;
};

/**
 * Checks if a shift matches the provided slot criteria.
 * @param shift - The shift to check.
 * @param roleId - The target role ID.
 * @param surgeryId - The target surgery ID.
 * @param dateIso - The target date string.
 * @returns True if the shift belongs to the slot.
 */
const isShiftInSlot = (
  shift: Shift,
  roleId: string,
  surgeryId: string,
  dateIso: string
): boolean => {
  if (getShiftIsoDate(shift.date) !== dateIso) return false;
  return matchesRef(shift.role_id, roleId) && matchesRef(shift.surgery_id, surgeryId);
};

/**
 * Composable for managing rota data.
 * @param userRef - Reactive reference to the current user profile.
 */
export function useRotaData(userRef: Ref<Nullable<UserProfile>>) {
  const practiceRoles = ref<PracticeRole[]>([]);
  const practiceSurgeries = ref<PracticeSurgery[]>([]);
  const rawShifts = ref<Shift[]>([]);
  const isLoading = ref(false);

  /**
   * Fetches all necessary data for the rota grid.
   * Logic: Parallel fetches for roles, surgeries, and shifts for the active practice.
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
    } catch {
      // Ensure state is clean on error to prevent ghost data
      practiceRoles.value = [];
      practiceSurgeries.value = [];
      rawShifts.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Flattens data for the grid.
   * Returns purely data rows; visual spacing is handled by the Table component.
   */
  const flattenedRows = computed<RotaRow[]>(() => {
    const rows: RotaRow[] = [];
    for (const role of practiceRoles.value) {
      for (const surgery of practiceSurgeries.value) {
        rows.push({
          id: `${role.id}_${surgery.id}`,
          role,
          surgery
        });
      }
    }
    return rows;
  });

  /**
   * Retrieves specific shifts for a given grid slot.
   * @param roleId - Role identifier.
   * @param surgeryId - Surgery identifier.
   * @param dateIso - Date string (YYYY-MM-DD).
   */
  const getShiftsForSlot = (roleId: string, surgeryId: string, dateIso: string): Shift[] => {
    return rawShifts.value.filter((s) => isShiftInSlot(s, roleId, surgeryId, dateIso));
  };

  return {
    flattenedRows,
    loadData,
    getShiftsForSlot,
    isLoading
  };
}

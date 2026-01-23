/**
 * Orchestrates the loading and filtering of rota-related data for the grid view.
 * Logic: centrally manages state for roles, surgeries, and shifts.
 * Decomposed to satisfy line-count limits and improve type safety.
 */
import { computed, ref } from 'vue';

import { fetchPracticeRoles, fetchPracticeSurgeries, fetchShifts } from '@/features/rota/rotaApi';

/**
 * @typedef {import('../rotaApi').Shift} Shift
 * @typedef {import('../rotaApi').PracticeRole} PracticeRole
 * @typedef {import('../rotaApi').PracticeSurgery} PracticeSurgery
 */

/**
 * Helper to safely extract the ISO date string from a shift object.
 * @param {Shift} shift - The shift object.
 * @returns {string|null} The ISO date string (YYYY-MM-DD) or null.
 */
const getShiftDateIso = (shift) => {
  if (!shift.date) {
    return null;
  }
  // Convert Firestore Timestamps to standard JS Dates before extracting the string.
  if (typeof shift.date.toDate === 'function') {
    return shift.date.toDate().toISOString().split('T')[0];
  }
  return new Date(shift.date).toISOString().split('T')[0];
};

/**
 * Helper to check if a reference matches an ID.
 * @param {any} refObj - The reference object (role_id or surgery_id).
 * @param {string} targetId - The ID to match against.
 * @returns {boolean} True if matched.
 */
const isRefMatch = (refObj, targetId) => {
  return refObj?.id === targetId || refObj?.path?.endsWith(targetId) || false;
};

/**
 * Filters the raw shifts array for a specific grid slot.
 * @param {Shift[]} shifts - The complete collection of shifts.
 * @param {string} rId - Target role ID.
 * @param {string} sId - Target surgery ID.
 * @param {string} dIso - Target date (YYYY-MM-DD).
 * @returns {Shift[]} Matching shifts.
 */
const filterShifts = (shifts, rId, sId, dIso) => {
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
 * @param {import('vue').Ref<any>} userRef - Reactive Ref containing the current user profile.
 * @returns {object} The rota data state and helper methods.
 */
export function useRotaData(userRef) {
  const practiceRoles = ref(/** @type {PracticeRole[]} */ ([]));
  const practiceSurgeries = ref(/** @type {PracticeSurgery[]} */ ([]));
  const rawShifts = ref(/** @type {Shift[]} */ ([]));
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
    flattenedRows: computed(() => {
      const rows = [];
      for (const role of practiceRoles.value) {
        for (const surgery of practiceSurgeries.value) {
          rows.push({ id: `${role.id}_${surgery.id}`, role, surgery });
        }
      }
      return rows;
    }),
    loadData,
    getShiftsForSlot: (/** @type {string} */ r, /** @type {string} */ s, /** @type {string} */ d) =>
      filterShifts(rawShifts.value, r, s, d)
  };
}

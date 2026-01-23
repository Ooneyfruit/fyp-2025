/**
 * Orchestrates the loading and filtering of rota-related data for the grid view.
 * Centrally manages the state for practice roles, surgeries, and shifts.
 */
import { computed,ref } from 'vue';

import { fetchPracticeRoles, fetchPracticeSurgeries, fetchShifts } from '../rotaAPI';

/**
 * Helper to safely extract the ISO date string from a shift object.
 * Handles Firestore Timestamps and standard Date strings.
 * @param {object} shift - The shift object.
 * @returns {string|null} The ISO date string (YYYY-MM-DD) or null.
 */
const getShiftDateIso = (shift) => {
  // Return null immediately if no date is provided on the object.
  if (!shift.date) return null;
  // Convert Firestore Timestamps to standard JS Dates before extracting the string.
  if (typeof shift.date.toDate === 'function') {
    return shift.date.toDate().toISOString().split('T')[0];
  }
  // Fall back to standard date parsing for raw string values.
  return new Date(shift.date).toISOString().split('T')[0];
};

/**
 * Helper to check if a reference matches an ID.
 * Supports direct ID comparison and path suffix checks.
 * @param {object} refObj - The reference object (role_id or surgery_id).
 * @param {string} targetId - The ID to match against.
 * @returns {boolean} True if matched.
 */
const isRefMatch = (refObj, targetId) => {
  // Check for direct ID equivalence or match the ID at the end of a path string.
  return refObj?.id === targetId || refObj?.path?.endsWith(targetId);
};

/**
 * Composable to manage the fetching and organisation of rota data.
 * Orchestrates the loading of roles, surgeries, and shifts for a practice.
 * @param {object} userRef - Reactive Vue Ref containing the current user profile.
 * @returns {object} The rota data state and helper methods.
 */
export function useRotaData(userRef) {
  const practiceRoles = ref([]);
  const practiceSurgeries = ref([]);
  const rawShifts = ref([]);
  const isLoading = ref(false);

  /**
   * Fetches all required data collections from the API concurrently.
   */
  const loadData = async () => {
    // Exit early if the user session does not include a valid practice reference.
    if (!userRef.value?.practiceRef) return;

    isLoading.value = true;
    const practiceId = userRef.value.practiceRef.id;

    try {
      // Execute all data fetches in parallel to minimise loading latency.
      const [roles, surgeries, shifts] = await Promise.all([
        fetchPracticeRoles(practiceId),
        fetchPracticeSurgeries(practiceId),
        fetchShifts(practiceId)
      ]);

      practiceRoles.value = roles;
      practiceSurgeries.value = surgeries;
      rawShifts.value = shifts;
    } catch (error) {
      // Log errors with context to assist in debugging data fetch failures.
      console.error('[useRotaData] Error loading data:', error);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Flattens data for the grid.
   * Returns purely data rows; visual spacing is handled by the Table component.
   */
  const flattenedRows = computed(() => {
    const rows = [];

    // Combine roles and surgeries into unique row identifiers for the rota grid.
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
   * Retrieves shifts that correspond to a specific grid slot and date.
   * @param {string} roleId - The unique identifier for the role.
   * @param {string} surgeryId - The unique identifier for the surgery.
   * @param {string} dateIso - The target date in ISO format.
   * @returns {Array} List of matching shift objects.
   */
  const getShiftsForSlot = (roleId, surgeryId, dateIso) => {
    return rawShifts.value.filter((s) => {
      // Filter out shifts that do not occur on the requested date.
      const shiftDate = getShiftDateIso(s);
      if (shiftDate !== dateIso) return false;

      // Ensure both the role and surgery match the slot requirements.
      const roleMatch = isRefMatch(s.role_id, roleId);
      const surgeryMatch = isRefMatch(s.surgery_id, surgeryId);

      return roleMatch && surgeryMatch;
    });
  };

  return {
    flattenedRows,
    loadData,
    getShiftsForSlot
  };
}

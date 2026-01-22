import { ref, computed } from 'vue';
import { fetchPracticeRoles, fetchPracticeSurgeries, fetchShifts } from '../rotaAPI';

/**
 * Helper to safely extract the ISO date string from a shift object.
 * Handles Firestore Timestamps and standard Date strings.
 * @param {object} shift - The shift object.
 * @returns {string|null} The ISO date string (YYYY-MM-DD) or null.
 */
const getShiftDateIso = (shift) => {
  if (!shift.date) return null;
  if (typeof shift.date.toDate === 'function') {
    return shift.date.toDate().toISOString().split('T')[0];
  }
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
  return refObj?.id === targetId || refObj?.path?.endsWith(targetId);
};

/**
 * Composable to manage the fetching and organization of rota data.
 * Orchestrates the loading of roles, surgeries, and shifts for a practice.
 * @param {import('vue').Ref<object>} userRef - Reactive reference to the current user.
 * @returns {object} The rota data state and helper methods.
 */
export function useRotaData(userRef) {
  const practiceRoles = ref([]);
  const practiceSurgeries = ref([]);
  const rawShifts = ref([]);
  const isLoading = ref(false);

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
    } catch (err) {
      console.error('[useRotaData] Error loading data:', err);
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

    practiceRoles.value.forEach((role) => {
      practiceSurgeries.value.forEach((surgery) => {
        rows.push({
          id: `${role.id}_${surgery.id}`,
          role,
          surgery
        });
      });
    });

    return rows;
  });

  const getShiftsForSlot = (roleId, surgeryId, dateIso) => {
    return rawShifts.value.filter((s) => {
      const shiftDate = getShiftDateIso(s);
      if (shiftDate !== dateIso) return false;

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

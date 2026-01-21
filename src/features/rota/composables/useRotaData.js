import { ref, computed } from 'vue';
import { fetchPracticeRoles, fetchPracticeSurgeries, fetchShifts } from '../rotaAPI';

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
      console.error("[useRotaData] Error loading data:", err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Flattens data and injects SPACER rows for visual grouping.
   * This is key for the "Separate Job Titles" requirement.
   */
  const flattenedRows = computed(() => {
    const rows = [];
    
    practiceRoles.value.forEach((role, rIndex) => {
      // Inject Spacer if not the first role
      if (rIndex > 0) {
        rows.push({ type: 'spacer', id: `spacer_${role.id}` });
      }

      practiceSurgeries.value.forEach((surgery, sIndex) => {
        rows.push({
          type: 'data',
          id: `${role.id}_${surgery.id}`,
          role,
          surgery,
          isRoleStart: sIndex === 0,
          isRoleEnd: sIndex === practiceSurgeries.value.length - 1
        });
      });
    });
    
    return rows;
  });

  const getShiftsForSlot = (roleId, surgeryId, dateIso) => {
    return rawShifts.value.filter(s => {
      // Robust date check handling timestamps or strings
      let shiftDate;
      if (s.date && typeof s.date.toDate === 'function') {
        shiftDate = s.date.toDate().toISOString().split('T')[0];
      } else if (s.date) {
        shiftDate = new Date(s.date).toISOString().split('T')[0];
      }
      
      const roleMatch = s.role_id?.id === roleId || s.role_id?.path?.endsWith(roleId);
      const surgeryMatch = s.surgery_id?.id === surgeryId || s.surgery_id?.path?.endsWith(surgeryId);
      
      return shiftDate === dateIso && roleMatch && surgeryMatch;
    });
  };

  return {
    flattenedRows,
    loadData,
    getShiftsForSlot
  };
}
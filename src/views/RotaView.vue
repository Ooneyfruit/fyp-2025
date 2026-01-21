<template>
  <AppPageContainer fluid>
    
    <RotaHeader 
      :month-label="monthLabel"
      :date-range-label="dateRangeLabel"
      :show-today-button="!isCurrentWeek"
      :is-mobile="breakpoints.isMobile.value"
      @navigate-month="jumpMonth"
      @navigate-period="changePeriod"
      @navigate-day="changeDay"
      @jump-today="goToToday"
    />

    <RotaGrid 
      :days="visibleDays"
      :rows="flattenedRows"
      :get-shifts="getShiftsForSlot"
      @slot-click="onSlotClick"
    />

    <RotaShiftModal 
      v-if="selectedCell"
      :show="showModal"
      :role="selectedCell.role"
      :surgery="selectedCell.surgery"
      :date="selectedCell.date"
      :shifts="selectedCell.shifts"
      @request-close="closeShiftModal"
      @save="onSaveShifts"
    />

  </AppPageContainer>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useBreakpoints } from '../composables/useBreakpoints';
import { useRotaDates } from '../features/rota/composables/useRotaDates';
import { useRotaData } from '../features/rota/composables/useRotaData';
import { createShift, deleteShift } from '../features/rota/rotaAPI';
import { doc } from 'firebase/firestore'; 
import { db } from '../services/firebase';

// Components
import AppPageContainer from '../components/layout/AppPageContainer.vue';
import RotaHeader from '../features/rota/components/RotaHeader.vue';
import RotaGrid from '../features/rota/components/RotaGrid.vue';
import RotaShiftModal from '../features/rota/components/RotaShiftModal.vue';

// --- Logic & State ---

const { user } = useAuth();
const breakpoints = useBreakpoints(ref(document.body), 80);

// 1. Date Management (includes new responsive logic)
const { 
  currentStartDate, 
  visibleDays, 
  monthLabel, 
  changePeriod, 
  changeDay,
  goToToday, 
  jumpMonth 
} = useRotaDates(breakpoints);

// 2. Data Management
const { flattenedRows, loadData, getShiftsForSlot } = useRotaData(user);

// 3. Computed Props for UI
const dateRangeLabel = computed(() => {
  if (!visibleDays.value.length) return '';
  const start = visibleDays.value[0].label;
  const end = visibleDays.value[visibleDays.value.length - 1].label;
  return `${start} - ${end}`;
});

const isCurrentWeek = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return visibleDays.value.some(d => d.iso === today);
});

// 4. Modal / Interaction Logic
const showModal = ref(false);
const selectedCell = ref(null);

const onSlotClick = ({ rowItem, day }) => {
  selectedCell.value = {
    role: rowItem.role,
    surgery: rowItem.surgery,
    date: day,
    shifts: getShiftsForSlot(rowItem.role.id, rowItem.surgery.id, day.iso)
  };
  showModal.value = true;
};

const closeShiftModal = () => {
  showModal.value = false;
  selectedCell.value = null;
};

const onSaveShifts = async ({ additions, removals }) => {
  try {
    const practiceId = user.value.practiceRef.id;
    
    // Process Removals
    await Promise.all(removals.map(id => deleteShift(id)));

    // Process Additions
    await Promise.all(additions.map(member => {
      const roleRef = doc(db, `practices/${practiceId}/roles`, selectedCell.value.role.id);
      const surgeryRef = doc(db, `practices/${practiceId}/surgeries`, selectedCell.value.surgery.id);
      
      const payload = {
        date: selectedCell.value.date.iso,
        user_id: member.userRef,
        user_name: member.name,
        role_id: roleRef,
        role_name: selectedCell.value.role.name,
        surgery_id: surgeryRef,
        surgery_name: selectedCell.value.surgery.name
      };
      
      return createShift(payload);
    }));

    closeShiftModal();
    loadData(); 
  } catch (err) {
    console.error("Failed to save changes", err);
  }
};

// Initial Data Load Trigger
watch(() => user.value?.practiceRef?.id, loadData, { immediate: true });
</script>
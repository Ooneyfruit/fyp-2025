<script setup>
/**
 * @file RotaView.vue
 * @description Main view for the Rota Management feature.
 * Orchestrates the grid, header, and shift modification modals.
 */
import { doc } from 'firebase/firestore';
import { computed, ref, watch } from 'vue';

// Components
import AppPageContainer from '../components/layout/AppPageContainer.vue';
import { useAuth } from '../composables/useAuth';
import { useBreakpoints } from '../composables/useBreakpoints';
import { useToast } from '../composables/useToast';
import RotaGrid from '../features/rota/components/RotaGrid.vue';
import RotaHeader from '../features/rota/components/RotaHeader.vue';
import RotaShiftModal from '../features/rota/components/RotaShiftModal.vue';
import { useRotaData } from '../features/rota/composables/useRotaData';
import { useRotaDates } from '../features/rota/composables/useRotaDates';
import { createShift, deleteShift } from '../features/rota/rotaAPI';
import { db } from '../services/firebase';

// --- Type Definitions ---

/**
 * @typedef {object} RotaRole
 * @property {string} id - The unique identifier for the role.
 * @property {string} name - The display name of the role.
 */

/**
 * @typedef {object} RotaSurgery
 * @property {string} id - The unique identifier for the surgery.
 * @property {string} name - The display name of the surgery.
 */

/**
 * @typedef {object} RotaDay
 * @property {string} iso - The ISO date string (YYYY-MM-DD).
 * @property {string} label - The formatted date label.
 */

/**
 * @typedef {object} RotaRowItem
 * @property {RotaRole} role - The role associated with this grid row.
 * @property {RotaSurgery} surgery - The surgery associated with this grid row.
 */

/**
 * @typedef {object} SelectedCell
 * @property {RotaRole} role - The role for the selected cell.
 * @property {RotaSurgery} surgery - The surgery for the selected cell.
 * @property {RotaDay} date - The date of the selected cell.
 * @property {Array<any>} shifts - The existing shifts in this cell.
 */

/**
 * @typedef {object} UserPracticeRef
 * @property {string} id - The ID of the practice.
 */

/**
 * @typedef {object} User
 * @property {UserPracticeRef} [practiceRef] - Firestore reference to the practice.
 */

/**
 * @typedef {object} ToastInterface
 * @property {(message: string) => void} success - Displays a success toast notification.
 * @property {(message: string) => void} error - Displays an error toast notification.
 */

/**
 * @typedef {object} BreakpointsInterface
 * @property {import('vue').Ref<boolean>} isMobile - Reactive reference indicating if the viewport is mobile-sized.
 */

// --- Constants ---
const SIDEBAR_OFFSET_PX = 80;

// --- Logic & State ---

/**
 * @typedef {object} AuthInterface
 * @property {import('vue').Ref<User>} user - The current authenticated user.
 */

/** @type {AuthInterface} */
const { user } = useAuth();

/** @type {BreakpointsInterface} */
const breakpoints = useBreakpoints(ref(document.body), SIDEBAR_OFFSET_PX);

/** @type {ToastInterface} */
const toast = useToast();

// 1. Date Management
/**
 * @typedef {object} RotaDatesInterface
 * @property {import('vue').Ref<Array<RotaDay>>} visibleDays - List of days currently displayed.
 * @property {import('vue').Ref<string>} monthLabel - Label for the current month context.
 * @property {(...args: any[]) => void} changePeriod - Function to toggle between week/month views.
 * @property {(...args: any[]) => void} changeDay - Function to navigate to a specific day.
 * @property {(...args: any[]) => void} goToToday - Function to jump to the current date.
 * @property {(...args: any[]) => void} jumpMonth - Function to navigate between months.
 */

/** @type {RotaDatesInterface} */
const { visibleDays, monthLabel, changePeriod, changeDay, goToToday, jumpMonth } =
  useRotaDates(breakpoints);

// 2. Data Management
/**
 * @typedef {object} RotaDataInterface
 * @property {import('vue').Ref<Array<any>>} flattenedRows - Processed rows for the grid.
 * @property {() => void} loadData - Triggers a data fetch.
 * @property {(roleId: string, surgeryId: string, date: string) => Array<any>} getShiftsForSlot - Retrieves shifts for a specific coordinate.
 */

/** @type {RotaDataInterface} */
const { flattenedRows, loadData, getShiftsForSlot } = useRotaData(user);

// 3. Computed Props for UI
const dateRangeLabel = computed(() => {
  if (visibleDays.value.length === 0) {
    return '';
  }
  const start = visibleDays.value[0].label;
  const end = visibleDays.value.at(-1)?.label || '';
  return `${start} - ${end}`;
});

const isCurrentWeek = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return visibleDays.value.some((d) => d.iso === today);
});

// 4. Modal / Interaction Logic
const showModal = ref(false);

/** @type {import('vue').Ref<SelectedCell | null>} */
const selectedCell = ref(null);

/**
 * Handles clicks on a specific grid slot.
 * Opens the shift management modal.
 * @param {object} payload - The event payload.
 * @param {RotaRowItem} payload.rowItem - The row data (role/surgery).
 * @param {RotaDay} payload.day - The date object for the clicked column.
 */
const onSlotClick = ({ rowItem, day }) => {
  selectedCell.value = {
    role: rowItem.role,
    surgery: rowItem.surgery,
    date: day,
    shifts: getShiftsForSlot(rowItem.role.id, rowItem.surgery.id, day.iso)
  };
  showModal.value = true;
};

/**
 * Closes the modal and resets selection state.
 */
const closeShiftModal = () => {
  showModal.value = false;
  selectedCell.value = null;
};

/**
 * Persists shift changes to Firestore.
 * @param {object} payload - The changes payload.
 * @param {Array<{userRef: string, name: string}>} payload.additions - New shifts to create.
 * @param {Array<string>} payload.removals - IDs of shifts to delete.
 */
const onSaveShifts = async ({ additions, removals }) => {
  // Strict Null Check: Ensure selectedCell exists before accessing properties
  if (!selectedCell.value) {
    return;
  }

  // Capture values locally to satisfy TypeScript inside the async callback
  const currentCell = selectedCell.value;

  try {
    const practiceId = user.value?.practiceRef?.id;

    if (!practiceId) {
      throw new Error('No practice ID found');
    }

    // Process Removals
    await Promise.all(removals.map((id) => deleteShift(id)));

    // Process Additions
    await Promise.all(
      additions.map((member) => {
        const roleRef = doc(db, `practices/${practiceId}/roles`, currentCell.role.id);
        const surgeryRef = doc(db, `practices/${practiceId}/surgeries`, currentCell.surgery.id);

        const payload = {
          date: currentCell.date.iso,
          user_id: member.userRef,
          user_name: member.name,
          role_id: roleRef,
          role_name: currentCell.role.name,
          surgery_id: surgeryRef,
          surgery_name: currentCell.surgery.name
        };

        return createShift(payload);
      })
    );

    closeShiftModal();
    loadData();
    toast.success('Rota updated successfully');
  } catch {
    toast.error('Failed to save changes');
  }
};

// Initial Data Load Trigger
watch(
  () => user.value?.practiceRef?.id,
  () => {
    if (user.value?.practiceRef?.id) {
      loadData();
    }
  },
  { immediate: true }
);
</script>

<template>
  <AppPageContainer fluid>
    <RotaHeader
      :date-range-label="dateRangeLabel"
      :is-mobile="Boolean(breakpoints.isMobile.value)"
      :month-label="monthLabel"
      :show-today-button="!isCurrentWeek"
      @jump-today="goToToday"
      @navigate-day="changeDay"
      @navigate-month="jumpMonth"
      @navigate-period="changePeriod"
    />

    <RotaGrid
      :days="visibleDays"
      :get-shifts="getShiftsForSlot"
      :rows="flattenedRows"
      @slot-click="onSlotClick"
    />

    <RotaShiftModal
      v-if="selectedCell"
      :date="selectedCell.date"
      :role="selectedCell.role"
      :shifts="selectedCell.shifts"
      :show="showModal"
      :surgery="selectedCell.surgery"
      @request-close="closeShiftModal"
      @save="onSaveShifts"
    />
  </AppPageContainer>
</template>

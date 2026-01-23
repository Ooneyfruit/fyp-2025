<script setup>
/**
 * Main view for the Rota Management feature.
 * Orchestrates the grid, navigation header, and shift modification modals.
 * Refactored to include explicit type annotations and resolve strict TypeScript errors.
 */
import { doc } from 'firebase/firestore';
import { computed, ref, watch } from 'vue';

// Components and composables.
import AppPageContainer from '@/components/layout/AppPageContainer.vue';
import { useAuth } from '@/composables/useAuth';
import { useBreakpoints } from '@/composables/useBreakpoints';
import { useToast } from '@/composables/useToast';
import RotaGrid from '@/features/rota/components/RotaGrid.vue';
import RotaHeader from '@/features/rota/components/RotaHeader.vue';
import RotaShiftModal from '@/features/rota/components/RotaShiftModal.vue';
import { useRotaData } from '@/features/rota/composables/useRotaData';
import { useRotaDates } from '@/features/rota/composables/useRotaDates';
import { createShift, deleteShift } from '@/features/rota/rotaApi';
import { db } from '@/services/firebase';

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
 * @typedef {object} User
 * @property {object} [practiceRef] - Firestore reference to the practice.
 * @property {string} practiceRef.id - The ID of the practice.
 */

/**
 * @typedef {object} AuthInterface
 * @property {import('vue').Ref<User>} user - The current authenticated user.
 */

/**
 * @typedef {object} BreakpointsInterface
 * @property {import('vue').Ref<boolean>} isMobile - Reactive reference for mobile state.
 */

/**
 * @typedef {object} ToastInterface
 * @property {(message: string) => void} success - Displays a success toast.
 * @property {(message: string) => void} error - Displays an error toast.
 */

/**
 * @typedef {object} RotaDatesInterface
 * @property {import('vue').Ref<Array<RotaDay>>} visibleDays - Days currently displayed.
 * @property {import('vue').Ref<string>} monthLabel - Label for the current month.
 * @property {(direction: number) => void} changePeriod - Toggles week/month views.
 * @property {(direction: number) => void} changeDay - Navigates to a specific day.
 * @property {() => void} goToToday - Jumps to the current date.
 * @property {(months: number) => void} jumpMonth - Navigates between months.
 */

/**
 * @typedef {object} RotaDataInterface
 * @property {import('vue').Ref<Array<any>>} flattenedRows - Processed grid rows.
 * @property {() => Promise<void>} loadData - Triggers a data fetch.
 * @property {(roleId: string, surgeryId: string, date: string) => Array<any>} getShiftsForSlot - Gets shifts.
 */

// --- Constants ---
const SIDEBAR_OFFSET_PX = 80;

// --- Logic & State ---

// Explicit casting ensures the compiler recognises destructured properties from JS modules.
const { user } = /** @type {AuthInterface} */ (useAuth());

const { isMobile } = /** @type {BreakpointsInterface} */ (
  useBreakpoints(ref(document.body), SIDEBAR_OFFSET_PX)
);

const toast = /** @type {ToastInterface} */ (useToast());

// 1. Date Management.
// Logic: pass the reactive isMobile ref directly to ensure navigation consistency.
const { visibleDays, monthLabel, changePeriod, changeDay, goToToday, jumpMonth } =
  /** @type {RotaDatesInterface} */ (useRotaDates({ isMobile }));

// 2. Data Management.
const { flattenedRows, loadData, getShiftsForSlot } = /** @type {RotaDataInterface} */ (
  useRotaData(user)
);

// 3. Computed Props for UI.
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
  // Logic: annotate parameter d to prevent implicit any errors.
  return visibleDays.value.some((/** @type {RotaDay} */ d) => d.iso === today);
});

// 4. Modal / Interaction Logic.
const showModal = ref(false);

// Logic: apply explicit type cast to the ref to avoid 'never' type inference.
const selectedCell = ref(/** @type {SelectedCell | null} */ (null));

/**
 * Handles clicks on a specific grid slot to open the management modal.
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
 * Closes the modal and resets the selection state.
 */
const closeShiftModal = () => {
  showModal.value = false;
  selectedCell.value = null;
};

/**
 * Persists shift additions and removals to Firestore.
 * @param {object} payload - The changes payload.
 * @param {Array<{userRef: string, name: string}>} payload.additions - New shifts.
 * @param {Array<string>} payload.removals - IDs of shifts to delete.
 */
const onSaveShifts = async ({ additions, removals }) => {
  // Logic: check for selectedCell value to satisfy TypeScript null safety.
  if (!selectedCell.value) {
    return;
  }

  const currentCell = selectedCell.value;

  try {
    const practiceId = user.value?.practiceRef?.id;

    if (!practiceId) {
      throw new Error('No practice ID found.');
    }

    // Process all removals in parallel to improve performance.
    await Promise.all(removals.map((/** @type {string} */ id) => deleteShift(id)));

    // Generate specific Firestore references for each new shift entry.
    await Promise.all(
      additions.map((/** @type {{userRef: string, name: string}} */ member) => {
        const roleRef = doc(db, `practices/${practiceId}/roles`, currentCell.role.id);
        const surgeryRef = doc(db, `practices/${practiceId}/surgeries`, currentCell.surgery.id);

        return createShift({
          date: currentCell.date.iso,
          user_id: member.userRef,
          user_name: member.name,
          role_id: roleRef,
          role_name: currentCell.role.name,
          surgery_id: surgeryRef,
          surgery_name: currentCell.surgery.name
        });
      })
    );

    closeShiftModal();
    loadData();
    toast.success('Rota updated successfully.');
  } catch {
    toast.error('Failed to save changes.');
  }
};

// Initialises the data load whenever the practice context changes.
watch(
  () => user.value?.practiceRef?.id,
  (/** @type {string | undefined} */ id) => {
    if (id) {
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
      :is-mobile="Boolean(isMobile)"
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

<style scoped>
/* Layout: specific transition handling for the RotaView container */
.rota-view-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>

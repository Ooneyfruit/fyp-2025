<script setup lang="ts">
/**
 * Main view for the Rota Management feature.
 * Orchestrates the grid, navigation header, and shift modification modals.
 */
import { doc } from 'firebase/firestore';
import { computed, type Ref, ref, watch } from 'vue';

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
import { type PracticeRole, type PracticeSurgery, type Shift } from '@/features/rota/rotaTypes';
import { db } from '@/services/firebase';

// --- Type Definitions (Local Interfaces for JS Composables) ---

interface RotaDay {
  iso: string;
  label: string;
}

interface BreakpointsInterface {
  isMobile: Ref<boolean>;
}

interface ToastInterface {
  success: (message: string) => void;
  error: (message: string) => void;
}

interface RotaDatesInterface {
  visibleDays: Ref<RotaDay[]>;
  monthLabel: Ref<string>;
  changePeriod: (direction: number) => void;
  changeDay: (direction: number) => void;
  goToToday: () => void;
  jumpMonth: (months: number) => void;
}

interface RotaRow {
  role: PracticeRole;
  surgery: PracticeSurgery;
}

interface RotaDataInterface {
  flattenedRows: Ref<RotaRow[]>;
  loadData: () => Promise<void>;
  getShiftsForSlot: (roleId: string, surgeryId: string, date: string) => Shift[];
}

interface SelectedCell {
  role: PracticeRole;
  surgery: PracticeSurgery;
  date: RotaDay;
  shifts: Shift[];
}

interface SlotClickPayload {
  rowItem: RotaRow;
  day: RotaDay;
}

interface SaveShiftsPayload {
  additions: Array<{ userRef: string; name: string }>;
  removals: string[];
}

// --- Constants ---
const SIDEBAR_OFFSET_PX = 80;

// --- Logic & State ---

const { user } = useAuth();

const { isMobile } = useBreakpoints(ref(document.body), SIDEBAR_OFFSET_PX) as BreakpointsInterface;
const toast = useToast() as ToastInterface;

// 1. Date Management.
const { visibleDays, monthLabel, changePeriod, changeDay, goToToday, jumpMonth } = useRotaDates({
  isMobile
}) as RotaDatesInterface;

// 2. Data Management.
const { flattenedRows, loadData, getShiftsForSlot } = useRotaData(user) as RotaDataInterface;

// 3. Computed Props for UI.
const dateRangeLabel = computed(() => {
  if (visibleDays.value.length === 0) {
    return '';
  }
  const start = visibleDays.value[0].label;
  // Fix: Replaced .at(-1) with standard indexing to support older JS targets/libs.
  const end = visibleDays.value.at(-1)?.label || '';
  return `${start} - ${end}`;
});

const isCurrentWeek = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return visibleDays.value.some((d) => d.iso === today);
});

// 4. Modal / Interaction Logic.
const showModal = ref(false);
const selectedCell = ref<SelectedCell | null>(null);

/**
 * Handles clicks on a specific grid slot to open the management modal.
 * @param payload - The event payload containing the row item and clicked day.
 */
const onSlotClick = (payload: SlotClickPayload) => {
  const { rowItem, day } = payload;
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
 * @param payload - The changes payload containing additions and removal IDs.
 */
const onSaveShifts = async (payload: SaveShiftsPayload) => {
  if (!selectedCell.value) {
    return;
  }

  const { additions, removals } = payload;
  const currentCell = selectedCell.value;

  try {
    const practiceId = user.value?.practiceRef?.id;

    if (!practiceId) {
      throw new Error('No practice ID found.');
    }

    // Process all removals in parallel to improve performance.
    await Promise.all(removals.map((id) => deleteShift(id)));

    // Generate specific Firestore references for each new shift entry.
    await Promise.all(
      additions.map((member) => {
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
    await loadData();
    toast.success('Rota updated successfully.');
  } catch {
    toast.error('Failed to save changes.');
  }
};

// Initialises the data load whenever the practice context changes.
watch(
  () => user.value?.practiceRef?.id,
  (id) => {
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

<script setup lang="ts">
/**
 * Main view for the Rota Management feature.
 * Orchestrates the grid, navigation header, and shift modification modals.
 */
import { doc, type DocumentReference } from 'firebase/firestore';
import { computed, ref, watch } from 'vue';

// Components
import AppPageContainer from '@/components/layout/AppPageContainer.vue';
import { useAuth } from '@/composables/useAuth';
import { useBreakpoints } from '@/composables/useBreakpoints';
import { useToast } from '@/composables/useToast';
import RotaGrid from '@/features/rota/components/RotaGrid.vue';
import RotaHeader from '@/features/rota/components/RotaHeader.vue';
import RotaShiftModal from '@/features/rota/components/RotaShiftModal.vue';
import { useRotaData } from '@/features/rota/composables/useRotaData';
import { type RotaDay, useRotaDates } from '@/features/rota/composables/useRotaDates';
import { createShift, deleteShift } from '@/features/rota/rotaApi';
import type { PracticeRole, PracticeSurgery, Shift } from '@/features/rota/rotaTypes';
import { db } from '@/services/firebase';

// --- Types ---

interface RotaRow {
  id: string;
  role: PracticeRole;
  surgery: PracticeSurgery;
}

interface SelectedCell {
  role: PracticeRole;
  surgery: PracticeSurgery;
  date: RotaDay;
  shifts: Shift[];
}

/**
 * Represents a member object emitted by the modal for addition.
 * Matches the structure of 'MappedMember' emitted by RotaShiftModal.
 */
interface ShiftAddition {
  uid: string;
  userRef: DocumentReference;
  name: string;
}

// --- Logic & State ---

const RESIZE_DEBOUNCE_MS = 80;

const { user } = useAuth();
const { error: showToastError } = useToast();
const breakpoints = useBreakpoints(ref(document.body), RESIZE_DEBOUNCE_MS);

// 1. Date Management (includes new responsive logic)
const { visibleDays, monthLabel, changePeriod, changeDay, goToToday, jumpMonth } =
  useRotaDates(breakpoints);

// 2. Data Management
const { flattenedRows, loadData, getShiftsForSlot } = useRotaData(user);

// 3. Computed Props for UI
const dateRangeLabel = computed(() => {
  if (visibleDays.value.length === 0) return '';
  const start = visibleDays.value[0].label;
  // Optional chaining protects against undefined if the array is unexpectedly empty
  const end = visibleDays.value.at(-1)?.label ?? '';
  return `${start} - ${end}`;
});

const isCurrentWeek = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return visibleDays.value.some((d) => d.iso === today);
});

// 4. Modal / Interaction Logic
const showModal = ref(false);
// Explicitly typed to prevent "properties do not exist on type never" errors
const selectedCell = ref<SelectedCell | null>(null);

const onSlotClick = ({ rowItem, day }: { rowItem: RotaRow; day: RotaDay }) => {
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

const onSaveShifts = async ({
  additions,
  removals
}: {
  additions: ShiftAddition[];
  removals: string[];
}) => {
  // Guard clauses ensuring necessary data exists before processing
  if (!user.value?.practiceRef) {
    showToastError('No active practice found.');
    return;
  }
  if (!selectedCell.value) {
    showToastError('No slot selected.');
    return;
  }

  try {
    const practiceId = user.value.practiceRef.id;

    // Process Removals
    await Promise.all(removals.map((id) => deleteShift(id)));

    // Process Additions
    await Promise.all(
      additions.map((member) => {
        // Re-assert existence of selectedCell inside the map callback to satisfy strict null checks
        if (!selectedCell.value) throw new Error('Selected cell context lost.');

        const roleRef = doc(db, `practices/${practiceId}/roles`, selectedCell.value.role.id);
        const surgeryRef = doc(
          db,
          `practices/${practiceId}/surgeries`,
          selectedCell.value.surgery.id
        );

        const payload = {
          date: selectedCell.value.date.iso,
          user_id: member.uid, // Use UID string, not the DocumentReference
          user_name: member.name,
          role_id: roleRef,
          role_name: selectedCell.value.role.name,
          surgery_id: surgeryRef,
          surgery_name: selectedCell.value.surgery.name
        };

        return createShift(payload);
      })
    );

    closeShiftModal();
    loadData();
  } catch {
    showToastError('Failed to save changes');
  }
};

// Initial Data Load Trigger
watch(() => user.value?.practiceRef?.id, loadData, { immediate: true });
</script>

<template>
  <AppPageContainer fluid>
    <RotaHeader
      :date-range-label="dateRangeLabel"
      :is-mobile="breakpoints.isMobile.value"
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
      :date="{ label: selectedCell.date.label, date: selectedCell.date.dateObj }"
      :role="selectedCell.role"
      :shifts="selectedCell.shifts"
      :show="showModal"
      :surgery="selectedCell.surgery"
      @request-close="closeShiftModal"
      @save="onSaveShifts"
    />
  </AppPageContainer>
</template>

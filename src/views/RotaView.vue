<script setup lang="ts">
/**
 * Main view for the Rota Management feature.
 * Orchestrates the grid, navigation header, and shift modification modals.
 */
import { computed, ref, watch } from 'vue';

// Components
import AppPageContainer from '@/components/layout/AppPageContainer.vue';
import { useAuth } from '@/composables/useAuth';
import { useBreakpoints } from '@/composables/useBreakpoints';
import RotaGrid from '@/features/rota/components/RotaGrid.vue';
import RotaHeader from '@/features/rota/components/RotaHeader.vue';
import RotaShiftModal, {
  type RotaShiftModalData
} from '@/features/rota/components/RotaShiftModal.vue';
import { useRotaData } from '@/features/rota/composables/useRotaData';
import { type RotaDay, useRotaDates } from '@/features/rota/composables/useRotaDates';
import type { PracticeRole, PracticeSurgery } from '@/features/rota/rotaTypes';

// --- Types ---

interface RotaRow {
  id: string;
  role: PracticeRole;
  surgery: PracticeSurgery;
}

// --- Logic & State ---

const RESIZE_DEBOUNCE_MS = 80;

const { user } = useAuth();
const breakpoints = useBreakpoints(ref(document.body), RESIZE_DEBOUNCE_MS);

// 1. Date Management (includes new responsive logic)
const { visibleDays, monthLabel, changePeriod, changeDay, goToToday, jumpMonth } =
  useRotaDates(breakpoints);

// 2. Data Management
const { flattenedRows, loadData, getShiftsForSlot } = useRotaData(user);

// 3. Computed Props for UI
const dateRangeLabel = computed(() => {
  if (visibleDays.value.length === 0) return '';
  const start = visibleDays.value[0]!.label;
  const end = visibleDays.value.at(-1)?.label ?? '';
  return `${start} - ${end}`;
});

const isCurrentWeek = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return visibleDays.value.some((d) => d.iso === today);
});

// 4. Modal / Interaction Logic
// Ref to the modal component instance to call open()
const rotaShiftModalRef = ref<InstanceType<typeof RotaShiftModal> | null>(null);

const onSlotClick = ({ rowItem, day }: { rowItem: RotaRow; day: RotaDay }) => {
  const payload: RotaShiftModalData = {
    role: rowItem.role,
    surgery: rowItem.surgery,
    date: day,
    shifts: getShiftsForSlot(rowItem.role.id, rowItem.surgery.id, day.iso)
  };

  rotaShiftModalRef.value?.open(payload);
};

const onShiftsSaved = () => {
  loadData();
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

    <RotaShiftModal ref="rotaShiftModalRef" @saved="onShiftsSaved" />
  </AppPageContainer>
</template>

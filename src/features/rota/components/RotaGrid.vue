<script setup lang="ts">
/**
 * RotaGrid.
 * The core matrix display for the rota system.
 * Renders rows (Role/Surgery combinations) against columns (Days).
 */
import { computed } from 'vue';

import { type RotaDay } from '@/features/rota/composables/useRotaDates';
import { type PracticeRole, type PracticeSurgery, type Shift } from '@/features/rota/rotaTypes';

import RotaSlot from './RotaSlot.vue';

// --- Type Definitions ---

interface RotaRow {
  id: string;
  role: PracticeRole;
  surgery: PracticeSurgery;
}

interface SlotClickPayload {
  rowItem: RotaRow;
  day: RotaDay;
}

// --- Props & Emits ---

const props = defineProps<{
  days: RotaDay[];
  rows: RotaRow[];
  getShifts: (roleId: string, surgeryId: string, dateIso: string) => Shift[];
}>();

const emit = defineEmits<(e: 'slot-click', payload: SlotClickPayload) => void>();

// --- Logic ---

// Determine 'today' based on the provided days prop to ensure consistency with the parent view
const todayIso = computed(() => {
  const today = props.days.find((d) => d.isToday);
  return today ? today.iso : new Date().toISOString().split('T')[0];
});

const isDatePast = (iso: string) => iso < todayIso.value;

/**
 * Handles the user interaction with a specific grid cell.
 * @param row - The row definition (Role/Surgery).
 * @param day - The specific day column.
 */
const handleSlotClick = (row: RotaRow, day: RotaDay) => {
  emit('slot-click', { rowItem: row, day });
};
</script>

<template>
  <div class="rota-grid-wrapper">
    <div class="grid-container">
      <div class="grid-header-row">
        <div class="sticky-col-header"></div>
        <div
          v-for="day in days"
          :key="day.iso"
          class="day-header"
          :class="{ 'is-today': day.isToday, 'is-weekend': day.isWeekend }"
        >
          {{ day.label }}
        </div>
      </div>

      <div v-for="row in rows" :key="row.id" class="grid-body-row">
        <div class="row-label-cell">
          <div class="role-text">{{ row.role.name }}</div>
          <div class="surgery-text">{{ row.surgery.name }}</div>
        </div>

        <RotaSlot
          v-for="day in days"
          :key="day.iso"
          class="grid-cell-slot"
          :is-before-today="isDatePast(day.iso)"
          :is-today="day.isToday"
          :is-weekend="day.isWeekend"
          :role-id="row.role.id"
          :shifts="getShifts(row.role.id, row.surgery.id, day.iso)"
          @click="handleSlotClick(row, day)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout: Scrollable container handling */
.rota-grid-wrapper {
  flex: 1;
  overflow: auto;
  position: relative;
  width: 100%;
}

.grid-container {
  display: inline-block;
  min-width: 100%;
}

/* Grid System: CSS Grid for alignment */
.grid-header-row,
.grid-body-row {
  display: grid;

  /* 1st col: fixed 10rem label, Rest: equal sized day columns */
  grid-template-columns: 10rem repeat(auto-fit, minmax(8rem, 1fr));
}

/* Headers */
.day-header {
  background: #f8fafc;
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.75rem;
  text-align: center;
}

.day-header.is-today {
  background: #eff6ff;
  color: var(--color-primary);
}

.day-header.is-weekend {
  background: #f1f5f9;
}

/* Row Labels */
.row-label-cell {
  background: white;
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 0;
  padding: 0.75rem;
  position: sticky;
  z-index: 10;
}

.role-text {
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 600;
}

.surgery-text {
  color: var(--text-muted);
  font-size: 0.75rem;
}

/* Slots */

/* Override specific slot styles if needed to fit the grid context, though RotaSlot handles most itself */
.grid-cell-slot {
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
}
</style>

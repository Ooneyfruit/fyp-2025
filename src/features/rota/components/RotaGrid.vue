<script setup lang="ts">
/**
 * RotaGrid.
 * The core matrix display for the rota system.
 * Renders rows (Role/Surgery combinations) against columns (Days).
 */
import { type PracticeRole, type PracticeSurgery, type Shift } from '@/features/rota/rotaTypes';

// --- Type Definitions ---

interface RotaDay {
  iso: string;
  label: string;
  isToday: boolean;
  isWeekend: boolean;
}

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

defineProps<{
  days: RotaDay[];
  rows: RotaRow[];
  getShifts: (roleId: string, surgeryId: string, dateIso: string) => Shift[];
}>();

// Fix: Use arrow function syntax for defineEmits to satisfy SonarLint S6598
const emit = defineEmits<(e: 'slot-click', payload: SlotClickPayload) => void>();

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

        <div
          v-for="day in days"
          :key="day.iso"
          class="grid-cell"
          :class="{ 'is-weekend': day.isWeekend }"
          @click="handleSlotClick(row, day)"
        >
          <div class="shift-stack">
            <div
              v-for="shift in getShifts(row.role.id, row.surgery.id, day.iso)"
              :key="shift.id"
              class="shift-pill"
            >
              {{ shift.user_name }}
            </div>
          </div>
        </div>
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

  /* 1st col: fixed 160px label, Rest: equal sized day columns */
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

/* Cells */
.grid-cell {
  background: white;
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  cursor: pointer;
  min-height: 4rem;
  padding: 0.25rem;
  transition: background 0.1s ease;
}

.grid-cell:hover {
  background: #f8fafc;
}

.grid-cell.is-weekend {
  background: #fcfcfc;
}

/* Shift Pills */
.shift-stack {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.shift-pill {
  background: var(--color-primary-light);
  border-radius: 0.25rem;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 500;
  overflow: hidden;
  padding: 0.15rem 0.4rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

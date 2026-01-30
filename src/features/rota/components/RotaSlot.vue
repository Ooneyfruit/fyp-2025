<script setup lang="ts">
/**
 * Rota slot component representing a single shift or empty space in the grid.
 * Handles display of assigned staff initials and edit states.
 */

import { computed, type PropType } from 'vue';

import IconEdit from '@/components/icons/IconEdit.vue';
import IconPlus from '@/components/icons/IconPlus.vue';
import { useRotaColors } from '@/features/rota/composables/useRotaColors';
import type { Shift } from '@/features/rota/rotaTypes';

const MAX_INITIALS = 2;

const props = defineProps({
  shifts: {
    type: Array as PropType<Shift[]>,
    default: () => []
  },
  roleId: {
    type: String as PropType<string | null>,
    default: null
  },
  isWeekend: { type: Boolean, default: false },
  isToday: { type: Boolean, default: false },
  isBeforeToday: { type: Boolean, default: false }
});

defineEmits(['click']);

const { getRoleColor } = useRotaColors();

const hasData = computed(() => props.shifts.length > 0);

const colors = computed(() => getRoleColor(props.roleId || ''));

const pillStyles = computed(() => ({
  backgroundColor: colors.value.bg,
  borderColor: colors.value.accent,
  color: colors.value.accent
}));

/**
 * Extracts the initials from a full name string.
 * @param name - The full name of the staff member.
 */
const getInitials = (name: string | undefined): string => {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, MAX_INITIALS)
    .toUpperCase();
};
</script>

<template>
  <button
    class="rota-slot"
    :class="{
      'has-data': hasData,
      'slot-weekend': isWeekend,
      'slot-past': isBeforeToday && !isWeekend,
      'slot-weekday': !isWeekend && !isBeforeToday,
      'slot-today': isToday,
      'slot-weekend-past': isWeekend && isBeforeToday
    }"
    type="button"
    @click="$emit('click')"
  >
    <div v-for="shift in shifts" :key="shift.id" class="shift-pill" :style="pillStyles">
      <div class="pill-content">
        <span class="initials" :style="{ color: colors.accent }">
          {{ getInitials(shift.user_name) }}
        </span>
        <span class="name" :style="{ color: colors.accent }">
          {{ shift.user_name }}
        </span>
      </div>
    </div>

    <div v-if="hasData" class="edit-overlay">
      <div class="edit-icon-wrapper">
        <IconEdit class="edit-icon" :stroke-width="2" />
      </div>
    </div>

    <div v-else class="empty-placeholder">
      <IconPlus class="plus-icon" :stroke-width="2" />
    </div>
  </button>
</template>

<style scoped>
.rota-slot {
  /* Reset button styles */
  appearance: none;
  background: transparent;
  border: 1px solid transparent; /* Default transparent border */
  border-radius: var(--border-radius);
  color: inherit;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-family: inherit;
  gap: 0.25rem;
  height: 100%;
  justify-content: center;
  margin: 0;
  min-height: 4rem;
  padding: 0.25rem;
  position: relative;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;
}

/* --- State Styling --- */

.rota-slot.slot-weekday {
  background-color: white;
  border: 1px solid #e2e8f0;
}

.rota-slot.slot-weekend {
  background-color: #f3f4f6;
  border: 1px solid #e2e4e7;
}

.rota-slot.slot-weekend-past {
  background-color: #f3f4f6;
  border: 1px solid transparent;
}

/* New style for past days (mild grey) */
.rota-slot.slot-past {
  background-color: transparent;
  border: 0 solid #e2e8f0;
}

.rota-slot.slot-today {
  background-color: #eff6ff;
  border: 1px solid #93c5fd;
}

/* Hover States */
.rota-slot:hover {
  background-color: white;
  border-color: #3b82f6 !important;
  box-shadow: 0 4px 6px -1px rgb(59 130 246 / 10%);
  z-index: 10;
}

.rota-slot:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Data Present State */
.rota-slot.has-data.slot-weekday {
  border-color: #e2e8f0;
}

.rota-slot.has-data.slot-weekend {
  background-color: #f3f4f6;
  border-color: transparent;
}

.rota-slot.has-data.slot-past {
  background-color: transparent;
}

.rota-slot.has-data.slot-today {
  background-color: #eff6ff;
  border-color: #93c5fd;
}

.rota-slot.has-data:hover {
  background-color: white;
  border-color: #3b82f6;
}

/* --- Placeholders & Overlays --- */

/* 1. Empty State Plus Icon */
.empty-placeholder {
  align-items: center;
  color: #64748b; /* Updated to Slate 500 for better contrast against white/grey */
  display: flex;
  inset: 0;
  justify-content: center;
  opacity: 0;
  pointer-events: none; /* Allows hover/click to pass through to .rota-slot */
  position: absolute;
  transition: all 0.2s ease;
}

/* Modified: Only show placeholder on hover for all slots, including Today */
.rota-slot:hover .empty-placeholder {
  color: #3b82f6;
  opacity: 1;
  transform: scale(1.1);
}

.rota-slot.slot-today .empty-placeholder {
  color: #93c5fd;
}

.rota-slot.slot-today:hover .empty-placeholder {
  color: #3b82f6;
}

/* 2. Occupied State Edit Overlay */
.edit-overlay {
  align-items: center;
  background-color: rgb(255 255 255 / 60%);
  border-radius: var(--border-radius);
  display: flex;
  inset: 0;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: opacity 0.2s ease;
}

.rota-slot:hover .edit-overlay {
  opacity: 1;
}

.edit-icon-wrapper {
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 10%);
  color: var(--color-primary);
  display: flex;
  padding: 6px;
}

.edit-icon {
  height: 1rem;
  width: 1rem;
}

/* UPDATED: Reduced size to be visually consistent with the edit icon */
.plus-icon {
  height: 1.15rem;
  width: 1.15rem;
}

/* --- Pill Styling --- */
.shift-pill {
  border-radius: 999px;
  border-style: solid;
  border-width: 1px;
  max-width: 100%;
  padding: 0.125rem 0.5rem;
}

.pill-content {
  align-items: center;
  display: flex;
  gap: 0.35rem;
  overflow: hidden;
}

.initials {
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 800;
}

.name {
  font-size: 0.75rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

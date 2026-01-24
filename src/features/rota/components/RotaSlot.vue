<script setup lang="ts">
/**
 * RotaSlot.
 * Primary responsibility: provides a grid cell for the rota, displaying assigned staff
 * or an empty placeholder. Supports dynamic colouring based on the associated Role.
 */
import { computed } from 'vue';

import IconEdit from '@/components/icons/IconEdit.vue';
import IconPlus from '@/components/icons/IconPlus.vue';
import { useRotaColors } from '@/features/rota/composables/useRotaColors';
import type { Shift } from '@/features/rota/rotaTypes';

const props = withDefaults(
  defineProps<{
    shifts?: Shift[];
    roleId?: string;
    isWeekend?: boolean;
    isToday?: boolean;
    isBeforeToday?: boolean;
  }>(),
  {
    shifts: () => [],
    roleId: '',
    isWeekend: false,
    isToday: false,
    isBeforeToday: false
  }
);

// Logic: Refactored to function type to satisfy sonarlint:S6598
const emit = defineEmits<(e: 'click') => void>();

const { getRoleColor } = useRotaColors();

// Constants to eliminate magic numbers.
const INITIALS_LIMIT = 2;

const hasData = computed(() => props.shifts.length > 0);

// Logic: Handles undefined roleId gracefully via useRotaColors
const colors = computed(() => getRoleColor(props.roleId || undefined));

const pillStyles = computed(() => ({
  backgroundColor: colors.value.bg,
  borderColor: colors.value.accent,
  color: colors.value.accent
}));

/**
 * Extracts initials from a user's name.
 * @param [name] - The display name to process.
 * @returns The formatted initials (e.g. "JD").
 */
const getInitials = (name?: string): string => {
  if (!name) {
    return '??';
  }

  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, INITIALS_LIMIT)
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
    @click="emit('click')"
  >
    <div v-if="hasData" class="slot-contents">
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

      <div class="edit-overlay">
        <div class="edit-icon-wrapper">
          <IconEdit class="edit-icon" :stroke-width="2" />
        </div>
      </div>
    </div>

    <div v-else class="empty-placeholder">
      <IconPlus class="plus-icon" :stroke-width="2" />
    </div>
  </button>
</template>

<style scoped>
.rota-slot {
  background: none;
  border: none;
  border-radius: 0; /* Reset for grid */
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-family: inherit;
  gap: 0.25rem;
  height: 100%;
  justify-content: center;
  min-height: 4rem;
  padding: 0.25rem;
  position: relative;
  transition: all 0.2s ease;
  width: 100%;
}

/* Logic: allows children to ignore this wrapper's box model for grid layouts. */
.slot-contents {
  display: contents;
}

/* --- State Styling --- */

.rota-slot.slot-weekday {
  background-color: white;
}

.rota-slot.slot-weekend {
  background-color: #f3f4f6;
}

.rota-slot.slot-weekend-past {
  background-color: #f3f4f6;
}

.rota-slot.slot-past {
  background-color: transparent;
}

.rota-slot.slot-today {
  background-color: #eff6ff;

  /* Highlight border for today, overriding default grid border */
  box-shadow: inset 0 0 0 1px #93c5fd;
}

/* Hover States. */
.rota-slot:hover {
  background-color: white;
  box-shadow: inset 0 0 0 2px #3b82f6;
  z-index: 10;
}

.rota-slot:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

/* Data Present State. */
.rota-slot.has-data.slot-today {
  background-color: #eff6ff;
}

/* --- Placeholders & Overlays --- */

.empty-placeholder {
  align-items: center;
  color: #475569;
  display: flex;
  inset: 0;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: all 0.2s ease;
}

.rota-slot:hover .empty-placeholder {
  color: #3b82f6;
  opacity: 1;
  transform: scale(1.1);
}

.edit-overlay {
  align-items: center;
  background-color: rgb(255 255 255 / 60%);
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
  color: #1d4ed8;
  display: flex;
  padding: 6px;
}

.edit-icon {
  height: 1rem;
  width: 1rem;
}

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

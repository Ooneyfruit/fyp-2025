<script setup lang="ts">
/**
 * Rota slot component.
 * Primary responsibility: represents an individual cell in the rota grid,
 * displaying assigned shifts or providing an interface to create new ones.
 */
import { computed } from 'vue';

import { type Shift } from '@/features/rota/rotaTypes';

import RotaAssignedStaff from './RotaAssignedStaff.vue';

interface Props {
  /** The collection of shifts assigned to this specific slot. */
  shifts: Shift[];
  /** Indicates if the slot falls on a weekend. */
  isWeekend?: boolean;
  /** Indicates if the date of this slot is in the past. */
  isPast?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isWeekend: false,
  isPast: false
});

/**
 * Emits a selection event when the slot is clicked.
 */
const emit = defineEmits<{
  select: [];
}>();

const hasShifts = computed(() => props.shifts.length > 0);

/**
 * Handles the click event on the slot container.
 */
const handleClick = (): void => {
  emit('select');
};
</script>

<template>
  <div
    class="rota-slot"
    :class="{
      'is-weekend': isWeekend,
      'is-past': isPast,
      'has-shifts': hasShifts
    }"
    @click="handleClick"
  >
    <RotaAssignedStaff v-if="hasShifts" :shifts="shifts" />

    <div v-else-if="!isPast" class="slot-placeholder">
      <span class="plus-icon">+</span>
    </div>
  </div>
</template>

<style scoped>
.rota-slot {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  cursor: pointer;
  min-height: 80px;
  padding: 0.5rem;
  position: relative;
  transition: background-color 0.2s ease;
}

.rota-slot:hover {
  background-color: var(--color-background-soft);
}

.rota-slot.is-weekend {
  background-color: var(--color-background-mute);
}

.rota-slot.is-past {
  cursor: default;
  opacity: 0.7;
}

.rota-slot.has-shifts {
  cursor: pointer;
}

.slot-placeholder {
  align-items: center;
  color: var(--color-text-light);
  display: flex;
  font-size: 1.5rem;
  height: 100%;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.rota-slot:hover .slot-placeholder {
  opacity: 1;
}

.plus-icon {
  font-weight: 300;
}
</style>

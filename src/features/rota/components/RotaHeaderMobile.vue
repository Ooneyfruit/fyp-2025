<script setup lang="ts">
/**
 * Rota navigation controls for mobile viewports.
 * Provides single-day stepping and a full month/year picker.
 */

import { ref } from 'vue';

import IconCalendar from '@/components/icons/IconCalendar.vue';
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue';
import IconChevronRight from '@/components/icons/IconChevronRight.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import RotaDatePicker from '@/features/rota/RotaDatePicker.vue';

const props = defineProps({
  dateRangeLabel: { type: String, required: true },
  monthLabel: { type: String, required: true },
  showTodayButton: { type: Boolean, default: false },
  currentDate: { type: Date, default: () => new Date() }
});

const emit = defineEmits(['navigate-day', 'jump-today', 'jump-to-date']);

/**
 * Template reference for the RotaDatePicker component.
 */
const datePicker = ref<InstanceType<typeof RotaDatePicker> | null>(null);

const handleDateUpdate = (date: Date) => {
  emit('jump-to-date', date);
};
</script>

<template>
  <div class="mobile-nav-bar">
    <BaseButton
      :icon="IconChevronLeft"
      title="Back 1 Day"
      variant="ghost"
      @click="$emit('navigate-day', -1)"
      >1d</BaseButton
    >

    <div class="date-picker-wrapper">
      <span class="month-label">{{ monthLabel }}</span>
      <BaseButton
        class="date-picker-trigger"
        :icon="IconCalendar"
        :label="dateRangeLabel"
        variant="primary"
        @click="datePicker?.open()"
      />
    </div>

    <BaseButton
      :icon="IconChevronRight"
      icon-position="right"
      title="Forward 1 Day"
      variant="ghost"
      @click="$emit('navigate-day', 1)"
      >1d</BaseButton
    >

    <button
      v-if="showTodayButton"
      class="today-link-mobile"
      type="button"
      @click.stop="$emit('jump-today')"
    >
      Today
    </button>

    <RotaDatePicker
      ref="datePicker"
      :current-date="props.currentDate"
      @update:date="handleDateUpdate"
    />
  </div>
</template>

<style scoped>
.mobile-nav-bar {
  align-items: flex-end;
  display: flex;
  gap: var(--spacing-sm);
  justify-content: space-between;
  margin-bottom: 1.5rem; /* Reserve space for the 'Today' button below */
  position: relative; /* For absolute positioning of today link */
}

.date-picker-wrapper {
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 0.25rem;
}

.month-label {
  color: var(--text-main, #374151);
  font-size: 0.85rem;
  font-weight: 600;
}

.date-picker-trigger {
  width: 100%;
}

.today-link-mobile {
  background: none;
  border: none;
  bottom: -1.5rem; /* Position below the nav bar */
  color: var(--primary-colour);
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 700;
  left: 50%;
  padding: 2px;
  position: absolute;
  transform: translateX(-50%);
}
</style>

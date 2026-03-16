<script setup lang="ts">
/**
 * High-level orchestration for the Rota navigation system.
 * Delegates all control rendering to the responsive child components.
 */

import AppPageHeaderGroup from '@/components/layout/AppPageHeaderGroup.vue';

import RotaHeaderDesktop from './RotaHeaderDesktop.vue';
import RotaHeaderMobile from './RotaHeaderMobile.vue';

defineProps({
  title: { type: String, default: 'Practice Rota' },
  monthLabel: { type: String, default: '' },
  dateRangeLabel: { type: String, default: '' },
  showTodayButton: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  // The current date is needed for the mobile date picker initial state.
  currentDate: { type: Date, default: () => new Date() }
});

const emit = defineEmits([
  'navigate-month',
  'navigate-period',
  'navigate-day',
  'jump-today',
  'jump-to-date'
]);

const handleJumpToDate = (date: Date) => {
  emit('jump-to-date', date);
};
</script>

<template>
  <div class="rota-header-container">
    <AppPageHeaderGroup :title="title" />

    <div class="rota-nav-wrapper">
      <RotaHeaderMobile
        v-if="isMobile"
        :current-date="currentDate"
        :date-range-label="dateRangeLabel"
        :month-label="monthLabel"
        :show-today-button="showTodayButton"
        @jump-to-date="handleJumpToDate"
        @jump-today="$emit('jump-today')"
        @navigate-day="$emit('navigate-day', $event)"
      />

      <RotaHeaderDesktop
        v-else
        :date-range-label="dateRangeLabel"
        :month-label="monthLabel"
        :show-today-button="showTodayButton"
        @jump-today="$emit('jump-today')"
        @navigate-month="$emit('navigate-month', $event)"
        @navigate-period="$emit('navigate-period', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.rota-header-container {
  margin-bottom: var(--spacing-lg);
}

.rota-nav-wrapper {
  margin-top: var(--spacing-sm);
  padding-inline: var(--spacing-md);
}

@media (width >= 80rem) {
  .rota-nav-wrapper {
    padding-inline: 0;
  }
}
</style>

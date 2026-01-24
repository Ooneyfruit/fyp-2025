<script setup lang="ts">
import AppPageHeaderGroup from '@/components/layout/AppPageHeaderGroup.vue';

import RotaHeaderDesktop from './RotaHeaderDesktop.vue';
import RotaHeaderMobile from './RotaHeaderMobile.vue';

/**
 * High-level orchestration for the Rota navigation system.
 * Delegates all control rendering to the responsive child components.
 */

withDefaults(
  defineProps<{
    title?: string;
    monthLabel?: string;
    dateRangeLabel?: string;
    showTodayButton?: boolean;
    isMobile?: boolean;
  }>(),
  {
    title: 'Practice Rota',
    monthLabel: '',
    dateRangeLabel: '',
    showTodayButton: false,
    isMobile: false
  }
);

const emit = defineEmits<{
  (e: 'navigate-month', direction: number): void;
  (e: 'navigate-period', direction: number): void;
  (e: 'navigate-day', direction: number): void;
  (e: 'jump-today'): void;
}>();
</script>

<template>
  <div class="rota-header-container">
    <AppPageHeaderGroup :title="title" />

    <div class="rota-nav-wrapper">
      <RotaHeaderMobile
        v-if="isMobile"
        :date-range-label="dateRangeLabel"
        :month-label="monthLabel"
        :show-today-button="showTodayButton"
        @jump-today="emit('jump-today')"
        @navigate-day="emit('navigate-day', $event)"
        @navigate-month="emit('navigate-month', $event)"
        @navigate-period="emit('navigate-period', $event)"
      />

      <RotaHeaderDesktop
        v-else
        :date-range-label="dateRangeLabel"
        :month-label="monthLabel"
        :show-today-button="showTodayButton"
        @jump-today="emit('jump-today')"
        @navigate-month="emit('navigate-month', $event)"
        @navigate-period="emit('navigate-period', $event)"
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

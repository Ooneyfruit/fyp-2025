<script setup lang="ts">
/**
 * (needs description).
 */

import AppPageHeaderGroup from '@/components/layout/AppPageHeaderGroup.vue';

import RotaHeaderDesktop from './RotaHeaderDesktop.vue';
import RotaHeaderMobile from './RotaHeaderMobile.vue';

/**
 * High-level orchestration for the Rota navigation system.
 * Delegates all control rendering to the responsive child components.
 */

defineProps({
  title: { type: String, default: 'Practice Rota' },
  monthLabel: { type: String, default: '' },
  dateRangeLabel: { type: String, default: '' },
  showTodayButton: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false }
});

defineEmits(['navigate-month', 'navigate-period', 'navigate-day', 'jump-today']);
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
        @jump-today="$emit('jump-today')"
        @navigate-day="$emit('navigate-day', $event)"
        @navigate-month="$emit('navigate-month', $event)"
        @navigate-period="$emit('navigate-period', $event)"
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

<script setup lang="ts">
/**
 * RotaHeader.
 * Controls date navigation and period selection for the rota grid.
 */
import IconCalendar from '@/components/icons/IconCalendar.vue';
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue';
import IconChevronRight from '@/components/icons/IconChevronRight.vue';
import BaseButton from '@/components/shared/BaseButton.vue';

defineProps<{
  monthLabel: string;
  dateRangeLabel: string;
  isMobile: boolean;
  showTodayButton: boolean;
}>();

const emit = defineEmits<{
  (e: 'navigate-period', direction: number): void;
  (e: 'navigate-day', direction: number): void;
  (e: 'navigate-month', direction: number): void;
  (e: 'jump-today'): void;
}>();
</script>

<template>
  <header class="rota-header">
    <div class="header-group left">
      <div v-if="isMobile" class="nav-controls mobile">
        <BaseButton
          :icon="IconChevronLeft"
          icon-only
          variant="secondary"
          @click="emit('navigate-day', -1)"
        />
        <span class="date-label">{{ monthLabel }}</span>
        <BaseButton
          :icon="IconChevronRight"
          icon-only
          variant="secondary"
          @click="emit('navigate-day', 1)"
        />
      </div>

      <div v-else class="nav-controls desktop">
        <div class="month-stepper">
          <BaseButton
            :icon="IconChevronLeft"
            icon-only
            variant="ghost"
            @click="emit('navigate-month', -1)"
          />
          <h2 class="month-title">{{ monthLabel }}</h2>
          <BaseButton
            :icon="IconChevronRight"
            icon-only
            variant="ghost"
            @click="emit('navigate-month', 1)"
          />
        </div>
        <BaseButton
          v-if="showTodayButton"
          class="today-btn"
          label="Today"
          size="sm"
          variant="secondary"
          @click="emit('jump-today')"
        />
      </div>
    </div>

    <div class="header-group right">
      <div v-if="!isMobile" class="week-stepper">
        <BaseButton
          :icon="IconChevronLeft"
          icon-only
          variant="secondary"
          @click="emit('navigate-period', -1)"
        />
        <div class="range-display">
          <IconCalendar class="calendar-icon" />
          <span class="range-text">{{ dateRangeLabel }}</span>
        </div>
        <BaseButton
          :icon="IconChevronRight"
          icon-only
          variant="secondary"
          @click="emit('navigate-period', 1)"
        />
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Layout: Flex container for the header bar */
.rota-header {
  align-items: center;
  background: white;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  height: 4rem;
  justify-content: space-between;
  padding: 0 var(--spacing-md);
  width: 100%;
}

.header-group {
  align-items: center;
  display: flex;
  gap: var(--spacing-md);
}

/* Typography & Controls */
.month-title {
  color: var(--text-main);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  min-width: 9rem;
  text-align: center;
}

.month-stepper {
  align-items: center;
  display: flex;
  gap: 0.25rem;
}

.nav-controls.mobile {
  display: flex;
  gap: var(--spacing-sm);
  width: 100%;
}

.date-label {
  align-items: center;
  display: flex;
  flex: 1;
  font-weight: 600;
  justify-content: center;
  white-space: nowrap;
}

/* Week Stepper Styling */
.week-stepper {
  align-items: center;
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  display: flex;
  padding: 0.125rem;
}

.range-display {
  align-items: center;
  color: var(--text-muted);
  display: flex;
  font-size: 0.875rem;
  font-weight: 500;
  gap: 0.5rem;
  min-width: 10rem;
  padding: 0 1rem;
}

.calendar-icon {
  height: 1rem;
  opacity: 0.7;
  width: 1rem;
}
</style>

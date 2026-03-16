<script setup lang="ts">
/**
 * Desktop header component for the rota view, providing navigation controls.
 *
 * This component renders the top navigation bar for the rota on desktop
 * resolutions. It includes buttons for moving forward and backward by
 * weeks or months, and displays the current date range and month labels.
 * It communicates with the parent component by emitting navigation events.
 */

import IconChevronDoubleLeft from '@/components/icons/IconChevronDoubleLeft.vue';
import IconChevronDoubleRight from '@/components/icons/IconChevronDoubleRight.vue';
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue';
import IconChevronRight from '@/components/icons/IconChevronRight.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import BaseSelectorBar from '@/components/shared/BaseSelectorBar.vue';

defineProps({
  dateRangeLabel: { type: String, required: true },
  monthLabel: { type: String, required: true },
  showTodayButton: { type: Boolean, default: false }
});

defineEmits(['navigate-month', 'navigate-period', 'jump-today']);
</script>

<template>
  <BaseSelectorBar>
    <BaseButton
      :icon="IconChevronDoubleLeft"
      title="Back 1 Month"
      variant="ghost"
      @click="$emit('navigate-month', -1)"
    >
      Month
    </BaseButton>

    <BaseButton
      :icon="IconChevronLeft"
      title="Back 1 Week"
      variant="outline"
      @click="$emit('navigate-period', -1)"
    >
      Prev Week
    </BaseButton>

    <div class="date-info">
      <span class="month-label">{{ monthLabel }}</span>
      <span class="range-label">{{ dateRangeLabel }}</span>

      <button v-if="showTodayButton" class="today-link-desktop" @click="$emit('jump-today')">
        Back to Today
      </button>
    </div>

    <BaseButton
      :icon="IconChevronRight"
      icon-position="right"
      title="Forward 1 Week"
      variant="outline"
      @click="$emit('navigate-period', 1)"
    >
      Next Week
    </BaseButton>

    <BaseButton
      :icon="IconChevronDoubleRight"
      icon-position="right"
      title="Forward 1 Month"
      variant="ghost"
      @click="$emit('navigate-month', 1)"
    >
      Month
    </BaseButton>
  </BaseSelectorBar>
</template>

<style scoped>
.date-info {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;

  /* Min-width ensures buttons don't move when month name length changes */
  min-width: 16rem;
  text-align: center;
}

.range-label {
  color: var(--text-main);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.month-label {
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-top: 2px;
}

/* In-flow button styling */
.today-link-desktop {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  height: 1.2rem; /* Fixed height context */
  line-height: 1;
  margin-top: 4px;
  padding: 2px 4px;
  text-decoration: none;
}

.today-link-desktop:hover {
  text-decoration: underline;
}

.today-link-placeholder {
  height: 1.2rem; /* Keeps vertical rhythm consistent even when button is hidden */
  margin-top: 4px;
  width: 1px;
}
</style>

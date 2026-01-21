<template>
  <div class="rota-header-controls">
    <BaseButton 
      variant="ghost"
      @click="$emit('navigate-month', -1)"
      aria-label="Previous Month"
      title="Back 1 Month"
    >
      Prev Month
    </BaseButton>

    <BaseButton 
      variant="outline"
      @click="$emit('navigate-period', -1)"
      :aria-label="`Previous ${periodLabel}`"
      icon-position="left"
    >
      <template #icon>
        <IconChevronDown class="icon-rotate-90" />
      </template>
      Prev {{ periodLabel }}
    </BaseButton>
    
    <div class="date-controls">
      <span class="date-range">{{ dateRangeLabel }}</span>
      <BaseButton 
        v-if="showTodayButton"
        variant="ghost" 
        class="today-btn"
        @click="$emit('jump-today')"
      >
        Back to Today
      </BaseButton>
    </div>

    <BaseButton 
      variant="outline"
      @click="$emit('navigate-period', 1)"
      :aria-label="`Next ${periodLabel}`"
      icon-position="right"
    >
      Next {{ periodLabel }}
      <template #icon>
        <IconChevronDown class="icon-rotate-270" />
      </template>
    </BaseButton>

    <BaseButton 
      variant="ghost"
      @click="$emit('navigate-month', 1)"
      aria-label="Next Month"
      title="Forward 1 Month"
    >
      Next Month
    </BaseButton>
  </div>
</template>

<script setup>
import BaseButton from '../../../components/shared/BaseButton.vue';
import IconChevronDown from '../../../components/icons/IconChevronDown.vue';

/**
 * Renders the navigation controls for the Rota view.
 * Handles period navigation (weeks/days) and date resetting.
 */

defineProps({
  periodLabel: { type: String, required: true },
  dateRangeLabel: { type: String, default: '' },
  showTodayButton: { type: Boolean, default: false }
});

defineEmits(['navigate-month', 'navigate-period', 'jump-today']);
</script>

<style scoped>
.rota-header-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.date-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 9rem;
}

.date-range {
  font-weight: 600;
  color: var(--text-main);
  text-align: center;
}

/* Button override for the "Today" action to make it distinct */
.rota-header-controls .today-btn {
  color: var(--primary-color);
  font-weight: 600;
  margin-top: -4px;
  height: auto;
  padding: 2px 8px;
}

.rota-header-controls .today-btn:hover {
  background-color: #eff6ff;
}

/* Utility classes for icon direction */
.icon-rotate-90 { transform: rotate(90deg); }
.icon-rotate-270 { transform: rotate(-90deg); }
</style>
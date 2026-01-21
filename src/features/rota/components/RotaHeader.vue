<template>
  <div class="rota-header-section">
    <AppPageHeaderGroup :title="title">
      <div class="controls">
        
        <BaseButton 
          variant="ghost"
          @click="$emit('navigate-month', -1)"
          aria-label="Previous Month"
          title="Back 1 Month"
          class="nav-btn-text"
        >
          Prev Month
        </BaseButton>

        <BaseButton 
          variant="outline"
          @click="$emit('navigate-period', -1)"
          :aria-label="periodLabelPrev"
          :title="periodLabelPrev"
        >
          <template #icon>
            <IconChevronDown class="rotate-90" />
          </template>
          {{ periodButtonTextPrev }}
        </BaseButton>
        
        <BaseButton 
          v-if="isMobile"
          variant="ghost"
          class="icon-btn-sm"
          @click="$emit('navigate-day', -1)"
          aria-label="Previous Day"
          title="Back 1 Day"
        >
          <IconChevronDown class="rotate-90" />
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
          v-if="isMobile"
          variant="ghost" 
          class="icon-btn-sm"
          @click="$emit('navigate-day', 1)"
          aria-label="Next Day"
          title="Forward 1 Day"
        >
          <IconChevronDown class="rotate-270" />
        </BaseButton>

        <BaseButton 
          variant="outline"
          @click="$emit('navigate-period', 1)"
          :aria-label="periodLabelNext"
          :title="periodLabelNext"
        >
          {{ periodButtonTextNext }}
          <IconChevronDown class="rotate-270 icon-right" />
        </BaseButton>

        <BaseButton 
          variant="ghost"
          @click="$emit('navigate-month', 1)"
          aria-label="Next Month"
          title="Forward 1 Month"
          class="nav-btn-text"
        >
          Next Month
        </BaseButton>

      </div>
    </AppPageHeaderGroup>
    
    <div class="rota-subtitle">{{ monthLabel }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import AppPageHeaderGroup from '../../../components/layout/AppPageHeaderGroup.vue';
import BaseButton from '../../../components/shared/BaseButton.vue';
import IconChevronDown from '../../../components/icons/IconChevronDown.vue';

/**
 * Header component for the Rota view.
 * Displays navigation controls for periods, days, and months.
 */
const props = defineProps({
  title: { type: String, default: 'Practice Rota' },
  monthLabel: { type: String, default: '' },
  dateRangeLabel: { type: String, default: '' },
  showTodayButton: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false }
});

defineEmits(['navigate-month', 'navigate-period', 'navigate-day', 'jump-today']);

// Computed labels for dynamic verbiage (3 Days vs Week)
const periodButtonTextPrev = computed(() => props.isMobile ? 'Prev 3 Days' : 'Prev Week');
const periodButtonTextNext = computed(() => props.isMobile ? 'Next 3 Days' : 'Next Week');

const periodLabelPrev = computed(() => props.isMobile ? 'Back 3 Days' : 'Back 1 Week');
const periodLabelNext = computed(() => props.isMobile ? 'Forward 3 Days' : 'Forward 1 Week');
</script>

<style scoped>
.rota-header-section { margin-bottom: var(--spacing-md); }

.rota-subtitle {
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 500;
  margin-top: -0.5rem;
  margin-left: 2px;
}

.controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap; /* Allows wrapping on very small screens if necessary */
}

.date-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 9rem;
  padding: 0 var(--spacing-xs);
}

.date-range {
  font-weight: 600;
  color: var(--text-main);
  text-align: center;
}

.today-btn {
  color: var(--primary-color) !important;
  font-weight: 600;
  margin-top: -4px;
  height: auto;
  padding: 2px 8px;
}

.today-btn:hover {
  background: #eff6ff !important;
}

/* Specific Utilities */
.icon-btn-sm {
  padding: 4px;
  height: auto;
  min-width: auto;
  color: var(--text-muted);
}
.icon-btn-sm:hover {
  color: var(--primary-color);
  background-color: var(--bg-hover);
}

.nav-btn-text {
  min-width: fit-content;
}

/* Icon Utilities */
.rotate-90 { transform: rotate(90deg); }
.rotate-270 { transform: rotate(-90deg); }

.icon-right {
  display: inline-block;
  vertical-align: middle;
  width: 1.15rem;
  height: 1.15rem;
  margin-left: 0.5rem;
  transform: rotate(-90deg) translateY(1px); 
}
</style>
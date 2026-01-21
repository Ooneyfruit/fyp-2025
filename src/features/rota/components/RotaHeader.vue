<template>
  <div class="rota-header-section">
    <AppPageHeaderGroup :title="title">
      <div class="controls">
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
          aria-label="Previous Week"
        >
          <template #icon>
            <IconChevronDown class="rotate-90" />
          </template>
          Prev Week
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
          aria-label="Next Week"
        >
          Next Week
          <IconChevronDown class="rotate-270 icon-right" />
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
    </AppPageHeaderGroup>
    
    <div class="rota-subtitle">{{ monthLabel }}</div>
  </div>
</template>

<script setup>
import AppPageHeaderGroup from '../../../components/layout/AppPageHeaderGroup.vue';
import BaseButton from '../../../components/shared/BaseButton.vue';
import IconChevronDown from '../../../components/icons/IconChevronDown.vue';

defineProps({
  title: { type: String, default: 'Practice Rota' },
  monthLabel: { type: String, default: '' },
  dateRangeLabel: { type: String, default: '' },
  showTodayButton: { type: Boolean, default: false }
});

defineEmits(['navigate-month', 'navigate-period', 'jump-today']);
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

/* Icon Utilities */
.rotate-90 { transform: rotate(90deg); }
.rotate-270 { transform: rotate(-90deg); }

/* Custom styling to align the right-side icon in the Next Week button */
.icon-right {
  display: inline-block;
  vertical-align: middle;
  width: 1.15rem;
  height: 1.15rem;
  margin-left: 0.5rem;
  /* Visual adjustment to match BaseButton's icon alignment */
  transform: rotate(-90deg) translateY(1px); 
}
</style>
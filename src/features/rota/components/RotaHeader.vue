<template>
  <div class="rota-header-section">
    <AppPageHeaderGroup :title="title">
      <RotaHeaderControls 
        :period-label="periodLabel"
        :date-range-label="dateRangeLabel"
        :show-today-button="showTodayButton"
        @navigate-month="$emit('navigate-month', $event)"
        @navigate-period="$emit('navigate-period', $event)"
        @jump-today="$emit('jump-today')"
      />
    </AppPageHeaderGroup>
    
    <div class="rota-subtitle">{{ monthLabel }}</div>
  </div>
</template>

<script setup>
import AppPageHeaderGroup from '../../../components/layout/AppPageHeaderGroup.vue';
import RotaHeaderControls from './RotaHeaderControls.vue';

defineProps({
  title: { type: String, default: 'Practice Rota' },
  monthLabel: { type: String, default: '' },
  periodLabel: { type: String, default: 'Week' },
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
</style>
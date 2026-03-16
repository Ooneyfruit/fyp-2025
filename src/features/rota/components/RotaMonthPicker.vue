<script setup lang="ts">
/**
 * A 4x3 grid for quickly selecting a month within the current year.
 */
import { computed } from 'vue';

const props = defineProps<{
  currentMonth: number;
  viewYear: number;
}>();

const emit = defineEmits<(e: 'select-month', monthIndex: number) => void>();

const REFERENCE_YEAR = 2000;

const months = computed(() => {
  const formatter = new Intl.DateTimeFormat('default', { month: 'short' });
  return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(REFERENCE_YEAR, i, 1)));
});

const isActualCurrentMonth = (index: number) => {
  const now = new Date();
  return now.getFullYear() === props.viewYear && now.getMonth() === index;
};
</script>

<template>
  <div class="month-grid">
    <button
      v-for="(month, index) in months"
      :key="month"
      class="month-cell"
      :class="{
        'is-selected': index === currentMonth,
        'is-current-month': isActualCurrentMonth(index)
      }"
      type="button"
      @click="emit('select-month', index)"
    >
      {{ month }}
    </button>
  </div>
</template>

<style scoped>
.month-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 1rem;
}

.month-cell {
  align-items: center;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  font-weight: 400;
  justify-content: center;
  padding: 0.75rem 0.25rem;
  position: relative;
  transition: all 0.2s;
}

.month-cell.is-selected {
  background-color: #eff6ff;
  border-color: #bfdbfe;
  color: #1e3a8a;
}

.month-cell.is-current-month {
  font-weight: 900;
}

.month-cell.is-current-month::after {
  background-color: var(--primary-color, #3b82f6);
  border-radius: 50%;
  bottom: 6px;
  content: '';
  height: 4px;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: 4px;
}

.month-cell:hover {
  background-color: #e5e7eb;
}
</style>

<template>
  <BaseSelectorBar>
    <BaseButton 
      variant="ghost" 
      :icon="IconChevronDoubleLeft" 
      title="Back 1 Month"
      @click="$emit('navigate-month', -1)"
    >
      Month
    </BaseButton>

    <BaseButton 
      variant="outline" 
      :icon="IconChevronLeft" 
      title="Back 1 Week"
      @click="$emit('navigate-period', -1)"
    >
      Prev Week
    </BaseButton>

    <div class="date-info">
      <span class="month-label">{{ monthLabel }}</span>
      <span class="range-label">{{ dateRangeLabel }}</span>
      
      <button 
        v-if="showTodayButton"
        class="today-link-desktop"
        @click="$emit('jump-today')"
      >
        Back to Today
      </button>
    </div>

    <BaseButton 
      variant="outline" 
      :icon="IconChevronRight" 
      icon-position="right"
      title="Forward 1 Week"
      @click="$emit('navigate-period', 1)"
    >
      Next Week
    </BaseButton>

    <BaseButton 
      variant="ghost" 
      :icon="IconChevronDoubleRight" 
      icon-position="right"
      title="Forward 1 Month"
      @click="$emit('navigate-month', 1)"
    >
      Month
    </BaseButton>
  </BaseSelectorBar>
</template>

<script setup>
import BaseSelectorBar from '../../../components/shared/BaseSelectorBar.vue';
import BaseButton from '../../../components/shared/BaseButton.vue';
import IconChevronLeft from '../../../components/icons/IconChevronLeft.vue';
import IconChevronRight from '../../../components/icons/IconChevronRight.vue';
import IconChevronDoubleLeft from '../../../components/icons/IconChevronDoubleLeft.vue';
import IconChevronDoubleRight from '../../../components/icons/IconChevronDoubleRight.vue';

defineProps({
  dateRangeLabel: { type: String, required: true },
  monthLabel: { type: String, required: true },
  showTodayButton: { type: Boolean, default: false }
});

defineEmits(['navigate-month', 'navigate-period', 'jump-today']);
</script>

<style scoped>
.date-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  /* Min-width ensures buttons don't move when month name length changes */
  min-width: 16rem; 
}

.range-label {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
}

.month-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  margin-top: 2px;
}

/* In-flow button styling */
.today-link-desktop {
  margin-top: 4px;
  background: none;
  border: none;
  padding: 2px 4px;
  color: var(--primary-color);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  height: 1.2rem; /* Fixed height context */
  line-height: 1;
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
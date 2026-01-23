<script setup>
import { computed } from 'vue';

import IconChevronDoubleLeft from '../../../components/icons/IconChevronDoubleLeft.vue';
import IconChevronDoubleRight from '../../../components/icons/IconChevronDoubleRight.vue';
import IconChevronLeft from '../../../components/icons/IconChevronLeft.vue';
import IconChevronRight from '../../../components/icons/IconChevronRight.vue';
import BaseButton from '../../../components/shared/BaseButton.vue';
import BaseSelectorBar from '../../../components/shared/BaseSelectorBar.vue';

const props = defineProps({
  dateRangeLabel: { type: String, required: true },
  monthLabel: { type: String, required: true },
  showTodayButton: { type: Boolean, default: false }
});

defineEmits(['navigate-month', 'navigate-period', 'navigate-day', 'jump-today']);

const monthLabelShort = computed(() => {
  return props.monthLabel
    .replace('January', 'Jan')
    .replace('February', 'Feb')
    .replace('March', 'Mar')
    .replace('April', 'Apr')
    .replace('August', 'Aug')
    .replace('September', 'Sep')
    .replace('October', 'Oct')
    .replace('November', 'Nov')
    .replace('December', 'Dec')
    .replaceAll(' 20', " '");
});
</script>

<template>
  <BaseSelectorBar>
    <BaseButton
      class="dense-btn"
      :icon="IconChevronDoubleLeft"
      title="Back Month"
      variant="ghost"
      @click="$emit('navigate-month', -1)"
    >
      M
    </BaseButton>

    <BaseButton
      class="dense-btn"
      :icon="IconChevronLeft"
      title="Back 3 Days"
      variant="ghost"
      @click="$emit('navigate-period', -1)"
    >
      3D
    </BaseButton>

    <BaseButton
      class="dense-btn"
      :icon="IconChevronLeft"
      title="Back Day"
      variant="outline"
      @click="$emit('navigate-day', -1)"
    >
      D
    </BaseButton>

    <div class="date-info-mobile">
      <span class="month-mobile">{{ monthLabelShort }}</span>
      <span class="range-mobile">{{ dateRangeLabel }}</span>

      <button v-if="showTodayButton" class="today-link-mobile" @click="$emit('jump-today')">
        Today
      </button>
    </div>

    <BaseButton
      class="dense-btn"
      :icon="IconChevronRight"
      icon-position="right"
      title="Forward Day"
      variant="outline"
      @click="$emit('navigate-day', 1)"
    >
      D
    </BaseButton>

    <BaseButton
      class="dense-btn"
      :icon="IconChevronRight"
      icon-position="right"
      title="Forward 3 Days"
      variant="ghost"
      @click="$emit('navigate-period', 1)"
    >
      3D
    </BaseButton>

    <BaseButton
      class="dense-btn"
      :icon="IconChevronDoubleRight"
      icon-position="right"
      title="Forward Month"
      variant="ghost"
      @click="$emit('navigate-month', 1)"
    >
      M
    </BaseButton>
  </BaseSelectorBar>
</template>

<style scoped>
.date-info-mobile {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;

  /* Min-width stabilizes the layout so buttons don't jump */
  min-width: 6.5rem;
}

.range-mobile {
  color: var(--text-main);
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.1;
}

.month-mobile {
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
}

.today-link-mobile {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 700;
  margin-top: 2px;
  padding: 0;
  text-decoration: underline;
}

.dense-btn {
  font-weight: 700;
  gap: 4px;
  height: 2.25rem;
  min-width: 2rem;
  padding: 0 4px;
}

/* Fix: Reset BaseButton internal transforms to force pure flex centring */
.dense-btn :deep(.icon-frame),
.dense-btn :deep(.button-label) {
  line-height: 1;
  transform: none;
}

.dense-btn :deep(.icon-frame) {
  align-items: center;
  display: flex;
  height: 0.9rem;
  justify-content: center;
  width: 0.9rem;
}
</style>

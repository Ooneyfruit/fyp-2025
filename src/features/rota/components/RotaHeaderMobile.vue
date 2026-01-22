<script setup>
import { computed } from 'vue';
import BaseSelectorBar from '../../../components/shared/BaseSelectorBar.vue';
import BaseButton from '../../../components/shared/BaseButton.vue';
import IconChevronLeft from '../../../components/icons/IconChevronLeft.vue';
import IconChevronRight from '../../../components/icons/IconChevronRight.vue';
import IconChevronDoubleLeft from '../../../components/icons/IconChevronDoubleLeft.vue';
import IconChevronDoubleRight from '../../../components/icons/IconChevronDoubleRight.vue';

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
      variant="ghost"
      class="dense-btn"
      :icon="IconChevronDoubleLeft"
      title="Back Month"
      @click="$emit('navigate-month', -1)"
    >
      M
    </BaseButton>

    <BaseButton
      variant="ghost"
      class="dense-btn"
      :icon="IconChevronLeft"
      title="Back 3 Days"
      @click="$emit('navigate-period', -1)"
    >
      3D
    </BaseButton>

    <BaseButton
      variant="outline"
      class="dense-btn"
      :icon="IconChevronLeft"
      title="Back Day"
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
      variant="outline"
      class="dense-btn"
      :icon="IconChevronRight"
      icon-position="right"
      title="Forward Day"
      @click="$emit('navigate-day', 1)"
    >
      D
    </BaseButton>

    <BaseButton
      variant="ghost"
      class="dense-btn"
      :icon="IconChevronRight"
      icon-position="right"
      title="Forward 3 Days"
      @click="$emit('navigate-period', 1)"
    >
      3D
    </BaseButton>

    <BaseButton
      variant="ghost"
      class="dense-btn"
      :icon="IconChevronDoubleRight"
      icon-position="right"
      title="Forward Month"
      @click="$emit('navigate-month', 1)"
    >
      M
    </BaseButton>
  </BaseSelectorBar>
</template>

<style scoped>
.date-info-mobile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* Min-width stabilizes the layout so buttons don't jump */
  min-width: 6.5rem;
}

.range-mobile {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.1;
}

.month-mobile {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
}

.today-link-mobile {
  margin-top: 2px;
  background: none;
  border: none;
  padding: 0;
  color: var(--primary-color);
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.dense-btn {
  padding: 0 4px;
  min-width: 2rem;
  height: 2.25rem;
  gap: 4px;
  font-weight: 700;
}

/* Fix: Reset BaseButton internal transforms to force pure flex centring */
.dense-btn :deep(.icon-frame),
.dense-btn :deep(.button-label) {
  transform: none;
  line-height: 1;
}

.dense-btn :deep(.icon-frame) {
  width: 0.9rem;
  height: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

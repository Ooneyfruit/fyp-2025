<script setup lang="ts">
/**
 * A container component that detects horizontal touch swipes.
 * Emits 'swipe-left' and 'swipe-right' events when the user swipes.
 * Designed to wrap carousels, date pickers, or other swipe views.
 */
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'swipe-left'): void;
  (e: 'swipe-right'): void;
}>();

const startX = ref(0);
const startY = ref(0);
const isSwiping = ref(false);
const SWIPE_THRESHOLD = 40; // Minimum horizontal pixels for a valid swipe

const handleTouchStart = (e: TouchEvent) => {
  if (!e.touches?.[0]) return;
  startX.value = e.touches[0].clientX;
  startY.value = e.touches[0].clientY;
  isSwiping.value = true;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isSwiping.value || !e.touches?.[0]) return;

  const diffX = e.touches[0].clientX - startX.value;
  const diffY = e.touches[0].clientY - startY.value;

  // Cancel horizontal swipe if the user is scrolling mostly vertically
  if (Math.abs(diffY) > SWIPE_THRESHOLD && Math.abs(diffY) > Math.abs(diffX)) {
    isSwiping.value = false;
    return;
  }

  // Detect horizontal swipe
  if (Math.abs(diffX) > SWIPE_THRESHOLD) {
    if (diffX > 0) {
      emit('swipe-right');
    } else {
      emit('swipe-left');
    }
    isSwiping.value = false; // Prevent rapid-firing events during the same touch
  }
};

const handleTouchEnd = () => {
  isSwiping.value = false;
};
</script>

<template>
  <div
    class="base-swipe-container"
    @touchend="handleTouchEnd"
    @touchmove="handleTouchMove"
    @touchstart="handleTouchStart"
  >
    <slot />
  </div>
</template>

<style scoped>
.base-swipe-container {
  /* Defers vertical scrolling back to the browser natively while capturing horizontal pans */
  touch-action: pan-y;
  width: 100%;
}
</style>

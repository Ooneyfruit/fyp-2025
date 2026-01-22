<script setup>
/**
 * Primary responsibility: provides a standardized loading interface for both inline content and full-page transitions.
 */
import { computed } from 'vue';
import BaseSpinner from './BaseSpinner.vue';

const props = defineProps({
  fullScreen: { type: Boolean, default: false }
});

// Increase spinner dimensions for full-screen states to ensure visual prominence.
const spinnerSize = computed(() => (props.fullScreen ? '2rem' : '1.5rem'));
</script>

<template>
  <div
    class="loading-container"
    :class="{ 'full-page': fullScreen }"
    role="status"
    aria-live="polite"
  >
    <BaseSpinner :size="spinnerSize" />

    <span class="loading-text">
      <slot>Syncing practice records...</slot>
    </span>
  </div>
</template>

<style scoped>
/* Layout: center alignment and spacing for the loading indicator. */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  color: var(--text-muted);
  padding: var(--spacing-lg) var(--spacing-md);
}

/* State: viewport expansion used during initial app boots or route transitions. */
.loading-container.full-page {
  height: 100vh;
  padding: 0;
  background-color: var(--bg-app);
}

.loading-text {
  font-size: 0.9375rem;
  font-weight: 500;
  /* Optical nudge to align text with the visual center of the circular spinner. */
  transform: translateY(0.0625rem);
}
</style>

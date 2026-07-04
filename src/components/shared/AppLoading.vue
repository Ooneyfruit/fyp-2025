<script setup lang="ts">
/**
 * Loading spinner.
 * Provides a standardised loading interface for both inline content and full-page transitions.
 */
import { computed } from 'vue';

import BaseSpinner from './BaseSpinner.vue';

interface Props {
  fullScreen?: boolean;
  /**
   * The text to display next to the spinner.
   * Can be overridden by the default slot.
   */
  text?: string;
}

const props = withDefaults(defineProps<Props>(), {
  fullScreen: false,
  text: 'Syncing practice records...'
});

// Increase spinner dimensions for full-screen states to ensure visual prominence.
const spinnerSize = computed(() => (props.fullScreen ? '2rem' : '1.5rem'));
</script>

<template>
  <output class="loading-container" :class="{ 'full-page': fullScreen }">
    <BaseSpinner :size="spinnerSize" />

    <span class="loading-text">
      <slot>{{ text }}</slot>
    </span>
  </output>
</template>

<style scoped>
/* Layout: center alignment and spacing for the loading indicator. */
.loading-container {
  align-items: center;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  justify-content: center;
  padding: var(--spacing-lg) var(--spacing-md);
}

/* State: viewport expansion used during initial app boots or route transitions. */
.loading-container.full-page {
  background-color: var(--bg-app);
  height: 100vh;
  padding: 0;
}

.loading-text {
  font-size: 0.9375rem;
  font-weight: 500;

  /* Optical nudge to align text with the visual centre of the circular spinner. */
  transform: translateY(0.0625rem);
}
</style>

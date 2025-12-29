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

<script setup>
import { computed } from 'vue';
import BaseSpinner from './BaseSpinner.vue';

const props = defineProps({
  fullScreen: { type: Boolean, default: false }
});

// Full page loading typically looks better with a slightly larger indicator
const spinnerSize = computed(() => props.fullScreen ? '2rem' : '1.5rem');
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  color: var(--text-muted);
  padding: var(--spacing-lg) var(--spacing-md);
}

.loading-container.full-page {
  height: 100vh;
  padding: 0;
  background-color: var(--bg-app);
}

.loading-text {
  font-size: 0.9375rem;
  font-weight: 500;
  /* Optical nudge to align text with the circular weight of the spinner */
  transform: translateY(0.0625rem);
}
</style>
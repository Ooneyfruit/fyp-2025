<template>
  <div class="loading-container" :class="{ 'full-page': fullScreen }">
    <div class="spinner" />
    <span class="loading-text">
      <slot>Syncing practice records...</slot>
    </span>
  </div>
</template>

<script setup>
defineProps({
  fullScreen: { type: Boolean, default: false }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  color: var(--text-muted);
  /* Default padding for in-content loading */
  padding: var(--spacing-lg) var(--spacing-md);
}

.loading-container.full-page {
  height: 100vh;
  padding: 0;
}

.spinner {
  /* Using REM for consistency with your 'no-px' policy */
  width: 1.5rem;
  height: 1.5rem;
  border: 0.125rem solid #e2e8f0;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 0.9375rem;
  /* Optical nudge to align text with the circular weight of the spinner */
  transform: translateY(0.0625rem);
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}
</style>
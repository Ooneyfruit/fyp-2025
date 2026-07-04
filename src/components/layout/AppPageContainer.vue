<script setup lang="ts">
/**
 * Standard page wrapper to ensure consistent padding and max-width constraints.
 * Supports a 'fluid' mode for wide data tables.
 */
defineProps({
  fluid: { type: Boolean, default: false }
});
</script>

<template>
  <main class="page-container" :class="{ 'is-fluid': fluid }">
    <slot />
  </main>
</template>

<style scoped>
.page-container {
  margin: 0 auto;
  max-width: var(--container-width, 70rem); /* Default constrained width */
  padding: var(--spacing-md);
  transition: max-width 0.3s ease;
  width: 100%;
}

.page-container.is-fluid {
  max-width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
}

@media (width <= 48rem) {
  .page-container {
    padding: var(--spacing-sm);
  }

  .page-container.is-fluid {
    padding: var(--spacing-sm);
  }
}
</style>

<template>
  <main class="page-container" :class="{ 'is-fluid': fluid }">
    <slot />
  </main>
</template>

<script setup>
/**
 * Standard page wrapper to ensure consistent padding and max-width constraints.
 * Now supports a 'fluid' mode for wide data tables.
 */
defineProps({
  fluid: { type: Boolean, default: false }
});
</script>

<style scoped>
.page-container {
  padding: var(--spacing-md);
  margin: 0 auto;
  width: 100%;
  max-width: var(--container-width, 70rem); /* Default constrained width */
  transition: max-width 0.3s ease;
}

/* * Fluid mode removes the strict max-width to use available screen real estate.
 * Useful for large data tables like the Rota.
 */
.page-container.is-fluid {
  max-width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
}

@media (max-width: 48rem) {
  .page-container {
    padding: var(--spacing-sm);
  }
  .page-container.is-fluid {
    padding: var(--spacing-sm);
  }
}
</style>

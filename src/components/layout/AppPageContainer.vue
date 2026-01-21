<template>
  <main 
    class="rd-page-container" 
    :class="{ 'rd-page-container--fluid': fluid }"
  >
    <slot />
  </main>
</template>

<script>
/**
 * Provides a standardized layout wrapper for top-level pages.
 * Handles primary content constraints, accessibility landmarks, and fluid layout options.
 */
export default {
  name: 'AppPageContainer',
  props: {
    /**
     * Determines if the container should ignore the maximum width constraint.
     * Useful for data-heavy views like calendars or large tables.
     */
    fluid: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
/* Layout: specific overrides for the container component. */
.rd-page-container {
  width: 100%;
}

/* Variant: edge-to-edge layout for data-dense interfaces. */
.rd-page-container--fluid {
  max-width: none;
}
</style>
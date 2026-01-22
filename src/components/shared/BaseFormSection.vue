<script setup>
/**
 * Layout component for form segmentation.
 * Logic: provides standard section headers and optional grid layout for children.
 */
defineProps({
  title: { type: String, default: '' },
  /**
   * If true, children will be wrapped in a responsive grid.
   */
  grid: { type: Boolean, default: false }
});
</script>

<template>
  <section class="rd-form-section">
    <div v-if="title" class="rd-section-header">
      {{ title }}
    </div>
    <div :class="{ 'rd-form-grid': grid }">
      <slot />
    </div>
  </section>
</template>

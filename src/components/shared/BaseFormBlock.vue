<template>
  <div class="form-block">
    <div v-if="title" class="block-header">
      {{ title }}
    </div>
    <div class="block-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
/**
 * Logical sectioning for forms.
 * Provides consistent spacing and headers for form blocks.
 */
defineProps({
  title: { type: String, default: '' }
});
</script>

<style scoped>
.form-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.block-header {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}
.block-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>

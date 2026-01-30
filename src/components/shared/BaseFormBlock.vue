<script setup lang="ts">
/**
 * Logical sectioning for forms.
 * Provides consistent spacing and headers for form blocks.
 */
defineProps({
  title: { type: String, default: '' }
});
</script>

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

<style scoped>
.form-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.block-header {
  border-bottom: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding-bottom: 0.5rem;
  text-transform: uppercase;
}

.block-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>

<script setup lang="ts">
/**
 * High-level layout orchestrator for page headers.
 * Combines page identification and action buttons into a responsive group.
 */

import AppPageHeader from './AppPageHeader.vue';

defineProps({
  // The primary text for the page heading.
  title: { type: String, required: true },

  // Optional secondary descriptive text for the page.
  subtitle: { type: String, default: '' }
});
</script>

<template>
  <div class="page-header-group">
    <AppPageHeader :subtitle="subtitle" :title="title">
      <slot name="extra" />
    </AppPageHeader>

    <div class="action-stack">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* Layout: horizontal alignment for identity and actions with wrap support */
.page-header-group {
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  justify-content: flex-start;
  margin-block-end: var(--spacing-md);
}

/* Actions: grouping logic for multiple action buttons */
.action-stack {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

/* Responsive: switch to vertical orientation on smaller viewports */
@media (width <= 50rem) {
  .page-header-group {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .action-stack {
    width: 100%;
  }
}
</style>

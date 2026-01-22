<template>
  <div class="page-header-group">
    <AppPageHeader :title="title" :subtitle="subtitle">
      <slot name="extra" />
    </AppPageHeader>

    <div class="action-stack">
      <slot />
    </div>
  </div>
</template>

<script setup>
import AppPageHeader from './AppPageHeader.vue';

/**
 * High-level layout orchestrator for page headers.
 * Combines page identification and action buttons into a responsive group.
 */
defineProps({
  // The primary text for the page heading.
  title: { type: String, required: true },

  // Optional secondary descriptive text for the page.
  subtitle: { type: String, default: '' }
});
</script>

<style scoped>
/* Layout: horizontal alignment for identity and actions with wrap support */
.page-header-group {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-block-end: var(--spacing-md);
  flex-wrap: wrap;
}

/* Actions: grouping logic for multiple action buttons */
.action-stack {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* Responsive: switch to vertical orientation on smaller viewports */
@media (max-width: 50rem) {
  .page-header-group {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .action-stack {
    width: 100%;
  }
}
</style>

<template>
  <div class="rd-selector-bar">
    <slot />
  </div>
</template>

<script setup>
/**
 * Primary responsibility: provides a flexible, equally-spaced container for navigation items.
 * Uses space-evenly to ensure uniform gaps between all child elements and container edges.
 */
</script>

<style scoped>
/* Layout: Standardised interactable bar styling */
.rd-selector-bar {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  background-color: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  padding: var(--spacing-sm) var(--spacing-md);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  width: 100%;
  min-height: 4.5rem;
  gap: var(--spacing-xs);
}

/* Logic: Prevent children from stretching or shrinking unevenly */
:deep(> *) {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Tablet: Tighten padding for narrower viewports */
@media (max-width: 48rem) {
  .rd-selector-bar {
    padding: var(--spacing-xs) var(--spacing-sm);
    min-height: 4rem;
  }
}
</style>
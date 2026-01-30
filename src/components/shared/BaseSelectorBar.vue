<script setup lang="ts">
/**
 * Primary responsibility: provides a flexible, equally-spaced container for navigation items.
 * Uses space-evenly to ensure uniform gaps between all child elements and container edges.
 */
</script>

<template>
  <div class="rd-selector-bar">
    <slot />
  </div>
</template>

<style scoped>
/* Layout: standardised interactive bar styling. */
.rd-selector-bar {
  align-items: center;
  background-color: var(--bg-surface, #fff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
  display: flex;
  gap: var(--spacing-xs);
  justify-content: space-evenly;
  min-height: 4.5rem;
  padding: var(--spacing-sm) var(--spacing-md);
  width: 100%;
}

/* Logic: prevent children from stretching or shrinking unevenly. */
:deep(> *) {
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
}

/* Tablet: tighten padding for narrower viewports. */
@media (width <= 48rem) {
  .rd-selector-bar {
    min-height: 4rem;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}
</style>

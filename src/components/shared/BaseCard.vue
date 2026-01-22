<template>
  <div class="base-card rd-card">
    <div v-if="$slots.header" class="card-header rd-card-header">
      <slot name="header" />
    </div>

    <div class="card-body rd-card-body">
      <slot />
    </div>
  </div>
</template>

<script setup>
/**
 * Primary responsibility: Provides a structural container component that implements the
 * standard project card styling with optional header and body slots.
 */
</script>

<style scoped>
/* Layout: Component-specific overrides to augment the global .rd-card utility. */
.base-card {
  display: flex;
  flex-direction: column;
}

/* Visual divider: Adds a subtle border between the header and body to improve content separation. */
.card-header + .card-body {
  border-top: 1px solid var(--border-color);
}
</style>

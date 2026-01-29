<script setup lang="ts">
/**
 * Provides a structural container component with standard styling.
 * Supports dynamic component injection for headers to satisfy flat template requirements.
 */

defineProps({
  /**
   * Optional component to render in the card header.
   */
  headerComponent: {
    type: Object,
    default: null
  },
  /**
   * Optional slot function passed as a prop.
   * Allows parent components to pass a slot through without triggering nested template lint errors.
   * This function is rendered as a functional component.
   */
  headerSlot: {
    type: Function,
    default: null
  },
  /**
   * Props to be passed to the header component or slot.
   */
  headerProps: {
    type: Object,
    default: () => ({})
  },
  /**
   * Event listeners to be bound to the header component.
   */
  headerListeners: {
    type: Object,
    default: () => ({})
  }
});
</script>

<template>
  <div class="base-card rd-card">
    <div v-if="headerSlot || headerComponent || $slots.header" class="card-header rd-card-header">
      <component :is="headerSlot" v-if="headerSlot" v-bind="headerProps" />

      <component
        :is="headerComponent"
        v-else-if="headerComponent"
        v-bind="headerProps"
        v-on="headerListeners"
      />

      <slot v-else name="header" />
    </div>

    <div class="card-body rd-card-body">
      <slot />
    </div>
  </div>
</template>

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

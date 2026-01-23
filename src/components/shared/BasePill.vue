<script setup>
/**
 * Primary responsibility: Provides a standardized, functional wrapper for small status
 * indicators and categorization tags within the RotaDent design system.
 */

defineProps({
  /**
   * The visual theme variation of the pill.
   * This maps directly to the .rd-pill-{variant} utility classes in the global stylesheet.
   */
  variant: {
    type: String,
    default: 'muted',
    validator: (v) =>
      ['primary', 'success', 'warning', 'danger', 'admin', 'muted'].includes(
        /** @type {string} */ (v)
      )
  }
});
</script>

<template>
  <span class="rd-pill" :class="[`rd-pill-${variant}`]">
    <div v-if="$slots.icon" aria-hidden="true" class="rd-pill-icon-frame">
      <slot name="icon" />
    </div>

    <span class="rd-pill-label">
      <slot />
    </span>
  </span>
</template>

<style scoped>
/* Layout: Specific dimensions for icon containers within the pill. */
.rd-pill-icon-frame {
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: 0.85rem;
  justify-content: center;
  width: 0.85rem;
}

/* Internal: Ensures any SVG passed into the icon slot scales correctly to fit the container. */
.rd-pill-icon-frame :deep(svg) {
  height: 100%;
  width: 100%;
}

/* Alignment: Applies a minor vertical nudge to balance the visual baseline of uppercase labels. */
.rd-pill-label {
  transform: translateY(0.035rem);
}
</style>

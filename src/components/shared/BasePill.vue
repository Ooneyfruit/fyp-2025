<template>
  <span class="rd-pill" :class="[`rd-pill-${variant}`]">
    <div v-if="$slots.icon" class="rd-pill-icon-frame" aria-hidden="true">
      <slot name="icon" />
    </div>

    <span class="rd-pill-label">
      <slot />
    </span>
  </span>
</template>

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
    validator: (v) => ['primary', 'success', 'warning', 'danger', 'admin', 'muted'].includes(v)
  }
});
</script>

<style scoped>
/* Layout: specific dimensions for icon containers within the pill. */
.rd-pill-icon-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 0.85rem;
  height: 0.85rem;
  flex-shrink: 0;
}

/* Internal: ensures any svg passed into the icon slot scales correctly to fit the container. */
.rd-pill-icon-frame :deep(svg) {
  width: 100%;
  height: 100%;
}

/* Alignment: applies a minor vertical nudge to balance the visual baseline of uppercase labels. */
.rd-pill-label {
  transform: translateY(0.035rem);
}
</style>

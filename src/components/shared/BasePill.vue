<script setup>
/**
 * Provides a standardised, functional wrapper for small status
 * indicators and categorization tags within the RotaDent design system.
 */

import { computed } from 'vue';

const props = defineProps({
  /**
   * The visual theme variation of the pill.
   * Maps to .rd-pill-variant classes.
   */
  variant: {
    type: String,
    default: 'muted',
    validator: (v) => ['primary', 'success', 'warning', 'danger', 'admin', 'muted'].includes(v)
  },
  /**
   * Optional custom colour overrides.
   * Enables dynamic branding (e.g. for Rota Roles) while keeping standard pill geometry.
   * Structure: `{ bg: '#hex', accent: '#hex' }`
   */
  customColours: {
    type: Object,
    default: null
  }
});

/**
 * Dynamically computes styles to override class-based defaults
 * only when customColours are provided.
 */
const styles = computed(() => {
  if (!props.customColours) return {};

  return {
    backgroundColor: props.customColours.bg,
    color: props.customColours.accent,
    borderColor: props.customColours.accent
  };
});
</script>

<template>
  <span class="rd-pill" :class="[`rd-pill-${variant}`]" :style="styles">
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

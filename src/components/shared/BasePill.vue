<template>
  <span 
    class="rd-pill" 
    :class="[`rd-pill-${variant}`]"
  >
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
 * BasePill.vue
 * A functional wrapper for the .rd-pill design system tokens.
 * Styles are predominantly managed in src/assets/main.css.
 */

defineProps({
  /**
   * Visual variant corresponding to the .rd-pill-{variant} classes in main.css.
   */
  variant: {
    type: String,
    default: 'muted',
    validator: (v) => [
      'primary', 
      'success', 
      'warning', 
      'danger', 
      'admin', 
      'muted'
    ].includes(v)
  }
});
</script>

<style scoped>
/* Component-level optical adjustments not included in the global utility classes */

.rd-pill-icon-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 0.85rem;
  height: 0.85rem;
  flex-shrink: 0;
}

/* Ensure any SVG passed into the icon slot scales correctly to the pill height */
.rd-pill-icon-frame :deep(svg) {
  width: 100%;
  height: 100%;
}

/* Optical nudge to vertically align uppercase text labels with the icons */
.rd-pill-label {
  transform: translateY(0.035rem);
}
</style>
<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    class="rd-button"
    :class="[
      `rd-button-${variant}`, 
      { 'is-processing': processing, 'is-icon-only': iconOnly }
    ]"
    :disabled="disabled || processing"
    :aria-busy="processing"
    :aria-label="iconOnly ? label : null"
    :title="iconOnly ? label : null"
    @click="!to && $emit('click')"
  >
    <div v-if="icon || $slots.icon" class="icon-frame" aria-hidden="true">
      <slot name="icon">
        <component :is="icon" />
      </slot>
    </div>
    
    <span v-if="!iconOnly" class="button-label">
      <template v-if="processing">Processing...</template>
      <template v-else>{{ label }}</template>
    </span>
  </component>
</template>

<script setup>
/**
 * Primary responsibility: provides a flexible button component that supports navigation, 
 * various visual states, and semantic variations.
 */

// Define component properties for behavior and visual styling.
defineProps({
  label: { type: String, required: true },
  to: { type: [String, Object], default: null },
  disabled: { type: Boolean, default: false },
  processing: { type: Boolean, default: false },
  /**
   * The visual theme of the button. 
   * Validates against the three core system variants.
   */
  variant: { 
    type: String, 
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger'].includes(v)
  },
  icon: { type: [Object, Function], default: null },
  iconOnly: { type: Boolean, default: false }
});

// Define emitted events for parent component interaction.
defineEmits(['click']);
</script>

<style scoped>
/* Layout: specific dimensions for icon-only button states. */
.rd-button.is-icon-only {
  padding: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  aspect-ratio: 1 / 1;
}

/* Layout: centering and optical alignment for icons. */
.icon-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.15rem;
  height: 1.15rem;
  flex-shrink: 0;
  /* Shift icon up slightly to account for the visual weight of the button container. */
  transform: translateY(-0.0625rem);
}

.icon-frame :deep(svg) {
  width: 100%;
  height: 100%;
}

/* Alignment: vertical nudge to improve legibility and balance the baseline. */
.button-label {
  transform: translateY(0.0625rem);
}

/* State: visual feedback for ongoing operations. */
.is-processing {
  cursor: wait;
}
</style>
<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    class="rd-button"
    :class="[`rd-button-${variant}`, { 'is-processing': processing }]"
    :disabled="disabled || processing"
    :aria-busy="processing"
    @click="!to && $emit('click')"
  >
    <div v-if="icon || $slots.icon" class="icon-frame" aria-hidden="true">
      <slot name="icon">
        <component :is="icon" />
      </slot>
    </div>
    
    <span class="button-label">
      <template v-if="processing">Processing...</template>
      <template v-else>{{ label }}</template>
    </span>
  </component>
</template>

<script setup>
/**
 * BaseButton.vue
 * Replaces PageAction.vue. Provides a universal action primitive 
 * with centralized global styling and a hybrid icon pattern.
 */

defineProps({
  // The text displayed on the button
  label: { type: String, required: true },
  
  // If provided, the component renders as a router-link
  to: { type: [String, Object], default: null },
  
  disabled: { type: Boolean, default: false },
  
  // Shows a loading state and disables the button
  processing: { type: Boolean, default: false },
  
  /**
   * Design variant: 'primary' (blue), 'secondary' (white outline), or 'danger'.
   * Aligns with the design pattern established in BasePill.vue.
   */
  variant: { 
    type: String, 
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger'].includes(v)
  },
  
  // Optional: Pass an Icon component directly (e.g., :icon="IconPlus")
  icon: { type: [Object, Function], default: null }
});

defineEmits(['click']);
</script>

<style scoped>
.icon-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.15rem;
  height: 1.15rem;
  flex-shrink: 0;
  /* OPTICAL NUDGE: Lifts icon slightly to align with font-weight balance */
  transform: translateY(-0.0625rem);
}

/* Ensure slot icons inherit appropriate sizing without manual classes */
.icon-frame :deep(svg) {
  width: 100%;
  height: 100%;
}

.button-label {
  /* OPTICAL NUDGE: Anchors text baseline to icon base */
  transform: translateY(0.0625rem);
}

.is-processing {
  cursor: wait;
}
</style>
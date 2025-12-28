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
 * BaseButton.vue
 * Supports 'primary', 'secondary', and 'danger' variants.
 */

defineProps({
  label: { type: String, required: true },
  to: { type: [String, Object], default: null },
  disabled: { type: Boolean, default: false },
  processing: { type: Boolean, default: false },
  /**
   * Now includes 'danger' for destructive actions.
   */
  variant: { 
    type: String, 
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger'].includes(v)
  },
  icon: { type: [Object, Function], default: null },
  iconOnly: { type: Boolean, default: false }
});

defineEmits(['click']);
</script>

<style scoped>
.rd-button.is-icon-only {
  padding: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  aspect-ratio: 1 / 1;
}

.icon-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.15rem;
  height: 1.15rem;
  flex-shrink: 0;
  transform: translateY(-0.0625rem);
}

.icon-frame :deep(svg) {
  width: 100%;
  height: 100%;
}

.button-label {
  transform: translateY(0.0625rem);
}

.is-processing {
  cursor: wait;
}
</style>
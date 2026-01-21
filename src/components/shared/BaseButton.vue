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
    <div 
      v-if="(icon || $slots.icon) && iconPosition === 'left'" 
      class="icon-frame" 
      aria-hidden="true"
    >
      <slot name="icon">
        <component :is="icon" />
      </slot>
    </div>
    
    <span v-if="!iconOnly" class="button-label">
      <template v-if="processing">Processing...</template>
      <template v-else>
        <slot>{{ label }}</slot>
      </template>
    </span>

    <div 
      v-if="(icon || $slots.icon) && iconPosition === 'right'" 
      class="icon-frame" 
      aria-hidden="true"
    >
      <slot name="icon">
        <component :is="icon" />
      </slot>
    </div>
  </component>
</template>

<script setup>
/**
 * Primary responsibility: provides a flexible button component that supports navigation, 
 * various visual states, and semantic variations.
 */

defineProps({
  label: { type: String, default: '' }, // Not required if slot is used
  to: { type: [String, Object], default: null },
  disabled: { type: Boolean, default: false },
  processing: { type: Boolean, default: false },
  /**
   * The visual theme of the button. 
   * Supports core semantic types and visual styles.
   */
  variant: { 
    type: String, 
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger', 'outline', 'ghost'].includes(v)
  },
  icon: { type: [Object, Function], default: null },
  iconOnly: { type: Boolean, default: false },
  /**
   * Defines the position of the icon relative to the label.
   * Ignored if iconOnly is true.
   */
  iconPosition: {
    type: String,
    default: 'left',
    validator: (v) => ['left', 'right'].includes(v)
  }
});

defineEmits(['click']);
</script>

<style scoped>
.rd-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--border-radius, 6px);
  transition: all 0.2s ease;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
}

.rd-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* --- Variants --- */

/* Primary: Solid Brand Color */
.rd-button-primary {
  background-color: var(--primary-color, #2563eb);
  color: white;
}
.rd-button-primary:not(:disabled):hover {
  background-color: var(--primary-color-dark, #1d4ed8);
}

/* Secondary: Grey Background */
.rd-button-secondary {
  background-color: #f8f8f8;
  color: #1e293b;
}
.rd-button-secondary:not(:disabled):hover {
  background-color: #e9e9e9;
}

/* Danger: Red */
.rd-button-danger {
  background-color: #ef4444;
  color: white;
}
.rd-button-danger:not(:disabled):hover {
  background-color: #dc2626;
}

/* Outline: Border only */
.rd-button-outline {
  background-color: transparent;
  border-color: #cbd5e1;
  color: #475569;
}
.rd-button-outline:not(:disabled):hover {
  border-color: #94a3b8;
  background-color: #f8fafc;
  color: #1e293b;
}

/* Ghost: No border/bg until hover */
.rd-button-ghost {
  background-color: transparent;
  color: #64748b;
}
.rd-button-ghost:not(:disabled):hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

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
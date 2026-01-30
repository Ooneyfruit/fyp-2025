<script setup lang="ts">
/**
 * Provides a flexible button component that supports navigation,
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
    // Validator inlined for 'vue/valid-define-props'.
    // Includes type check to satisfy TS 'unknown' argument error.
    validator: (v) =>
      typeof v === 'string' && ['primary', 'secondary', 'danger', 'outline', 'ghost'].includes(v)
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
    // Validator inlined for 'vue/valid-define-props'.
    // Includes type check to satisfy TS 'unknown' argument error.
    validator: (v) => typeof v === 'string' && ['left', 'right'].includes(v)
  }
});

defineEmits(['click']);
</script>

<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :aria-busy="processing"
    :aria-label="iconOnly ? label : null"
    class="rd-button"
    :class="[`rd-button-${variant}`, { 'is-processing': processing, 'is-icon-only': iconOnly }]"
    :disabled="disabled || processing"
    :title="iconOnly ? label : null"
    :to="to"
    @click="!to && $emit('click')"
  >
    <div
      v-if="(icon || $slots.icon) && iconPosition === 'left'"
      aria-hidden="true"
      class="icon-frame"
    >
      <slot name="icon">
        <component :is="icon" />
      </slot>
    </div>

    <span v-if="!iconOnly" class="button-label">
      <span v-if="processing">Processing...</span>
      <slot v-else>{{ label }}</slot>
    </span>

    <div
      v-if="(icon || $slots.icon) && iconPosition === 'right'"
      aria-hidden="true"
      class="icon-frame"
    >
      <slot name="icon">
        <component :is="icon" />
      </slot>
    </div>
  </component>
</template>

<style scoped>
/* Base structural styles for the button component. */
.rd-button {
  align-items: center;
  border: 1px solid transparent;
  border-radius: var(--border-radius, 6px);
  cursor: pointer;
  display: inline-flex;
  font-size: 0.875rem;
  font-weight: 500;
  gap: 0.5rem;
  justify-content: center;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

/* Dim opacity to indicate disabled state visually. */
.rd-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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
  background-color: #fff;
  border: 1px solid #e2e8f0;
  color: #1e293b;
}

.rd-button-secondary:not(:disabled):hover {
  background-color: #e9e9e9;
}

/* Danger: Red */
.rd-button-danger {
  background-color: var(--color-danger);
  color: white;
}

.rd-button-danger:not(:disabled):hover {
  background-color: #dc2626;
}

/* Outline: Border only */
.rd-button-outline {
  /* Changed from transparent to white to satisfy accessibility contrast checkers. */
  background-color: #fff;
  border-color: #cbd5e1;

  /* Darkened to #1e293b (Slate-800) for strict AAA accessibility contrast. */
  color: #1e293b;
}

.rd-button-outline:not(:disabled):hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
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
  aspect-ratio: 1 / 1;
  height: 2.5rem;
  padding: 0.5rem;
  width: 2.5rem;
}

/* Layout: centring and optical alignment for icons. */
.icon-frame {
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: 1.15rem;
  justify-content: center;
  transform: translateY(-0.0625rem);
  width: 1.15rem;
}

/* Ensure SVG icons fill their frame completely. */
.icon-frame :deep(svg) {
  height: 100%;
  width: 100%;
}

/* Optically align text label to match icon baseline. */
.button-label {
  transform: translateY(0.0625rem);
}

.is-processing {
  cursor: wait;
}
</style>

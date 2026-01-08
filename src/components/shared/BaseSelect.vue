<template>
  <div class="rd-select-group" :class="{ 'is-fluid': fluid }">
    <label v-if="label" :for="id" class="rd-select-label">{{ label }}</label>
    <div class="select-wrapper">
      <select 
        :id="id"
        :name="name || id"
        :value="modelValue" 
        class="rd-select"
        :class="[`rd-select-${variant}`]"
        :disabled="disabled"
        @change="handleChange"
      >
        <slot />
      </select>
      
      <IconChevronDown class="select-icon" aria-hidden="true" />
    </div>
  </div>
</template>

<script setup>
/**
 * Standardized form selection component.
 * Acts as a functional wrapper for the global rd-select classes and manages focus transitions.
 */
import IconChevronDown from '../icons/IconChevronDown.vue';

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  /**
   * Semantic identifiers for accessibility and browser autofill support.
   */
  id: { type: String, default: undefined },
  name: { type: String, default: undefined },
  /**
   * Visual theme variant. 
   * Maps to the primary, secondary, and danger global classes.
   */
  variant: { 
    type: String, 
    default: 'secondary',
    validator: (v) => ['primary', 'secondary', 'danger'].includes(v)
  },
  /**
   * If true, the component will expand to 100% of its container width.
   */
  fluid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

/**
 * Synchronizes the internal selection state and clears active focus.
 * Blurring the element prevents a lingering focus outline after the menu closes.
 * @param {Event} event - the native change event.
 */
const handleChange = (event) => {
  emit('update:modelValue', event.target.value);
  
  // Logic: remove focus to trigger the CSS transition back from the focus state.
  event.target.blur();
};
</script>

<style scoped>
/* Layout: orchestration for the select label and wrapper structure. */
.rd-select-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: fit-content;
}

.rd-select-group.is-fluid {
  width: 100%;
}

.rd-select-label {
  font-size: 0.725rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  padding-left: 0.1rem;
  letter-spacing: 0.025em;
  cursor: pointer;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

/* Surface: positioning and interaction logic for the overlay icon. */
.select-icon {
  position: absolute;
  right: 0.75rem;
  width: 1rem;
  height: 1rem;
  pointer-events: none; /* Ensure clicks pass through to the underlying select element. */
  transition: transform var(--anim-speed) ease;
}

/* State: toggle icon orientation when the select is active or focused. */
.rd-select:focus + .select-icon {
  transform: rotate(180deg);
}

/* Theme: dynamic icon coloring based on the select variant. */
.rd-select-primary + .select-icon { color: white; }
.rd-select-secondary + .select-icon { color: var(--text-muted); }
.rd-select-danger + .select-icon { color: var(--color-danger); }
</style>
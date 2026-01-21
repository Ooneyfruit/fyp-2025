<template>
  <div class="rd-select-group" :class="{ 'is-fluid': fluid }">
    <label v-if="label" :for="id" class="rd-field-label">{{ label }}</label>
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
 * Logic: provides a visual wrapper for native selects with an animated chevron.
 */
import IconChevronDown from '../icons/IconChevronDown.vue';

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  id: { type: String, default: undefined },
  name: { type: String, default: undefined },
  variant: { 
    type: String, 
    default: 'secondary',
    validator: (v) => ['primary', 'secondary', 'danger'].includes(v)
  },
  fluid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

/**
 * Synchronizes the internal state and forces a blur to reset animations.
 * @param {Event} event - the native change event.
 */
const handleChange = (event) => {
  emit('update:modelValue', event.target.value);
  
  // Logic: force the select to lose focus so the chevron spins back to its default state.
  event.target.blur();
};
</script>

<style scoped>
.rd-select-group { 
  display: flex; 
  flex-direction: column; 
  gap: 0.5rem; 
  width: fit-content; 
}

.rd-select-group.is-fluid { 
  width: 100%; 
}

.select-wrapper { 
  position: relative; 
  display: flex; 
  align-items: center; 
  width: 100%; 
}

/* Surface: positioning and animation logic for the overlay icon. */
.select-icon {
  position: absolute;
  right: 0.75rem;
  width: 1rem;
  height: 1rem;
  pointer-events: none; /* Logic: allow click events to pass through to the select element. */
  transition: transform var(--anim-speed) ease, color var(--anim-speed) ease;
}

/* State: rotate the icon 180 degrees when the select is active or focused. */
.rd-select:focus + .select-icon {
  transform: rotate(180deg);
}

/* Logic: override global select height to match rd-input exactly. */
.rd-select { 
  height: 2.75rem !important; 
}

/* Theme: dynamic icon coloring based on the select variant. */
.rd-select-primary + .select-icon { color: white; }
.rd-select-secondary + .select-icon { color: var(--text-muted); }
.rd-select-danger + .select-icon { color: var(--color-danger); }
</style>
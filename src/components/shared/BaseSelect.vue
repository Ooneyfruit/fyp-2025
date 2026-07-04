<script setup lang="ts">
/**
 * Standardised form selection component.
 * Provides a visual wrapper for native selects with an animated chevron.
 */
import IconChevronDown from '@/components/icons/IconChevronDown.vue';

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  id: { type: String, default: undefined },
  name: { type: String, default: undefined },
  variant: {
    type: String,
    default: 'secondary',
    validator: (v) => ['primary', 'secondary', 'danger'].includes(v as string)
  },
  fluid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

/**
 * Synchronises the internal state and forces a blur to reset animations.
 *
 * @param event - The native change event.
 */
const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement | null;

  if (!target) {
    return;
  }

  emit('update:modelValue', target.value);

  // Logic: Force the select to lose focus so the chevron spins back to its default state.
  target.blur();
};
</script>

<template>
  <div class="rd-select-group" :class="{ 'is-fluid': fluid }">
    <label v-if="label" class="rd-field-label" :for="id">{{ label }}</label>
    <div class="select-wrapper">
      <select
        :id="id"
        class="rd-select"
        :class="[`rd-select-${variant}`]"
        :disabled="disabled"
        :name="name || id"
        :value="modelValue"
        @change="handleChange"
      >
        <slot />
      </select>

      <IconChevronDown aria-hidden="true" class="select-icon" />
    </div>
  </div>
</template>

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
  align-items: center;
  display: flex;
  position: relative;
  width: 100%;
}

/* Surface: Positioning and animation logic for the overlay icon. */
.select-icon {
  height: 1rem;
  pointer-events: none; /* Logic: Allow click events to pass through to the select element. */
  position: absolute;
  right: 0.75rem;
  transition:
    transform var(--anim-speed) ease,
    color var(--anim-speed) ease;
  width: 1rem;
}

/* Theme: Dynamic icon colouring based on the select variant. */
.rd-select-primary + .select-icon {
  color: white;
}

.rd-select-secondary + .select-icon {
  color: var(--text-muted);
}

.rd-select-danger + .select-icon {
  color: var(--colour-danger);
}

/* State: Rotate the icon 180 degrees when the select is active or focused. */
.rd-select:focus + .select-icon {
  transform: rotate(180deg);
}

/* Logic: Override global select height to match rd-input exactly. */
.rd-select {
  height: 2.75rem !important;
}
</style>

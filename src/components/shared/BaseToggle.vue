<script setup>
/**
 * Primitive checkbox switch component.
 * Primary responsibility: provides a visual sliding toggle and propagates state to the native input.
 */
import { useId } from 'vue';

defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: 'Toggle' }
});

const emit = defineEmits(['update:modelValue']);

/**
 * Generates a unique, stable identifier for this component instance.
 * Logic: uses the native Vue 3.5 useId hook to ensure accessibility and avoid pseudorandom security flags.
 */
const elementId = useId();

/**
 * Handles the change event triggered by the native checkbox.
 * Logic: safely casts the event target to an HTMLInputElement to satisfy strict type safety requirements.
 * @param event - The native DOM change event.
 */
function handleChange(event) {
  const target = event.target;

  // Verify that the target is an input element before accessing the checked property.
  if (target instanceof HTMLInputElement) {
    emit('update:modelValue', target.checked);
  }
}
</script>

<template>
  <div class="rd-toggle-wrapper">
    <input
      :id="elementId"
      :checked="modelValue"
      class="rd-toggle-input"
      :disabled="disabled"
      type="checkbox"
      @change="handleChange"
    />
    <label class="rd-toggle" :for="elementId">
      <span class="rd-toggle-slider" />
      <span class="sr-only">{{ label }}</span>
    </label>
  </div>
</template>

<style scoped>
/**
 * Logic: functional styles for the toggle are handled centrally in main.css.
 * The rd-toggle-wrapper ensures the input and label are contained together for layout stability.
 */
.rd-toggle-wrapper {
  align-items: center;
  display: inline-flex;
}

.sr-only {
  border-width: 0;
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
</style>

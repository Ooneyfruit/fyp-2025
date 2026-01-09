<template>
  <label class="rd-toggle">
    <input 
      type="checkbox" 
      :checked="modelValue" 
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="rd-toggle-input" 
    />
    <span class="rd-toggle-slider"></span>
  </label>
</template>

<script setup>
/**
 * Primitive checkbox switch component.
 * Logic: provides a visual sliding toggle and propagates the disabled state to the native input.
 */
defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
/* Logic: functional styles for the toggle are handled centrally in main.css. */
</style>
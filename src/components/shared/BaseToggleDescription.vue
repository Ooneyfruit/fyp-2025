<script setup>
/**
 * Labeled toggle component for forms.
 * Logic: combines a descriptive block with a functional toggle switch while maintaining shared state.
 */
import BaseToggle from './BaseToggle.vue';

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="rd-toggle-card" :class="{ 'is-disabled': disabled }">
    <div class="rd-toggle-info">
      <span class="rd-toggle-title">{{ title }}</span>
      <small v-if="subtitle" class="rd-toggle-subtitle">{{ subtitle }}</small>
    </div>
    <BaseToggle
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped>
/* Logic: layout and interactive state styling are handled in main.css. */
</style>

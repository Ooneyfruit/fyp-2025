<script setup lang="ts">
/**
 * A reusable toggle switch component.
 *
 * This component provides a customizable styled checkbox that looks like a
 * toggle switch (slider). It supports `v-model` binding for two-way data
 * synchronisation and can be disabled. It automatically generates a unique
 * ID to link the `<input>` with its `<label>` for accessibility.
 */

import { useId } from 'vue';

defineProps<{
  modelValue?: boolean;
  disabled?: boolean;
  label?: string;
}>();

const emit = defineEmits<(e: 'update:modelValue', checked: boolean) => void>();

const elementId = useId();

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
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
      <span class="sr-only">{{ label || 'Toggle' }}</span>
    </label>
  </div>
</template>

<style scoped>
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

.rd-toggle-input:checked + .rd-toggle .rd-toggle-slider {
  background-color: var(--colour-primary);
}

.rd-toggle-input:checked + .rd-toggle .rd-toggle-slider::before {
  transform: translateX(1rem);
}
</style>

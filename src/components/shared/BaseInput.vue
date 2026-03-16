<script setup lang="ts">
/**
 * A reusable input component.
 *
 * This component standardizes the styling and behavior of basic text
 * inputs across the application. It acts as a wrapper around a standard
 * HTML `<input>`, providing seamless `v-model` integration using a computed
 * getter/setter. It accepts an optional ID for label association.
 */

import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null;
    id?: string;
  }>(),
  {
    modelValue: '',
    id: undefined
  }
);

const emit = defineEmits<(e: 'update:modelValue', value: string | number) => void>();

const inputValue = computed({
  get: () => props.modelValue ?? '',
  set: (val) => emit('update:modelValue', val)
});
</script>

<template>
  <input :id="id" v-model="inputValue" class="rd-input" />
</template>

<script setup lang="ts">
/**
 * (needs description).
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

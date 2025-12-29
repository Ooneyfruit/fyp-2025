<template>
  <div 
    class="base-spinner animate-spin" 
    :style="spinnerStyles"
    aria-hidden="true"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: { type: String, default: '1.5rem' },
  thickness: { type: String, default: '0.125rem' },
  color: { type: String, default: 'var(--color-primary)' }
});

const spinnerStyles = computed(() => ({
  width: props.size,
  height: props.size,
  borderWidth: props.thickness,
  borderTopColor: props.color
}));
</script>

<style scoped>
.base-spinner {
  border-style: solid;
  border-color: #e2e8f0; /* Muted base track */
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
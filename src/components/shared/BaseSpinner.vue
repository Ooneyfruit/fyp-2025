<script setup>
/**
 * Primary responsibility: provides a lightweight, customizable css-based loading spinner
 * used to indicate asynchronous operations throughout the application.
 */
import { computed } from 'vue';

// Define configuration properties for the spinner's size, thickness, and brand color.
const props = defineProps({
  size: { type: String, default: '1.5rem' },
  thickness: { type: String, default: '0.125rem' },
  color: { type: String, default: 'var(--color-primary)' }
});

// Construct a style object to dynamically apply prop values to the spinner's borders.
const spinnerStyles = computed(() => ({
  width: props.size,
  height: props.size,
  borderWidth: props.thickness,
  borderTopColor: props.color
}));
</script>

<template>
  <div class="base-spinner animate-spin" :style="spinnerStyles" aria-hidden="true" />
</template>

<style scoped>
/* Layout: specific styling for the circular track and its visual consistency. */
.base-spinner {
  border-style: solid;
  /* Apply a muted color to the non-active segments of the circular track. */
  border-color: #e2e8f0;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>

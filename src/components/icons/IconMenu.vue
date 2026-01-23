<script setup>
/**
 * Primary responsibility: provides a scalable 'hamburger' menu icon for navigation controls.
 */

// Define component properties for visual customization.
defineProps({
  strokeWidth: { type: [Number, String], default: 2 }
});
</script>

<template>
  <svg
    class="rd-icon"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    :stroke-width="strokeWidth"
    viewBox="0 0 24 24"
  >
    <line x1="3" x2="21" y1="12" y2="12" />
    <line x1="3" x2="21" y1="6" y2="6" />
    <line x1="3" x2="21" y1="18" y2="18" />
  </svg>
</template>

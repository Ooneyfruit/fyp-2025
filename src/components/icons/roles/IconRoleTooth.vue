<script setup lang="ts">
/**
 * Refined tooth icon.
 * A modern, geometric representation of a molar with clean root definitions.
 */
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
    <path
      d="M7 4c-2 0-3 2-3 4s1 7 1 9c0 2 1 3 3 3s3-2 4-2 2 2 4 2 3-1 3-3c0-2 1-7 1-9s-1-4-3-4c-2 0-3 2-3 2s-1-2-3-2z"
    />
  </svg>
</template>

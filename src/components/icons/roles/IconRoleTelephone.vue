<script setup lang="ts">
/**
 * Refined telephone icon.
 * A "modern-retro" handset with sleek, minimalist communication lines.
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
      d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2 17 17 0 0 1-15-15 2 2 0 0 1 2-2z"
    />
  </svg>
</template>

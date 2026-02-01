<script setup lang="ts">
/**
 * Icon of a double-ended scaler.
 * Shows an instrument with working tips on both ends for versatility.
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
    <rect height="8" rx="1" width="4" x="10" y="8" />
    <path d="M12 8V4C12 2 15 2 15 4" />
    <path d="M12 16V20L9 22" />
  </svg>
</template>

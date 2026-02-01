<script setup lang="ts">
/**
 * Dental drill icon.
 * Minimalist representation of a high-speed clinical handpiece.
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
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m4 20 10-10m0 0 4-4m-4 0 4 4m-2-6 4 4" />
  </svg>
</template>

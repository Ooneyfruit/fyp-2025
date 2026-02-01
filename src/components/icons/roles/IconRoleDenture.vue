<script setup lang="ts">
/**
 * Icon of a denture set.
 * Represents removable prosthetics or geriatric dental care.
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
    <path d="M4 12c0-5 4-8 8-8s8 3 8 8" />
    <path d="M4 12c0 3 4 5 8 5s8-2 8-5" />
    <path d="M8 14v-4" />
    <path d="M12 16v-6" />
    <path d="M16 14v-4" />
  </svg>
</template>

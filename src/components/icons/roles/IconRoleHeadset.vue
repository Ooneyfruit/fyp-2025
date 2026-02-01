<script setup lang="ts">
/**
 * Headset icon.
 * Represents the dental receptionist role or modern support tasks.
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
    <path d="M3 14v-3a9 9 0 0 1 18 0v3" />
    <rect height="6" rx="1" width="4" x="2" y="13" />
    <rect height="6" rx="1" width="4" x="18" y="13" />
    <path d="M20 19v3h-6" />
  </svg>
</template>

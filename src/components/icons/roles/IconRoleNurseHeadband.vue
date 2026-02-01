<script setup lang="ts">
/**
 * Nurse icon.
 * Represents the dental nurse role, depicted by a traditional medical cap.
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
    <path d="M3 7v10c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V7L12 3 3 7z" />
    <path d="M12 10v6" />
    <path d="M9 13h6" />
    <path d="M19 7v6" />
    <path d="M5 7v6" />
  </svg>
</template>

<script setup lang="ts">
/**
 * Support hands icon.
 * Represents the dental support worker or patient care roles.
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
    <path d="M7 16l-4-4 4-4" />
    <path d="M17 16l4-4-4-4" />
    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <path d="M12 14v4" />
    <path d="M8 22h8" />
  </svg>
</template>

<script setup lang="ts">
/**
 * Badge icon.
 * Represents the practice principal, owner, or leadership role.
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
    <circle cx="12" cy="12" r="10" />
    <path d="m12 7 1.5 3h3L14 12l1 3.5-3-2-3 2 1-3.5-2.5-2h3z" />
  </svg>
</template>

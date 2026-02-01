<script setup lang="ts">
/**
 * Clipboard icon.
 * Represents the practice manager role, audits, or administrative tasks.
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
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect height="4" rx="1" ry="1" width="8" x="8" y="2" />
    <path d="M9 12h6m-6 4h6" />
  </svg>
</template>

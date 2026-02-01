<script setup lang="ts">
/**
 * Refined syringe icon.
 * Highlights the needle precision and plunger mechanism with thin lines.
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
    <rect height="5" rx="1" transform="rotate(-45 12 12)" width="12" x="6" y="9.5" />
    <path d="M18 6l3-3" />
    <path d="M6 18l-3 3" />
    <path d="M4.5 16.5l3 3" />
  </svg>
</template>

<script setup lang="ts">
/**
 * Refined dental mirror icon.
 * Uses perspective to depict a reflective examination tool on a thin stem.
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
    <ellipse cx="14" cy="8" rx="6" ry="5" transform="rotate(-20 14 8)" />
    <path d="M8.5 12.5L3 21" />
  </svg>
</template>

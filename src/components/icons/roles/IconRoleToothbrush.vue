<script setup lang="ts">
/**
 * Toothbrush icon.
 * Abstracted representation of preventative care tools.
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
    <path d="M4 20l10-10" />
    <path d="M14 10l3-3 3 3-3 3-3-3z" />
    <path d="M17 7l2-2" />
  </svg>
</template>

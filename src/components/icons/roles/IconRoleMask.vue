<script setup lang="ts">
/**
 * Surgical mask icon.
 * Represents the sedationist, anaesthetist, or infection control roles.
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
    <rect height="10" rx="1" width="18" x="3" y="7" />
    <path d="M3 10h18" />
    <path d="M3 14h18" />
    <path d="M3 11c-2 0-2-3 0-3" />
    <path d="M21 11c2 0 2-3 0-3" />
    <path d="M3 13c-2 0-2 3 0 3" />
    <path d="M21 13c2 0 2 3 0 3" />
  </svg>
</template>

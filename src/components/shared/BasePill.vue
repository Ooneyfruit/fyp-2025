<template>
  <span :class="['pill-bubble', typeClass]">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // e.g., 'primary', 'success', 'warning', 'muted', 'admin'
  variant: { type: String, default: 'muted' }
});

const typeClass = computed(() => `variant-${props.variant}`);
</script>

<style scoped>
.pill-bubble { 
  padding: 0.2rem 0.6rem; 
  border-radius: 2rem; 
  font-size: 0.7rem; 
  font-weight: 600; 
  display: inline-flex; 
  white-space: nowrap; 
  width: fit-content; 
}
/* Style variants mapping to your existing CSS */
.variant-muted { border: 1px solid var(--border-color); color: var(--text-muted); }
.variant-primary { background: #f3f4f6; color: #4b5563; }
.variant-admin { background: #eff6ff; color: #1e40af; }
.variant-success { background: var(--color-success-bg); color: var(--color-success); }
.variant-warning { background: var(--color-warning-bg); color: var(--color-warning); }
</style>
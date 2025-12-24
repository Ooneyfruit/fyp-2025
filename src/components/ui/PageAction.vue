<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    class="page-action"
    :disabled="disabled || processing"
    :aria-busy="processing"
    @click="!to && $emit('click')"
  >
    <div class="icon-frame" aria-hidden="true">
      <slot name="icon">
        <IconPlus />
      </slot>
    </div>
    
    <span class="action-label">
      {{ label }}
    </span>
  </component>
</template>

<script setup>
import IconPlus from '../icons/IconPlus.vue';

defineProps({
  label: { type: String, required: true },
  to: { type: [String, Object], default: null },
  disabled: { type: Boolean, default: false },
  processing: { type: Boolean, default: false }
});

defineEmits(['click']);
</script>

<style scoped>
.page-action {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs); /* Use semantic spacing */
  padding: 0.65rem 1.25rem;
  background-color: var(--color-primary);
  color: var(--text-light);
  border-radius: var(--border-radius);
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9375rem;
  line-height: 1; /* Eliminates ghost line-height */
  transition: opacity var(--anim-speed) ease;
}

.icon-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  /* OPTICAL NUDGE: Lifts icon to align with capital letter center */
  transform: translateY(-0.0625rem);
}

.action-label {
  /* OPTICAL NUDGE: Anchors text baseline to icon base */
  transform: translateY(0.0625rem);
  white-space: nowrap;
}

.page-action:hover:not(:disabled) {
  opacity: 0.9;
}

.page-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
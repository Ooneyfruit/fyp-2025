<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div v-show="isVisible" class="toast-overlay" role="status" aria-live="polite">
        <div class="toast-body rd-card">
          <span class="message">{{ message }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/**
 * Primary responsibility: provides a global notification system that renders messages at the bottom of the viewport.
 */
import { useToast } from '../../composables/useToast';

// Consume the global toast state from the shared composition function.
const { message, isVisible } = useToast();
</script>

<style scoped>
/* Layout: fixed overlay anchored to the bottom center of the screen. */
.toast-overlay {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  /* Ensure the toast remains visible above modals and other high-level ui elements. */
  z-index: var(--z-tooltip); 
  width: 100%;
  max-width: 28rem;
  padding: 0 var(--spacing-md);
  pointer-events: none;
}

/* Theme: Card styling with a distinctive brand accent border. */
.toast-body {
  padding: 1rem 1.25rem;
  pointer-events: auto;
  /* Use an inset left border to indicate notification status without extra html elements. */
  border-left: 0.375rem solid var(--color-primary);
  display: flex;
  align-items: center;
}

.message {
  color: var(--text-main);
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.4;
  white-space: pre-line;
}

/* Animation: Slide and fade logic for enter/leave states. */
.toast-slide-enter-active,
.toast-slide-leave-active {
  /* Use a spring-like cubic bezier to create a more responsive mobile feel. */
  transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 1.5rem) scale(0.95);
}

/* Responsive: Reduce margins and expand width for smaller viewports. */
@media (max-width: 40rem) {
  .toast-overlay {
    bottom: 1rem;
    max-width: 100%;
  }
}
</style>
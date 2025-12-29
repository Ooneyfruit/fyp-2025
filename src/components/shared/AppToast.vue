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
import { useToast } from '../../composables/useToast';
const { message, isVisible } = useToast();
</script>

<style scoped>
.toast-overlay {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  /* Ensures the toast stays above modals (z-modal is 1000) */
  z-index: var(--z-tooltip); 
  width: 100%;
  max-width: 28rem;
  padding: 0 var(--spacing-md);
  pointer-events: none;
}

/* Theme Inheritance */
.toast-body {
  padding: 1rem 1.25rem;
  pointer-events: auto;
  /* INNOVATION: Instead of a separate div, we use an inset border-left */
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

.toast-slide-enter-active,
.toast-slide-leave-active {
  /* Using a spring-like cubic bezier for a more "app-like" feel */
  transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 1.5rem) scale(0.95);
}

@media (max-width: 40rem) {
  .toast-overlay {
    bottom: 1rem;
    max-width: 100%;
  }
}
</style>
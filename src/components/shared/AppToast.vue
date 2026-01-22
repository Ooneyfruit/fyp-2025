<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div v-show="isVisible" class="toast-overlay" role="status" aria-live="polite">
        <div class="toast-body rd-card">
          <div class="toast-content">
            <span class="message">{{ message }}</span>

            <div class="actions">
              <BaseButton
                v-if="actionLabel"
                :label="actionLabel"
                variant="primary"
                @click="handleAction"
              />

              <button class="dismiss-btn" aria-label="Dismiss notification" @click="hideToast">
                <IconClose />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/**
 * Primary responsibility: provides a global, interactive notification system.
 * Animates messages and optional action buttons into the viewport.
 */
import { useToast } from '../../composables/useToast';
import BaseButton from './BaseButton.vue';
import IconClose from '../icons/IconClose.vue';

// Access the shared reactive state from the toast composition function.
const { message, isVisible, actionLabel, handleAction, hideToast } = useToast();
</script>

<style scoped>
/* Layout: fixed overlay anchored to the bottom center of the screen. */
.toast-overlay {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  /* Ensures the toast remains visible above modals and other high-level layers. */
  z-index: var(--z-tooltip);
  width: 100%;
  max-width: 32rem;
  padding: 0 var(--spacing-md);
  pointer-events: none;
}

/* Theme: Card styling with a brand accent and flex alignment for actions. */
.toast-body {
  padding: 0.75rem 1rem;
  pointer-events: auto;
  border-left: 0.375rem solid var(--color-primary);
}

.toast-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.message {
  color: var(--text-main);
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.4;
  white-space: pre-line;
}

/* Interaction: Styling for the optional dismissal icon button. */
.dismiss-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.dismiss-btn:hover {
  background: var(--bg-hover);
}

.dismiss-btn :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}

/* Animation: Spring-like cubic bezier for responsive entry and exit. */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  /* Maintain the horizontal centering while sliding vertically and scaling. */
  transform: translate(-50%, 1.5rem) scale(0.95);
}

/* Responsive: Optimize layout for mobile viewports using a dynamic wrapping strategy. */
@media (max-width: 40rem) {
  .toast-overlay {
    bottom: 1rem;
    max-width: 100%;
  }

  .toast-content {
    /* Logic: utilize wrapping instead of a forced column to prevent unnecessary vertical expansion. */
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem var(--spacing-sm);
  }

  .actions {
    /* Logic: push actions to the end to maintain horizontal hierarchy where space allows. */
    margin-left: auto;
    flex-shrink: 0;
    justify-content: flex-end;
  }
}
</style>

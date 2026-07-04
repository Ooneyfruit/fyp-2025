<script setup lang="ts">
/**
 * Provides a global, interactive notification system.
 * Animates messages and optional action buttons into the viewport.
 */
import IconClose from '@/components/icons/IconClose.vue';
import { useToast } from '@/composables/useToast';

import BaseButton from './BaseButton.vue';

// Access the shared reactive state from the toast composition function.
const { message, isVisible, actionLabel, handleAction, hideToast } = useToast();
</script>

<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <output v-show="isVisible" class="toast-overlay">
        <div class="toast-body rd-card">
          <div class="toast-content">
            <span class="message">{{ message }}</span>

            <div class="actions">
              <BaseButton
                v-if="actionLabel"
                :label="actionLabel"
                variant="primary"
                @click="() => handleAction()"
              />

              <button
                aria-label="Dismiss notification"
                class="dismiss-btn"
                @click="() => hideToast()"
              >
                <IconClose />
              </button>
            </div>
          </div>
        </div>
      </output>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Layout: fixed overlay anchored to the bottom centre of the screen. */
.toast-overlay {
  bottom: 2rem;
  left: 50%;
  max-width: 32rem;
  padding: 0 var(--spacing-md);
  pointer-events: none;
  position: fixed;
  transform: translateX(-50%);
  width: 100%;

  /* Ensures the toast remains visible above modals and other high-level layers. */
  z-index: var(--z-tooltip);
}

/* Theme: Card styling with a brand accent and flex alignment for actions. */
.toast-body {
  border-left: 0.375rem solid var(--colour-primary);
  padding: 0.75rem 1rem;
  pointer-events: auto;
}

.toast-content {
  align-items: center;
  display: flex;
  gap: var(--spacing-md);
  justify-content: space-between;
}

.actions {
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: 0.5rem;
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
  align-items: center;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  padding: 0.5rem;
  transition: background 0.2s;
}

.dismiss-btn:hover {
  background: var(--bg-hover);
}

.dismiss-btn :deep(svg) {
  height: 1.25rem;
  width: 1.25rem;
}

/* Animation: Spring-like cubic bezier for responsive entry and exit. */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;

  /* Maintain the horizontal centring while sliding vertically and scaling. */
  transform: translate(-50%, 1.5rem) scale(0.95);
}

/* Responsive: Optimise layout for mobile viewports using a dynamic wrapping strategy. */
@media (width <= 40rem) {
  .toast-overlay {
    bottom: 1rem;
    max-width: 100%;
  }

  .toast-content {
    align-items: center;

    /* Logic: utilise wrapping instead of a forced column to prevent unnecessary vertical expansion. */
    flex-wrap: wrap;
    gap: 0.5rem var(--spacing-sm);
  }

  .actions {
    flex-shrink: 0;
    justify-content: flex-end;

    /* Logic: push actions to the end to maintain horizontal hierarchy where space allows. */
    margin-left: auto;
  }
}
</style>

<script setup>
/**
 * Primary responsibility: provides a robust, accessible modal dialog system
 * with built-in scroll locking, keyboard dismissal, and flexible sizing.
 */
import { onUnmounted,watch } from 'vue';

import IconClose from '@/components/icons/IconClose.vue';

// Define configuration for appearance and visibility state.
const props = defineProps({
  title: { type: String, default: 'Modal Window' },
  show: { type: Boolean, default: false },
  // Controls the maximum width of the modal container.
  size: { type: String, default: 'md' }
});

// Define events for state management and cleanup notifications.
const emit = defineEmits(['request-close', 'closed']);

/**
 * Forwards a request to the parent component to toggle the visibility state.
 * @returns {void}
 */
const handleRequestClose = () => emit('request-close');

/**
 * Monitors keyboard events to provide standard escape-key dismissal logic.
 * @param {KeyboardEvent} e - The keyboard event object.
 */
const handleKeyDown = (e) => {
  // Only trigger dismissal if the escape key is pressed while the modal is active.
  if (e.key === 'Escape' && props.show) handleRequestClose();
};

/**
 * Manage global side effects when the modal state changes.
 */
watch(
  () => props.show,
  (isVisible) => {
    if (isVisible) {
      // Disable body scrolling to prevent layout shifting behind the modal.
      document.body.style.overflow = 'hidden';
      globalThis.addEventListener('keydown', handleKeyDown);
    } else {
      // Restore default scroll behavior and clean up event listeners.
      document.body.style.overflow = '';
      globalThis.removeEventListener('keydown', handleKeyDown);
    }
  },
  { immediate: true }
);

// Ensure global side effects are cleared if the component is destroyed.
onUnmounted(() => {
  document.body.style.overflow = '';
  globalThis.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="rd-modal" @after-leave="$emit('closed')">
      <div
        v-if="show"
        aria-modal="true"
        class="modal-root"
        :class="[`size-${size}`]"
        role="dialog"
        tabindex="-1"
      >
        <div class="modal-overlay" @click="handleRequestClose" />

        <div class="modal-container rd-card">
          <header class="modal-header rd-card-header">
            <slot name="header">
              <h3 class="modal-title">
                {{ title }}
              </h3>
              <button
                aria-label="Close"
                class="close-btn"
                type="button"
                @click="handleRequestClose"
              >
                <IconClose :stroke-width="2.5" />
              </button>
            </slot>
          </header>

          <div class="modal-body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Layout: full-screen fixed container to center the modal dialog. */
.modal-root {
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  padding: var(--spacing-sm);
  position: fixed;

  /* Maintain position above standard content and navigation. */
  z-index: var(--z-modal);
}

/* Overlay: dimmed background with light blurring to focus user attention. */
.modal-overlay {
  backdrop-filter: blur(1px);
  background: rgb(15 23 42 / 50%);
  inset: 0;
  position: absolute;
  transition: opacity 0.15s ease-out;
}

/* Container: the physical card structure of the modal. */
.modal-container {
  background: white;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 40%);
  display: flex;
  flex-direction: column;

  /* Constrain height to ensure the modal remains within the viewport on small screens. */
  max-height: min(45rem, 90vh);
  position: relative;
  transform-origin: center;
  width: calc(100% - (var(--spacing-md) * 2));
  z-index: 1;
}

/* Sizing Logic: max-width definitions for various modal sizes. */
.size-sm .modal-container {
  max-width: 24rem;
}

.size-md .modal-container {
  max-width: 36rem;
}

.size-lg .modal-container {
  max-width: 54rem;
}

/* Layout: responsiveness and padding adjustments for larger viewports. */
@media (width >= 48rem) {
  .modal-root {
    padding: var(--spacing-sm) var(--spacing-sm);
  }
}

/* Header: layout and visual separation from the main body content. */
.modal-header {
  border-bottom: 1px solid var(--border-color);
  justify-content: space-between;
}

.modal-title {
  color: var(--text-main);
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
}

/* Controls: dismissal button styling and interactive states. */
.close-btn {
  align-items: center;
  background: none;
  border: none;
  border-radius: var(--border-radius);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  margin: -0.5rem;
  padding: 0.5rem;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background-color: var(--bg-app);
  color: var(--color-danger);
}

.close-btn :deep(svg) {
  height: 1.25rem;
  width: 1.25rem;
}

/* Body: internal padding and scroll management for long content. */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

/* Footer: background and border logic to anchor actions at the bottom. */
.modal-footer {
  background: var(--bg-app);
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-sm) var(--spacing-md);
}

/* Animation: complex transitions for opacity and scale to create a high-quality feel. */
.rd-modal-enter-active {
  transition: opacity 0.15s cubic-bezier(0.25, 1, 0.5, 1);
}

.rd-modal-leave-active {
  transition: opacity 0.1s cubic-bezier(0.5, 0, 0.75, 0);
}

.rd-modal-enter-active .modal-container {
  transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.rd-modal-leave-active .modal-container {
  transition: transform 0.1s cubic-bezier(0.5, 0, 0.75, 0);
}

.rd-modal-enter-from {
  opacity: 0;
}

.rd-modal-enter-from .modal-container {
  transform: scale(0.95) translateY(10px);
}

.rd-modal-leave-to {
  opacity: 0;
}

.rd-modal-leave-to .modal-container {
  transform: scale(0.98);
}
</style>

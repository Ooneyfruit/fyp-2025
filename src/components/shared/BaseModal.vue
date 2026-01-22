<script setup>
/**
 * Primary responsibility: provides a robust, accessible modal dialog system
 * with built-in scroll locking, keyboard dismissal, and flexible sizing.
 */
import { watch, onUnmounted } from 'vue';
import IconClose from '../icons/IconClose.vue';

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
      window.addEventListener('keydown', handleKeyDown);
    } else {
      // Restore default scroll behavior and clean up event listeners.
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    }
  },
  { immediate: true }
);

// Ensure global side effects are cleared if the component is destroyed.
onUnmounted(() => {
  document.body.style.overflow = '';
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="rd-modal" @after-leave="$emit('closed')">
      <div
        v-if="show"
        class="modal-root"
        :class="[`size-${size}`]"
        role="dialog"
        aria-modal="true"
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
                class="close-btn"
                type="button"
                aria-label="Close"
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
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Maintain position above standard content and navigation. */
  z-index: var(--z-modal);
  padding: var(--spacing-sm);
}

/* Overlay: dimmed background with light blurring to focus user attention. */
.modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(1px);
  transition: opacity 0.15s ease-out;
}

/* Container: the physical card structure of the modal. */
.modal-container {
  position: relative;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  transform-origin: center;
  z-index: 1;
  width: calc(100% - (var(--spacing-md) * 2));
  /* Constrain height to ensure the modal remains within the viewport on small screens. */
  max-height: min(45rem, 90vh);
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
@media (min-width: 48rem) {
  .modal-root {
    padding: var(--spacing-sm) var(--spacing-sm);
  }
}

/* Header: layout and visual separation from the main body content. */
.modal-header {
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-main);
}

/* Controls: dismissal button styling and interactive states. */
.close-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: var(--border-radius);
  transition: all 0.15s ease;
  margin: -0.5rem;
}

.close-btn:hover {
  background-color: var(--bg-app);
  color: var(--color-danger);
}

.close-btn :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}

/* Body: internal padding and scroll management for long content. */
.modal-body {
  padding: var(--spacing-md);
  flex: 1;
  overflow-y: auto;
}

/* Footer: background and border logic to anchor actions at the bottom. */
.modal-footer {
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background: var(--bg-app);
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
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

<script lang="ts">
/**
 * Shared state to track the number of open modals across the application.
 * This ensures the body scroll lock is only removed when the LAST modal closes.
 * Declared in a separate script block to exist at the module level (singleton).
 */
let openModalCount = 0;
</script>

<script setup lang="ts">
/**
 * Primary responsibility: Provides a robust, accessible modal dialog system.
 * Features:
 * - Stack-aware scroll locking (via shared module state)
 * - Keyboard dismissal
 * - Flexible sizing and footer injection
 */
import { type Component, onUnmounted, watch } from 'vue';

import IconClose from '@/components/icons/IconClose.vue';

// Props are defined inline to avoid "exported variable using private name" (VLS)
// and "unused exported type" (Knip) errors simultaneously.
const props = withDefaults(
  defineProps<{
    title?: string;
    show?: boolean;
    /**
     * Controls the maximum width of the modal container.
     * Options: 'sm' | 'md' | 'lg'
     */
    size?: string;
    /**
     * Optional component to render in the footer area.
     * Eliminates the need for nested templates in parent components.
     */
    footerComponent?: Component;
    /**
     * Props to pass to the footerComponent.
     */
    footerProps?: Record<string, unknown>;
  }>(),
  {
    title: 'Modal Window',
    show: false,
    size: 'md',
    footerComponent: undefined,
    footerProps: () => ({})
  }
);

// Define events for state management and cleanup notifications.
const emit = defineEmits(['request-close', 'closed']);

/**
 * Forwards a request to the parent component to toggle the visibility state.
 */
const handleRequestClose = () => emit('request-close');

/**
 * Monitors keyboard events to provide standard escape-key dismissal logic.
 * @param e - The keyboard event object.
 */
const handleKeyDown = (e: KeyboardEvent) => {
  // Only trigger dismissal if the escape key is pressed while the modal is active.
  if (e.key === 'Escape' && props.show) handleRequestClose();
};

// --- Scroll Locking Logic ---
// We track 'isLocked' per instance to prevent double-counting if the watcher fires redundantly.
let isLocked = false;

const lockBody = () => {
  if (!isLocked) {
    openModalCount++;
    // Only apply the style if this is the first modal opening
    if (openModalCount === 1) {
      document.body.style.overflow = 'hidden';
    }
    isLocked = true;
    globalThis.addEventListener('keydown', handleKeyDown);
  }
};

const unlockBody = () => {
  if (isLocked) {
    openModalCount--;
    // Only restore scrolling if NO other modals are open
    if (openModalCount === 0) {
      document.body.style.overflow = '';
    }
    isLocked = false;
    globalThis.removeEventListener('keydown', handleKeyDown);
  }
};

/**
 * Manages global side effects when the modal state changes.
 */
watch(
  () => props.show,
  (isVisible) => {
    if (isVisible) {
      lockBody();
    } else {
      unlockBody();
    }
  },
  { immediate: true }
);

// Ensures global side effects are cleared if the component is destroyed.
onUnmounted(() => {
  unlockBody();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="rd-modal" @after-leave="$emit('closed')">
      <div v-if="show" class="modal-root" :class="[`size-${size}`]">
        <div class="modal-overlay" @click="handleRequestClose"></div>

        <dialog aria-modal="true" class="modal-container rd-card" open tabindex="-1">
          <header class="modal-header rd-card-header">
            <slot name="header">
              <h3 class="modal-title">{{ title }}</h3>
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

          <footer v-if="footerComponent || $slots.footer" class="modal-footer">
            <component :is="footerComponent" v-if="footerComponent" v-bind="footerProps" />
            <slot v-else name="footer" />
          </footer>
        </dialog>
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

/* Resets default user-agent styles for the native dialog element. */
dialog.modal-container {
  border: none;
  color: inherit;
  margin: 0;
  padding: 0;
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

<script setup>
/**
 * Primary responsibility: provides a robust, accessible modal dialogue system
 * using the native HTML5 <dialog> element.
 * Supports scroll locking, backdrop management, and dynamic component injection.
 */
import { ref, watch } from 'vue';

import IconClose from '@/components/icons/IconClose.vue';

const props = defineProps({
  title: { type: String, default: 'Modal Window' },
  show: { type: Boolean, default: false },
  // Controls the maximum width of the modal container.
  size: { type: String, default: 'md' },
  /**
   * Component to render in the modal footer to avoid deep slot nesting.
   */
  footerComponent: {
    type: Object,
    default: null
  },
  /**
   * Props mapping for the injected footer component.
   */
  footerProps: {
    type: Object,
    default: () => ({})
  },
  /**
   * Event listener mapping for the injected footer component.
   */
  footerListeners: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['request-close', 'closed']);

// Logic: explicit type casting resolves 'Property does not exist on type never' errors.
const modalRef = ref(/** @type {HTMLDialogElement | null} */ (null));

/**
 * Synchronises the native dialogue state with the reactive 'show' prop.
 * Logic: uses showModal() for top-layer rendering and focus management.
 */
watch(
  () => props.show,
  (isVisible) => {
    if (isVisible) {
      modalRef.value?.showModal();
    } else {
      modalRef.value?.close();
    }
  },
  { immediate: true }
);

/**
 * Handles the native 'close' event emitted by the dialogue (e.g. via Escape key).
 */
const handleNativeClose = () => {
  emit('request-close');
  emit('closed');
};
</script>

<template>
  <Teleport to="body">
    <dialog ref="modalRef" class="modal-root" :class="[`size-${size}`]" @close="handleNativeClose">
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
              @click="$emit('request-close')"
            >
              <IconClose :stroke-width="2.5" />
            </button>
          </slot>
        </header>

        <div class="modal-body">
          <slot />
        </div>

        <footer v-if="footerComponent || $slots.footer" class="modal-footer">
          <component
            :is="footerComponent"
            v-if="footerComponent"
            v-bind="footerProps"
            v-on="footerListeners"
          />
          <slot v-else name="footer" />
        </footer>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
/* Layout: centring and backdrop styling for the native dialogue element. */
.modal-root {
  background: none;
  border: none;
  inset: 0;
  margin: auto;
  max-height: 90vh;
  outline: none;
  padding: 0;
  width: calc(100% - (var(--spacing-md) * 2));
  z-index: var(--z-modal);
}

/* Logic: '::backdrop' replaces custom overlay divs in native dialogues. */
.modal-root::backdrop {
  backdrop-filter: blur(1px);
  background: rgb(15 23 42 / 50%);
}

.modal-container {
  background: white;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 40%);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.size-sm.modal-root {
  max-width: 24rem;
}

.size-md.modal-root {
  max-width: 36rem;
}

.size-lg.modal-root {
  max-width: 54rem;
}

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

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.modal-footer {
  background: var(--bg-app);
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-sm) var(--spacing-md);
}
</style>

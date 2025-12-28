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
        <div class="modal-overlay" @click="handleRequestClose"></div>
        
        <div class="modal-container rd-card">
          <header class="modal-header rd-card-header">
            <slot name="header">
              <h3 class="modal-title">{{ title }}</h3>
              <button 
                class="close-btn" 
                @click="handleRequestClose" 
                type="button" 
                aria-label="Close"
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

<script setup>
import { watch, onUnmounted } from 'vue';
import IconClose from '../icons/IconClose.vue';

const props = defineProps({ 
  title: { type: String, default: 'Modal Window' },
  show: { type: Boolean, default: false },
  // Variants: 'sm', 'md', 'lg'
  size: { type: String, default: 'md' }
});

const emit = defineEmits(['request-close', 'closed']);

const handleRequestClose = () => emit('request-close');

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.show) handleRequestClose();
};

/**
 * BODY SCROLL LOCKING
 */
watch(() => props.show, (isVisible) => {
  if (isVisible) {
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
  } else {
    document.body.style.overflow = '';
    window.removeEventListener('keydown', handleKeyDown);
  }
}, { immediate: true });

onUnmounted(() => { 
  document.body.style.overflow = '';
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.modal-root {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal); 
  padding: var(--spacing-md);
}

.modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(1px);
  transition: opacity 0.15s ease-out;
}

.modal-container {
  position: relative;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  transform-origin: center;
  z-index: 1;
  width: calc(100% - (var(--spacing-md) * 2));
  max-height: min(45rem, 90vh);
}

/* Sizing Logic */
.size-sm .modal-container { max-width: 24rem; }
.size-md .modal-container { max-width: 36rem; }
.size-lg .modal-container { max-width: 54rem; }

@media (min-width: 48rem) {
  .modal-root {
    padding: var(--spacing-lg) var(--spacing-lg);
  }
}

.modal-header {
  justify-content: space-between;
  /* RESTORED: Tiny dividing line separating title from body */
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-main);
}

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

.modal-body {
  padding: var(--spacing-md);
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background: var(--bg-app);
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}

/**
 * PREMIUM ANIMATION SYSTEM
 */
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
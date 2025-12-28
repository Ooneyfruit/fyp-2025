<template>
  <Teleport to="body">
    <Transition name="rd-modal" @after-leave="$emit('closed')">
      <div 
        v-if="show"
        class="modal-root" 
        role="dialog" 
        aria-modal="true" 
        tabindex="-1"
      >
        <div class="modal-overlay" @click="handleRequestClose"></div>
        
        <div class="modal-container rd-card">
          <header class="modal-header">
            <h3>{{ title }}</h3>
            <button 
              class="close-btn" 
              @click="handleRequestClose" 
              type="button" 
              aria-label="Close"
            >
              <IconClose :stroke-width="2.5" />
            </button>
          </header>

          <div class="modal-body">
            <slot />
          </div>
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
  show: { type: Boolean, default: false }
});

const emit = defineEmits(['request-close', 'closed']);

const handleRequestClose = () => emit('request-close');

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.show) handleRequestClose();
};

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
  background: rgba(15, 23, 42, 0.4);
  /* Faster overlay sync */
  transition: opacity 0.12s ease-out;
}

.modal-container {
  position: relative;
  background: white;
  width: 100%;
  max-width: 34rem;
  height: min(40rem, 90vh);
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  transform-origin: center;
  z-index: 1;
}

.modal-header {
  padding: 1.25rem var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
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
}

.close-btn:hover {
  background-color: var(--bg-app);
  color: var(--color-danger);
  transform: scale(1.1);
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

/* PREMIUM INSTANT ANIMATION SYSTEM
   Entry: High-velocity decel (Quartic Out) for smoothness at speed.
   Leave: Pure acceleration (Quartic In) for disappearing.
*/
.rd-modal-enter-active {
  transition: opacity 0.12s cubic-bezier(0.25, 1, 0.5, 1);
}

.rd-modal-leave-active {
  transition: opacity 0.1s cubic-bezier(0.5, 0, 0.75, 0);
}

.rd-modal-enter-active .modal-container {
  /* Aggressive smooth snap */
  transition: transform 0.18s cubic-bezier(0.25, 1, 0.5, 1);
}

.rd-modal-leave-active .modal-container {
  /* Instant retreat */
  transition: transform 0.1s cubic-bezier(0.5, 0, 0.75, 0);
}

.rd-modal-enter-from, .rd-modal-leave-to {
  opacity: 0;
}

.rd-modal-enter-from .modal-container {
  transform: scale(0.96) translateY(8px);
}

.rd-modal-leave-to .modal-container {
  transform: scale(0.98);
}
</style>
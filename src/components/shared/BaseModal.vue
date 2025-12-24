<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div class="modal-root">
        <div class="modal-overlay" @click="$emit('request-close')"></div>
        <div class="modal-container">
          <header class="modal-header">
            <h3>{{ title }}</h3>
            <button class="close-btn" @click="$emit('request-close')">&times;</button>
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
import { onMounted, onUnmounted } from 'vue';
defineProps({ title: String });
defineEmits(['request-close']);

onMounted(() => { 
  console.log("[BaseModal] Root element mounted. Locking body scroll.");
  document.body.style.overflow = 'hidden'; 
});

onUnmounted(() => { 
  console.log("[BaseModal] Root element unmounted. Restoring body scroll.");
  document.body.style.overflow = ''; 
});
</script>

<style scoped>
/* ALL ORIGINAL STYLES PRESERVED */
.modal-root { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 1.5rem; }
.modal-overlay { position: absolute; inset: 0; background: rgba(31, 41, 55, 0.3); backdrop-filter: blur(2px); }
.modal-container { position: relative; background: #ffffff; width: 100%; max-width: 34rem; height: 40rem; max-height: 90vh; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; overflow: hidden; }
.modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.modal-header h3 { margin: 0; font-size: 1.125rem; font-weight: 600; }
.close-btn { background: none; border: none; font-size: 1.75rem; color: #9ca3af; cursor: pointer; line-height: 1; }
.modal-body { padding: 1.5rem; flex: 1; overflow-y: auto; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.15s linear; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div v-if="isVisible" class="toast-wrapper">
        <div class="toast-card">
          <div class="accent-bar"></div>
          <div class="content">
            <span class="message">{{ message }}</span>
          </div>
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
.toast-wrapper { position: fixed; bottom: 2.5rem; left: 50%; transform: translateX(-50%); z-index: 10001; pointer-events: none; width: 90%; max-width: 32rem; }
.toast-card { background: #ffffff; border: 1px solid var(--border-color); border-radius: 0.75rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); display: flex; overflow: hidden; }
.accent-bar { width: 0.375rem; background: var(--color-primary); flex-shrink: 0; }
.content { padding: 1rem 1.25rem; flex: 1; background: #ffffff; }
.message { color: var(--text-main); font-size: 0.9rem; font-weight: 500; white-space: pre-line; line-height: 1.4; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translate(-50%, 2rem); }
</style>
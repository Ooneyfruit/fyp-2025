<template>
  <div class="auth-wrapper">
    <div v-if="!isAuthReady" class="loading-container">
      <svg class="clock-logo" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <div class="loading-msg">Checking authentication...</div>
    </div>
    <slot v-else />
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth';
const { isAuthReady } = useAuth();
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1rem;
}
.clock-logo {
  color: var(--color-primary);
  animation: pulse 2s infinite;
}
.loading-msg {
  color: var(--text-muted);
  font-size: 1.1rem;
}
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
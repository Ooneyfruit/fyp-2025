<template>
  <div class="auth-wrapper">
    <div v-if="!isAuthReady" class="loading-msg">
      Checking authentication...
    </div>

    <slot v-else />
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth';

const { isAuthReady } = useAuth();
</script>

<style scoped>
.loading-msg { 
  text-align: center; 
  margin-top: 50px; 
  color: #666; 
  font-size: 1.1rem;
}
</style>
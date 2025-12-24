<template>
  <div class="auth-wrapper">
    <AppLoading v-if="!isAuthReady" full-screen>
      Checking authentication...
    </AppLoading>
    
    <slot v-else />
  </div>
</template>

<script setup>
import { useAuth } from '../../composables/useAuth';
import AppLoading from '../shared/AppLoading.vue';

const { isAuthReady } = useAuth();
</script>

<style scoped>
.auth-wrapper {
  /* Ensures no layout shifts when the slot content appears */
  min-height: 100vh;
}
</style>
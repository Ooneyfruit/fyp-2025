<template>
  <div class="app-auth-guard app-layout">
    <Transition name="fade" mode="out-in">
      <AppLoading 
        v-if="!isAuthReady" 
        full-screen
      >
        Checking authentication...
      </AppLoading>
      
      <slot v-else />
    </Transition>
  </div>
</template>

<script setup>
/**
 * Component logic for monitoring global authentication readiness.
 */
import { useAuth } from '../../composables/useAuth';
import AppLoading from '../shared/AppLoading.vue';

// Access the reactive readiness state from the auth composable
const { isAuthReady } = useAuth();
</script>

<style scoped>
/** * Layout: Component-specific overrides 
 */
.app-auth-guard {
  /* Match the global app background to ensure seamless transitions during initial load */
  background-color: var(--bg-app);
}
</style>
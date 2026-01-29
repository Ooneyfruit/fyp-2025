<script setup lang="ts">
/**
 * Component logic for monitoring global authentication readiness.
 */
import AppLoading from '@/components/shared/AppLoading.vue';
import { useAuth } from '@/composables/useAuth';

// Access the reactive readiness state from the auth composable
const { isAuthReady } = useAuth();
</script>

<template>
  <div class="app-auth-guard app-layout">
    <Transition mode="out-in" name="fade">
      <AppLoading v-if="!isAuthReady" full-screen> Checking authentication... </AppLoading>

      <slot v-else />
    </Transition>
  </div>
</template>

<style scoped>
/* Layout: Component-specific overrides */
.app-auth-guard {
  /* Match the global app background to ensure seamless transitions during initial load */
  background-color: var(--bg-app);
}
</style>

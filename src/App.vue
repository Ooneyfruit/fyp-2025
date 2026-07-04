<script setup lang="ts">
/**
 * Main application shell.
 * Orchestrates global layout states and manages PWA update notifications.
 */

import { useRegisterSW } from 'virtual:pwa-register/vue';
import { onMounted, type Ref, watch } from 'vue';

import AppSideMenu from '@/components/layout/AppSideMenu.vue';
import AppToast from '@/components/shared/AppToast.vue';
import { user } from '@/composables/useAuth';
import { initLayoutStabilisation, useLayout } from '@/composables/useLayout';
import { useToast } from '@/composables/useToast';
// Shared layout and UI components.
import { NavBar } from '@/features/navbar/navbarApi';

// Interfaces for JS Composables

interface UseLayoutReturn {
  isSidebarOpen: Ref<boolean>;
  isMobile: Ref<boolean>;
  canAnimate: Ref<boolean>;
  toggleSidebar: () => void;
}

interface UseToastReturn {
  showToast: (message: string, options?: object) => void;
}

// Logic & State

const { isSidebarOpen, isMobile, canAnimate, toggleSidebar } = useLayout() as UseLayoutReturn;
const { showToast } = useToast() as UseToastReturn;

const { needRefresh, updateServiceWorker } = useRegisterSW({
  /**
   * Callback fired when the service worker is successfully registered.
   * Confirms that the PWA features are active in the current browser session.
   */
  onRegistered() {
    // Service worker registered successfully.
  },
  /**
   * Callback fired when a new content version is detected by the browser.
   * Signals that the application should prompt the user to refresh.
   */
  onNeedRefresh() {
    // New content is available; toast will be triggered by the watcher below.
  }
});

// Watch for PWA refresh triggers and delegate to the global toast system.
watch(needRefresh, (available: boolean) => {
  if (available) {
    showToast('A new version of RotaDent is available.', {
      duration: 0,
      action: {
        label: 'Refresh Now',
        callback: updateServiceWorker
      }
    });
  }
});

onMounted(() => {
  /**
   * Triggers the conservative stabilisation window.
   * Only allows animations once the browser has proven sustained main-thread availability.
   */
  initLayoutStabilisation();
});
</script>

<template>
  <div
    class="app-layout"
    :class="{
      'is-sidebar-open': isSidebarOpen,
      'is-mobile': isMobile,
      'is-animate-ready': canAnimate
    }"
  >
    <NavBar v-if="user" @toggle-sidebar="() => toggleSidebar()" />
    <AppSideMenu v-if="user" />

    <main :class="user ? 'main-content' : 'full-screen'">
      <router-view />
    </main>

    <AppToast />
  </div>
</template>

<style scoped>
/* Layout: core shell dimensions. */
.app-layout {
  min-height: 100vh;
}

.is-mobile .main-content {
  margin-left: 0;
}

.is-sidebar-open:not(.is-mobile) .main-content {
  margin-left: var(--sidebar-width);
}

/* Responsive: override content margins for small screens. */
@media (width <= 48rem) {
  .main-content {
    margin-left: 0;
  }
}
</style>

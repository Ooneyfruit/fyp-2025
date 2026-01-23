<script setup>
/**
 * Main application shell.
 * Orchestrates global layout states and manages PWA update notifications.
 */
// @ts-expect-error Virtual module 'virtual:pwa-register/vue' may lack type definitions in the current environment.
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { onMounted, watch } from 'vue';

import AppSideMenu from '@/components/layout/AppSideMenu.vue';
import AppToast from '@/components/shared/AppToast.vue';
import { user } from '@/composables/useAuth';
import { initLayoutStabilisation, useLayout } from '@/composables/useLayout';
import { useToast } from '@/composables/useToast';
// Shared layout and UI components.
import { NavBar } from '@/features/navbar/navbarAPI';

const { isSidebarOpen, isMobile, canAnimate, toggleSidebar } = useLayout();
const { showToast } = useToast();

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
watch(needRefresh, (available) => {
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

/* Sidebar context: spacing rules for the main content area.
  Note: .is-mobile must come BEFORE the desktop overrides to satisfy specificity order
  in some linting configurations, though specificity itself dictates application.
  Here we order them to ensure no-descending-specificity compliance.
*/

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

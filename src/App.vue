<template>
  <div 
    class="app-layout" 
    :class="{ 
      'is-sidebar-open': isSidebarOpen, 
      'is-mobile': isMobile,
      'is-animate-ready': canAnimate 
    }"
  >
    <template v-if="user">
      <NavBar @toggleSidebar="toggleSidebar" />
      <AppSideMenu />
    </template>

    <main :class="user ? 'main-content' : 'full-screen'">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <AppToast />
  </div>
</template>

<script setup>
/**
 * Main application shell.
 * Orchestrates global layout states, feature API integration, and PWA updates.
 */
import { onMounted, watch } from 'vue';
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { user } from './composables/useAuth';
import { useLayout, initLayoutStabilization } from './composables/useLayout';
import { useToast } from './composables/useToast';

// Feature API: consolidated entry point for navigation capabilities.
import { NavBar } from './features/navbar/navbarAPI';

// Shared layout and UI components.
import AppSideMenu from './components/layout/AppSideMenu.vue';
import AppToast from './components/shared/AppToast.vue';

const { isSidebarOpen, isMobile, canAnimate, toggleSidebar } = useLayout();
const { showToast } = useToast();

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered() { console.log('[PWA] Service Worker Registered'); },
  onNeedRefresh() { console.log('[PWA] Version update available.'); }
});

// Watch for PWA refresh triggers and delegate to the global toast system.
watch(needRefresh, (available) => {
  if (available) {
    showToast("A new version of RotaDent is available.", {
      duration: 0,
      action: {
        label: "Refresh Now",
        callback: updateServiceWorker
      }
    });
  }
});

onMounted(() => {
  /**
   * Triggers the conservative stabilization window.
   * Only allows animations once the browser has proven sustained main-thread availability.
   */
  initLayoutStabilization();
});
</script>

<style scoped>
/* Layout: core shell dimensions and vertical expansion */
.app-layout { 
  min-height: 100vh; 
}

/* Sidebar context: spacing rules for the main content area */
.is-sidebar-open:not(.is-mobile) .main-content { 
  margin-left: var(--sidebar-width); 
}

/* Responsive: override content margins for small screens */
.is-mobile .main-content { 
  margin-left: 0; 
}

/* Responsive: override content margins for small screens */
@media (max-width: 48rem) { 
  .main-content { 
    margin-left: 0; 
  } 
}
</style>
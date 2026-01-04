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
      <router-view />
    </main>

    <Transition name="pwa-fade">
      <div v-if="needRefresh" class="pwa-update-banner" role="alert">
        <div class="banner-content">
          <div class="text-group">
            <span class="title">System Update</span>
            <span class="desc">A new version of RotaDent is available.</span>
          </div>
          <BaseButton 
            label="Refresh Now" 
            variant="primary" 
            @click="updateServiceWorker()" 
          />
        </div>
      </div>
    </Transition>

    <AppToast />
  </div>
</template>

<script setup>
/**
 * Main application shell.
 * Orchestrates global layout states and applies the dynamic stabilization lockout.
 */
import { onMounted } from 'vue';
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { user } from './composables/useAuth';
import { useLayout, initLayoutStabilization } from './composables/useLayout';

// Shared layout and UI components.
import NavBar from './components/layout/NavBar.vue';
import AppSideMenu from './components/layout/AppSideMenu.vue';
import AppToast from './components/shared/AppToast.vue';
import BaseButton from './components/shared/BaseButton.vue';

const { isSidebarOpen, isMobile, canAnimate, toggleSidebar } = useLayout();

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered() { console.log('[PWA] Service Worker Registered'); },
  onNeedRefresh() { console.log('[PWA] Version update available.'); }
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
.app-layout { 
  min-height: 100vh; 
}

/* Sidebar context: spacing rules for the main content area */
.is-sidebar-open:not(.is-mobile) .main-content { 
  margin-left: var(--sidebar-width); 
}

.is-mobile .main-content { 
  margin-left: 0; 
}

/* PWA Notification Banner Styles */
.pwa-update-banner {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-modal); 
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  width: calc(100% - 2.5rem);
  max-width: 32rem;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.text-group {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.text-group .title {
  font-weight: 700;
  color: var(--text-main);
  font-size: 0.9375rem;
}

.text-group .desc {
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.pwa-fade-enter-active, .pwa-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.pwa-fade-enter-from, .pwa-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 2rem);
}

@media (max-width: 48rem) { 
  .main-content { 
    margin-left: 0; 
  } 
  .pwa-update-banner { 
    bottom: 1rem; 
  }
}
</style>
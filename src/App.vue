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
      <SideMenu 
        :isOpen="isSidebarOpen" 
        :isMobile="isMobile"
        @close="closeSidebar" 
      />
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
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRegisterSW } from 'virtual:pwa-register/vue'; // PWA Lifecycle Hook
import { user } from './composables/useAuth';
import NavBar from './components/layout/NavBar.vue';
import SideMenu from './components/layout/SideMenu.vue';
import AppToast from './components/shared/AppToast.vue';
import BaseButton from './components/shared/BaseButton.vue';

const isMobile = ref(window.innerWidth < 768);
const desktopPreference = ref(localStorage.getItem('isSidebarOpen') === 'true');
const isSidebarOpen = ref(isMobile.value ? false : desktopPreference.value);

// Transitions only enable after layout stabilization
const canAnimate = ref(false);

/**
 * PWA REGISTRATION & UPDATE STRATEGY
 * needRefresh becomes true when a new service worker is detected.
 */
const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered(r) {
    console.log('[PWA] Service Worker Registered');
  },
  onNeedRefresh() {
    console.log('[PWA] New version detected; showing refresh prompt.');
  }
});

const syncHtmlClasses = (isOpen) => {
  document.documentElement.classList.toggle('initial-layout-wide', isOpen);
  document.documentElement.classList.toggle('initial-layout-slim', !isOpen);
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  syncHtmlClasses(isSidebarOpen.value);
  
  if (!isMobile.value) {
    desktopPreference.value = isSidebarOpen.value;
    localStorage.setItem('isSidebarOpen', isSidebarOpen.value);
  }
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
  syncHtmlClasses(false);
};

const handleResize = () => {
  const wasMobile = isMobile.value;
  isMobile.value = window.innerWidth < 768;

  if (wasMobile !== isMobile.value) {
    document.documentElement.classList.toggle('initial-layout-mobile', isMobile.value);
    if (isMobile.value) {
      isSidebarOpen.value = false;
    } else {
      isSidebarOpen.value = desktopPreference.value;
    }
    syncHtmlClasses(isSidebarOpen.value);
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  
  /**
   * DYNAMIC STABILIZATION LOGIC:
   * Safety window to ensure hydration is finished before allowing CSS slides.
   */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        canAnimate.value = true;
        console.log("[App] Layout stabilized. Smooth transitions enabled.");
      }, 1000);
    });
  });
});

onUnmounted(() => window.removeEventListener('resize', handleResize));

watch(user, (val) => {
  if (val) {
    isSidebarOpen.value = isMobile.value ? false : desktopPreference.value;
    syncHtmlClasses(isSidebarOpen.value);
  }
}, { immediate: true });
</script>

<style scoped>
.app-layout { min-height: 100vh; }

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
  /* Ensures the banner stays above the sidebar but below high-level tooltips */
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

/* Animation context matching the toast component style */
.pwa-fade-enter-active, .pwa-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}
.pwa-fade-enter-from, .pwa-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 2rem);
}

@media (max-width: 48rem) { 
  .main-content { margin-left: 0; } 
  .pwa-update-banner { bottom: 1rem; }
}
</style>
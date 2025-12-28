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

    <AppToast />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { user } from './composables/useAuth';
import NavBar from './components/layout/NavBar.vue';
import SideMenu from './components/layout/SideMenu.vue';
import AppToast from './components/shared/AppToast.vue'; // Required import for global visibility

const isMobile = ref(window.innerWidth < 768);
const desktopPreference = ref(localStorage.getItem('isSidebarOpen') === 'true');
const isSidebarOpen = ref(isMobile.value ? false : desktopPreference.value);

// Transitions only enable after layout stabilization
const canAnimate = ref(false);

/**
 * Synchronizes the global HTML classes used by the index.html teleport script
 * to maintain consistent positioning until Vue state takes over completely.
 */
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
   * We wait for two animation frames to guarantee the browser has processed the
   * static layout, then apply a 1000ms safety window. This is the 'minimum time'
   * required to ensure hydration is finished before allowing CSS slides.
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

@media (max-width: 48rem) { 
  .main-content { margin-left: 0; } 
}
</style>
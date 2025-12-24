<template>
  <div 
    class="app-layout" 
    :class="{ 
      'is-sidebar-open': isSidebarOpen, 
      'is-mobile': isMobile,
      'no-transitions': isInitialLoad
    }"
  >
    <template v-if="user">
      <NavBar @toggleSidebar="toggleSidebar" :isAccountModalOpen="isAccountModalOpen" />
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
import { useRoute, useRouter } from 'vue-router';
import { user } from './composables/useAuth';
import { useToast } from './composables/useToast';

import NavBar from './components/layout/NavBar.vue';
import SideMenu from './components/layout/SideMenu.vue';
import AppToast from './components/shared/AppToast.vue';

const route = useRoute();
const router = useRouter();
const { showToast } = useToast();

const isMobile = ref(window.innerWidth < 768);
const isInitialLoad = ref(true);
const isAccountModalOpen = ref(false);

// Memory: Desktop preference is persistent. Mobile is volatile (always closed on refresh/load).
const getInitialState = () => {
  if (window.innerWidth < 768) return false;
  const saved = localStorage.getItem('isSidebarOpen');
  // Default to open (true) if never set
  return saved === null ? true : saved === 'true';
};

const isSidebarOpen = ref(getInitialState());

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  if (!isMobile.value) {
    localStorage.setItem('isSidebarOpen', isSidebarOpen.value);
  }
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

const handleResize = () => {
  const wasMobile = isMobile.value;
  isMobile.value = window.innerWidth < 768;

  if (wasMobile !== isMobile.value) {
    if (isMobile.value) {
      // Transition to Mobile: Menu disappears immediately
      isSidebarOpen.value = false;
    } else {
      // Transition to Desktop: Restore memory preference
      const desktopPref = localStorage.getItem('isSidebarOpen') !== 'false';
      isSidebarOpen.value = isSidebarOpen.value ? true : desktopPref;
    }
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  // Kill transitions for the first 100ms to allow layout to settle jump-free
  setTimeout(() => { isInitialLoad.value = false; }, 100);
});

onUnmounted(() => window.removeEventListener('resize', handleResize));

// Practice Switch logic with unified toast messaging
watch(user, (curr, prev) => {
  if (prev && curr && prev.practiceRef?.id !== curr.practiceRef?.id) {
    const practiceName = curr.activePracticeName;
    const permissions = curr.is_administrator ? "Admin" : "Standard";
    let baseMsg = `Switched to ${practiceName}. You have ${permissions} permissions.`;

    if (route.meta.requiresAdmin && !curr.is_administrator) {
      router.push('/');
      showToast(`Forced to home page.\n${baseMsg}`);
    } else {
      showToast(baseMsg);
    }
  }
}, { immediate: false });
</script>

<style scoped>
.app-layout { min-height: 100vh; }

/* Suppresses layout 'jumps' on first load or during specific state changes */
.no-transitions, .no-transitions * {
  transition: none !important;
}

.main-content {
  padding-top: var(--navbar-height);
  transition: margin-left var(--anim-speed) ease;
  margin-left: var(--sidebar-slim-width);
}

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
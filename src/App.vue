<template>
  <div 
    class="app-layout" 
    :class="{ 
      'is-sidebar-open': isSidebarOpen, 
      'is-mobile': isMobile 
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
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
// FIXED: Import the ref directly; do not re-declare it below
import { user } from './composables/useAuth';
import NavBar from './components/layout/NavBar.vue';
import SideMenu from './components/layout/SideMenu.vue';

const isMobile = ref(window.innerWidth < 768);
const desktopPreference = ref(localStorage.getItem('isSidebarOpen') === 'true');
const isSidebarOpen = ref(isMobile.value ? false : desktopPreference.value);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  if (!isMobile.value) {
    desktopPreference.value = isSidebarOpen.value;
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
      isSidebarOpen.value = false;
    } else {
      isSidebarOpen.value = desktopPreference.value;
    }
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => window.removeEventListener('resize', handleResize));

watch(user, (val) => {
  if (val) {
    isSidebarOpen.value = isMobile.value ? false : desktopPreference.value;
  }
}, { immediate: true });
</script>

<style scoped>
.app-layout { min-height: 100vh; }
.main-content {
  padding-top: var(--navbar-height);
  transition: margin-left var(--anim-speed) ease;
  margin-left: var(--sidebar-slim-width);
}
.is-sidebar-open:not(.is-mobile) .main-content { margin-left: var(--sidebar-width); }
.is-mobile .main-content { margin-left: 0; }
@media (max-width: 48rem) { .main-content { margin-left: 0; } }
</style>
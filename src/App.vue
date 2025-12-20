<template>
  <div 
    class="app-layout" 
    :class="{ 
      'is-sidebar-open': isSidebarOpen, 
      'stop-transitions': !enableTransitions 
    }"
  >
    <template v-if="user">
      <NavBar @toggleSidebar="toggleSidebar" />
      <SideMenu :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />
    </template>

    <main :class="user ? 'main-content' : 'full-screen'">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuth } from './composables/useAuth';
import NavBar from './components/NavBar.vue';
import SideMenu from './components/SideMenu.vue';

const { user } = useAuth();
const enableTransitions = ref(false);
const storedState = localStorage.getItem('isSidebarOpen');
const isSidebarOpen = ref(storedState === 'true');

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

watch(isSidebarOpen, (newValue) => localStorage.setItem('isSidebarOpen', newValue));

watch(user, (newValue) => {
  if (newValue) {
    setTimeout(() => enableTransitions.value = true, 100);
  } else {
    enableTransitions.value = false;
  }
}, { immediate: true });
</script>

<style scoped>
.app-layout { min-height: 100vh; }

/* Desktop Behaviour */
.main-content {
  padding-top: var(--navbar-height);
  transition: margin-left var(--anim-speed) ease;
  
  /* Default (Closed) */
  margin-left: var(--sidebar-slim-width); 
}

/* Open State */
.is-sidebar-open .main-content {
  margin-left: var(--sidebar-width);
}

.full-screen { padding: 0; margin: 0; }

/* Mobile Behaviour */
@media (max-width: 48rem) {
  .main-content { margin-left: 0; }
  .is-sidebar-open .main-content { margin-left: 0; }
}

.stop-transitions :deep(*) { transition: none !important; }
</style>
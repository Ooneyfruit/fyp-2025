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
// ... Script section remains exactly the same ...
// (Imports, useAuth, watch logic, etc. do not need changes)
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

/* --- DESKTOP BEHAVIOR --- */
.main-content {
  padding-top: var(--navbar-height);
  transition: margin-left var(--anim-speed) ease;
  
  /* DEFAULT (Closed): content sits next to the slim sidebar */
  margin-left: var(--sidebar-slim-width); 
}

/* OPEN STATE: content pushed by full sidebar */
.is-sidebar-open .main-content {
  margin-left: var(--sidebar-width);
}

.full-screen { padding: 0; margin: 0; }

/* --- MOBILE BEHAVIOR (< 768px) --- */
@media (max-width: 48rem) {
  /* On mobile, closed means GONE, so margin is 0 */
  .main-content { margin-left: 0; }
  
  /* Even when open, sidebar overlays content, so margin stays 0 */
  .is-sidebar-open .main-content { margin-left: 0; }
}

.stop-transitions :deep(*) { transition: none !important; }
</style>
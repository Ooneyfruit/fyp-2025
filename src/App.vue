<template>
  <div class="app-layout" :class="{ 'is-sidebar-open': isSidebarOpen }">
    
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
import { ref } from 'vue';
// We do NOT need useRouter here anymore for redirects
// We do NOT need watchEffect here anymore
import { useAuth } from './composables/useAuth';
import NavBar from './components/NavBar.vue';
import SideMenu from './components/SideMenu.vue';

const { user } = useAuth();
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// NOTICE: The watchEffect is GONE.
// The Router (src/router/index.js) is now the only thing handling redirects.
</script>

<style scoped>
.app-layout { min-height: 100vh; }

.main-content {
  padding-top: var(--navbar-height);
  transition: margin-left var(--anim-speed) ease;
  margin-left: 0;
}

.is-sidebar-open .main-content {
  margin-left: var(--sidebar-width);
}

.full-screen {
  padding: 0;
  margin: 0;
}

@media (max-width: 768px) {
  .is-sidebar-open .main-content { margin-left: 0; }
}
</style>
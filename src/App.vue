<template>
  <div class="app-layout" :class="{ 'is-sidebar-open': isSidebarOpen }">
    
    <NavBar @toggleSidebar="toggleSidebar" />
    
    <SideMenu 
      :isOpen="isSidebarOpen" 
      @close="isSidebarOpen = false" 
    />
    
    <main class="main-content">
      <StaffManagement />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import NavBar from './components/NavBar.vue';
import SideMenu from './components/SideMenu.vue';
import StaffManagement from './components/StaffManagement.vue';

const isSidebarOpen = ref(false); // Closed by default

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<style scoped>
/* 1. Layout Container */
.app-layout {
  min-height: 100vh;
}

/* 2. Main Content Behavior */
.main-content {
  /* Push content down to account for Navbar */
  padding-top: var(--navbar-height);
  
  /* Smooth transition for the "Slide" effect */
  transition: margin-left var(--anim-speed) ease;
  
  /* Default: No indentation */
  margin-left: 0;
}

/* 3. THE PUSH LOGIC */
/* When sidebar is open, add left margin equal to sidebar width */
.is-sidebar-open .main-content {
  margin-left: var(--sidebar-width);
}

/* --- MOBILE RESPONSIVENESS --- */
/* On small screens, we DON'T want to push content (it squishes too much).
   We revert to 'Overlay' style just for mobile. */
@media (max-width: 768px) {
  .is-sidebar-open .main-content {
    margin-left: 0; /* Don't push on mobile */
  }
}
</style>
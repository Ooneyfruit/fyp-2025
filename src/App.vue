<template>
  <div class="app-layout">
    <NavBar @toggleSidebar="isSidebarOpen = !isSidebarOpen" />
    
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
import SideMenu from './components/SideMenu.vue'; // Import the new component
import StaffManagement from './components/StaffManagement.vue';

// The Source of Truth for the sidebar state
const isSidebarOpen = ref(false);
</script>

<style>
body { margin: 0; background-color: #f8f9fa; font-family: sans-serif; }
</style>
<template>
  <div>
    <div 
      v-if="isOpen" 
      class="overlay" 
      @click="$emit('close')"
    ></div>

    <aside class="sidebar" :class="{ 'open': isOpen }">
      <div class="sidebar-header">
        <h3>Menu</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>

      <nav class="sidebar-nav">
        <a 
          v-for="item in menuItems" 
          :key="item.name"
          href="#" 
          class="nav-item"
          :class="{ active: item.active }"
        >
          <span class="icon">{{ item.icon }}</span>
          {{ item.name }}
        </a>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  isOpen: Boolean
});

defineEmits(['close']);

// DATA: Add new sidebar items here
const menuItems = ref([
  { name: 'Staff Management', icon: '👥', active: true },
  // Future items:
  // { name: 'My Rota', icon: '📅', active: false },
  // { name: 'Patients', icon: '🏥', active: false },
]);
</script>

<style scoped>
.overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); z-index: 998;
}

.sidebar {
  position: fixed; top: 0; left: 0; height: 100%; width: 250px;
  background: white; z-index: 999;
  transform: translateX(-100%); /* Hidden by default */
  transition: transform 0.3s ease;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  display: flex; flex-direction: column;
}

.sidebar.open {
  transform: translateX(0); /* Slide in */
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex; justify-content: space-between; align-items: center;
}

.sidebar-header h3 { margin: 0; font-size: 18px; color: #333; }

.close-btn {
  background: none; border: none; font-size: 24px; cursor: pointer; color: #666;
}

.sidebar-nav { padding: 20px 0; }

.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 24px;
  text-decoration: none; color: #555; font-weight: 500;
  transition: background 0.2s;
}

.nav-item:hover { background-color: #f5f5f5; }

.nav-item.active {
  background-color: #e8f0fe; color: #1967d2;
  border-right: 3px solid #1967d2;
}

.icon { font-size: 18px; }
</style>
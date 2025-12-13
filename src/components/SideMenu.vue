<template>
  <div>
    <div 
      v-if="isOpen" 
      class="mobile-overlay" 
      @click="$emit('close')"
    ></div>

    <aside class="sidebar" :class="{ 'open': isOpen }">
      <nav class="sidebar-nav">
        <a 
          v-for="item in menuItems" 
          :key="item.name"
          href="#" 
          class="nav-item"
          :class="{ active: item.active }"
          @click.prevent="handleNavigation(item)" 
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

defineProps({ isOpen: Boolean });
const emit = defineEmits(['close']);

const menuItems = ref([
  { name: 'Staff Management', icon: '👥', active: true },
]);

const handleNavigation = (item) => {
  menuItems.value.forEach(i => i.active = false);
  item.active = true;
  // On Desktop: You might want the menu to STAY open after clicking. 
  // If so, remove the line below. For now, we close it.
  emit('close');
};
</script>

<style scoped>
.sidebar {
  /* USE VARIABLES */
  top: var(--navbar-height);
  width: var(--sidebar-width);
  height: calc(100vh - var(--navbar-height));
  
  position: fixed;
  left: 0;
  background: white;
  border-right: 1px solid #eee;
  z-index: 40;
  
  /* Slide Animation */
  transform: translateX(-100%);
  transition: transform var(--anim-speed) ease;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-nav { padding: 20px 0; }

.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 24px;
  text-decoration: none; color: #555; font-weight: 500;
  border-left: 4px solid transparent;
}

.nav-item:hover { background-color: #f5f5f5; }

.nav-item.active {
  background-color: #e8f0fe; color: #1967d2;
  border-left-color: #1967d2; /* Highlight left border */
}

/* --- MOBILE ONLY OVERLAY --- */
.mobile-overlay {
  display: none; /* Hidden on desktop */
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); z-index: 39;
}

@media (max-width: 768px) {
  .mobile-overlay { display: block; } /* Show on mobile */
}
</style>
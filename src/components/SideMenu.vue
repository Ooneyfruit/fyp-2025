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
          :class="{ active: route.path === item.path }" 
          @click.prevent="handleNavigation(item)" 
          :title="!isOpen ? item.name : ''" 
        >
          <span class="icon">{{ item.icon }}</span>
          
          <span class="label" :class="{ 'hidden': !isOpen }">
            {{ item.name }}
          </span>
        </a>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../composables/useAuth';

defineProps({ isOpen: Boolean });
const emit = defineEmits(['close']);
const { user } = useAuth();
const router = useRouter();
const route = useRoute();

const allMenuItems = [
  { name: 'Home', icon: '🏠', path: '/', adminOnly: false },
  { name: 'Staff Management', icon: '👥', path: '/staff', adminOnly: true },
];

const menuItems = computed(() => {
  return allMenuItems.filter(item => item.adminOnly ? user.value?.is_administrator : true);
});

const handleNavigation = (item) => {
  if (window.innerWidth < 768) emit('close');
  router.push(item.path);
};
</script>

<style scoped>
/* Base Styles */
.sidebar {
  top: var(--navbar-height);
  bottom: 0;
  position: fixed;
  left: 0;
  background: white;
  border-right: 1px solid var(--border-color);
  z-index: var(--z-sidebar);
  
  /* Transitions */
  transition: width var(--anim-speed) ease, transform var(--anim-speed) ease;
  overflow-x: hidden; /* Hide text when it slides out */
  white-space: nowrap; /* Prevent text wrapping during animation */

  /* Default State */
  width: var(--sidebar-slim-width);
  transform: translateX(0); 
}

/* Open State */
.sidebar.open {
  width: var(--sidebar-width);
}

.sidebar-nav { padding: var(--spacing-md) 0; }

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0; /* Adjust padding to center the icon when slim */
  padding-left: 1.5rem; /* Fixed left padding ensures icon stays in place */
  
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 500;
  border-left: 0.25rem solid transparent;
  font-size: 1rem;
  height: 3rem;
}

.nav-item:hover { background-color: #f5f5f5; }
.nav-item.active { background-color: #e8f0fe; color: #1967d2; border-left-color: #1967d2; }

.icon {
  font-size: 1.25rem;
  min-width: 1.5rem; /* Ensure icon reserves space */
  text-align: center;
}

/* Text Label Logic */
.label {
  margin-left: 0.75rem;
  opacity: 1;
  transition: opacity 0.2s ease;
}

/* Label Hiding Logic */
.label.hidden {
  opacity: 0;
  pointer-events: none; /* Prevent clicking hidden text */
}

/* Mobile Overrides */
@media (max-width: 48rem) {
  .sidebar {
    width: var(--sidebar-width);
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }
  
  .label.hidden {
    opacity: 1; 
  }
  
  .mobile-overlay {
    display: block;
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); z-index: var(--z-overlay);
  }
}
</style>
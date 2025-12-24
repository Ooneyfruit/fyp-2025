<template>
  <div>
    <Transition name="fade-overlay">
      <div 
        v-if="isOpen && isMobile" 
        class="mobile-overlay" 
        @click="$emit('close')"
      ></div>
    </Transition>

    <aside class="sidebar" :class="{ 'open': isOpen }">
      <nav class="sidebar-nav">
        <a 
          v-for="item in menuItems" 
          :key="item.name"
          href="#" 
          class="nav-item"
          :class="{ active: route.path === item.path }" 
          @click.prevent="handleNavigation(item)" 
          :title="(!isOpen && !isMobile) ? item.name : ''" 
        >
          <span class="icon">
            <component :is="item.icon" />
          </span>
          
          <span class="label" :class="{ 'visible': isOpen }">
            {{ item.name }}
          </span>
        </a>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { computed, markRaw } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../../composables/useAuth';

import IconHome from '../icons/IconHome.vue';
import IconUsers from '../icons/IconUsers.vue';

const props = defineProps({ isOpen: Boolean, isMobile: Boolean });
const emit = defineEmits(['close']);

const { user } = useAuth();
const router = useRouter();
const route = useRoute();

const allMenuItems = [
  { name: 'Home', icon: markRaw(IconHome), path: '/', adminOnly: false },
  { name: 'User Management', icon: markRaw(IconUsers), path: '/users', adminOnly: true },
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
.sidebar {
  top: var(--navbar-height); bottom: 0; position: fixed; left: 0;
  background: white; border-right: 1px solid var(--border-color);
  z-index: var(--z-sidebar); 
  /* Transitions are active here but suppressed via parent class in App.vue on load */
  transition: width var(--anim-speed) ease, transform var(--anim-speed) ease;
  overflow-x: hidden; white-space: nowrap;
  width: var(--sidebar-slim-width); /* Default desktop state */
}

.sidebar.open { width: var(--sidebar-width); }
.sidebar-nav { padding: var(--spacing-md) 0; }

.nav-item {
  display: flex; align-items: center; padding-left: 1.5rem; 
  text-decoration: none; color: var(--text-muted);
  font-weight: 500; border-left: 0.25rem solid transparent;
  height: 3rem;
}

.nav-item:hover { background-color: #f5f5f5; }
.nav-item.active { background-color: #e8f0fe; color: var(--color-primary); border-left-color: var(--color-primary); }

.icon { width: 1.5rem; height: 1.5rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.label { margin-left: 0.75rem; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
.label.visible { opacity: 1; pointer-events: auto; }

@media (max-width: 48rem) {
  .sidebar {
    /* IMPORTANT: width is NOT forced to full-width here. 
       It inherits var(--sidebar-slim-width) from above, preventing the "stretch" glitch.
    */
    transform: translateX(-105%); 
    transition: transform var(--anim-speed) ease;
  }
  .sidebar.open { 
    /* Force full width only when mobile menu is actually toggled open */
    width: var(--sidebar-width);
    transform: translateX(0); 
  }
}

.mobile-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(31, 41, 55, 0.3); backdrop-filter: blur(2px); z-index: var(--z-overlay); }
.fade-overlay-enter-active, .fade-overlay-leave-active { transition: opacity 0.3s ease; }
.fade-overlay-enter-from, .fade-overlay-leave-to { opacity: 0; }
</style>
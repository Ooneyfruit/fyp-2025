<template>
  <div>
    <Transition name="fade">
      <div 
        v-if="isSidebarOpen && isMobile" 
        class="mobile-overlay" 
        @click="closeSidebar"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      ></div>
    </Transition>

    <aside 
      class="sidebar" 
      :class="{ 'open': isSidebarOpen, 'is-swiping': isSwiping }"
      :style="swipeTransform"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <nav class="sidebar-nav">
        <a 
          v-for="item in filteredMenuItems" 
          :key="item.name"
          href="#" 
          class="nav-item"
          :class="{ active: route.path === item.path }" 
          @click.prevent="handleNavigation(item)" 
          :title="(!isSidebarOpen && !isMobile) ? item.name : ''" 
        >
          <span class="icon">
            <component :is="item.icon" />
          </span>
          
          <span class="label" :class="{ 'visible': isSidebarOpen }">
            {{ item.name }}
          </span>
        </a>
      </nav>
    </aside>
  </div>
</template>

<script setup>
/**
 * Navigation sidebar with enhanced touch interaction.
 * Uses a proxy-event pattern to allow swiping from anywhere on the screen.
 */
import { computed, markRaw } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { useLayout } from '../../composables/useLayout';
import { useSwipeAway } from '../../composables/useSwipeAway';

// Component icons.
import IconHome from '../icons/IconHome.vue';
import IconUsers from '../icons/IconUsers.vue';

const MENU_CONFIG = [
  { name: 'Home', icon: markRaw(IconHome), path: '/', adminOnly: false },
  { name: 'User Management', icon: markRaw(IconUsers), path: '/users', adminOnly: true },
];

const { isSidebarOpen, isMobile, closeSidebar } = useLayout();
const { user } = useAuth();
const router = useRouter();
const route = useRoute();

// Gesture logic is active only when the sidebar is visible on mobile.
const isSwipeEnabled = computed(() => isMobile.value && isSidebarOpen.value);

// Initialize generalized swipe logic to drive the sidebar animation.
const { 
  isSwiping, 
  swipeTransform, 
  handleTouchStart, 
  handleTouchMove, 
  handleTouchEnd 
} = useSwipeAway({
  threshold: 80,
  onTrigger: closeSidebar,
  enabled: isSwipeEnabled
});

const filteredMenuItems = computed(() => {
  return MENU_CONFIG.filter(item => 
    item.adminOnly ? user.value?.is_administrator : true
  );
});

/**
 * Handles navigation events and ensures menu closure on mobile.
 * @param {Object} item - Navigation item metadata.
 */
const handleNavigation = (item) => {
  if (isMobile.value) {
    closeSidebar();
  }
  router.push(item.path);
};
</script>

<style scoped>
/* Sidebar container with transition logic for state changes */
.sidebar {
  top: var(--navbar-height); 
  bottom: 0;
  position: fixed;
  left: 0;
  background: white;
  border-right: 0.0625rem solid var(--border-color);
  z-index: var(--z-sidebar); 
  overflow-x: hidden;
  white-space: nowrap;
  width: var(--sidebar-slim-width);
  transition: width 0.3s ease, transform 0.3s ease;
}

/* Prevent transition conflicts during active manual swiping */
.sidebar.is-swiping {
  transition: none;
}

.sidebar.open { 
  width: var(--sidebar-width); 
}

.sidebar-nav { 
  padding: var(--spacing-md) 0; 
}

.nav-item {
  display: flex;
  align-items: center;
  padding-left: 1.5rem; 
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 500;
  border-left: 0.25rem solid transparent;
  font-size: 1rem;
  height: 3rem;
  line-height: 1;
}

.nav-item:hover { 
  background-color: #f5f5f5; 
}

.nav-item.active { 
  background-color: #e8f0fe; 
  color: #1967d2; 
  border-left-color: #1967d2; 
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0; 
}

.label {
  margin-left: 0.75rem;
  opacity: 0; 
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.label.visible { 
  opacity: 1; 
  pointer-events: auto; 
}

/* Mobile positioning logic */
@media (max-width: 48rem) {
  .sidebar {
    width: var(--sidebar-width);
    transform: translateX(-100%);
  }
  .sidebar.open {
    transform: translateX(0);
  }
}

/* Overlay serves as the touch proxy for viewport-wide gestures */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(31, 41, 55, 0.3);
  backdrop-filter: blur(2px);
  z-index: var(--z-overlay);
  touch-action: none;
}
</style>
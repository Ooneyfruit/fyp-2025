<script setup>
/**
 * Navigation sidebar with enhanced touch interaction.
 * Uses a proxy-event pattern to allow swiping from anywhere on the screen.
 */
import { computed, markRaw } from 'vue';
import { useRoute,useRouter } from 'vue-router';

// Component icons.
import IconCalendar from '@/components/icons/IconCalendar.vue'; // Changed from IconHome
import IconUsers from '@/components/icons/IconUsers.vue';
import { useAuth } from '@/composables/useAuth';
import { useLayout } from '@/composables/useLayout';
import { useSwipeAway } from '@/composables/useSwipeAway';

const MENU_CONFIG = [
  { name: 'Rota', icon: markRaw(IconCalendar), path: '/', adminOnly: false },
  { name: 'User Management', icon: markRaw(IconUsers), path: '/users', adminOnly: true }
];

const { isSidebarOpen, isMobile, closeSidebar } = useLayout();
const { user } = useAuth();
const router = useRouter();
const route = useRoute();

// Gesture logic is active only when the sidebar is visible on mobile.
const isSwipeEnabled = computed(() => isMobile.value && isSidebarOpen.value);

// Initialize generalized swipe logic to drive the sidebar animation.
const { isSwiping, swipeTransform, handleTouchStart, handleTouchMove, handleTouchEnd } =
  useSwipeAway({
    threshold: 80,
    onTrigger: closeSidebar,
    enabled: isSwipeEnabled
  });

const filteredMenuItems = computed(() => {
  return MENU_CONFIG.filter((item) => (item.adminOnly ? user.value?.is_administrator : true));
});

/**
 * Handles navigation events and ensures menu closure on mobile.
 * @param {object} item - Navigation item metadata.
 */
const handleNavigation = (item) => {
  if (isMobile.value) {
    closeSidebar();
  }
  router.push(item.path);
};
</script>

<template>
  <div>
    <Transition name="fade">
      <div
        v-if="isSidebarOpen && isMobile"
        class="mobile-overlay"
        @click="closeSidebar"
        @touchend="handleTouchEnd"
        @touchmove="handleTouchMove"
        @touchstart="handleTouchStart"
      />
    </Transition>

    <aside
      class="sidebar"
      :class="{ open: isSidebarOpen, 'is-swiping': isSwiping }"
      :style="swipeTransform"
      @touchend="handleTouchEnd"
      @touchmove="handleTouchMove"
      @touchstart="handleTouchStart"
    >
      <nav class="sidebar-nav">
        <a
          v-for="item in filteredMenuItems"
          :key="item.name"
          class="nav-item"
          :class="{ active: route.path === item.path }"
          href="#"
          :title="!isSidebarOpen && !isMobile ? item.name : ''"
          @click.prevent="handleNavigation(item)"
        >
          <span class="icon">
            <component :is="item.icon" />
          </span>

          <span class="label" :class="{ visible: isSidebarOpen }">
            {{ item.name }}
          </span>
        </a>
      </nav>
    </aside>
  </div>
</template>

<style scoped>
/* Sidebar container with transition logic for state changes */
.sidebar {
  background: white;
  border-right: 0.0625rem solid var(--border-color);
  bottom: 0;
  left: 0;
  overflow-x: hidden;
  position: fixed;
  top: var(--navbar-height);
  transition:
    width 0.3s ease,
    transform 0.3s ease;
  white-space: nowrap;
  width: var(--sidebar-slim-width);
  z-index: var(--z-sidebar);
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
  align-items: center;
  border-left: 0.25rem solid transparent;
  color: var(--text-muted);
  display: flex;
  font-size: 1rem;
  font-weight: 500;
  height: 3rem;
  line-height: 1;
  padding-left: 1.5rem;
  text-decoration: none;
}

.nav-item:hover {
  background-color: #f5f5f5;
}

.nav-item.active {
  background-color: #e8f0fe;
  border-left-color: #1967d2;
  color: #1967d2;
}

.icon {
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: 1.5rem;
  justify-content: center;
  width: 1.5rem;
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
@media (width <= 48rem) {
  .sidebar {
    transform: translateX(-100%);
    width: var(--sidebar-width);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}

/* Overlay serves as the touch proxy for viewport-wide gestures */
.mobile-overlay {
  backdrop-filter: blur(2px);
  background: rgb(31 41 55 / 30%);
  height: 100%;
  left: 0;
  position: fixed;
  top: 0;
  touch-action: none;
  width: 100%;
  z-index: var(--z-overlay);
}
</style>

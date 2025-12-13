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
        >
          <span class="icon">{{ item.icon }}</span>
          {{ item.name }}
        </a>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../composables/useAuth';

// 1. Define Props (Fixes the "isOpen" error)
defineProps({
  isOpen: Boolean
});

// 2. Define Emits
const emit = defineEmits(['close']);

// 3. Setup Logic
const { user } = useAuth();
const router = useRouter();
const route = useRoute();

// 4. Define Menu Items (Static List)
const allMenuItems = [
  { name: 'Home', icon: '🏠', path: '/', adminOnly: false },
  { name: 'Staff Management', icon: '👥', path: '/staff', adminOnly: true },
];

// 5. Computed Filter (Hides Admin items if user isn't admin)
const menuItems = computed(() => {
  return allMenuItems.filter(item => {
    // If the item requires admin, check if the user is an admin.
    // If user is null (not logged in), this safely returns false.
    return item.adminOnly ? user.value?.is_administrator : true;
  });
});

const handleNavigation = (item) => {
  emit('close');
  router.push(item.path);
};
</script>

<style scoped>
/* Use your existing styles or the REM-based ones we created earlier */
.sidebar {
  top: var(--navbar-height);
  bottom: 0;
  width: var(--sidebar-width);
  position: fixed;
  left: 0;
  background: white;
  border-right: 1px solid var(--border-color);
  z-index: var(--z-sidebar);
  transform: translateX(-100%);
  transition: transform var(--anim-speed) ease;
  overflow-y: auto; 
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-nav {
  padding: var(--spacing-md) 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 500;
  border-left: 0.25rem solid transparent;
  font-size: 1rem;
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
  font-size: 1.125rem;
}

.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: var(--z-overlay);
}

@media (max-width: 48rem) {
  .mobile-overlay { display: block; }
}
</style>
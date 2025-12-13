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
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router'; // Import useRoute

defineProps({ isOpen: Boolean });
const emit = defineEmits(['close']);
const router = useRouter();
const route = useRoute(); // Initialize Route to read current URL

const menuItems = ref([
  // No longer need 'active: true' here. 
  // The template calculates it automatically based on the URL.
  { name: 'Home', icon: '🏠', path: '/' },
  { name: 'Staff Management', icon: '👥', path: '/staff' },
]);

const handleNavigation = (item) => {
  emit('close');
  router.push(item.path);
};
</script>

<style scoped>
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
  gap: 0.75rem; /* 12px */
  padding: 0.75rem 1.5rem; /* 12px 24px */
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 500;
  border-left: 0.25rem solid transparent;
  font-size: 1rem;
}

.nav-item:hover {
  background-color: #f5f5f5;
}

/* This class applies whenever the URL matches the item.path */
.nav-item.active {
  background-color: #e8f0fe;
  color: #1967d2;
  border-left-color: #1967d2;
}

.icon {
  font-size: 1.125rem; /* 18px */
}

/* Mobile Overlay */
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
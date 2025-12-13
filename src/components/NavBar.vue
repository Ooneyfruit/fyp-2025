<template>
  <nav class="navbar">
    <div class="nav-left">
      <button @click="$emit('toggleSidebar')" class="hamburger-btn" aria-label="Menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div class="brand-container">
        <svg class="clock-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span class="brand-text">RotaDent</span>
      </div>
    </div>

    <div class="nav-actions">
      <div v-if="user" class="user-info">
        <span class="user-email">{{ user.email }}</span>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'; // 1. Import Router
import { useAuth } from '../composables/useAuth';

defineEmits(['toggleSidebar']);

const { user, logout } = useAuth();
const router = useRouter(); // 2. Initialize Router

const handleLogout = async () => {
  await logout();
  // 3. Force navigation to Login page immediately after logout
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  height: var(--navbar-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 0 var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: var(--z-navbar);
  flex-shrink: 0;
  box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.02);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.hamburger-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3125rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  border-radius: var(--border-radius);
}

.hamburger-btn:hover {
  background-color: #f0f0f0;
}

.brand-container {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.clock-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-primary);
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
  letter-spacing: -0.03rem;
}

.nav-actions {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.9375rem;
}

.user-email {
  font-size: 0.875rem;
  color: var(--text-muted);
  display: none;
}

@media (min-width: 48rem) {
  .user-email { display: block; }
}

.logout-btn {
  background-color: #f1f3f4;
  color: var(--text-main);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background-color: #e8eaed;
}
</style>
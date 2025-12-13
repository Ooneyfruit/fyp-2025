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
import { useAuth } from '../composables/useAuth';

// We define an event 'toggleSidebar' that the parent (App.vue) listens for
defineEmits(['toggleSidebar']);

const { user, logout } = useAuth();

const handleLogout = async () => {
  await logout();
};
</script>

<style scoped>
.navbar {
  /* Use the variable */
  height: var(--navbar-height);
  
  display: flex; justify-content: space-between; align-items: center;
  background-color: white; padding: 0 20px;
  border-bottom: 1px solid #e0e0e0; 
  position: sticky; top: 0; z-index: 50;
  /* Ensure resizing doesn't squash the nav */
  flex-shrink: 0; 
}
/* ... rest of your styles ... */

.nav-left { display: flex; align-items: center; gap: 20px; }

.hamburger-btn {
  background: none; border: none; cursor: pointer; padding: 5px;
  color: #555; display: flex; align-items: center; border-radius: 4px;
}
.hamburger-btn:hover { background-color: #f0f0f0; }

.brand-container { display: flex; align-items: center; gap: 10px; }

.clock-icon { color: #4285F4; }

.brand-text {
  font-size: 20px; font-weight: 600; color: #4285F4; letter-spacing: -0.5px;
}

.nav-actions { display: flex; align-items: center; }
.user-info { display: flex; align-items: center; gap: 15px; }
.user-email { font-size: 14px; color: #555; display: none; } /* Hide email on small screens if needed */

/* Show email on larger screens */
@media (min-width: 768px) {
  .user-email { display: block; }
}

.logout-btn {
  background-color: #f1f3f4; color: #333; border: none; padding: 8px 16px;
  border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer;
  transition: background 0.2s;
}
.logout-btn:hover { background-color: #e8eaed; }
</style>
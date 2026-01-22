<template>
  <div ref="menuRef" class="user-menu-coordinator">
    <div v-if="!isMobile" class="desktop-layout">
      <NavUserTrigger :email="user.email" @click="openAccountModal" />

      <BaseButton label="Log Out" variant="secondary" @click="handleLogout" />
    </div>

    <div v-else class="mobile-layout">
      <BaseButton
        :icon="IconSettings"
        variant="secondary"
        icon-only
        label="Settings"
        @click="isOpen = !isOpen"
      />

      <NavUserDropdown v-if="isOpen" @edit="openAccountModal" @logout="handleLogout" />
    </div>
  </div>
</template>

<script setup>
/**
 * User menu coordinator.
 * Orchestrates responsive views and global dismissal behaviors for the settings menu.
 */
import { ref, inject, computed } from 'vue';
import { useAuth } from '../../../composables/useAuth';
import { useLayout } from '../../../composables/useLayout';
import { useClickOutside } from '../../../composables/useClickOutside';

import BaseButton from '../../../components/shared/BaseButton.vue';
import IconSettings from '../../../components/icons/IconSettings.vue';
import NavUserTrigger from './NavUserTrigger.vue';
import NavUserDropdown from './NavUserDropdown.vue';

const { user, logout } = useAuth();
const { isMobile } = useLayout();

const isOpen = ref(false);
const menuRef = ref(null);
const userModal = inject('userModal');

/**
 * Prepares profile data for the global account management modal.
 */
const normalizedUserData = computed(() => {
  if (!user.value) return null;
  return {
    ...user.value,
    profile: { ...user.value },
    user: { id: user.value.uid }
  };
});

// Logic: bind generic dismissal detection for the menu container.
useClickOutside(menuRef, () => {
  isOpen.value = false;
});

const openAccountModal = () => {
  isOpen.value = false;
  userModal.value?.open(normalizedUserData.value);
};

const handleLogout = async () => {
  isOpen.value = false;
  await logout();
  window.location.href = '/login';
};
</script>

<style scoped>
/* Layout: orchestration for menu positioning. */
.user-menu-coordinator {
  position: relative;
}

.desktop-layout {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.mobile-layout {
  display: flex;
  align-items: center;
}
</style>

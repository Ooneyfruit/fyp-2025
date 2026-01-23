<script setup>
/**
 * User menu coordinator.
 * Orchestrates responsive views and global dismissal behaviours for the settings menu.
 */
import { computed, inject, ref } from 'vue';

import IconSettings from '@/components/icons/IconSettings.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import { useAuth } from '@/composables/useAuth';
import { useClickOutside } from '@/composables/useClickOutside';
import { useLayout } from '@/composables/useLayout';

import NavUserDropdown from './NavUserDropdown.vue';
import NavUserTrigger from './NavUserTrigger.vue';

// Destructure reactive authentication state and the logout method.
const { user, logout } = useAuth();

// Determine device layout for responsive conditional rendering.
const { isMobile } = useLayout();

// Manage the visibility state of the mobile dropdown menu.
const isOpen = ref(false);

// Reference the root element for external click detection logic.
const menuRef = ref(null);

// Inject the global modal handler for user account management.
const userModal = inject('userModal');

/**
 * Prepares profile data for the global account management modal.
 * Logic: normalises the flat user state into the nested structure expected by UserModal.
 */
const normalizedUserData = computed(() => {
  if (!user.value) return null;
  return {
    ...user.value,
    profile: { ...user.value },
    user: { id: user.value.uid }
  };
});

/**
 * Derives the user's email address for display.
 * Logic: provides a fallback empty string to satisfy strict prop typing during transitional null states.
 */
const userEmail = computed(() => {
  return user.value?.email ?? '';
});

// Logic: bind generic dismissal detection for the menu container.
useClickOutside(menuRef, () => {
  isOpen.value = false;
});

// Closes the menu context and triggers the account editing modal.
const openAccountModal = () => {
  isOpen.value = false;
  userModal.value?.open(normalizedUserData.value);
};

// Logic: terminates the user session and performs a hard redirect to clear state.
const handleLogout = async () => {
  isOpen.value = false;
  await logout();
  globalThis.location.href = '/login';
};
</script>

<template>
  <div ref="menuRef" class="user-menu-coordinator">
    <div v-if="!isMobile" class="desktop-layout">
      <NavUserTrigger :email="userEmail" @click="openAccountModal" />

      <BaseButton label="Log Out" variant="secondary" @click="handleLogout" />
    </div>

    <div v-else class="mobile-layout">
      <BaseButton
        :icon="IconSettings"
        icon-only
        label="Settings"
        variant="secondary"
        @click="isOpen = !isOpen"
      />

      <NavUserDropdown v-if="isOpen" @edit="openAccountModal" @logout="handleLogout" />
    </div>
  </div>
</template>

<style scoped>
/* Layout: orchestration for menu positioning. */
.user-menu-coordinator {
  position: relative;
}

.desktop-layout {
  align-items: center;
  display: flex;
  gap: var(--spacing-lg);
}

.mobile-layout {
  align-items: center;
  display: flex;
}
</style>

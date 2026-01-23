<script setup>
/**
 * Application navigation shell.
 * Aggregates brand identity and session-specific navigation components.
 */
import { provide,ref } from 'vue';

import IconLogoInvert from '@/components/icons/IconLogoInvert.vue';
import IconMenu from '@/components/icons/IconMenu.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import { useAuth } from '@/composables/useAuth';
import { useLayout } from '@/composables/useLayout';
import UserModal from '@/features/users/components/UserModal.vue';

import NavPracticeSwitcher from './NavPracticeSwitcher.vue';
import NavUserMenu from './NavUserMenu.vue';

defineEmits(['toggleSidebar']);

const { user } = useAuth();
const { isMobile } = useLayout();
const userModalRef = ref(null);

/**
 * Exposes the user modal reference to children.
 * This allows deeply nested navigation components to trigger the global edit modal.
 */
provide('userModal', userModalRef);
</script>

<template>
  <nav class="navbar">
    <div class="nav-left">
      <BaseButton
        :icon="IconMenu"
        icon-only
        label="Menu"
        variant="secondary"
        @click="$emit('toggleSidebar')"
      />

      <div class="brand-container">
        <IconLogoInvert class="logo-icon" />
        <span class="brand-text">RotaDent</span>
      </div>
    </div>

    <div v-if="user" class="nav-actions">
      <NavPracticeSwitcher v-if="!isMobile" class="desktop-switcher" />
      <NavUserMenu />
    </div>

    <UserModal ref="userModalRef" />
  </nav>
</template>

<style scoped>
/* Layout: fixed position shell for the top navigation bar. */
.navbar {
  align-items: center;
  background: white;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  height: var(--navbar-height);
  justify-content: space-between;
  left: 0;
  padding: 0 var(--spacing-md);
  position: fixed;
  top: 0;
  width: 100%;
  z-index: var(--z-navbar);
}

.nav-left {
  align-items: center;
  display: flex;
  gap: var(--spacing-md);
}

.brand-container {
  align-items: center;
  display: flex;
  gap: 0.675rem;
  min-width: 140px;
}

.brand-text {
  color: var(--color-primary);
  font-size: 1.25rem;
  font-weight: 600;
  white-space: nowrap;
}

.logo-icon {
  color: var(--color-primary);
  height: 1.9rem;
  width: 1.9rem;
}

.nav-actions {
  align-items: center;
  display: flex;
  gap: var(--spacing-lg);
  justify-content: flex-end;
}

.desktop-switcher {
  width: auto;
}
</style>

<template>
  <nav class="navbar">
    <div class="nav-left">
      <BaseButton 
        :icon="IconMenu"
        variant="secondary"
        icon-only
        label="Menu"
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

<script setup>
/**
 * Application navigation shell.
 * Aggregates brand identity and session-specific navigation components.
 */
import { ref, provide } from 'vue';
import { useAuth } from '../../../composables/useAuth';
import { useLayout } from '../../../composables/useLayout';

import BaseButton from '../../../components/shared/BaseButton.vue';
import UserModal from '../../users/components/UserModal.vue';
import NavPracticeSwitcher from './NavPracticeSwitcher.vue';
import NavUserMenu from './NavUserMenu.vue';

import IconMenu from '../../../components/icons/IconMenu.vue';
import IconLogoInvert from '../../../components/icons/IconLogoInvert.vue';

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

<style scoped>
/* Layout: fixed position shell for the top navigation bar. */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--navbar-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0 var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  z-index: var(--z-navbar);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.brand-container {
  display: flex;
  align-items: center;
  gap: 0.675rem;
  min-width: 140px;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
}

.logo-icon {
  width: 1.9rem;
  height: 1.9rem;
  color: var(--color-primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-lg);
}

.desktop-switcher {
  width: auto;
}
</style>
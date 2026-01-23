<script setup>
/**
 * Mobile user settings card.
 * Composes identity displays and functional action groups for the navigation overlay.
 */
import IconEdit from '@/components/icons/IconEdit.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import { useAuth } from '@/composables/useAuth';
// Switched to alias and standard lowercase 'Api' to resolve resolution conflicts.
import { UserIdentity } from '@/features/users/usersApi';

import NavPracticeSwitcher from './NavPracticeSwitcher.vue';

/**
 * @typedef {object} AuthInterface
 * @property {import('vue').Ref<any>} user - The current authenticated user state.
 * @property {import('vue').Ref<boolean>} isAuthReady - Initialisation state.
 * @property {Function} login - Sign-in method.
 * @property {Function} logout - Sign-out method.
 */

defineEmits(['edit', 'logout']);

// Extract user state using explicit type casting to resolve property inference.
const { user } = /** @type {AuthInterface} */ (useAuth());
</script>

<template>
  <div class="nav-user-dropdown rd-card animate-slide-in">
    <div class="rd-card-header dropdown-header">
      <UserIdentity :profile="user" />
      <span class="rd-pill rd-pill-muted role-badge">{{ user?.role || 'Guest' }}</span>
    </div>

    <div class="rd-card-body dropdown-body">
      <BaseButton
        class="full-width-btn"
        :icon="IconEdit"
        label="Edit Profile"
        variant="secondary"
        @click="$emit('edit')"
      />

      <div class="rd-card-divider">
        <NavPracticeSwitcher label="Switch Practice" />
      </div>

      <div class="rd-card-footer">
        <BaseButton
          class="full-width-btn"
          label="Log Out"
          variant="danger"
          @click="$emit('logout')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Surface: specific constraints for the navigation dropdown card. */
.nav-user-dropdown {
  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 10%);
  position: absolute;
  right: 0;
  top: calc(100% + 0.625rem);
  width: 17rem;
  z-index: var(--z-overlay);
}

.dropdown-header {
  align-items: flex-start !important;
  background: #f8fafc;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.role-badge {
  font-size: 0.65rem;
  margin-left: 3rem;
}

.dropdown-body {
  gap: 1rem;
}

.full-width-btn {
  justify-content: flex-start !important;
  width: 100%;
}
</style>

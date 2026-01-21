<template>
  <div class="nav-user-dropdown rd-card animate-slide-in">
    <div class="rd-card-header dropdown-header">
      <UserIdentity :profile="user" />
      <span class="rd-pill rd-pill-muted role-badge">{{ user.role }}</span>
    </div>
    
    <div class="rd-card-body dropdown-body">
      <BaseButton 
        label="Edit Profile"
        :icon="IconEdit"
        variant="secondary"
        class="full-width-btn"
        @click="$emit('edit')"
      />

      <div class="rd-card-divider">
        <NavPracticeSwitcher label="Switch Practice" />
      </div>

      <div class="rd-card-footer">
        <BaseButton 
          label="Log Out"
          variant="danger"
          class="full-width-btn"
          @click="$emit('logout')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Mobile user settings card.
 * Composes identity displays and functional action groups.
 */
import { useAuth } from '../../../composables/useAuth';
import { UserIdentity } from '../../users/usersAPI';
import NavPracticeSwitcher from './NavPracticeSwitcher.vue';
import BaseButton from '../../../components/shared/BaseButton.vue';
import IconEdit from '../../../components/icons/IconEdit.vue';

defineEmits(['edit', 'logout']);
const { user } = useAuth();
</script>

<style scoped>
/* Surface: specific constraints for the navigation dropdown card. */
.nav-user-dropdown {
  position: absolute;
  top: calc(100% + 0.625rem);
  right: 0;
  width: 17rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: var(--z-overlay);
}

.dropdown-header {
  flex-direction: column;
  align-items: flex-start !important;
  gap: var(--spacing-xs);
  background: #f8fafc;
}

.role-badge {
  font-size: 0.65rem;
  margin-left: 3rem;
}

.dropdown-body {
  gap: 1rem;
}

.full-width-btn {
  width: 100%;
  justify-content: flex-start !important;
}
</style>
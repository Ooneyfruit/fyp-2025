<template>
    <div class="nav-user-dropdown rd-card">
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
  
        <div class="dropdown-divider">
          <NavPracticeSwitcher label="Switch Practice" variant="mobile" />
        </div>
  
        <div class="dropdown-footer">
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
  .nav-user-dropdown {
    position: absolute;
    top: calc(100% + 0.625rem);
    right: 0;
    width: 17rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.2s ease-out;
    z-index: var(--z-overlay);
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
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
  
  .dropdown-divider {
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }
  
  .full-width-btn {
    width: 100%;
    justify-content: flex-start !important;
  }
  
  .dropdown-footer {
    border-top: 1px solid var(--border-color);
    margin-top: 0.5rem;
    padding-top: 1rem;
  }
  </style>
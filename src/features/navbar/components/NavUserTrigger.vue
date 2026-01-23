<script setup>
/**
 * Desktop profile trigger ui.
 * Provides a simplified interface for accessing account settings.
 */
import IconEdit from '../../../components/icons/IconEdit.vue';

defineProps({
  email: { type: String, required: true }
});
</script>

<template>
  <button class="profile-trigger">
    <span class="email-label">{{ email }}</span>
    <div class="edit-icon-wrapper">
      <IconEdit class="edit-icon" />
    </div>
  </button>
</template>

<style scoped>
/* Surface: configuration for the interactive profile button. */
.profile-trigger {
  align-items: center;
  background: none;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  gap: 0.6rem;
  padding: 0.4rem 0.6rem;
  transition: background var(--anim-speed) ease;
}

.email-label {
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  transition: color var(--anim-speed) ease;
}

.edit-icon-wrapper {
  height: 1.1rem;
  width: 1.1rem;
}

.edit-icon {
  color: var(--text-muted);
  height: 100%;
  transition: color var(--anim-speed) ease;
  width: 100%;
}

.profile-trigger:hover {
  background: #eff6ff;
}

.profile-trigger:hover .email-label,
.profile-trigger:hover .edit-icon {
  color: var(--color-primary);
}
</style>

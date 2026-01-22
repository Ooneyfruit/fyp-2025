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
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  border-radius: 0.5rem;
  transition: background var(--anim-speed) ease;
}

.email-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
  transition: color var(--anim-speed) ease;
}

.edit-icon-wrapper {
  width: 1.1rem;
  height: 1.1rem;
}

.edit-icon {
  width: 100%;
  height: 100%;
  color: var(--text-muted);
  transition: color var(--anim-speed) ease;
}

.profile-trigger:hover {
  background: #eff6ff;
}

.profile-trigger:hover .email-label,
.profile-trigger:hover .edit-icon {
  color: var(--color-primary);
}
</style>

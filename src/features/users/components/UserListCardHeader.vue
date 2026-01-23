<script setup>
/**
 * UserListCardHeader.
 * Specialized header for user cards, handling identity display and action triggers.
 */
import UserActionButtons from './UserActionButtons.vue';
import UserIdentity from './UserIdentity.vue';

defineProps({
  profile: {
    type: Object,
    required: true
  }
});

defineEmits(['edit']);
</script>

<template>
  <div class="card-identity-wrapper">
    <UserIdentity :profile="profile" />
    <UserActionButtons class="card-edit-btn" @edit="$emit('edit')" />
  </div>
</template>

<style scoped>
/* Layout: Ensures the identity info and edit button are correctly aligned. */
.card-identity-wrapper {
  align-items: flex-start;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  width: 100%;
}
</style>

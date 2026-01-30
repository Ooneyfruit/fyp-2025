<script setup lang="ts">
/**
 * Card Header component for User Data View.
 * Displays the user's identity and provides access to edit actions.
 */
import type { PracticeUser, UserProfile } from '@/features/users/userTypes';

import UserActionButtons from './UserActionButtons.vue';
import UserIdentity from './UserIdentity.vue';

/**
 * Local type definition matching the runtime structure from usePracticeUsers.
 * The runtime object contains a nested 'profile' property.
 */
type PracticeUserRow = PracticeUser & { profile: UserProfile };

defineProps<{
  item: PracticeUserRow;
}>();

defineEmits<{
  edit: [item: PracticeUser];
}>();
</script>

<template>
  <div class="card-identity-wrapper">
    <UserIdentity :profile="item.profile" />
    <UserActionButtons class="card-edit-btn" @edit="$emit('edit', item)" />
  </div>
</template>

<style scoped>
/* Layout: Flex container for the card header. */
.card-identity-wrapper {
  align-items: flex-start;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  width: 100%;
}
</style>

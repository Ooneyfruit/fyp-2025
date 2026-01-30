<script setup lang="ts">
/**
 * Table Cell component for displaying User Identity.
 * Designed to be used within the 'member' slot or as a cellComponent.
 */
import { computed } from 'vue';

import type { PracticeUser, UserProfile } from '@/features/users/userTypes';

import UserIdentity from './UserIdentity.vue';

const props = defineProps<{
  /**
   * Accepts the generic item type from BaseTable.
   */
  item: Record<string, unknown>;
}>();

/**
 * Local type definition matching the runtime structure from usePracticeUsers.
 */
type PracticeUserRow = PracticeUser & { profile: UserProfile };

const user = computed(() => props.item as unknown as PracticeUserRow);
</script>

<template>
  <UserIdentity :profile="user.profile" />
</template>

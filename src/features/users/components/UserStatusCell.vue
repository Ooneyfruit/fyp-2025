<script setup lang="ts">
/**
 * Table cell adapter for UserStatusPills.
 * Extracts the specific status type from the column header metadata.
 */
import { computed } from 'vue';

import type { PracticeUser } from '@/features/users/userTypes';

import UserStatusPills from './UserStatusPills.vue';

const props = defineProps<{
  /**
   * The raw item from the table.
   */
  item: Record<string, unknown>;
  /**
   * The column header configuration, containing the pill type in 'meta'.
   */
  header: {
    meta: {
      type: 'role' | 'admin' | 'contract';
    };
  };
}>();

/**
 * Casts the generic table item to a PracticeUser.
 */
const member = computed(() => props.item as unknown as PracticeUser);
</script>

<template>
  <UserStatusPills :member="member" :type="header.meta.type" />
</template>

<script setup lang="ts">
/**
 * Table cell component for User Actions.
 * Triggers the 'onEdit' callback provided via header metadata.
 */
import { computed } from 'vue';

import type { PracticeUser } from '@/features/users/userTypes';

import UserActionButtons from './UserActionButtons.vue';

const props = defineProps<{
  item: Record<string, unknown>;
  header: {
    meta: {
      onEdit: (user: PracticeUser) => void;
    };
  };
}>();

const user = computed(() => props.item as unknown as PracticeUser);
</script>

<template>
  <UserActionButtons @edit="header.meta.onEdit(user)" />
</template>

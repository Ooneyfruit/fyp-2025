<script setup lang="ts">
/**
 * Data Adapter for User Management.
 * Switches between Table and Card views based on available container width.
 */
import { markRaw, ref } from 'vue';

import BaseTable, { type TableHeader } from '@/components/shared/BaseTable.vue';
import { useBreakpoints } from '@/composables/useBreakpoints';
import type { PracticeUser, UserProfile } from '@/features/users/userTypes';

import UserActionCell from './UserActionCell.vue';
import UserCardList from './UserCardList.vue';
import UserDateCell from './UserDateCell.vue';
import UserMemberCell from './UserMemberCell.vue';
import UserStatusCell from './UserStatusCell.vue';

/**
 * The breakpoint threshold in rem units for switching to mobile view.
 */
const MOBILE_BREAKPOINT_REM = 62;

/**
 * Local type definition matching the runtime structure from usePracticeUsers.
 */
type PracticeUserRow = PracticeUser & { profile: UserProfile };

withDefaults(
  defineProps<{
    users?: PracticeUserRow[];
  }>(),
  {
    users: () => []
  }
);

const emit = defineEmits<{
  edit: [item: PracticeUser];
}>();

const adapterRoot = ref<HTMLElement | null>(null);

// Adjusted threshold to 62rem (approx 992px).
// Increased to prevent the actions column from clipping before the switch to mobile view occurs.
const { isMobile } = useBreakpoints(adapterRoot, MOBILE_BREAKPOINT_REM);

/**
 * Callback to handle edit actions from within cell components.
 * Passed via 'meta' to UserActionCell.
 */
const onEditUser = (user: PracticeUser) => {
  emit('edit', user);
};

/**
 * The 'member' column uses minmax() to enforce readability.
 * Calculation: Icon (2.25rem) + Gap (0.75rem) + Text (4.5rem) + Padding (~2rem) = ~9.5rem.
 * Has min-width set to 10rem to guarantee the text is at least twice the icon width.
 *
 * Uses 'markRaw' on components to avoid unnecessary reactivity overhead.
 */
const userHeaders: TableHeader[] = [
  {
    key: 'member',
    label: 'Member',
    width: 'minmax(10rem, 1fr)',
    cellComponent: markRaw(UserMemberCell)
  },
  {
    key: 'role',
    label: 'Role',
    width: 'min-content',
    cellComponent: markRaw(UserStatusCell),
    meta: { type: 'role' }
  },
  {
    key: 'status',
    label: 'Status',
    width: 'min-content',
    cellComponent: markRaw(UserStatusCell),
    meta: { type: 'admin' }
  },
  {
    key: 'contract',
    label: 'Contract',
    width: 'min-content',
    cellComponent: markRaw(UserStatusCell),
    meta: { type: 'contract' }
  },
  {
    key: 'start_date',
    label: 'Joined',
    width: '8.5rem',
    cellComponent: markRaw(UserDateCell)
  },
  {
    key: 'end_date',
    label: 'End Date',
    width: '8.5rem',
    cellComponent: markRaw(UserDateCell)
  },
  {
    key: 'actions',
    label: 'Actions',
    width: 'min-content',
    align: 'center',
    cellComponent: markRaw(UserActionCell),
    meta: { onEdit: onEditUser }
  }
];
</script>

<template>
  <div ref="adapterRoot" class="adapter-container">
    <div v-if="!users || users.length === 0" class="loading-overlay">
      <p>Synchronizing Practice Identities...</p>
    </div>

    <BaseTable v-else-if="!isMobile" :headers="userHeaders" :items="users as any[]" />

    <UserCardList v-else :users="users" @edit="$emit('edit', $event)" />
  </div>
</template>

<style scoped>
.adapter-container {
  min-height: 200px;
  position: relative;
  transition: width var(--anim-speed) ease;
  width: 100%;
}

.loading-overlay {
  align-items: center;
  color: var(--text-muted);
  display: flex;
  font-style: italic;
  height: 200px;
  justify-content: center;
}
</style>

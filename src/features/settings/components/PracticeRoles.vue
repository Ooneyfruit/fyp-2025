<script setup lang="ts">
/**
 * Component to list the professional roles configured for the practice.
 */
import { markRaw } from 'vue';

import BaseTable, { type TableHeader } from '@/components/shared/BaseTable.vue';
import RoleIconCell from '@/features/settings/components/cells/RoleIconCell.vue';
import { type PracticeRoleConfig } from '@/features/settings/settingsTypes';

defineProps<{
  roles: PracticeRoleConfig[];
}>();

const headers: TableHeader[] = [
  { key: 'name', label: 'Role Name' },
  { key: 'type', label: 'Classification' },
  {
    key: 'icon',
    label: 'Icon',
    align: 'center',
    width: '80px',
    cellComponent: markRaw(RoleIconCell)
  }
];
</script>

<template>
  <div class="roles-section">
    <h3>Practice Roles</h3>
    <BaseTable :headers="headers" :items="roles as any" />
  </div>
</template>

<style scoped>
.roles-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
</style>

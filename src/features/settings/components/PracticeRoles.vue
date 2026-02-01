<script setup lang="ts">
/**
 * (needs description).
 */

import { markRaw, ref } from 'vue';

import IconPlus from '@/components/icons/IconPlus.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import BaseTable, { type TableHeader } from '@/components/shared/BaseTable.vue';
import RoleActionCell from '@/features/settings/components/cells/RoleActionCell.vue';
import RoleColorCell from '@/features/settings/components/cells/RoleColorCell.vue';
import RoleIconCell from '@/features/settings/components/cells/RoleIconCell.vue';
import PracticeRoleModal from '@/features/settings/components/modals/PracticeRoleModal.vue';
import { type PracticeRoleConfig } from '@/features/settings/settingsTypes';

defineProps<{
  roles: PracticeRoleConfig[];
}>();

const isModalOpen = ref(false);
const selectedRole = ref<PracticeRoleConfig | null>(null);

const openAddModal = () => {
  selectedRole.value = null;
  isModalOpen.value = true;
};

const handleEdit = (item: PracticeRoleConfig) => {
  selectedRole.value = item;
  isModalOpen.value = true;
};

const headers: TableHeader[] = [
  { key: 'name', label: 'Role Name' },
  { key: 'type', label: 'Classification' },
  {
    key: 'color',
    label: 'Colour',
    align: 'center',
    width: '100px',
    cellComponent: markRaw(RoleColorCell)
  },
  {
    key: 'icon',
    label: 'Icon',
    align: 'center',
    width: '80px',
    cellComponent: markRaw(RoleIconCell)
  },
  {
    key: 'actions',
    label: '',
    width: '60px',
    align: 'center',
    cellComponent: markRaw(RoleActionCell),
    meta: { onEdit: handleEdit }
  }
];
</script>

<template>
  <div class="roles-section">
    <div class="section-header">
      <h3>Practice Roles</h3>
      <BaseButton :icon="IconPlus" label="Add Role" variant="primary" @click="openAddModal" />
    </div>

    <BaseTable :headers="headers" :items="roles as any" />

    <PracticeRoleModal
      :role-to-edit="selectedRole"
      :show="isModalOpen"
      @close="isModalOpen = false"
    />
  </div>
</template>

<style scoped>
.roles-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.section-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

h3 {
  color: var(--text-main);
  font-size: 1.1rem;
  margin: 0;
}
</style>

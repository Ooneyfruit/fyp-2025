<script setup lang="ts">
/**
 * Renders a list of practice roles with management capabilities.
 * Supports adding, editing, and restoring archived roles.
 */

import { computed, markRaw, ref } from 'vue';

import IconPlus from '@/components/icons/IconPlus.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import BaseTable, { type TableHeader } from '@/components/shared/BaseTable.vue';
import BaseToggle from '@/components/shared/BaseToggle.vue';
import RoleActionCell from '@/features/settings/components/cells/RoleActionCell.vue';
import RoleColorCell from '@/features/settings/components/cells/RoleColorCell.vue';
import RoleIconCell from '@/features/settings/components/cells/RoleIconCell.vue';
import PracticeRoleModal from '@/features/settings/components/modals/PracticeRoleModal.vue';
import { usePracticeActions } from '@/features/settings/composables/usePracticeActions';
import { type PracticeRoleConfig } from '@/features/settings/settingsTypes';

const props = defineProps<{
  roles: PracticeRoleConfig[];
}>();

const { toggleRoleArchive } = usePracticeActions();

const showArchived = ref(false);
const isModalOpen = ref(false);
const selectedRole = ref<PracticeRoleConfig | null>(null);

const displayedItems = computed(() => {
  return props.roles
    .filter((item) => !!item.is_deleted === showArchived.value)
    .map((item) => item as unknown as Record<string, unknown>);
});

const openAddModal = () => {
  selectedRole.value = null;
  isModalOpen.value = true;
};

const handleEdit = (item: Record<string, unknown>) => {
  selectedRole.value = item as unknown as PracticeRoleConfig;
  isModalOpen.value = true;
};

const handleRestore = async (item: Record<string, unknown>) => {
  if (item.id) {
    await toggleRoleArchive(item.id as string, false);
  }
};

const headers = computed<TableHeader[]>(() => [
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
    width: '80px',
    align: 'center',
    cellComponent: markRaw(RoleActionCell),
    meta: {
      onEdit: handleEdit,
      onRestore: handleRestore
    }
  }
]);
</script>

<template>
  <div class="roles-section">
    <div class="section-header">
      <div class="header-left">
        <h3>Practice Roles</h3>
        <div class="archive-toggle">
          <BaseToggle v-model="showArchived" label="Show Archived" />
          <span class="toggle-text">Show Archived</span>
        </div>
      </div>
      <BaseButton
        v-if="!showArchived"
        :icon="IconPlus"
        label="Add Role"
        variant="primary"
        @click="openAddModal"
      />
    </div>

    <BaseTable :headers="headers" :items="displayedItems" />

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

.header-left {
  align-items: center;
  display: flex;
  gap: 1.5rem;
}

.archive-toggle {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

.toggle-text {
  color: var(--text-muted);
  font-size: 0.85rem;
}

h3 {
  color: var(--text-main);
  font-size: 1.1rem;
  margin: 0;
}
</style>

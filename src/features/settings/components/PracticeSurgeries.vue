<script setup lang="ts">
/**
 * (needs description).
 */

import { computed, markRaw, ref } from 'vue';

import IconPlus from '@/components/icons/IconPlus.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import BaseTable, { type TableHeader } from '@/components/shared/BaseTable.vue';
import SurgeryActionCell from '@/features/settings/components/cells/SurgeryActionCell.vue';
import SurgeryDayCell from '@/features/settings/components/cells/SurgeryDayCell.vue';
import SurgeryStaffCell from '@/features/settings/components/cells/SurgeryStaffCell.vue';
import SurgeryTimeCell from '@/features/settings/components/cells/SurgeryTimeCell.vue';
import PracticeSurgeryModal from '@/features/settings/components/modals/PracticeSurgeryModal.vue';
import { type PracticeRoleConfig } from '@/features/settings/settingsTypes';

const props = defineProps<{
  items: Record<string, unknown>[];
  roles: PracticeRoleConfig[];
}>();

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SUBSTRING_LENGTH = 3;

const isModalOpen = ref(false);
const selectedSurgery = ref<Record<string, unknown> | null>(null);

const openAddModal = () => {
  selectedSurgery.value = null;
  isModalOpen.value = true;
};

const handleEdit = (item: Record<string, unknown>) => {
  selectedSurgery.value = item;
  isModalOpen.value = true;
};

const headers = computed<TableHeader[]>(() => {
  const base: TableHeader[] = [
    { key: 'name', label: 'Name', width: '150px' },
    {
      key: 'start_time',
      label: 'Start',
      width: '80px',
      cellComponent: markRaw(SurgeryTimeCell)
    },
    {
      key: 'end_time',
      label: 'End',
      width: '80px',
      cellComponent: markRaw(SurgeryTimeCell)
    }
  ];

  const dayHeaders: TableHeader[] = DAYS.map((d) => ({
    key: `day_${d}`,
    label: d.slice(0, Math.max(0, SUBSTRING_LENGTH)),
    width: '50px',
    align: 'center',
    cellComponent: markRaw(SurgeryDayCell)
  }));

  const roleHeaders: TableHeader[] = props.roles.map((r) => ({
    key: `role_${r.id}`,
    label: r.name,
    align: 'center',
    width: '80px',
    cellComponent: markRaw(SurgeryStaffCell)
  }));

  const actionHeader: TableHeader = {
    key: 'actions',
    label: '',
    width: '60px',
    align: 'center',
    cellComponent: markRaw(SurgeryActionCell),
    meta: { onEdit: handleEdit }
  };

  return [...base, ...dayHeaders, ...roleHeaders, actionHeader];
});
</script>

<template>
  <div class="surgeries-section">
    <div class="section-header">
      <h3>Surgeries & Requirements</h3>
      <BaseButton :icon="IconPlus" label="Add Surgery" variant="primary" @click="openAddModal" />
    </div>

    <BaseTable :headers="headers" :items="items" :vertical-lines="true" />

    <PracticeSurgeryModal
      :all-roles="roles"
      :show="isModalOpen"
      :surgery-to-edit="selectedSurgery"
      @close="isModalOpen = false"
    />
  </div>
</template>

<style scoped>
.surgeries-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  overflow-x: auto;
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

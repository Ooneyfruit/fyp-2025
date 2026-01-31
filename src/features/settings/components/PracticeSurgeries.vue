<script setup lang="ts">
/**
 * Component to display surgery schedules and staffing requirements.
 * Dynamically generates table headers and assigns cell components.
 */
import { computed, markRaw } from 'vue';

import BaseTable, { type TableHeader } from '@/components/shared/BaseTable.vue';
import SurgeryDayCell from '@/features/settings/components/cells/SurgeryDayCell.vue';
import SurgeryStaffCell from '@/features/settings/components/cells/SurgeryStaffCell.vue';
import SurgeryTimeCell from '@/features/settings/components/cells/SurgeryTimeCell.vue';
import { type PracticeRoleConfig } from '@/features/settings/settingsTypes';

const props = defineProps<{
  items: Record<string, unknown>[];
  roles: PracticeRoleConfig[];
}>();

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SUBSTRING_LENGTH = 3;

// Construct headers with assigned cell components.
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
    key: `day_${d}`, // Key used by SurgeryDayCell to identify the day
    label: d.slice(0, Math.max(0, SUBSTRING_LENGTH)),
    width: '50px',
    align: 'center',
    cellComponent: markRaw(SurgeryDayCell)
  }));

  const roleHeaders: TableHeader[] = props.roles.map((r) => ({
    key: `role_${r.id}`, // Key maps to the enriched data property
    label: r.name,
    align: 'center',
    width: '100px',
    cellComponent: markRaw(SurgeryStaffCell)
  }));

  return [...base, ...dayHeaders, ...roleHeaders];
});
</script>

<template>
  <div class="surgeries-section">
    <h3>Surgeries & Requirements</h3>
    <BaseTable :headers="headers" :items="items" :vertical-lines="true" />
  </div>
</template>

<style scoped>
.surgeries-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  overflow-x: auto;
}
</style>

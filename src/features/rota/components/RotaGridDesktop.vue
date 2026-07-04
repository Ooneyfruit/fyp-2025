<script lang="ts">
/**
 * (needs description).
 */

const defaultIsRequirementUnmet = () => false;
</script>

<script setup lang="ts">
/**
 * Rota grid component for displaying shifts in a tabular format on desktop.
 * Organises data into roles and surgeries across a timeline of visible days.
 */

import { computed, markRaw, type PropType, provide } from 'vue';

import BaseTable from '@/components/shared/BaseTable.vue';
import type { RotaDay } from '@/features/rota/composables/useRotaDates';
import type { RotaRow, Shift } from '@/features/rota/rotaTypes';

import RotaDayCell from './RotaDayCell.vue';
import RotaLoading from './RotaLoading.vue';
import RotaRoleCell from './RotaRoleCell.vue';

const props = defineProps({
  days: {
    type: Array as PropType<RotaDay[]>,
    required: true
  },
  rows: {
    type: Array as PropType<RotaRow[]>,
    required: true
  },
  getShifts: {
    type: Function as PropType<(roleId: string, surgeryId: string, dateIso: string) => Shift[]>,
    required: true
  },
  isRequirementUnmet: {
    type: Function as PropType<(roleId: string, surgeryId: string, day: RotaDay) => boolean>,
    default: () => defaultIsRequirementUnmet
  }
});

const emit = defineEmits(['slot-click']);

provide('getShifts', props.getShifts);
provide('isRequirementUnmet', props.isRequirementUnmet);
provide('onGridClick', (payload: { rowItem: unknown; day: RotaDay }) => {
  emit('slot-click', payload);
});

const tableHeaders = computed(() => {
  return [
    {
      key: 'header_col',
      label: 'Role / Surgery',
      width: 'minmax(0, 10rem)',
      align: 'left' as const,
      cellComponent: markRaw(RotaRoleCell)
    },
    ...props.days.map((d: RotaDay) => ({
      key: d.key,
      label: d.label,
      width: 'minmax(0, 1fr)',
      align: 'left' as const,
      headerClass: d.isToday ? 'header-today' : '',
      cellComponent: markRaw(RotaDayCell),
      meta: d
    }))
  ];
});

const emptyStateComponent = markRaw(RotaLoading);
</script>

<template>
  <BaseTable
    class="rota-table"
    :empty-component="emptyStateComponent"
    group-by="role.id"
    :headers="tableHeaders"
    :items="rows"
    :vertical-lines="true"
  />
</template>

<style scoped>
:deep(th.header-today),
:deep(.header-cell.header-today) {
  background-color: #eff6ff !important;
  color: #2563eb !important;
  font-weight: 800 !important;
}
</style>

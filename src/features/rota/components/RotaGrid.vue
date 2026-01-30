<script setup lang="ts">
/**
 * Rota grid component for displaying shifts in a tabular format.
 * Organises data into roles and surgeries across a timeline of visible days.
 */

import { computed, markRaw, type PropType, provide } from 'vue';

import BaseTable from '@/components/shared/BaseTable.vue';
import type { RotaDay } from '@/features/rota/composables/useRotaDates';
import type { PracticeRole, PracticeSurgery, Shift } from '@/features/rota/rotaTypes';

import RotaDayCell from './RotaDayCell.vue';
import RotaLoading from './RotaLoading.vue';
import RotaRoleCell from './RotaRoleCell.vue';

/**
 * Represents a row in the rota grid.
 * Includes denormalised role and surgery data.
 * The index signature is required to ensure compatibility with BaseTable's Record type.
 */
interface RotaRow {
  [key: string]: unknown;
  id: string;
  role: PracticeRole;
  surgery: PracticeSurgery;
  _isGroupStart?: boolean;
}

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
  }
});

const emit = defineEmits(['slot-click']);

// --- Dependency Injection ---
// Provide these functions to the Cell components to avoid prop drilling through BaseTable.
provide('getShifts', props.getShifts);
provide('onGridClick', (payload: { rowItem: unknown; day: RotaDay }) => {
  emit('slot-click', payload);
});

// --- Table Configuration ---

const tableHeaders = computed(() => {
  return [
    {
      key: 'header_col',
      label: 'Role / Surgery',
      // Using minmax(0, X) is critical here to allow column shrinking.
      width: 'minmax(0, 9.2rem)',
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
      // Pass the day object as metadata so the cell component can access it
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
/* Header Highlight for Today */

/* Styles for cells have been moved to their respective components (RotaRoleCell, RotaDayCell). */

/* We keep header styles here as BaseTable renders the <th> elements. */

:deep(th.header-today),
:deep(.header-cell.header-today) {
  background-color: #eff6ff !important;
  color: #2563eb !important;
  font-weight: 800 !important;
}
</style>

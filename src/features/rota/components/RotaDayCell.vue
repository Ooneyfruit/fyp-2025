<script setup lang="ts">
/**
 * Displays the shifts for a specific day/role/surgery combination.
 * Designed to be used as a cellComponent in BaseTable.
 */
import { computed, inject } from 'vue';

import type { TableHeader } from '@/components/shared/BaseTable.vue';
import type { RotaDay } from '@/features/rota/composables/useRotaDates';
import type { PracticeRole, PracticeSurgery, Shift } from '@/features/rota/rotaTypes';

import RotaSlot from './RotaSlot.vue';

interface RotaRow {
  [key: string]: unknown;
  id: string;
  role: PracticeRole;
  surgery: PracticeSurgery;
}

const props = defineProps<{
  item: Record<string, unknown>;
  header: TableHeader;
}>();

// Dependency Injection to avoid prop drilling through BaseTable
const getShifts = inject<(roleId: string, surgeryId: string, dateIso: string) => Shift[]>(
  'getShifts',
  () => []
);

const onGridClick = inject<(payload: { rowItem: unknown; day: RotaDay }) => void>(
  'onGridClick',
  () => {}
);

const row = computed(() => props.item as RotaRow);
const day = computed(() => props.header.meta as RotaDay);

const handleClick = () => {
  onGridClick({ rowItem: props.item, day: day.value });
};
</script>

<template>
  <div class="cell-wrapper">
    <RotaSlot
      :is-before-today="day.isBeforeToday"
      :is-today="day.isToday"
      :is-weekend="day.isWeekend"
      :role-id="row.role.id"
      :role-name="row.role.name"
      :shifts="getShifts(row.role.id, row.surgery.id, day.iso)"
      @click="handleClick"
    />
  </div>
</template>

<style scoped>
.cell-wrapper {
  display: flex;
  height: 100%;
  width: 100%;
}
</style>

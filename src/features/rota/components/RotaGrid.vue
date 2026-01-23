<script setup>
import { computed } from 'vue';

import BaseTable from '@/components/shared/BaseTable.vue';
import { useRotaColors } from '@/features/rota/composables/useRotaColors';

import RotaSlot from './RotaSlot.vue';

const props = defineProps({
  days: { type: Array, required: true },
  rows: { type: Array, required: true },
  getShifts: { type: Function, required: true }
});

defineEmits(['slot-click']);

const { getRoleColor } = useRotaColors();

// --- Helpers ---

/**
 * Converts a string to sentence case (first letter upper, rest lower).
 * @param {string} str - The input string
 * @returns {string} Formatted string
 */
const toSentenceCase = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// --- Table Configuration ---

const tableHeaders = computed(() => {
  return [
    {
      key: 'header_col',
      label: 'Role / Surgery',
      // Using minmax(0, X) is critical here.
      // Unlike fit-content, minmax(0, 14rem) allows the column to shrink below
      // the intrinsic width of its content (min-content), forcing truncation.
      width: 'minmax(0, 9.2rem)',
      align: 'left'
    },
    ...props.days.map((d) => ({
      key: d.key,
      label: d.label,
      width: 'minmax(0, 1fr)',
      align: 'left',
      headerClass: d.isToday ? 'header-today' : ''
    }))
  ];
});

// --- Styling Helpers ---

/**
 * Generates style object for role badges based on role ID.
 * @param {string} roleId - The ID of the role
 * @returns {object} Style object with color properties
 */
const getRoleBadgeStyle = (roleId) => {
  const c = getRoleColor(roleId);
  return {
    backgroundColor: c.bg,
    color: c.accent,
    borderColor: c.accent
  };
};
</script>

<template>
  <BaseTable
    class="rota-table"
    group-by="role.id"
    :headers="tableHeaders"
    :items="rows"
    :vertical-lines="true"
  >
    <template #cell(header_col)="{ item }">
      <div class="header-col-inner">
        <div v-if="item._isGroupStart" class="role-title" :style="getRoleBadgeStyle(item.role.id)">
          {{ toSentenceCase(item.role.name) }}
        </div>
        <div class="surgery-subtitle">
          {{ item.surgery.name }}
        </div>
      </div>
    </template>

    <template v-for="day in days" :key="day.iso" #[`cell(${day.key})`]="{ item }">
      <div class="cell-wrapper">
        <RotaSlot
          :is-before-today="day.isBeforeToday"
          :is-today="day.isToday"
          :is-weekend="day.isWeekend"
          :role-id="item.role.id"
          :shifts="getShifts(item.role.id, item.surgery.id, day.iso)"
          @click="$emit('slot-click', { rowItem: item, day })"
        />
      </div>
    </template>

    <template #empty>
      <div class="empty-state-content">
        <p>No roles configured. Please add Roles and Surgeries.</p>
      </div>
    </template>
  </BaseTable>
</template>

<style scoped>
/* Header Column Styling */
.header-col-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  /* CRITICAL: These styles ensure the content respects the parent's width cap. */

  /* Without this, the grid item's implicit 'min-width: auto' would force the column open. */
  width: 100%;
}

.role-title {
  align-self: flex-start;
  border: 1px solid transparent;
  border-radius: 4px;
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;

  /* Removed text-transform: uppercase so sentence case helper works */
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;

  /* Ensure badges also truncate if they exceed the narrow column width */
  max-width: 100%;
  overflow: hidden;
  padding: 2px 6px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.surgery-subtitle {
  color: var(--text-muted);
  font-size: 0.85rem;

  /* Ensure subtitle truncates */
  overflow: hidden;
  padding-left: 4px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Cell Layout */
.cell-wrapper {
  display: flex;
  height: 100%;
  width: 100%;
}

/* Header Highlight for Today */
:deep(th.header-today),
:deep(.header-cell.header-today) {
  background-color: #eff6ff !important;
  color: #2563eb !important;
  font-weight: 800 !important;
}

.empty-state-content {
  color: var(--text-muted);
  padding: 5rem;
  text-align: center;
}
</style>

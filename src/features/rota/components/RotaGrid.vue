<template>
  <BaseTable 
    :headers="tableHeaders" 
    :items="rows"
    :row-class="getRowClass"
    :vertical-lines="true"
    class="rota-table"
  >
    <template #cell(header_col)="{ item }">
      <div v-if="item.type === 'data'" class="header-col-inner">
        <div 
          v-if="item.isRoleStart" 
          class="role-title"
          :style="getRoleBadgeStyle(item.role.id)"
        >
          {{ item.role.name }}
        </div>
        <div class="surgery-subtitle">
          {{ item.surgery.name }}
        </div>
      </div>
    </template>

    <template 
      v-for="day in days" 
      :key="day.iso" 
      #[`cell(${day.key})`]="{ item }"
    >
      <div 
        v-if="item.type === 'data'" 
        class="cell-wrapper"
      >
        <RotaSlot 
          :shifts="getShifts(item.role.id, item.surgery.id, day.iso)"
          :role-id="item.role.id"
          :is-weekend="day.isWeekend"
          :is-today="day.isToday"
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

<script setup>
import { computed } from 'vue';
import BaseTable from '../../../components/shared/BaseTable.vue';
import RotaSlot from './RotaSlot.vue';
import { useRotaColors } from '../composables/useRotaColors';

const props = defineProps({
  days: { type: Array, required: true },
  rows: { type: Array, required: true }, // The flattened rows
  getShifts: { type: Function, required: true } // Function to retrieve shifts for a cell
});

defineEmits(['slot-click']);

const { getRoleColor } = useRotaColors();

// --- Table Configuration ---

const tableHeaders = computed(() => {
  return [
    { key: 'header_col', label: 'Role / Surgery', width: '220px', align: 'left' },
    ...props.days.map(d => ({
      key: d.key,
      label: d.label,
      width: '1fr',
      align: 'left',
      headerClass: d.isToday ? 'header-today' : '' 
    }))
  ];
});

// --- Styling Helpers ---

const getRoleBadgeStyle = (roleId) => {
  const c = getRoleColor(roleId);
  return { 
    backgroundColor: c.bg,
    color: c.accent,
    borderColor: c.accent
  };
};

const getRowClass = (item) => {
  if (item.type === 'spacer') return 'row-spacer';
  
  const classes = ['row-data'];
  if (item.isRoleStart) classes.push('role-group-start');
  if (item.isRoleEnd) classes.push('role-group-end');
  else classes.push('role-group-middle');
  
  return classes.join(' ');
};
</script>

<style scoped>
/* Spacer Row: Invisible gap */
:deep(.row-spacer .body-cell), :deep(.row-spacer .header-cell) {
  background: transparent;
  border: none;
  height: 1.5rem; 
  pointer-events: none;
}

/* Header Column Styling */
.header-col-inner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.role-title {
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  border: 1px solid transparent;
}

.surgery-subtitle {
  color: var(--text-muted);
  font-size: 0.85rem;
  padding-left: 4px;
}

/* Cell Layout */
.cell-wrapper {
  width: 100%;
  height: 100%;
  min-height: 4.5rem;
  display: flex;
  padding: 2px; 
  position: relative;
}

/* Header Highlight for Today */
:deep(th.header-today) {
  color: #2563eb !important; 
  background-color: #eff6ff !important; 
  font-weight: 800 !important;
}

/* Rounding Logic */
:deep(.role-group-start .body-cell:first-child) { border-top-left-radius: var(--border-radius); }
:deep(.role-group-start .body-cell:last-child) { border-top-right-radius: var(--border-radius); }
:deep(.role-group-end .body-cell:first-child) { border-bottom-left-radius: var(--border-radius); }
:deep(.role-group-end .body-cell:last-child) { border-bottom-right-radius: var(--border-radius); }

/* Borders for Group Visuals */
:deep(.row-data .body-cell) {
  border-bottom: 1px solid var(--border-color);
  background: white; 
  overflow: hidden; 
}

:deep(.role-group-middle .body-cell), 
:deep(.role-group-start .body-cell) {
  border-bottom: 1px solid #f1f5f9; 
}

:deep(.role-group-end .body-cell) {
  border-bottom: 1px solid var(--border-color);
}

.empty-state-content { padding: 3rem; text-align: center; color: var(--text-muted); }
</style>
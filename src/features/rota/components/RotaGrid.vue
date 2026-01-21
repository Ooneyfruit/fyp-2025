<template>
  <BaseTable 
    :headers="tableHeaders" 
    :items="rows"
    :vertical-lines="true"
    group-by="role.id"
    class="rota-table"
  >
    <template #cell(header_col)="{ item }">
      <div class="header-col-inner">
        <div 
          v-if="item._isGroupStart" 
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
      <div class="cell-wrapper">
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
  rows: { type: Array, required: true },
  getShifts: { type: Function, required: true }
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
</script>

<style scoped>
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
  align-self: flex-start;
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
  display: flex;
}

/* Header Highlight for Today */
:deep(th.header-today), 
:deep(.header-cell.header-today) {
  color: #2563eb !important; 
  background-color: #eff6ff !important; 
  font-weight: 800 !important;
}

.empty-state-content { padding: 3rem; text-align: center; color: var(--text-muted); }
</style>
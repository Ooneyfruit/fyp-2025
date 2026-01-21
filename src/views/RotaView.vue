<template>
  <AppPageContainer fluid>
    <div class="rota-header-section">
      <AppPageHeaderGroup title="Practice Rota">
        <div class="controls">
          <BaseButton 
            variant="outline"
            :icon="IconChevronDown" 
            class="rotate-90" 
            @click="changePeriod(-1)"
            aria-label="Previous Period"
          />
          <span class="date-range">{{ dateRangeLabel }}</span>
          <BaseButton 
            variant="outline"
            :icon="IconChevronDown" 
            class="rotate-270" 
            @click="changePeriod(1)"
            aria-label="Next Period"
          />
        </div>
      </AppPageHeaderGroup>
      
      <div class="rota-subtitle">{{ monthLabel }}</div>
    </div>

    <BaseTable 
      :headers="tableHeaders" 
      :items="flattenedRows"
      :row-class="getRowClass"
      class="rota-table"
    >
      <template #cell(header_col)="{ item }">
        <div v-if="item.type === 'data'" class="header-col-inner">
          <div 
            v-if="item.isRoleStart" 
            class="role-title"
            :style="{ 
              backgroundColor: getRoleColor(item.role.id).bg,
              color: getRoleColor(item.role.id).accent,
              borderColor: getRoleColor(item.role.id).accent
            }"
          >
            {{ item.role.name }}
          </div>
          <div class="surgery-subtitle">
            {{ item.surgery.name }}
          </div>
        </div>
      </template>

      <template 
        v-for="day in visibleDays" 
        :key="day.iso" 
        #[`cell(${day.key})`]="{ item }"
      >
        <div v-if="item.type === 'data'" class="cell-wrapper" :class="getColumnClass(day.iso)">
          <RotaSlot 
            :shifts="getShiftsForSlot(item.role.id, item.surgery.id, day.iso)"
            @click="openShiftModal(item, day)"
          />
        </div>
      </template>

      <template #empty>
        <div class="empty-state-content">
          <p>No roles configured. Please add Roles and Surgeries.</p>
        </div>
      </template>
    </BaseTable>

    <RotaShiftModal 
      v-if="selectedCell"
      :show="showModal"
      :role="selectedCell.role"
      :surgery="selectedCell.surgery"
      :date="selectedCell.date"
      :shifts="selectedCell.shifts"
      @request-close="closeShiftModal"
      @save="onSaveShifts"
    />
  </AppPageContainer>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useBreakpoints } from '../composables/useBreakpoints';
import { useRotaDates } from '../features/rota/composables/useRotaDates';
import { useRotaData } from '../features/rota/composables/useRotaData';
import { useRotaColors } from '../features/rota/composables/useRotaColors';
import { createShift, deleteShift } from '../features/rota/rotaAPI';
import { doc, collection } from 'firebase/firestore'; // For references
import { db } from '../services/firebase';

// Components
import AppPageContainer from '../components/layout/AppPageContainer.vue';
import AppPageHeaderGroup from '../components/layout/AppPageHeaderGroup.vue';
import BaseButton from '../components/shared/BaseButton.vue';
import BaseTable from '../components/shared/BaseTable.vue';
import RotaSlot from '../features/rota/components/RotaSlot.vue';
import RotaShiftModal from '../features/rota/components/RotaShiftModal.vue';
import IconChevronDown from '../components/icons/IconChevronDown.vue';

const { user } = useAuth();
const breakpoints = useBreakpoints(ref(document.body), 80);
const { currentStartDate, visibleDays, monthLabel, changePeriod } = useRotaDates(breakpoints);
const { flattenedRows, loadData, getShiftsForSlot } = useRotaData(user);
const { getRoleColor, getColumnClass } = useRotaColors();

const showModal = ref(false);
const selectedCell = ref(null);

const tableHeaders = computed(() => {
  return [
    { key: 'header_col', label: 'Role / Surgery', width: '220px', align: 'left' },
    ...visibleDays.value.map(d => ({
      key: d.key,
      label: d.label,
      width: '1fr',
      align: 'left'
    }))
  ];
});

const dateRangeLabel = computed(() => {
  if (!visibleDays.value.length) return '';
  const start = visibleDays.value[0].label;
  const end = visibleDays.value[visibleDays.value.length - 1].label;
  return `${start} - ${end}`;
});

/**
 * Style Helper: Handles Spacer Rows and Rounding Logic
 */
const getRowClass = (item) => {
  if (item.type === 'spacer') return 'row-spacer';
  
  const classes = ['row-data'];
  if (item.isRoleStart) classes.push('role-group-start');
  if (item.isRoleEnd) classes.push('role-group-end');
  else classes.push('role-group-middle');
  
  return classes.join(' ');
};

const openShiftModal = (rowItem, day) => {
  selectedCell.value = {
    role: rowItem.role,
    surgery: rowItem.surgery,
    date: day,
    shifts: getShiftsForSlot(rowItem.role.id, rowItem.surgery.id, day.iso)
  };
  showModal.value = true;
};

const closeShiftModal = () => {
  showModal.value = false;
  selectedCell.value = null;
};

/**
 * Handle Persistence from Modal
 */
const onSaveShifts = async ({ additions, removals }) => {
  try {
    const practiceId = user.value.practiceRef.id;
    
    // Process Removals
    await Promise.all(removals.map(id => deleteShift(id)));

    // Process Additions
    await Promise.all(additions.map(member => {
      // Construct references
      const roleRef = doc(db, `practices/${practiceId}/roles`, selectedCell.value.role.id);
      const surgeryRef = doc(db, `practices/${practiceId}/surgeries`, selectedCell.value.surgery.id);
      
      const payload = {
        date: selectedCell.value.date.iso,
        user_id: member.userRef,
        user_name: member.name,
        role_id: roleRef,
        role_name: selectedCell.value.role.name,
        surgery_id: surgeryRef,
        surgery_name: selectedCell.value.surgery.name
      };
      
      return createShift(payload);
    }));

    closeShiftModal();
    loadData(); // Refresh View
  } catch (err) {
    console.error("Failed to save changes", err);
    // In real app, show Toast error here
  }
};

watch(() => user.value?.practiceRef?.id, loadData, { immediate: true });
</script>

<style scoped>
.rota-header-section { margin-bottom: var(--spacing-md); }
.rota-subtitle {
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 500;
  margin-top: -0.5rem;
  margin-left: 2px;
}
.controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
.date-range {
  font-weight: 600;
  color: var(--text-main);
  min-width: 9rem;
  text-align: center;
}

/* --- Table Styling Enhancements --- */

/* Spacer Row: Invisible gap */
:deep(.row-spacer .body-cell), :deep(.row-spacer .header-cell) {
  background: transparent;
  border: none;
  height: 1.5rem; /* The gap size */
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

/* Cell Colors (Stripes) */
.cell-wrapper {
  width: 100%;
  height: 100%;
  min-height: 4.5rem;
  display: flex;
  padding: 0.25rem;
}

.cell-wrapper.col-alt-weekday { background-color: #f9fafb; } /* Grey 50 */
.cell-wrapper.col-weekend { background-color: #f3f4f6; }     /* Grey 100 */

/* Rounding Logic for the "Block" Look */
:deep(.role-group-start .body-cell:first-child) { border-top-left-radius: var(--border-radius); }
:deep(.role-group-start .body-cell:last-child) { border-top-right-radius: var(--border-radius); }
:deep(.role-group-end .body-cell:first-child) { border-bottom-left-radius: var(--border-radius); }
:deep(.role-group-end .body-cell:last-child) { border-bottom-right-radius: var(--border-radius); }

/* Borders for Group Visuals */
:deep(.row-data .body-cell) {
  border-bottom: 1px solid var(--border-color);
  background: white; /* Ensure stripes overlay correctly if handled via bg */
}

/* Remove internal borders in the group to make it look like one block */
:deep(.role-group-middle .body-cell), 
:deep(.role-group-start .body-cell) {
  border-bottom: 1px solid #f1f5f9; /* Very faint divider within group */
}

:deep(.role-group-end .body-cell) {
  border-bottom: 1px solid var(--border-color); /* Stronger border at end of role */
}

/* Utils */
.rotate-90 :deep(svg) { transform: rotate(90deg); }
.rotate-270 :deep(svg) { transform: rotate(-90deg); }
.empty-state-content { padding: 3rem; text-align: center; color: var(--text-muted); }
</style>
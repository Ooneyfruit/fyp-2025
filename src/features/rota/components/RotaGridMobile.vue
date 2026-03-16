<script setup lang="ts">
/**
 * Card-based vertically stacked format for rendering the rota grid on mobile.
 */
import { computed, type PropType, provide } from 'vue';

import { useRotaColors } from '@/features/rota/composables/useRotaColors';
import type { RotaDay } from '@/features/rota/composables/useRotaDates';
import type { PracticeRole, PracticeSurgery, Shift } from '@/features/rota/rotaTypes';
import { getRoleIcon } from '@/features/settings/composables/useRoleIcons';

import RotaDayCell from './RotaDayCell.vue';
import RotaLoading from './RotaLoading.vue';

interface RotaRow {
  [key: string]: unknown;
  id: string;
  role: PracticeRole;
  surgery: PracticeSurgery;
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

provide('getShifts', props.getShifts);
provide('onGridClick', (payload: { rowItem: unknown; day: RotaDay }) => {
  emit('slot-click', payload);
});

const { getRoleColor } = useRotaColors();

// Group rows by Role, then iterate through Surgeries
const groupedRows = computed(() => {
  const groups: Record<string, { role: PracticeRole; surgeries: RotaRow[] }> = {};
  for (const row of props.rows) {
    if (!groups[row.role.id]) {
      groups[row.role.id] = { role: row.role, surgeries: [] };
    }
    groups[row.role.id]!.surgeries.push(row);
  }
  return Object.values(groups);
});

const getRoleName = (name: string) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getRoleBadgeStyle = (roleName: string) => {
  const c = getRoleColor(roleName);
  return {
    backgroundColor: c.bg,
    color: c.accent,
    borderColor: c.accent
  };
};
</script>

<template>
  <div class="rota-mobile-grid">
    <div v-if="rows.length === 0" class="empty-state rd-card">
      <RotaLoading />
    </div>

    <div v-else class="mobile-grid-content">
      <!-- Sticky Day Headers -->
      <div
        class="days-header sticky-header"
        :style="{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }"
      >
        <div
          v-for="day in days"
          :key="day.key"
          class="day-header-cell"
          :class="{ 'is-today': day.isToday }"
        >
          {{ day.label }}
        </div>
      </div>

      <!-- Grouped by Role -->
      <div v-for="group in groupedRows" :key="group.role.id" class="role-group">
        <!-- Surgeries within Role -->
        <div v-for="(rowItem, index) in group.surgeries" :key="rowItem.id" class="surgery-group">
          <!-- Header Bar -->
          <div class="surgery-title-bar">
            <div class="surgery-name">{{ rowItem.surgery.name }}</div>

            <div
              v-if="index === 0"
              class="role-title-pill"
              :style="getRoleBadgeStyle(group.role.name)"
            >
              <component
                :is="getRoleIcon(group.role.icon_id)"
                v-if="getRoleIcon(group.role.icon_id)"
                class="role-icon"
              />
              <span class="role-text">{{ getRoleName(group.role.name) }}</span>
            </div>
          </div>

          <!-- Days Slots -->
          <div
            class="days-row"
            :style="{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }"
          >
            <div v-for="day in days" :key="day.key" class="day-slot-cell">
              <!-- Mock table header structure to satisfy cell requirements -->
              <RotaDayCell :header="{ meta: day } as any" :item="rowItem" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rota-mobile-grid {
  display: flex;
  flex-direction: column;
  max-width: 100%;
  min-width: 0;
  width: 100%;
}

.empty-state {
  padding: 3rem;
  text-align: center;
}

.mobile-grid-content {
  display: flex;
  flex-direction: column;
}

/* Sticky Header */
.sticky-header {
  background: white;
  border-bottom: 2px solid var(--border-color);
  display: grid;
  position: sticky;

  /* Anchor underneath standard App navbar if present */
  top: var(--navbar-height, 4rem);
  z-index: 20;
}

.day-header-cell {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  min-width: 0;
  overflow: hidden;
  padding: 1rem var(--spacing-xs);
  text-align: center;
  text-overflow: ellipsis;
  text-transform: uppercase;
}

.day-header-cell.is-today {
  color: var(--color-primary);
  font-weight: 800;
}

/* Role Group */
.role-group {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius, 8px);
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  overflow: hidden; /* Ensures child backgrounds respect the border-radius */
}

/* Exact layout mirror for RotaRoleCell desktop titles */
.role-title-pill {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 4px;
  display: inline-flex;
  font-size: 0.75rem;
  font-weight: 700;
  gap: 0.35rem;
  line-height: 1.2;
  margin-left: auto;
  max-width: 100%;
  padding: 3px 6px;
}

.role-icon {
  fill: none;
  flex-shrink: 0;
  height: 0.9rem;
  stroke: currentcolor;
  width: 0.9rem;
}

.role-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Surgery Group */
.surgery-group {
  display: flex;
  flex-direction: column;
}

.surgery-group:not(:first-child) {
  border-top: 1px solid var(--border-color);
}

.surgery-title-bar {
  align-items: center;
  background-color: var(--bg-surface, #fff);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-muted);
  display: flex;
  font-size: 0.8rem;
  font-weight: 600;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.6rem var(--spacing-sm);
}

.surgery-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.days-row {
  display: grid;
  width: 100%;
}

.day-slot-cell {
  align-items: center;
  border-right: 1px solid #f1f5f9;
  display: flex;
  min-height: 5.5rem;
  min-width: 0;
  padding: 0.4rem 0.5rem;
}

.day-slot-cell:last-child {
  border-right: none;
}
</style>

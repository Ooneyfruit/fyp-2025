<script setup lang="ts">
/**
 * Displays the Role title and Surgery name in the first column of the Rota Grid.
 * Designed to be used as a cellComponent in BaseTable.
 */
import { computed } from 'vue';

import type { TableHeader } from '@/components/shared/BaseTable.vue';
import { useRotaColors } from '@/features/rota/composables/useRotaColors';
import type { PracticeRole, PracticeSurgery } from '@/features/rota/rotaTypes';
import { getRoleIcon } from '@/features/settings/composables/useRoleIcons';

interface RotaRow {
  [key: string]: unknown;
  id: string;
  role: PracticeRole;
  surgery: PracticeSurgery;
  _isGroupStart?: boolean;
}

const props = defineProps<{
  item: Record<string, unknown>;
  header?: TableHeader;
}>();

const { getRoleColor } = useRotaColors();

/**
 * Casts the generic item to our specific RotaRow type.
 */
const row = computed(() => props.item as RotaRow);

const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
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

/**
 * Retrieves the Vue component for the associated role icon.
 */
const roleIcon = computed(() => {
  return getRoleIcon(row.value.role.icon_id);
});
</script>

<template>
  <div class="header-col-inner">
    <div v-if="row._isGroupStart" class="role-title" :style="getRoleBadgeStyle(row.role.name)">
      <component :is="roleIcon" v-if="roleIcon" class="role-icon" />
      <span class="role-text">{{ toTitleCase(row.role.name) }}</span>
    </div>
    <div class="surgery-subtitle">
      {{ row.surgery.name }}
    </div>
  </div>
</template>

<style scoped>
.header-col-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.role-title {
  align-items: center;
  align-self: flex-start;
  border: 1px solid transparent;
  border-radius: 4px;
  display: inline-flex;
  font-size: 0.75rem;
  font-weight: 700;
  gap: 0.35rem;
  line-height: 1.2;
  margin-bottom: 0.25rem;

  /* Ensure the badge itself doesn't exceed the container width */
  max-width: 100%;
  padding: 3px 6px;

  /* Removed letter-spacing to fix kerning issues */
}

.role-icon {
  fill: none;
  flex-shrink: 0;
  height: 0.9rem;
  stroke: currentcolor;
  width: 0.9rem;
}

.role-text {
  /* Critical for truncation inside a flex child: allow it to shrink */
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.surgery-subtitle {
  color: var(--text-muted);
  font-size: 0.85rem;
  overflow: hidden;
  padding-left: 4px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

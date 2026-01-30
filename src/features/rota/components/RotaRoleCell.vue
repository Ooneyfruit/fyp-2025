<script setup lang="ts">
/**
 * Displays the Role title and Surgery name in the first column of the Rota Grid.
 * Designed to be used as a cellComponent in BaseTable.
 */
import { computed } from 'vue';

import type { TableHeader } from '@/components/shared/BaseTable.vue';
import { useRotaColors } from '@/features/rota/composables/useRotaColors';
import type { PracticeRole, PracticeSurgery } from '@/features/rota/rotaTypes';

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

const toSentenceCase = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const getRoleBadgeStyle = (roleId: string) => {
  const c = getRoleColor(roleId);
  return {
    backgroundColor: c.bg,
    color: c.accent,
    borderColor: c.accent
  };
};
</script>

<template>
  <div class="header-col-inner">
    <div v-if="row._isGroupStart" class="role-title" :style="getRoleBadgeStyle(row.role.id)">
      {{ toSentenceCase(row.role.name) }}
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
  align-self: flex-start;
  border: 1px solid transparent;
  border-radius: 4px;
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
  max-width: 100%;
  overflow: hidden;
  padding: 2px 6px;
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

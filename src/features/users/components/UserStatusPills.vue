<script setup lang="ts">
/**
 * Unified status indicator for user attributes.
 * Connects domain data (Roles, Status) to UI components (BasePill).
 * Uses persistent Rota colours for role badges to ensure cross-page consistency.
 */
import { computed } from 'vue';

import BasePill from '@/components/shared/BasePill.vue';
import { useRotaColors } from '@/features/rota/composables/useRotaColors';
import { type PracticeUser } from '@/features/users/userTypes';

const props = defineProps<{
  member: PracticeUser;
  type: 'role' | 'admin' | 'contract';
}>();

const { getRoleColor } = useRotaColors();

interface PillConfig {
  label: string;
  variant: 'primary' | 'admin' | 'muted' | 'success' | 'warning' | 'danger';
  customColors?: { bg: string; accent: string };
}

/**
 * Logic: Helper to determine contract status.
 */
const getContractConfig = (m: PracticeUser): PillConfig => {
  if (m.status === 'invited') {
    return { label: 'Invited', variant: 'muted' };
  }

  const isEmployee = m.is_employee ?? true;

  if (isEmployee) {
    return { label: 'Employee', variant: 'muted' };
  }

  return { label: 'Contractor', variant: 'muted' };
};

/**
 * Configuration mappings.
 * 'role' type now fetches the persistent colour using the Role Name.
 */
const typeMappers: Record<string, (m: PracticeUser) => PillConfig> = {
  role: (m) => {
    // Key Logic: Use the Role Name string. This matches the logic in RotaDayCell.vue.
    const roleColors = getRoleColor(m.role);
    return {
      label: m.role || 'No Role',
      variant: 'muted', // Base variant, overridden by customColors
      customColors: {
        bg: roleColors.bg,
        accent: roleColors.accent
      }
    };
  },
  admin: (m) => ({
    label: m.is_administrator ? 'Admin' : 'User',
    variant: 'muted'
  }),
  contract: getContractConfig
};

const pillConfig = computed<PillConfig>(() => {
  const mapper = typeMappers[props.type];

  if (!mapper) {
    return { label: 'Unknown', variant: 'muted' };
  }

  return mapper(props.member);
});
</script>

<template>
  <BasePill :custom-colors="pillConfig.customColors" :variant="pillConfig.variant">
    {{ pillConfig.label }}
  </BasePill>
</template>

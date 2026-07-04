<script setup lang="ts">
/**
 * Unified status indicator for user attributes.
 * Connects domain data (Roles, Status) to UI components (BasePill).
 * Uses persistent Rota colours for role badges to ensure cross-page consistency.
 */
import { computed } from 'vue';

import BasePill from '@/components/shared/BasePill.vue';
import { useRotaColours } from '@/features/rota/composables/useRotaColours';
import { type PracticeUser } from '@/features/users/userTypes';

const props = defineProps<{
  member: PracticeUser;
  type: 'role' | 'admin' | 'contract';
}>();

const { getRoleColour } = useRotaColours();

interface PillConfig {
  label: string;
  variant: 'primary' | 'admin' | 'muted' | 'success' | 'warning' | 'danger';
  customColours?: { bg: string; accent: string };
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
 */
const typeMappers: Record<string, (m: PracticeUser) => PillConfig> = {
  role: (m) => {
    // Key Logic: Use the Role Name string. This matches the logic in RotaDayCell.vue.
    const roleColours = getRoleColour(m.role);
    return {
      label: m.role || 'No Role',
      variant: 'muted', // Base variant, overridden by customColours
      customColours: {
        bg: roleColours.bg,
        accent: roleColours.accent
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
  <BasePill :custom-colours="pillConfig.customColours" :variant="pillConfig.variant">
    {{ pillConfig.label }}
  </BasePill>
</template>

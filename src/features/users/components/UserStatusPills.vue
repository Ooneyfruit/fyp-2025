<script setup lang="ts">
/**
 * Unified status indicator for user attributes.
 * Maps member data and type to specific BasePill variants.
 */
import { computed } from 'vue';

import BasePill from '@/components/shared/BasePill.vue';
import { type PracticeUser } from '@/features/users/userTypes';

const props = defineProps<{
  member: PracticeUser;
  type: 'role' | 'admin' | 'contract';
}>();

interface PillConfig {
  label: string;
  variant: 'primary' | 'admin' | 'muted' | 'success' | 'warning' | 'danger';
}

/**
 * Logic: Helper to determine contract status without nested ternaries.
 * Satisfies SonarLint S3358.
 * @param m - The practice user member.
 * @returns The configuration object for the pill (label and variant).
 */
const getContractConfig = (m: PracticeUser): PillConfig => {
  if (m.status === 'invited') {
    return { label: 'Invited', variant: 'warning' };
  }
  // Default to true if undefined, as per legacy logic
  const isEmployee = m.is_employee ?? true;

  if (isEmployee) {
    return { label: 'Employee', variant: 'success' };
  }

  return { label: 'Contractor', variant: 'warning' };
};

/**
 * Configuration for different status types and their visual mapping.
 */
const typeMappers: Record<string, (m: PracticeUser) => PillConfig> = {
  role: (m) => ({
    label: m.role || 'No Role',
    variant: 'primary'
  }),
  admin: (m) => ({
    label: m.is_administrator ? 'Admin' : 'User',
    variant: m.is_administrator ? 'admin' : 'muted'
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
  <BasePill :variant="pillConfig.variant">
    {{ pillConfig.label }}
  </BasePill>
</template>

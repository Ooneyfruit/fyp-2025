<script setup>
/**
 * Unified status indicator for user attributes.
 * Maps member data and type to specific BasePill variants.
 */
import { computed } from 'vue';

import BasePill from '../../../components/shared/BasePill.vue';

const props = defineProps({
  member: { type: Object, required: true },
  // The attribute type determines which data field to visualise: 'role', 'admin', or 'contract'.
  type: { type: String, required: true }
});

/**
 * Configuration for different status types and their visual mapping.
 * Uses an index signature to satisfy linting requirements for object mapping.
 * @type { {[key: string]: (m: any) => {label: string, variant: string}} }
 */
const typeMappers = {
  role: (m) => ({
    label: m.role || 'No Role',
    variant: 'primary'
  }),
  admin: (m) => ({
    label: m.is_administrator ? 'Admin' : 'User',
    variant: m.is_administrator ? 'admin' : 'muted'
  }),
  contract: (m) => ({
    label: m.is_employee ? 'Employee' : 'Contractor',
    variant: m.is_employee ? 'success' : 'warning'
  })
};

const pillConfig = computed(() => {
  // Retrieve the mapper function based on the provided type prop.
  // This avoids switch-statement complexity and allows for easy extension.
  const mapper = typeMappers[props.type];

  // Provide a fallback configuration if the provided type is not supported.
  if (!mapper) {
    return { label: 'Unknown', variant: 'muted' };
  }

  // Execute the mapper to retrieve label and variant settings based on member data.
  return mapper(props.member);
});
</script>

<template>
  <BasePill :variant="pillConfig.variant">
    {{ pillConfig.label }}
  </BasePill>
</template>

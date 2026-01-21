<template>
  <BasePill :variant="pillConfig.variant">
    {{ pillConfig.label }}
  </BasePill>
</template>

<script setup>
/**
 * Unified status indicator for user attributes.
 * Maps member data and type to specific BasePill variants.
 */
import { computed } from 'vue';
import BasePill from '../../../components/shared/BasePill.vue';

const props = defineProps({
  member: { type: Object, required: true },
  type: { type: String, required: true } // 'role', 'admin', or 'contract'
});

const pillConfig = computed(() => {
  // Logic: determine label and visual variant based on prop type.
  switch (props.type) {
    case 'role':
      return { label: props.member.role, variant: 'primary' };
    case 'admin':
      return { 
        label: props.member.is_administrator ? 'Admin' : 'User', 
        variant: props.member.is_administrator ? 'admin' : 'muted' 
      };
    case 'contract':
      return { 
        label: props.member.is_employee ? 'Employee' : 'Contractor', 
        variant: props.member.is_employee ? 'success' : 'warning' 
      };
    default:
      return { label: 'Unknown', variant: 'muted' };
  }
});
</script>
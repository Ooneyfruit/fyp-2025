<template>
  <BasePill v-if="type === 'role'" variant="primary">
    {{ member.role }}
  </BasePill>

  <BasePill v-else-if="type === 'admin'" :variant="member.is_administrator ? 'admin' : 'muted'">
    {{ member.is_administrator ? 'Admin' : 'User' }}
  </BasePill>

  <BasePill v-else-if="type === 'contract'" :variant="member.is_employee ? 'success' : 'warning'">
    {{ member.is_employee ? 'Employee' : 'Contractor' }}
  </BasePill>
</template>

<script setup>
import BasePill from '../ui/BasePill.vue';

defineProps({
  member: { type: Object, required: true },
  type: { type: String, required: true } // 'role', 'admin', or 'contract'
});
</script>
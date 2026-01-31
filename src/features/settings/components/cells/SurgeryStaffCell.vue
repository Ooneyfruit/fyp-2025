<script setup lang="ts">
/**
 * Renders the staff count for a specific role.
 * Highlights zero values differently.
 */
import { computed } from 'vue';

import { type TableHeader } from '@/components/shared/BaseTable.vue';

const props = defineProps<{
  item: Record<string, unknown>;
  header: TableHeader;
}>();

const count = computed(() => {
  return (props.item[props.header.key] as number) || 0;
});
</script>

<template>
  <span class="staff-count" :class="{ zero: count === 0 }">
    {{ count }}
  </span>
</template>

<style scoped>
.staff-count {
  font-weight: 600;
}

.staff-count.zero {
  color: var(--text-muted);
  opacity: 0.5;
}
</style>

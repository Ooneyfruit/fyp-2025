<script setup lang="ts">
/**
 * Renders an indicator if the surgery operates on the day specified in the header key.
 * Expected Header Key Format: "day_Monday", "day_Tuesday", etc.
 */
import { computed } from 'vue';

import { type TableHeader } from '@/components/shared/BaseTable.vue';

const props = defineProps<{
  item: Record<string, unknown>;
  header: TableHeader;
}>();

const PREFIX_LEN = 4; // Length of "day_"

const isOperating = computed(() => {
  // Extract "Monday" from "day_Monday"
  const dayName = props.header.key.slice(Math.max(0, PREFIX_LEN));
  const days = props.item.days_of_operation as string[];
  return Array.isArray(days) && days.includes(dayName);
});
</script>

<template>
  <span class="day-indicator">
    {{ isOperating ? '✓' : '_' }}
  </span>
</template>

<style scoped>
.day-indicator {
  color: var(--text-main);
  font-family: monospace;
  font-weight: bold;
}
</style>

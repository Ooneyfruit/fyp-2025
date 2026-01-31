<script setup lang="ts">
/**
 * Renders a formatted time string from a Firestore timestamp.
 */
import { type Timestamp } from 'firebase/firestore';
import { computed } from 'vue';

import { type TableHeader } from '@/components/shared/BaseTable.vue';

const props = defineProps<{
  item: Record<string, unknown>;
  header: TableHeader;
}>();

const formattedTime = computed(() => {
  const val = props.item[props.header.key] as Timestamp | undefined;
  if (!val || !val.seconds) return '--:--';

  const MS_PER_SEC = 1000;
  const d = new Date(val.seconds * MS_PER_SEC);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});
</script>

<template>
  <span>{{ formattedTime }}</span>
</template>

<script setup lang="ts">
/**
 * Table cell component for displaying formatted Firestore dates.
 */
import { computed } from 'vue';

import type { FirestoreDate } from '@/features/users/userTypes';

const props = defineProps<{
  item: Record<string, unknown>;
  header: {
    key: string;
  };
}>();

const SECONDS_TO_MS = 1000;

const dateValue = computed(() => {
  return props.item[props.header.key] as FirestoreDate;
});

/**
 * Formats a Firestore timestamp or date string into a readable GB date format.
 */
const formattedDate = computed((): string => {
  const ts = dateValue.value;

  if (!ts) {
    return '—';
  }

  // Check if the object has a toDate method (Firestore Timestamp).
  if (typeof ts === 'object' && 'toDate' in ts && typeof ts.toDate === 'function') {
    return ts
      .toDate()
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // Fallback for objects with seconds property or raw values.
  const seconds = (ts as { seconds?: number }).seconds;
  const timeValue = seconds ? seconds * SECONDS_TO_MS : (ts as string | number);
  const d = new Date(timeValue);

  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
});
</script>

<template>
  <span class="date-text">{{ formattedDate }}</span>
</template>

<style scoped>
.date-text {
  color: var(--text-main);
  font-size: 0.85rem;
  white-space: nowrap;
}
</style>

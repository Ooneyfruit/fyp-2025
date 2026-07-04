<script setup lang="ts">
/**
 * Card Body component for User Data View.
 * Displays detailed user information such as role, status, and contract dates.
 */
import type { FirestoreDate, PracticeUser } from '@/features/users/userTypes';

import UserStatusPills from './UserStatusPills.vue';

defineProps<{
  item: PracticeUser;
}>();

/**
 * The multiplier to convert seconds to milliseconds.
 */
const SECONDS_TO_MS = 1000;

/**
 * Formats a Firestore timestamp or date string into a readable GB date format.
 *
 * @param timestamp - The timestamp or date value to format.
 * @returns The formatted date string or null if input is invalid.
 */
const formatDate = (timestamp: FirestoreDate): string | null => {
  if (!timestamp) {
    return null;
  }

  // Check if the object has a toDate method (Firestore Timestamp).
  if (
    typeof timestamp === 'object' &&
    'toDate' in timestamp &&
    typeof timestamp.toDate === 'function'
  ) {
    return timestamp
      .toDate()
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // Fallback for objects with seconds property or raw values.
  const seconds = (timestamp as { seconds?: number }).seconds;
  const timeValue = seconds ? seconds * SECONDS_TO_MS : (timestamp as string | number);
  const d = new Date(timeValue);

  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
</script>

<template>
  <div>
    <div class="detail-row">
      <span class="label">Role</span>
      <UserStatusPills :member="item" type="role" />
    </div>
    <div class="detail-row">
      <span class="label">Status</span>
      <UserStatusPills :member="item" type="admin" />
    </div>
    <div class="detail-row">
      <span class="label">Joined</span>
      <span class="date-text">{{ formatDate(item.start_date) }}</span>
    </div>
    <div class="detail-row">
      <span class="label">Ends</span>
      <span class="date-text">{{ item.end_date ? formatDate(item.end_date) : '—' }}</span>
    </div>
  </div>
</template>

<style scoped>
.date-text {
  color: var(--text-main);
  font-size: 0.85rem;
  white-space: nowrap;
}

.detail-row {
  align-items: center;
  display: grid;
  gap: var(--spacing-sm);
  grid-template-columns: 6.25rem 1fr;
  margin-bottom: var(--spacing-xs);
}

.detail-row .label {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}
</style>

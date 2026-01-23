<script setup>
/**
 * UserListCard.
 * Encapsulates the card view for a single user using component injection for headers.
 */
import BaseCard from '@/components/shared/BaseCard.vue';

import UserListCardHeader from './UserListCardHeader.vue';
import UserStatusPills from './UserStatusPills.vue';

const MILLISECONDS_IN_SECOND = 1000;

// Prop definition without variable assignment to satisfy 'no-unused-vars' rule.
defineProps({
  item: {
    type: Object,
    required: true
  }
});

defineEmits(['edit']);

/**
 * Logic: supports Firestore timestamps, objects with second offsets, or raw millisecond numbers.
 * @param {any} ts - The raw timestamp data to format.
 * @returns {string|null} Formatted date (e.g. "01 Jan 2023") or null if invalid.
 */
const formatDate = (ts) => {
  if (!ts) {
    return null;
  }

  /** @type {Date} */
  let dateObj;

  // Handle Firestore Timestamp objects with native toDate methods.
  if (typeof ts === 'object' && 'toDate' in ts && typeof ts.toDate === 'function') {
    dateObj = ts.toDate();
  } else if (typeof ts === 'object' && 'seconds' in ts) {
    // Handle plain objects containing second-based offsets.
    dateObj = new Date(Number(ts.seconds) * MILLISECONDS_IN_SECOND);
  } else {
    // Fallback to direct numeric conversion for milliseconds.
    dateObj = new Date(Number(ts));
  }

  return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
</script>

<template>
  <BaseCard
    :header-component="UserListCardHeader"
    :header-listeners="{ edit: () => $emit('edit', item) }"
    :header-props="{ profile: /** @type {any} */ (item).profile }"
  >
    <div class="detail-row">
      <span class="label">Role</span>
      <UserStatusPills :member="/** @type {any} */ (item)" type="role" />
    </div>

    <div class="detail-row">
      <span class="label">Status</span>
      <UserStatusPills :member="/** @type {any} */ (item)" type="admin" />
    </div>

    <div class="detail-row">
      <span class="label">Joined</span>
      <span class="date-text">
        {{ formatDate(/** @type {any} */ (item).start_date) }}
      </span>
    </div>

    <div class="detail-row">
      <span class="label">Ends</span>
      <span class="date-text">
        {{
          /** @type {any} */ (item).end_date ? formatDate(/** @type {any} */ (item).end_date) : '—'
        }}
      </span>
    </div>
  </BaseCard>
</template>

<style scoped>
/* Component-specific layout for detail rows and typography. */
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

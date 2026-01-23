<script setup>
/**
 * User data adapter for management interfaces.
 * Logic: dynamically switches between table and card visualisations based on container width.
 * Refactored to include explicit type annotations to satisfy strict TypeScript checks.
 */
import { ref } from 'vue';

import BaseCardList from '@/components/shared/BaseCardList.vue';
import BaseTable from '@/components/shared/BaseTable.vue';
import { useBreakpoints } from '@/composables/useBreakpoints';

import UserActionButtons from './UserActionButtons.vue';
import UserIdentity from './UserIdentity.vue';
import UserListCard from './UserListCard.vue';
import UserStatusPills from './UserStatusPills.vue';

// Constants to eliminate magic numbers and improve maintainability.
const MOBILE_LAYOUT_THRESHOLD = 62;
const MILLISECONDS_IN_SECOND = 1000;

/**
 * @typedef {object} MemberProfile
 * @property {string} [name] - Display name.
 * @property {string} [email] - Contact email.
 */

/**
 * @typedef {object} UserMember
 * @property {MemberProfile} profile - User profile information.
 * @property {string} role - Assigned practice role.
 * @property {boolean} is_administrator - Administrative status flag.
 * @property {boolean} is_employee - Employment status flag.
 * @property {any} start_date - Initial joining date.
 * @property {any} [end_date] - Optional contract end date.
 */

defineProps({
  users: {
    // Type cast applied to the constructor to satisfy TypeScript property checks.
    type: /** @type {import('vue').PropType<UserMember[]>} */ (Array),
    default: () => []
  }
});

const emit = defineEmits(['edit']);

const adapterRoot = ref(null);

// Observe the root container width to trigger responsive layout shifts.
const { isMobile } = useBreakpoints(adapterRoot, MOBILE_LAYOUT_THRESHOLD);

/**
 * Formats a raw timestamp or numeric value into a readable UK date string.
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

/**
 * Configuration for the data table headers using component injection.
 * Logic: explicitly types 'item' parameters as UserMember to prevent implicit any errors.
 */
const userHeaders = [
  {
    key: 'member',
    label: 'Member',
    width: 'minmax(10rem, 1fr)',
    component: UserIdentity,
    // Explicitly casting the parameter to UserMember to satisfy TypeScript.
    props: (/** @type {UserMember} */ item) => ({ profile: item.profile })
  },
  {
    key: 'role',
    label: 'Role',
    width: 'min-content',
    component: UserStatusPills,
    props: (/** @type {UserMember} */ item) => ({ member: item, type: 'role' })
  },
  {
    key: 'status',
    label: 'Status',
    width: 'min-content',
    component: UserStatusPills,
    props: (/** @type {UserMember} */ item) => ({ member: item, type: 'admin' })
  },
  {
    key: 'contract',
    label: 'Contract',
    width: 'min-content',
    component: UserStatusPills,
    props: (/** @type {UserMember} */ item) => ({ member: item, type: 'contract' })
  },
  {
    key: 'joined',
    label: 'Joined',
    width: '8.5rem',
    // 'val' is the specific cell value, while 'item' represents the full row data.
    formatter: (/** @type {any} */ val, /** @type {UserMember} */ item) =>
      formatDate(item.start_date),
    cellClass: 'date-text'
  },
  {
    key: 'endDate',
    label: 'End Date',
    width: '8.5rem',
    formatter: (/** @type {any} */ val, /** @type {UserMember} */ item) =>
      item.end_date ? formatDate(item.end_date) : '—',
    cellClass: 'date-text'
  },
  {
    key: 'actions',
    label: 'Actions',
    width: 'min-content',
    align: 'center',
    component: UserActionButtons,
    listeners: (/** @type {UserMember} */ item) => ({
      edit: () => emit('edit', item)
    })
  }
];
</script>

<template>
  <div ref="adapterRoot" class="adapter-container">
    <div v-if="!users || users.length === 0" class="loading-overlay">
      <p>Synchronising Practice Identities...</p>
    </div>

    <BaseTable v-else-if="!isMobile" :headers="userHeaders" :items="users" />

    <BaseCardList
      v-else
      :card-component="UserListCard"
      :items="users"
      min-card-width="18rem"
      @edit="(/** @type {UserMember} */ item) => $emit('edit', item)"
    />
  </div>
</template>

<style scoped>
.adapter-container {
  min-height: 200px;
  position: relative;
  transition: width var(--anim-speed) ease;
  width: 100%;
}

.loading-overlay {
  align-items: center;
  color: var(--text-muted);
  display: flex;
  font-style: italic;
  height: 200px;
  justify-content: center;
}

/* Logic: standardises date appearance across table and card layouts. */
:deep(.date-text) {
  color: var(--text-main);
  font-size: 0.85rem;
  white-space: nowrap;
}
</style>

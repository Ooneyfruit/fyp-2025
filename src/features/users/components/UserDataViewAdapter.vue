<script setup lang="ts">
/**
 * User data adapter for management interfaces.
 * Logic: dynamically switches between table and card visualisations based on container width.
 */
import { ref } from 'vue';

import BaseCardList from '@/components/shared/BaseCardList.vue';
import BaseTable from '@/components/shared/BaseTable.vue';
import { useBreakpoints } from '@/composables/useBreakpoints';
import { type FirestoreDate, type PracticeUser } from '@/features/users/userTypes';

import UserActionButtons from './UserActionButtons.vue';
import UserIdentity from './UserIdentity.vue';
import UserListCard from './UserListCard.vue';
import UserStatusPills from './UserStatusPills.vue';

// Constants to eliminate magic numbers and improve maintainability.
const MOBILE_LAYOUT_THRESHOLD = 62;
const MILLISECONDS_IN_SECOND = 1000;

defineProps<{
  /**
   * The collection of practice users to display.
   */
  users: PracticeUser[];
}>();

const emit = defineEmits<(e: 'edit', item: PracticeUser) => void>();

const adapterRoot = ref<HTMLElement | null>(null);

// Observe the root container width to trigger responsive layout shifts.
const { isMobile } = useBreakpoints(adapterRoot, MOBILE_LAYOUT_THRESHOLD);

/**
 * Formats a raw timestamp or numeric value into a readable UK date string.
 * @param ts - The raw timestamp data to format (Firestore Timestamp, seconds object, or number).
 * @returns The formatted date string (e.g. "01 Jan 2023") or null if input is invalid.
 */
const formatDate = (ts: FirestoreDate): string | null => {
  if (!ts) {
    return null;
  }

  let dateObj: Date;

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
 * Interface for Table Header Configuration.
 * Explicitly defining this prevents implicit 'any' errors in complex object literals.
 */
interface TableHeader {
  /**
   * Unique identifier for the column.
   */
  key: string;
  /**
   * Display label for the column header.
   */
  label: string;
  /**
   * CSS grid width specification.
   */
  width: string;
  /**
   * Optional custom component to render the cell content.
   */
  component?: unknown;
  /**
   * Optional function to generate props for the custom component.
   */
  props?: (item: PracticeUser) => Record<string, unknown>;
  /**
   * Optional function to format the raw value into a display string.
   */
  formatter?: (val: unknown, item: PracticeUser) => string | null;
  /**
   * Optional CSS class to apply to the cell.
   */
  cellClass?: string;
  /**
   * Optional text alignment specification.
   */
  align?: string;
  /**
   * Optional function to bind event listeners to the custom component.
   */
  listeners?: (item: PracticeUser) => Record<string, unknown>;
}

/**
 * Configuration for the data table headers using component injection.
 */
const userHeaders: TableHeader[] = [
  {
    key: 'member',
    label: 'Member',
    width: 'minmax(10rem, 1fr)',
    component: UserIdentity,
    props: (item) => ({ profile: item })
  },
  {
    key: 'role',
    label: 'Role',
    width: 'min-content',
    component: UserStatusPills,
    props: (item) => ({ member: item, type: 'role' })
  },
  {
    key: 'status',
    label: 'Status',
    width: 'min-content',
    component: UserStatusPills,
    props: (item) => ({ member: item, type: 'admin' })
  },
  {
    key: 'contract',
    label: 'Contract',
    width: 'min-content',
    component: UserStatusPills,
    props: (item) => ({ member: item, type: 'contract' })
  },
  {
    key: 'joined',
    label: 'Joined',
    width: '8.5rem',
    formatter: (_, item) => formatDate(item.start_date),
    cellClass: 'date-text'
  },
  {
    key: 'endDate',
    label: 'End Date',
    width: '8.5rem',
    formatter: (_, item) => (item.end_date ? formatDate(item.end_date) : '—'),
    cellClass: 'date-text'
  },
  {
    key: 'actions',
    label: 'Actions',
    width: 'min-content',
    align: 'center',
    component: UserActionButtons,
    listeners: (item) => ({
      edit: () => emit('edit', item)
    })
  }
];
</script>

<template>
  <div ref="adapterRoot" class="adapter-container">
    <div v-if="!users || users.length === 0" class="loading-overlay">
      <p>Synchronising practice identities...</p>
    </div>

    <BaseTable v-else-if="!isMobile" :headers="userHeaders" :items="users" />

    <BaseCardList
      v-else
      :card-component="UserListCard"
      :items="users"
      min-card-width="18rem"
      @edit="(item: PracticeUser) => emit('edit', item)"
    />
  </div>
</template>

<style scoped>
/* Main container: base styling for the responsive data adapter. */
.adapter-container {
  min-height: 200px;
  position: relative;
  transition: width var(--anim-speed) ease;
  width: 100%;
}

/* Loading: placeholder state for asynchronous data fetching. */
.loading-overlay {
  align-items: center;
  color: var(--text-muted);
  display: flex;
  font-style: italic;
  height: 200px;
  justify-content: center;
}

/* Typography: standardisation for date text appearance across layouts. */
:deep(.date-text) {
  color: var(--text-main);
  font-size: 0.85rem;
  white-space: nowrap;
}
</style>

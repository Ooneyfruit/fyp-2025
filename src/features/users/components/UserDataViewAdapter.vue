<script setup>
/**
 * User data adapter for management interfaces.
 * Logic: dynamically switches between table and card visualisations based on container width.
 */
import { ref } from 'vue';

import BaseCardList from '@/components/shared/BaseCardList.vue';
import BaseTable from '@/components/shared/BaseTable.vue';
import { useBreakpoints } from '@/composables/useBreakpoints';

import UserActionButtons from './UserActionButtons.vue';
import UserIdentity from './UserIdentity.vue';
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

// Define props without variable assignment as the props are not used within the script block.
defineProps({
  users: {
    // Type cast applied to the constructor to satisfy TypeScript property checks.
    type: /** @type {import('vue').PropType<UserMember[]>} */ (Array),
    default: () => []
  }
});

defineEmits(['edit']);

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
 * Configuration for the data table headers.
 */
const userHeaders = [
  { key: 'member', label: 'Member', width: 'minmax(10rem, 1fr)' },
  { key: 'role', label: 'Role', width: 'min-content' },
  { key: 'status', label: 'Status', width: 'min-content' },
  { key: 'contract', label: 'Contract', width: 'min-content' },
  { key: 'joined', label: 'Joined', width: '8.5rem' },
  { key: 'endDate', label: 'End Date', width: '8.5rem' },
  { key: 'actions', label: 'Actions', width: 'min-content', align: 'center' }
];
</script>

<template>
  <div ref="adapterRoot" class="adapter-container">
    <div v-if="!users || users.length === 0" class="loading-overlay">
      <p>Synchronising Practice Identities...</p>
    </div>

    <BaseTable v-else-if="!isMobile" :headers="userHeaders" :items="users">
      <template #cell(member)="{ item }">
        <UserIdentity :profile="/** @type {any} */ (item).profile" />
      </template>

      <template #cell(role)="{ item }">
        <UserStatusPills :member="/** @type {any} */ (item)" type="role" />
      </template>

      <template #cell(status)="{ item }">
        <UserStatusPills :member="/** @type {any} */ (item)" type="admin" />
      </template>

      <template #cell(contract)="{ item }">
        <UserStatusPills :member="/** @type {any} */ (item)" type="contract" />
      </template>

      <template #cell(joined)="{ item }">
        <span class="date-text">
          {{ formatDate(/** @type {any} */ (item).start_date) }}
        </span>
      </template>

      <template #cell(endDate)="{ item }">
        <span class="date-text">
          {{
            /** @type {any} */ (item).end_date
              ? formatDate(/** @type {any} */ (item).end_date)
              : '—'
          }}
        </span>
      </template>

      <template #cell(actions)="{ item }">
        <UserActionButtons @edit="$emit('edit', item)" />
      </template>
    </BaseTable>

    <BaseCardList v-else :items="users" min-card-width="18rem">
      <template #card-header="{ item }">
        <div class="card-identity-wrapper">
          <UserIdentity :profile="/** @type {any} */ (item).profile" />
          <UserActionButtons class="card-edit-btn" @edit="$emit('edit', item)" />
        </div>
      </template>
      <template #card-body="{ item }">
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
              /** @type {any} */ (item).end_date
                ? formatDate(/** @type {any} */ (item).end_date)
                : '—'
            }}
          </span>
        </div>
      </template>
    </BaseCardList>
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

.date-text {
  color: var(--text-main);
  font-size: 0.85rem;
  white-space: nowrap;
}

.card-identity-wrapper {
  align-items: flex-start;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  width: 100%;
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

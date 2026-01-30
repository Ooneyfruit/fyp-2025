<script setup lang="ts">
/**
 * Data Adapter for User Management.
 * Switches between Table and Card views based on available container width.
 */
import { ref } from 'vue';

import BaseCardList from '@/components/shared/BaseCardList.vue';
import BaseTable from '@/components/shared/BaseTable.vue';
import { useBreakpoints } from '@/composables/useBreakpoints';
import type { FirestoreDate } from '@/features/users/userTypes';

import UserActionButtons from './UserActionButtons.vue';
import UserIdentity from './UserIdentity.vue';
import UserStatusPills from './UserStatusPills.vue';

/**
 * The breakpoint threshold in rem units for switching to mobile view.
 */
const MOBILE_BREAKPOINT_REM = 62;

/**
 * The multiplier to convert seconds to milliseconds.
 */
const SECONDS_TO_MS = 1000;

const props = withDefaults(
  defineProps<{
    users?: any[];
  }>(),
  {
    users: () => []
  }
);

defineEmits(['edit']);

const adapterRoot = ref<HTMLElement | null>(null);

// Adjusted threshold to 62rem (approx 992px).
// Increased to prevent the actions column from clipping before the switch to mobile view occurs.
const { isMobile } = useBreakpoints(adapterRoot, MOBILE_BREAKPOINT_REM);

/**
 * Formats a Firestore timestamp or date string into a readable GB date format.
 *
 * @param ts - The timestamp or date value to format.
 * @returns The formatted date string or null if input is invalid.
 */
const formatDate = (ts: FirestoreDate): string | null => {
  if (!ts) {
    return null;
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
};

/**
 * The 'member' column uses minmax() to enforce readability.
 * Calculation: Icon (2.25rem) + Gap (0.75rem) + Text (4.5rem) + Padding (~2rem) = ~9.5rem.
 * Has min-width set to 10rem to guarantee the text is at least twice the icon width.
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
      <p>Synchronizing Practice Identities...</p>
    </div>

    <BaseTable v-else-if="!isMobile" :headers="userHeaders" :items="users">
      <template #cell(member)="{ item }">
        <UserIdentity :profile="item.profile" />
      </template>

      <template #cell(role)="{ item }">
        <UserStatusPills :member="item" type="role" />
      </template>

      <template #cell(status)="{ item }">
        <UserStatusPills :member="item" type="admin" />
      </template>

      <template #cell(contract)="{ item }">
        <UserStatusPills :member="item" type="contract" />
      </template>

      <template #cell(joined)="{ item }">
        <span class="date-text">{{ formatDate(item.start_date) }}</span>
      </template>

      <template #cell(endDate)="{ item }">
        <span class="date-text">{{ item.end_date ? formatDate(item.end_date) : '—' }}</span>
      </template>

      <template #cell(actions)="{ item }">
        <UserActionButtons @edit="$emit('edit', item)" />
      </template>
    </BaseTable>

    <BaseCardList v-else :items="users" min-card-width="18rem">
      <template #card-header="{ item }">
        <div class="card-identity-wrapper">
          <UserIdentity :profile="item.profile" />
          <UserActionButtons class="card-edit-btn" @edit="$emit('edit', item)" />
        </div>
      </template>
      <template #card-body="{ item }">
        <div class="detail-row">
          <span class="label">Role</span><UserStatusPills :member="item" type="role" />
        </div>
        <div class="detail-row">
          <span class="label">Status</span><UserStatusPills :member="item" type="admin" />
        </div>
        <div class="detail-row">
          <span class="label">Joined</span
          ><span class="date-text">{{ formatDate(item.start_date) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Ends</span
          ><span class="date-text">{{ item.end_date ? formatDate(item.end_date) : '—' }}</span>
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

/* Layout: Flex container for the card header. */
.card-identity-wrapper {
  align-items: flex-start;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  width: 100%; /* Ensure the wrapper fills the card header width so space-between works */
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

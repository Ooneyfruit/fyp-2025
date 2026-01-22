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

<script setup>
/**
 * UserDataViewAdapter
 *
 * Data Adapter for User Management.
 * Switches between Table and Card views based on available container width.
 */
import { ref, onMounted } from 'vue';
import BaseTable from '../../../components/shared/BaseTable.vue';
import BaseCardList from '../../../components/shared/BaseCardList.vue';
import UserIdentity from './UserIdentity.vue';
import UserStatusPills from './UserStatusPills.vue';
import UserActionButtons from './UserActionButtons.vue';
import { useBreakpoints } from '../../../composables/useBreakpoints';

// Define props with explicit types and default values to prevent runtime warnings
const props = defineProps({
  users: {
    type: Array,
    default: () => []
  }
});

defineEmits(['edit']);

onMounted(() =>
  console.log(`[UserDataViewAdapter] Mounted with ${props.users?.length || 0} users.`)
);

const adapterRoot = ref(null);

// Adjusted threshold to 62rem (approx 992px).
// Increased to prevent the actions column from clipping before the switch to mobile view occurs.
const { isMobile } = useBreakpoints(adapterRoot, 62);

/**
 * Formats a timestamp into a readable date string.
 * @param {Object|number} ts - Firestore timestamp or seconds
 * @returns {string|null} Formatted date string (e.g. "01 Jan 2023")
 */
const formatDate = (ts) => {
  if (!ts) return null;
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000 || ts);
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

<style scoped>
.adapter-container {
  width: 100%;
  transition: width var(--anim-speed) ease;
  position: relative;
  min-height: 200px;
}

.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
  font-style: italic;
}

.date-text {
  font-size: 0.85rem;
  color: var(--text-main);
  white-space: nowrap;
}

/* Layout: Flex container for the card header */
.card-identity-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%; /* Ensure the wrapper fills the card header width so space-between works */
}

.detail-row {
  display: grid;
  grid-template-columns: 6.25rem 1fr;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.detail-row .label {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
}
</style>

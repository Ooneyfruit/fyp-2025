<template>
  <div ref="adapterRoot" class="adapter-container">
    <AppTable v-if="!isMobile" :headers="userHeaders" :items="users">
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
        <span class="text-tabular date-text nowrap">{{ formatDate(item.start_date) }}</span>
      </template>

      <template #cell(endDate)="{ item }">
        <span class="text-tabular date-text nowrap">
          {{ item.end_date ? formatDate(item.end_date) : '—' }}
        </span>
      </template>

      <template #cell(actions)="{ item }">
        <UserActionButtons @edit="$emit('edit', item)" />
      </template>
    </AppTable>

    <AppCardList v-else :items="users">
      <template #card-header="{ item }">
        <div class="card-identity-wrapper">
          <UserIdentity :profile="item.profile" />
          <UserActionButtons @edit="$emit('edit', item)" class="card-edit-btn" />
        </div>
      </template>
      
      <template #card-body="{ item }">
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
          <span class="date-text nowrap">{{ formatDate(item.start_date) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Ends</span>
          <span class="date-text nowrap">
            {{ item.end_date ? formatDate(item.end_date) : '—' }}
          </span>
        </div>
      </template>
    </AppCardList>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppTable from '../ui/AppTable.vue';
import AppCardList from '../ui/AppCardList.vue';
import UserIdentity from '../domain/UserIdentity.vue';
import UserStatusPills from '../domain/UserStatusPills.vue';
import UserActionButtons from '../domain/UserActionButtons.vue';
import { useBreakpoints } from '../../composables/useBreakpoints';

const props = defineProps({
  users: { type: Array, required: true }
});

defineEmits(['edit']);

// Logic for container-aware responsiveness
const adapterRoot = ref(null);
const { isMobile } = useBreakpoints(adapterRoot);

/**
 * Date formatting helper
 */
const formatDate = (ts) => {
  if (!ts) return null;
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000 || ts);
  return d.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

/**
 * Header Configuration
 * Restricted widths to prevent bloat; using REM for scaling consistency.
 */
const userHeaders = [
  { key: 'member', label: 'Member', width: '12rem' }, 
  { key: 'role', label: 'Role', shrink: true },
  { key: 'status', label: 'Status', shrink: true },
  { key: 'contract', label: 'Contract', shrink: true },
  { key: 'joined', label: 'Joined', width: '4.5rem', class: 'date-col' },
  { key: 'endDate', label: 'End Date', width: '4.5rem', class: 'date-col' },
  { key: 'actions', label: 'Actions', width: '4rem', class: 'action-header' }
];
</script>

<style scoped>
.adapter-container {
  width: 100%;
  /* Smooth transition for when the sidebar expands/collapses */
  transition: width var(--anim-speed) ease;
}

/* TABLE STYLES */
.date-text { 
  font-size: 0.75rem; 
  color: var(--text-muted); 
  max-width: 4.5rem; 
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nowrap { white-space: nowrap !important; }
.text-tabular { font-variant-numeric: tabular-nums; }

.action-header {
  width: 4rem !important;
  text-align: center;
}

/* MOBILE CARD STYLES */
.card-identity-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.75rem;
  width: 100%;
}

.card-edit-btn {
  margin-top: 0.125rem; /* Vertical alignment with name baseline */
  flex-shrink: 0;
}

.detail-row { 
  display: grid; 
  grid-template-columns: 6.25rem 1fr; /* 100px fixed label width */
  align-items: center; 
  gap: 1rem;
}

.detail-row .label { 
  color: var(--text-muted); 
  font-weight: 600; 
  font-size: 0.75rem; 
  text-transform: uppercase; 
}
</style>
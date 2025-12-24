<template>
  <div ref="adapterRoot" class="adapter-container">
    <div v-if="!users || users.length === 0" class="loading-overlay">
      <p>Synchronizing Practice Identities...</p>
    </div>

    <AppTable v-else-if="!isMobile" :headers="userHeaders" :items="users">
      <template #cell(member)="{ item }">
        <UserIdentity :profile="item.profile" />
      </template>
      <template #cell(role)="{ item }"><UserStatusPills :member="item" type="role" /></template>
      <template #cell(status)="{ item }"><UserStatusPills :member="item" type="admin" /></template>
      <template #cell(contract)="{ item }"><UserStatusPills :member="item" type="contract" /></template>
      <template #cell(joined)="{ item }">
        <span class="date-text">{{ formatDate(item.start_date) }}</span>
      </template>
      <template #cell(endDate)="{ item }">
        <span class="date-text">{{ item.end_date ? formatDate(item.end_date) : '—' }}</span>
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
        <div class="detail-row"><span class="label">Role</span><UserStatusPills :member="item" type="role" /></div>
        <div class="detail-row"><span class="label">Status</span><UserStatusPills :member="item" type="admin" /></div>
        <div class="detail-row"><span class="label">Joined</span><span class="date-text">{{ formatDate(item.start_date) }}</span></div>
        <div class="detail-row"><span class="label">Ends</span><span class="date-text">{{ item.end_date ? formatDate(item.end_date) : '—' }}</span></div>
      </template>
    </AppCardList>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppTable from '../../../components/shared/AppTable.vue';
import AppCardList from '../../../components/shared/AppCardList.vue';
import UserIdentity from './UserIdentity.vue';
import UserStatusPills from './UserStatusPills.vue';
import UserActionButtons from './UserActionButtons.vue';
import { useBreakpoints } from '../../../composables/useBreakpoints';

const props = defineProps({ users: Array });
defineEmits(['edit']);

onMounted(() => console.log(`[UserDataViewAdapter] Mounted with ${props.users?.length || 0} users.`));

const adapterRoot = ref(null);
const { isMobile } = useBreakpoints(adapterRoot);

const formatDate = (ts) => {
  if (!ts) return null;
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000 || ts);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const userHeaders = [
  { key: 'member', label: 'Member', style: { flex: '1 1 8rem' } }, 
  { key: 'role', label: 'Role', style: { flex: '0 0 7rem' } },
  { key: 'status', label: 'Status', style: { flex: '0 0 6rem' } },
  { key: 'contract', label: 'Contract', style: { flex: '0 0 7rem' } },
  { key: 'joined', label: 'Joined', style: { flex: '0 0 6.5rem' } },
  { key: 'endDate', label: 'End Date', style: { flex: '0 0 6.5rem' } },
  { key: 'actions', label: 'Actions', style: { flex: '0 0 4rem', display: 'flex', justifyContent: 'center' } }
];
</script>

<style scoped>
.adapter-container { width: 100%; transition: width var(--anim-speed) ease; position: relative; min-height: 200px; }
.loading-overlay { display: flex; align-items: center; justify-content: center; height: 200px; color: var(--text-muted); font-style: italic; }
.date-text { font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; }
.card-identity-wrapper { display: flex; align-items: flex-start; gap: 0.75rem; }
.detail-row { display: grid; grid-template-columns: 6.25rem 1fr; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-xs); }
.detail-row .label { color: var(--text-muted); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
</style>
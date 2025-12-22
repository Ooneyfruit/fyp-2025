<template>
  <AuthGuard>
    <PageContainer class="user-view-container">
      <div class="header-flex-wrapper">
        <PageHeader 
          title="User Management" 
          subtitle="Manage personnel and permissions for your practice."
        />
        <div class="header-button-area">
          <button class="modern-add-btn" @click="openAddModal" :disabled="uiProcessing">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-msg">Syncing practice records...</div>
      
      <div v-else class="content-wrapper">
        <div class="table-container desktop-only">
          <table class="user-table">
            <thead>
              <tr>
                <th class="member-col">Member</th>
                <th class="shrink-col">Role</th>
                <th class="shrink-col">Status</th>
                <th class="shrink-col">Contract</th>
                <th class="date-col">Joined</th>
                <th class="date-col">End Date</th>
                <th class="action-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in userList" :key="member.id">
                <td class="member-col">
                  <div class="user-info">
                    <img :src="member.profile?.profile_image || 'https://via.placeholder.com/40'" class="avatar" />
                    <div class="meta">
                      <div class="name">{{ member.profile?.name || 'Unknown' }}</div>
                      <div class="email" :title="member.profile?.email">{{ member.profile?.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="shrink-col"><span class="pill-bubble role">{{ member.role }}</span></td>
                <td class="shrink-col">
                  <span :class="['pill-bubble', member.is_administrator ? 'admin' : 'user-status']">
                    {{ member.is_administrator ? 'Admin' : 'User' }}
                  </span>
                </td>
                <td class="shrink-col">
                  <span :class="['pill-bubble', member.is_employee ? 'emp' : 'con']">
                    {{ member.is_employee ? 'Employee' : 'Contractor' }}
                  </span>
                </td>
                <td class="text-tabular date-text nowrap">{{ formatDate(member.start_date) }}</td>
                <td class="text-tabular date-text nowrap">{{ member.end_date ? formatDate(member.end_date) : '—' }}</td>
                <td class="action-cell">
                  <button @click="editUser(member)" class="edit-action-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-only card-grid">
          <div v-for="member in userList" :key="member.id" class="user-card">
            <div class="card-header">
              <img :src="member.profile?.profile_image || 'https://via.placeholder.com/40'" class="avatar" />
              <div class="meta">
                <div class="name">{{ member.profile?.name }}</div>
                <div class="email mobile-email-truncate">{{ member.profile?.email }}</div>
              </div>
              <button @click="editUser(member)" class="edit-action-btn card-edit-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
            <div class="card-body">
              <div class="detail-row"><span class="label">Role</span><span class="pill-bubble role">{{ member.role }}</span></div>
              <div class="detail-row"><span class="label">Status</span><span :class="['pill-bubble', member.is_administrator ? 'admin' : 'user-status']">{{ member.is_administrator ? 'Admin' : 'User' }}</span></div>
              <div class="detail-row"><span class="label">Joined</span><span class="date-text nowrap">{{ formatDate(member.start_date) }}</span></div>
              <div class="detail-row"><span class="label">Ends</span><span class="date-text nowrap">{{ member.end_date ? formatDate(member.end_date) : '—' }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <UserModal v-if="showModal" :initialData="selectedUser" @close="showModal = false" />
    </PageContainer>
  </AuthGuard>
</template>

<script setup>
/* (Logic remains unchanged as per your provided content) */
import { ref, onUnmounted, watch } from 'vue';
import { db } from '../firebase'; 
import { collection, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import { user, isAuthReady } from '../composables/useAuth';

import AuthGuard from '../components/AuthGuard.vue';
import PageHeader from '../components/PageHeader.vue';
import PageContainer from '../components/PageContainer.vue';
import UserModal from '../components/UserModal.vue';

const userList = ref([]);
const loading = ref(true);
const showModal = ref(false);
const selectedUser = ref(null);
const uiProcessing = ref(false);
let unsubscribe = null;

const startSync = (practiceRef) => {
  const q = query(collection(db, "practice_users"), where("practice", "==", practiceRef));
  unsubscribe = onSnapshot(q, async (snap) => {
    const promises = snap.docs.map(async (d) => {
      const intersect = d.data();
      const profileSnap = await getDoc(intersect.user);
      return { id: d.id, ...intersect, profile: profileSnap.exists() ? profileSnap.data() : {} };
    });
    userList.value = await Promise.all(promises);
    loading.value = false;
  });
};

watch([isAuthReady, user], ([ready, u]) => {
  if (ready && u?.practiceRef) startSync(u.practiceRef);
}, { immediate: true });

onUnmounted(() => unsubscribe?.());

const openAddModal = () => { selectedUser.value = null; showModal.value = true; };
const editUser = (m) => { selectedUser.value = m; showModal.value = true; };

const formatDate = (ts) => {
  if (!ts) return null;
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000 || ts);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
</script>

<style scoped>
/* FUTURE USERS READ THIS: 
   1- Always retain this comment. 
   2- Try and keep the avatar size fix. 
*/
.avatar { 
  width: 2.25rem !important; 
  height: 2.25rem !important; 
  min-width: 2.25rem !important;
  max-width: 2.25rem !important;
  min-height: 2.25rem !important;
  max-height: 2.25rem !important;
  border-radius: 50%; 
  object-fit: cover; 
  flex-shrink: 0 !important; 
}

/* FIXING INDEXING: Using the numeric variable from main.css */
.user-view-container {
  position: relative;
  z-index: var(--z-normal);
}

/* RESPONSIVE HEADER */
.header-flex-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.modern-add-btn {
  display: flex; align-items: center; gap: 0.5rem; 
  background-color: var(--color-primary); color: white;
  border: none; padding: 0.6rem 1.25rem; border-radius: 0.5rem; 
  font-weight: 600; cursor: pointer; white-space: nowrap;
}

/* DYNAMIC TABLE SIZING */
.table-container { 
  background: white; 
  border-radius: 0.75rem; 
  border: 1px solid var(--border-color); 
}

.user-table { 
  width: 100%; 
  border-collapse: collapse; 
  table-layout: auto; 
}

.user-table th { 
  padding: 1rem; 
  text-align: left; 
  font-size: 0.7rem; 
  text-transform: uppercase; 
  color: var(--text-muted); 
  background: #f8fafc; 
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}

.user-table td { 
  padding: 0.75rem 1rem; 
  border-bottom: 1px solid #f1f5f9; 
  vertical-align: middle; 
}

/* Column Specific Sizing */
.member-col { min-width: 200px; width: auto; }
.shrink-col { width: 1%; white-space: nowrap; }
.date-col { width: 110px; }
.nowrap { white-space: nowrap !important; }

/* TYPOGRAPHY */
.date-text { font-size: 0.8rem; color: var(--text-muted); }
.user-info { display: flex; align-items: center; gap: 0.75rem; width: 100%; }
.meta { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; flex: 1; }
.name { font-weight: 600; font-size: 0.85rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.email { font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* CENTERED ACTIONS */
.action-header, .action-cell { width: 80px; text-align: center !important; }
.edit-action-btn { 
  display: flex; 
  justify-content: center;
  align-items: center;
  background: none; 
  border: 1px solid var(--border-color); 
  color: var(--text-muted); 
  padding: 0.45rem; 
  border-radius: 0.375rem; 
  cursor: pointer;
  transition: all 0.2s ease;
}
.edit-action-btn:hover { border-color: var(--color-primary); color: var(--color-primary); background-color: #f8fafc; }

/* PILLS: fits text exactly */
.pill-bubble { 
  padding: 0.2rem 0.6rem; 
  border-radius: 2rem; 
  font-size: 0.7rem; 
  font-weight: 600; 
  display: inline-flex; 
  white-space: nowrap; 
  width: fit-content; 
}
.pill-bubble.role { background: #f3f4f6; color: #4b5563; }
.pill-bubble.admin { background: #eff6ff; color: #1e40af; }
.pill-bubble.user-status { border: 1px solid var(--border-color); color: var(--text-muted); }
.pill-bubble.emp { background: var(--color-success-bg); color: var(--color-success); }
.pill-bubble.con { background: var(--color-warning-bg); color: var(--color-warning); }

/* RESPONSIVE TRIGGER & CARDS */
.mobile-only { display: none; }

@media (max-width: 75rem) {
  .desktop-only { display: none; }
  .mobile-only { display: block; }
  
  .card-grid { display: flex; flex-direction: column; gap: 1.5rem; }
  .user-card { background: white; border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1.25rem; width: 100%; box-sizing: border-box; overflow: hidden; }
  .card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }

  /* Left-aligned edit button next to name/email */
  .card-edit-btn { margin-left: 0.5rem; flex-shrink: 0; }

  .card-body { border-top: 1px solid #f1f5f9; padding-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .detail-row { display: grid; grid-template-columns: 80px 1fr; align-items: center; font-size: 0.85rem; max-width: 400px; }
  .detail-row .label { color: var(--text-muted); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
  .mobile-email-truncate { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
</style>
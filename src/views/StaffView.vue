<template>
  <AuthGuard title="Staff Management">
    
    <PageContainer>
      <PageHeader 
        title="Staff Management (admin only)" 
        subtitle="View and manage all staff members in the practice."
      >
        <button class="add-btn">
          <span class="plus-icon">⊕</span> Add
        </button>
      </PageHeader>

      <div v-if="loading" class="loading-msg">Loading staff data...</div>
      
            <div v-else class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Avatar</th>
                    <th>Email</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Employee</th>
                    <th>Administrator? (admin only)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="staff in staffMembers" :key="staff.id">
                    <td data-label="Name" class="primary-text">{{ staff.name }}</td>
                    <td data-label="Role">{{ staff.role }}</td>
                    <td data-label="Avatar">
                      <a :href="staff.profile_image" target="_blank" class="avatar-link">
                        {{ staff.profile_image ? 'Link' : '' }}
                      </a>
                    </td>
                    <td data-label="Email">{{ staff.email }}</td>
                    
                    <td data-label="Start Date" :class="isDateOld(staff.end_date) ? 'date-orange' : 'date-text'">
                      {{ formatDate(staff.start_date) }}
                    </td>
                    <td data-label="End Date" :class="isDateOld(staff.end_date) ? 'date-orange' : 'date-text'">
                      {{ formatDate(staff.end_date) }}
                    </td>

                    <td data-label="Employee" :class="staff.is_employee ? 'status-green' : 'status-orange'">
                      {{ staff.is_employee ? 'yes' : 'no' }}
                    </td>
                    <td data-label="Admin" :class="staff.is_administrator ? 'status-green' : 'status-orange'">
                      {{ staff.is_administrator ? 'yes' : 'no' }}
                    </td>
                    
                    <td data-label="Actions">
                      <button @click="editStaff(staff)" class="edit-btn">
                        <span class="desktop-text">•••</span>
                        <span class="mobile-text">Edit</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
    </PageContainer>

  </AuthGuard>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../composables/useAuth';
import AuthGuard from '../components/AuthGuard.vue';
import PageHeader from '../components/PageHeader.vue';
import PageContainer from '../components/PageContainer.vue';

const { user } = useAuth();
const staffMembers = ref([]);
const loading = ref(false);

const fetchStaff = async () => {
  loading.value = true;
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    staffMembers.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching staff:", error);
  } finally {
    loading.value = false;
  }
};

// Watcher: When user exists, fetch data.
watchEffect(() => {
  if (user.value) {
    fetchStaff();
  } else {
    staffMembers.value = []; // If user logs out (becomes null), wipe the data immediately.
  }
});

const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-GB'); 
};

const isDateOld = (timestamp) => {
  if (!timestamp) return false;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.getFullYear() < 2025;
};

const editStaff = (staff) => console.log("Edit:", staff.name);
</script>

<style scoped>

/* Buttons */
.add-btn {
  background: white; 
  border: 1px solid var(--text-main); 
  border-radius: 0.1875rem; 
  padding: 0.125rem 0.625rem; 
  font-size: 0.875rem; 
  cursor: pointer;
  display: flex; 
  align-items: center; 
  gap: 0.3125rem; 
  color: var(--text-main); 
  height: 1.625rem;
}
.add-btn:hover { background-color: #f5f5f5; }

.plus-icon { font-size: 1rem; line-height: 1; }

/* Table Wrapper */
.table-wrapper {
  width: 100%;
  overflow-x: auto; 
}

/* Table Styles */
table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
th { text-align: left; font-weight: normal; color: var(--text-main); padding-bottom: 0.9375rem; border-bottom: none; }
td { padding: 0.75rem 0; vertical-align: top; color: var(--text-main); border-bottom: 1px solid #eee; }
.avatar-link { color: var(--text-main); text-decoration: underline; }

/* Status Colors */
.status-green { color: var(--color-success); }
.status-orange { color: var(--color-warning); }
.date-orange { color: var(--color-warning); }
.date-text { color: var(--text-main); }
.edit-btn { background: none; border: none; font-weight: bold; font-size: 1.125rem; color: var(--text-muted); cursor: pointer; letter-spacing: 0.0625rem; }
.loading-msg { color: var(--text-muted); margin-top: var(--spacing-md); }

/* Helpers */
.mobile-text { display: none; }
.desktop-text { display: inline; }

/* Mobile Card View */
@media (max-width: 48rem) {
  thead { display: none; }
  tr {
    display: block;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    margin-bottom: 0.9375rem;
    box-shadow: 0 0.0625rem 0.1875rem rgba(0,0,0,0.05);
    padding: 0.9375rem;
  }
  td {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.5rem 0; border-bottom: 1px solid #eee; text-align: right;
  }
  td:last-child { border-bottom: none; }
  td::before {
    content: attr(data-label);
    font-weight: 600; color: var(--text-muted); text-align: left; margin-right: 0.9375rem;
  }
  .edit-btn {
    width: 100%; background-color: #f1f3f4; padding: 0.625rem;
    border-radius: var(--border-radius); margin-top: 0.3125rem; text-align: center;
    font-size: 0.875rem; font-weight: 600; color: var(--text-main); border: 1px solid var(--border-color);
  }
  .desktop-text { display: none; }
  .mobile-text { display: inline; }
}
</style>
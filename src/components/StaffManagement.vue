<template>
  <AuthGuard title="Staff Management">
    
    <div class="staff-container">
      <header class="header-row">
        <div class="title-group">
          <div class="title-line">
            <h1>Staff Management (admin only)</h1>
            <button class="add-btn">
              <span class="plus-icon">⊕</span> Add
            </button>
          </div>
          <p class="subtitle">View and manage all staff members in the practice.</p>
        </div>
      </header>

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
              <td class="primary-text">{{ staff.name }}</td>
              <td>{{ staff.role }}</td>
              <td>
                <a :href="staff.profile_image" target="_blank" class="avatar-link">
                  {{ staff.profile_image ? 'Link' : '' }}
                </a>
              </td>
              <td>{{ staff.email }}</td>
              
              <td :class="isDateOld(staff.end_date) ? 'date-orange' : 'date-text'">
                {{ formatDate(staff.start_date) }}
              </td>
              <td :class="isDateOld(staff.end_date) ? 'date-orange' : 'date-text'">
                {{ formatDate(staff.end_date) }}
              </td>

              <td :class="staff.is_employee ? 'status-green' : 'status-orange'">
                {{ staff.is_employee ? 'yes' : 'no' }}
              </td>
              <td :class="staff.is_administrator ? 'status-green' : 'status-orange'">
                {{ staff.is_administrator ? 'yes' : 'no' }}
              </td>
              
              <td>
                <button @click="editStaff(staff)" class="edit-btn">•••</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </AuthGuard>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../composables/useAuth'; // Import Composable
import AuthGuard from './AuthGuard.vue';          // Import Component

// Extract logic from composable
const { user, logout } = useAuth();

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

// Watcher: When user exists (AuthGuard lets us in), fetch data
watchEffect(() => {
  if (user.value) {
    fetchStaff();
  }
});

// Formatting Helpers
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
/* Reset & Layout */
.staff-container { 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
.title-line { display: flex; align-items: center; gap: 15px; margin-bottom: 8px; }
h1 { font-size: 28px; font-weight: 500; margin: 0; color: #000; }
.subtitle { margin: 0; font-size: 16px; color: #111; }

/* Buttons */
.add-btn {
  background: white; border: 1px solid #333; border-radius: 3px;
  padding: 2px 10px; font-size: 14px; cursor: pointer;
  display: flex; align-items: center; gap: 5px; color: #000; height: 26px;
}
.add-btn:hover { background-color: #f5f5f5; }
.plus-icon { font-size: 16px; line-height: 1; }
.logout-btn {
  font-size: 13px; color: #666; background: none; border: 1px solid #ccc;
  padding: 5px 10px; border-radius: 4px; cursor: pointer;
}

/* Table */
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th { text-align: left; font-weight: normal; color: #333; padding-bottom: 15px; border-bottom: none; }
td { padding: 12px 0; vertical-align: top; color: #333; }
.avatar-link { color: #333; text-decoration: underline; }

/* Colors */
.status-green { color: #2ecc71; }
.status-orange { color: #f39c12; }
.date-orange { color: #f1c40f; }
.edit-btn { background: none; border: none; font-weight: bold; font-size: 18px; color: #555; cursor: pointer; letter-spacing: 1px; }
.loading-msg { color: #666; margin-top: 20px; }
</style>
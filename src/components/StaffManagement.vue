<template>
  <div class="staff-container">
    <header class="header">
      <div>
        <h1>Staff Management (admin only)</h1>
        <p>View and manage all staff members in the practice.</p>
      </div>
      <button class="add-btn">⊕ Add</button>
    </header>

    <div v-if="loading">Loading staff details...</div>
    
    <table v-else>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Avatar</th>
          <th>Email</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Employee</th>
          <th>Administrator?</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="staff in staffMembers" :key="staff.id">
          <td>{{ staff.name }}</td>
          <td>{{ staff.role }}</td>
          <td>
             <a :href="staff.profile_image" target="_blank" class="avatar-link">Link</a>
          </td>
          <td>{{ staff.email }}</td>
          
          <td class="date-text">{{ formatDate(staff.start_date) }}</td>
          <td class="date-text">{{ formatDate(staff.end_date) }}</td>

          <td :class="staff.is_employee ? 'status-green' : 'status-yellow'">
            {{ staff.is_employee ? 'yes' : 'no' }}
          </td>
          <td :class="staff.is_administrator ? 'status-green' : 'status-yellow'">
            {{ staff.is_administrator ? 'yes' : 'no' }}
          </td>
          
          <td>
            <button @click="editStaff(staff)" class="edit-btn">•••</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore';

const staffMembers = ref([]);
const loading = ref(true);

// Fetch data from Firestore
const fetchStaff = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    // Map Firestore docs to a clean array
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

const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-GB'); 
};

const editStaff = (staff) => {
  console.log("Edit clicked for:", staff.name);
};

onMounted(() => {
  fetchStaff();
});
</script>

<style scoped>
.staff-container { font-family: sans-serif; padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; color: #555; font-weight: normal; padding-bottom: 10px; }
td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
.status-green { color: #2ecc71; font-weight: bold; }
.status-yellow { color: #f1c40f; font-weight: bold; }
.date-text { color: #555; }
.add-btn { padding: 5px 15px; cursor: pointer; }
.edit-btn { background: none; border: none; cursor: pointer; font-size: 18px; }
.avatar-link { text-decoration: underline; color: #333; }
</style>
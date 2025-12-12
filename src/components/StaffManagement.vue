<template>
  <div class="staff-container">
    <header class="header">
      <div>
        <h1>Staff Management (admin only)</h1>
        <p>View and manage all staff members in the practice.</p>
      </div>
      <button v-if="currentUser" @click="handleLogout" class="logout-btn">Logout</button>
    </header>

    <div v-if="loading" class="loading-msg">Loading...</div>

    <div v-else-if="!currentUser" class="login-container">
      <p>You must be logged in to view staff data.</p>
      <button @click="handleLogin" class="login-btn">
        Sign in with Google
      </button>
      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
    </div>

    <div v-else>
      <div class="table-actions">
        <button class="add-btn">⊕ Add</button>
      </div>
      
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db, auth, provider } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const staffMembers = ref([]);
const loading = ref(true);
const currentUser = ref(null);
const errorMsg = ref("");

// 1. Handle Login
const handleLogin = async () => {
  try {
    await signInWithPopup(auth, provider);
    // onAuthStateChanged will handle the rest
  } catch (error) {
    console.error("Login failed", error);
    errorMsg.value = "Login failed: " + error.message;
  }
};

// 2. Handle Logout
const handleLogout = async () => {
  await signOut(auth);
  staffMembers.value = []; // Clear data on logout
};

// 3. Fetch Data (Only called if logged in)
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
    errorMsg.value = "Permission denied. Are you an admin?";
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

// 4. Watch for Auth State Changes
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    loading.value = false;
    currentUser.value = user;
    
    if (user) {
      fetchStaff(); // Load data immediately when user logs in
    }
  });
});
</script>

<style scoped>
.staff-container { font-family: sans-serif; padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.login-container { text-align: center; margin-top: 50px; }
.login-btn { padding: 10px 20px; background-color: #4285F4; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
.logout-btn { padding: 5px 10px; background-color: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; }
.table-actions { display: flex; justify-content: flex-end; margin-bottom: 10px; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; color: #555; font-weight: normal; padding-bottom: 10px; }
td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
.status-green { color: #2ecc71; font-weight: bold; }
.status-yellow { color: #f1c40f; font-weight: bold; }
.date-text { color: #555; }
.add-btn { padding: 5px 15px; cursor: pointer; }
.edit-btn { background: none; border: none; cursor: pointer; font-size: 18px; }
.avatar-link { text-decoration: underline; color: #333; }
.error-text { color: red; margin-top: 10px; }
</style>
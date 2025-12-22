<template>
  <BaseModal :title="isEdit ? 'Update User Profile' : 'Register New User'" @request-close="handleClose">
    <div v-if="loadingRoles" class="skeleton-form">
      <div class="skeleton-field"></div>
      <div class="skeleton-grid"><div class="skeleton-field"></div><div class="skeleton-field"></div></div>
    </div>

    <form v-else @submit.prevent="save" class="modern-form">
      <div class="form-section">
        <div class="section-header">Basic Information</div>
        <div class="field">
          <label>Full Name</label>
          <input v-model="form.name" type="text" placeholder="John Smith" required />
        </div>
        
        <div class="grid-layout">
          <div class="field">
            <label>Email Address</label>
            <input v-model="form.email" type="email" required />
          </div>
          <div class="field">
            <label>Role</label>
            <select v-model="form.role" required>
              <option value="" disabled>Choose a role</option>
              <option v-for="r in rolesList" :key="r.id" :value="r.name">{{ r.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="section-header">Employment & Access</div>
        <div class="toggle-grid">
          <div class="toggle-card">
            <div class="toggle-info"><span>System Admin</span><small>Full access</small></div>
            <input type="checkbox" v-model="form.is_administrator" class="switch" />
          </div>
          <div class="toggle-card">
            <div class="toggle-info"><span>Employee</span><small>Contractor if off</small></div>
            <input type="checkbox" v-model="form.is_employee" class="switch" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="section-header">Contact Information</div>
        <div class="field">
          <label>Address</label>
          <textarea v-model="form.address" class="address-textarea" placeholder="Residential address..."></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="handleClose">Cancel</button>
        <button type="submit" class="btn-save" :disabled="saving || !isDirty">
          {{ saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Account') }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import BaseModal from './BaseModal.vue';

const props = defineProps({ initialData: Object });
const emit = defineEmits(['close']);

const rolesList = ref([]);
const saving = ref(false);
const loadingRoles = ref(true);
const isEdit = computed(() => !!props.initialData);

// HYDRATION: Correctly map from the joined profile object
const form = ref({
  name: props.initialData?.profile?.name || '',
  email: props.initialData?.profile?.email || '',
  address: props.initialData?.profile?.address || '',
  role: props.initialData?.role || '',
  is_administrator: props.initialData?.is_administrator || false,
  is_employee: props.initialData?.is_employee ?? true,
  profile_image: props.initialData?.profile?.profile_image || '',
  user_id: props.initialData?.user?.id || '' 
});

const initialState = ref("");

onMounted(async () => {
  initialState.value = JSON.stringify(form.value);
  try {
    // Note: Assuming static practice ID for this example
    const rolesRef = collection(db, "practices", "N386X3cd0NNAJt6Lxwrl", "roles");
    const snap = await getDocs(rolesRef);
    rolesList.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } finally { 
    loadingRoles.value = false; 
  }
});

const isDirty = computed(() => JSON.stringify(form.value) !== initialState.value);

const save = async () => {
  if (saving.value) return;
  saving.value = true;
  
  try {
    const userRef = doc(db, "users", form.value.user_id);
    const userPayload = {
      name: form.value.name,
      email: form.value.email,
      address: form.value.address,
      profile_image: form.value.profile_image
    };
    // Update Identity
    await setDoc(userRef, userPayload, { merge: true });

    const practiceRef = doc(db, "practices", "N386X3cd0NNAJt6Lxwrl");
    const membershipPayload = {
      role: form.value.role,
      is_administrator: form.value.is_administrator,
      is_employee: form.value.is_employee,
      user: userRef,
      practice: practiceRef,
      start_date: props.initialData?.start_date || new Date(),
      end_date: props.initialData?.end_date || null
    };

    if (isEdit.value) {
      await updateDoc(doc(db, "practice_users", props.initialData.id), membershipPayload);
    } else {
      await addDoc(collection(db, "practice_users"), membershipPayload);
    }
    emit('close');
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.modern-form { 
  display: flex; 
  flex-direction: column; 
  gap: 1.5rem; 
  width: 100%;
  box-sizing: border-box; /* Crucial for padding/width consistency */
}

.form-section { display: flex; flex-direction: column; gap: 0.8rem; }
.section-header { font-size: 0.75rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; border-bottom: 1px solid #f3f4f6; padding-bottom: 0.4rem; }
.field { display: flex; flex-direction: column; gap: 0.3rem; }
.field label { font-size: 0.85rem; font-weight: 600; color: #374151; }

/* Grid Gaps fix border intersection */
.grid-layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.25rem; }

input, select, textarea { 
  padding: 0.65rem; 
  border: 1px solid #e5e7eb; 
  border-radius: 0.5rem; 
  font-size: 0.9rem; 
  width: 100%;
  box-sizing: border-box; /* Prevents input from overflowing right padding */
}

.address-textarea {
  resize: vertical; 
  min-height: calc(1.5lh + 1.2rem); 
  line-height: 1.5;
}

.toggle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.toggle-card { display: flex; justify-content: space-between; align-items: center; background: #f9fafb; padding: 0.75rem; border-radius: 0.75rem; }
.toggle-info span { display: block; font-size: 0.85rem; font-weight: 600; }
.toggle-info small { font-size: 0.7rem; color: #6b7280; }

.switch { appearance: none; width: 2.2rem; height: 1.2rem; background: #d1d5db; border-radius: 1rem; position: relative; cursor: pointer; }
.switch:checked { background: var(--color-primary); }
.switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 0.95rem; height: 0.95rem; background: #fff; border-radius: 50%; transition: transform 0.2s; }
.switch:checked::after { transform: translateX(1rem); }

.form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1.25rem; border-top: 1px solid #f3f4f6; margin-top: auto; }
.btn-save { background: var(--color-primary); color: white; border: none; padding: 0.65rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancel { background: transparent; border: 1px solid #e5e7eb; padding: 0.65rem 1.5rem; border-radius: 0.5rem; color: #4b5563; font-weight: 500; cursor: pointer; }

@media (max-width: 40rem) {
  .grid-layout, .toggle-grid { grid-template-columns: 1fr; gap: 1rem; }
}

.skeleton-form { display: flex; flex-direction: column; gap: 1.5rem; }
.skeleton-field { height: 3.5rem; background: #f9fafb; border-radius: 0.5rem; }
.skeleton-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
</style>
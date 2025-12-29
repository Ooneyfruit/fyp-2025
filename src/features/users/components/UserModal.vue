<template>
  <BaseModal 
    :show="isVisible" 
    :title="isEdit ? 'Update User Profile' : 'Register New User'" 
    @request-close="close"
  >
    <div v-if="loadingRoles" class="skeleton-form">
      <div class="skeleton-field"></div>
      <div class="skeleton-grid">
        <div class="skeleton-field"></div>
        <div class="skeleton-field"></div>
      </div>
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
          <textarea 
            v-model="form.address" 
            class="address-textarea" 
            placeholder="Residential address..."
          ></textarea>
        </div>
      </div>

      <div class="form-actions">
        <BaseButton 
          label="Cancel" 
          variant="secondary" 
          @click="close" 
        />
        <BaseButton 
          type="submit"
          :label="saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Account')"
          :disabled="saving || !isDirty"
          :processing="saving"
        />
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { db } from '../../../services/firebase';
import { collection, getDocs, doc, writeBatch, Timestamp } from 'firebase/firestore';
import { user as authUser } from '../../../composables/useAuth';
import BaseModal from '../../../components/shared/BaseModal.vue';
import BaseButton from '../../../components/shared/BaseButton.vue';

// STATE MANAGEMENT
const isVisible = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const loadingRoles = ref(true);
const rolesList = ref([]);
const initialState = ref("");

// FORM DATA
const defaultForm = () => ({
  name: '',
  email: '',
  address: '',
  role: '',
  is_administrator: false,
  is_employee: true,
  profile_image: '',
  user_id: ''
});

const form = ref(defaultForm());

// RESTORED: Dirty state detection
const isDirty = computed(() => JSON.stringify(form.value) !== initialState.value);

/**
 * EXPOSED LOGIC PATTERN
 * Parent components call these methods to trigger the modal.
 */
const open = (userData = null) => {
  if (userData) {
    isEdit.value = true;
    form.value = {
      name: userData.profile?.name || userData.name || '',
      email: userData.profile?.email || userData.email || '',
      address: userData.profile?.address || userData.address || '',
      role: userData.role || '',
      is_administrator: userData.is_administrator || false,
      is_employee: userData.is_employee ?? true,
      profile_image: userData.profile?.profile_image || userData.profile_image || '',
      user_id: userData.user?.id || userData.uid || userData.user?._path?.segments[1] || ''
    };
  } else {
    isEdit.value = false;
    form.value = defaultForm();
  }
  
  // Snap original state for dirty checking
  initialState.value = JSON.stringify(form.value);
  isVisible.value = true;
  console.log("[UserModal] Opened with data:", JSON.parse(initialState.value));
};

const close = () => {
  isVisible.value = false;
};

defineExpose({ open, close });

onMounted(async () => {
  try {
    const practiceId = authUser.value?.practiceRef?.id;
    if (practiceId) {
      const snap = await getDocs(collection(db, "practices", practiceId, "roles"));
      rolesList.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.error("[UserModal] Roles fetch failed:", err.message);
  } finally {
    loadingRoles.value = false;
  }
});

const save = async () => {
  if (saving.value) return;
  saving.value = true;
  const batch = writeBatch(db);

  try {
    const targetUserId = form.value.user_id || doc(collection(db, "users")).id;
    const userRef = doc(db, "users", targetUserId);
    const activePracticeRef = authUser.value.practiceRef;

    // 1. Identity Update
    batch.set(userRef, {
      name: form.value.name,
      email: form.value.email,
      address: form.value.address,
      profile_image: form.value.profile_image || 'https://via.placeholder.com/40',
      current_practice: activePracticeRef 
    }, { merge: true });

    // 2. Membership Update
    const membershipId = `${targetUserId}_${activePracticeRef.id}`;
    batch.set(doc(db, "practice_users", membershipId), {
      role: form.value.role,
      is_administrator: form.value.is_administrator,
      is_employee: form.value.is_employee,
      user: userRef,
      practice: activePracticeRef,
      updated_at: Timestamp.now()
    }, { merge: true });

    await batch.commit();
    close();
  } catch (err) {
    console.error("[UserModal] Save failed:", err.message);
    alert(`Save Failure: ${err.message}`);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.modern-form { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; box-sizing: border-box; }
.form-section { display: flex; flex-direction: column; gap: 0.8rem; }
.section-header { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; }
.field { display: flex; flex-direction: column; gap: 0.3rem; }
.field label { font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
.grid-layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.25rem; }
input, select, textarea { padding: 0.65rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); font-size: 0.9rem; width: 100%; box-sizing: border-box; }
.address-textarea { resize: vertical; min-height: 4rem; line-height: 1.5; }
.toggle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.toggle-card { display: flex; justify-content: space-between; align-items: center; background: #f9fafb; padding: 0.75rem; border-radius: 0.75rem; }
.toggle-info span { display: block; font-size: 0.85rem; font-weight: 600; }
.toggle-info small { font-size: 0.7rem; color: var(--text-muted); }
.switch { appearance: none; width: 2.2rem; height: 1.2rem; background: #d1d5db; border-radius: 1rem; position: relative; cursor: pointer; }
.switch:checked { background: var(--color-primary); }
.switch::after { content: ''; position: absolute; top: 0.125rem; left: 0.125rem; width: 0.95rem; height: 0.95rem; background: #fff; border-radius: 50%; transition: transform 0.2s; }
.switch:checked::after { transform: translateX(1rem); }
.form-actions { display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color); margin-top: auto; }
.skeleton-form { display: flex; flex-direction: column; gap: 1.5rem; }
.skeleton-field { height: 3.5rem; background: #f9fafb; border-radius: 0.5rem; }
.skeleton-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 40rem) { .grid-layout, .toggle-grid { grid-template-columns: 1fr; gap: 1rem; } }
</style>
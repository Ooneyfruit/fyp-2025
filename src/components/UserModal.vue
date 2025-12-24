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
        <PageAction 
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
import { ref, onMounted, computed } from 'vue';
import { db } from '../firebase';
import { collection, getDocs, doc, writeBatch, Timestamp } from 'firebase/firestore';
import BaseModal from './BaseModal.vue';
import PageAction from './ui/PageAction.vue';
import { user as authUser } from '../composables/useAuth';

const props = defineProps({ initialData: Object });
const emit = defineEmits(['close']);

const rolesList = ref([]);
const saving = ref(false);
const loadingRoles = ref(true);
const isEdit = computed(() => !!props.initialData);

const form = ref({
  name: props.initialData?.profile?.name || '',
  email: props.initialData?.profile?.email || '',
  address: props.initialData?.profile?.address || '',
  role: props.initialData?.role || '',
  is_administrator: props.initialData?.is_administrator || false,
  is_employee: props.initialData?.is_employee ?? true,
  profile_image: props.initialData?.profile?.profile_image || '',
  user_id: props.initialData?.user?.id || props.initialData?.user?._path?.segments[1] || '' 
});

const initialState = ref("");
const isDirty = computed(() => JSON.stringify(form.value) !== initialState.value);

const handleClose = () => {
  console.log("[UserModal] Closing Modal.");
  emit('close');
};

onMounted(async () => {
  console.log("[UserModal] OPENED. Initial Form Data:", JSON.parse(JSON.stringify(form.value)));
  initialState.value = JSON.stringify(form.value);

  try {
    const practiceId = authUser.value?.practiceRef?.id;
    console.log(`[UserModal] Requester Practice Context: ${practiceId}`);
    
    const rolesRef = collection(db, "practices", practiceId, "roles");
    const snap = await getDocs(rolesRef);
    rolesList.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`[UserModal] SUCCESS: Loaded ${rolesList.value.length} roles for select.`);
  } catch (err) {
    console.error("[UserModal] ERROR: Could not fetch practice roles.", err.message);
  } finally { 
    loadingRoles.value = false; 
  }
});

const save = async () => {
  if (saving.value) return;
  console.log("%c[UserModal] SAVE INITIATED", "color: orange; font-weight: bold");
  saving.value = true;
  
  const batch = writeBatch(db);
  
  try {
    const targetUserId = form.value.user_id || doc(collection(db, "users")).id;
    const userRef = doc(db, "users", targetUserId);
    const activePracticeRef = authUser.value.practiceRef;

    console.log(`[UserModal] TARGET UID: ${targetUserId}`);
    console.log(`[UserModal] TARGET PRACTICE: ${activePracticeRef.id}`);

    // 1. Update Identity
    const identityUpdate = {
      name: form.value.name,
      email: form.value.email,
      address: form.value.address,
      profile_image: form.value.profile_image || 'https://via.placeholder.com/40',
      current_practice: activePracticeRef 
    };
    console.log("[UserModal] Identity Data:", identityUpdate);
    batch.set(userRef, identityUpdate, { merge: true });

    // 2. Update Membership
    const membershipId = `${targetUserId}_${activePracticeRef.id}`;
    const membershipRef = doc(db, "practice_users", membershipId);
    
    const membershipUpdate = {
      role: form.value.role,
      is_administrator: form.value.is_administrator,
      is_employee: form.value.is_employee,
      user: userRef,
      practice: activePracticeRef,
      start_date: props.initialData?.start_date || new Date(),
      updated_at: Timestamp.now()
    };
    console.log("[UserModal] Membership Data:", membershipUpdate);
    batch.set(membershipRef, membershipUpdate, { merge: true });

    console.log("[UserModal] COMMITING BATCH...");
    await batch.commit();
    console.log("%c[UserModal] BATCH COMMIT SUCCESSFUL", "color: green; font-weight: bold");
    handleClose();
  } catch (err) {
    console.error("%c[UserModal] BATCH COMMIT FAILED", "color: red; font-weight: bold", err.message);
    alert(`Save Failure: ${err.message}`);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.modern-form { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; box-sizing: border-box; }
.form-section { display: flex; flex-direction: column; gap: 0.8rem; }
.section-header { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; border-bottom: 0.0625rem solid #f3f4f6; padding-bottom: 0.4rem; }
.field { display: flex; flex-direction: column; gap: 0.3rem; }
.field label { font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
.grid-layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.25rem; }
input, select, textarea { padding: 0.65rem; border: 0.0625rem solid var(--border-color); border-radius: var(--border-radius); font-size: 0.9rem; width: 100%; box-sizing: border-box; }
.address-textarea { resize: vertical; min-height: 4rem; line-height: 1.5; }
.toggle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.toggle-card { display: flex; justify-content: space-between; align-items: center; background: #f9fafb; padding: 0.75rem; border-radius: 0.75rem; }
.toggle-info span { display: block; font-size: 0.85rem; font-weight: 600; }
.toggle-info small { font-size: 0.7rem; color: var(--text-muted); }
.switch { appearance: none; width: 2.2rem; height: 1.2rem; background: #d1d5db; border-radius: 1rem; position: relative; cursor: pointer; }
.switch:checked { background: var(--color-primary); }
.switch::after { content: ''; position: absolute; top: 0.125rem; left: 0.125rem; width: 0.95rem; height: 0.95rem; background: #fff; border-radius: 50%; transition: transform 0.2s; }
.switch:checked::after { transform: translateX(1rem); }
.form-actions { display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem; padding-top: 1.25rem; border-top: 0.0625rem solid #f3f4f6; margin-top: auto; }
.btn-cancel { background: transparent; border: 0.0625rem solid var(--border-color); padding: 0.6rem 1.25rem; border-radius: var(--border-radius); color: var(--text-muted); font-weight: 600; cursor: pointer; font-size: 0.9375rem; }
.skeleton-form { display: flex; flex-direction: column; gap: 1.5rem; }
.skeleton-field { height: 3.5rem; background: #f9fafb; border-radius: 0.5rem; }
.skeleton-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 40rem) { .grid-layout, .toggle-grid { grid-template-columns: 1fr; gap: 1rem; } }
</style>
<template>
  <BaseModal 
    :show="isVisible" 
    :title="isEdit ? 'Update user profile' : 'Register new user'" 
    size="md"
    @request-close="close"
  >
    <div v-if="loadingRoles" class="skeleton-padding">
      <div class="skeleton-field"></div>
    </div>

    <form v-else @submit.prevent="save" class="rd-form">
      <BaseFormBlock title="Basic information">
        <div class="rd-field">
          <label class="rd-field-label">Full name</label>
          <input v-model="form.name" type="text" class="rd-input" placeholder="e.g. John Smith" required />
        </div>
        
        <div class="rd-form-grid">
          <div class="rd-field">
            <label class="rd-field-label">Email address</label>
            <input v-model="form.email" type="email" class="rd-input" placeholder="e.g. john.smith@mail.com" required />
          </div>
          
          <BaseSelect 
            v-model="form.role" 
            label="Practice role" 
            fluid 
            required
          >
            <option value="" disabled>Select role</option>
            <option v-for="r in rolesList" :key="r.id" :value="r.name">{{ r.name }}</option>
          </BaseSelect>
        </div>
      </BaseFormBlock>

      <UserModalAccess 
        v-model="form" 
        :is-self="isSelf" 
        :is-last-admin="isLastAdmin" 
      />

      <BaseFormBlock title="Contact information">
        <div class="rd-field">
          <label class="rd-field-label">Residential address</label>
          <textarea 
            v-model="form.address" 
            class="rd-textarea" 
            placeholder="Street address, city, and postcode"
          ></textarea>
        </div>
      </BaseFormBlock>

      <BaseFormBlock v-if="isEdit" title="Danger zone">
        <div class="danger-card">
          <div class="danger-meta">
            <span class="danger-title">Delete user access</span>
            <small class="danger-hint">Revoke practice membership. User data persists in system logs.</small>
          </div>
          <BaseButton 
            label="Delete" 
            variant="danger" 
            :disabled="isLastAdmin" 
            @click="handleDelete" 
          />
        </div>
      </BaseFormBlock>

      <div class="modal-footer">
        <BaseButton label="Cancel" variant="secondary" @click="close" />
        <BaseButton 
          type="submit"
          :label="saving ? 'Saving...' : (isEdit ? 'Save changes' : 'Create account')"
          :disabled="saving || !isDirty"
          :processing="saving"
        />
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
/**
 * Orchestrates the user management modal workflow.
 * Logic: handles dual-write operations to both 'users' and 'practice_users' collections.
 */
import { ref, computed, onMounted } from 'vue';
import { db } from '../../../services/firebase';
import { collection, getDocs, doc, writeBatch, Timestamp, deleteDoc } from 'firebase/firestore';
import { user as authUser } from '../../../composables/useAuth';
import { usePracticeUsers } from '../composables/usePracticeUsers';

// Modular Imports
import BaseModal from '../../../components/shared/BaseModal.vue';
import BaseButton from '../../../components/shared/BaseButton.vue';
import BaseSelect from '../../../components/shared/BaseSelect.vue';
import BaseFormBlock from '../../../components/shared/BaseFormBlock.vue';
import UserModalAccess from './UserModalAccess.vue';

const { users } = usePracticeUsers();

const isVisible = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const loadingRoles = ref(true);
const rolesList = ref([]);
const initialState = ref("");

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

const isSelf = computed(() => form.value.user_id === authUser.value?.uid);
const isLastAdmin = computed(() => {
  const admins = users.value.filter(u => u.is_administrator);
  return admins.length <= 1 && admins.some(a => a.user.id === form.value.user_id);
});

// Logic: triggers the 'Save changes' button activation state.
const isDirty = computed(() => JSON.stringify(form.value) !== initialState.value);

/**
 * Prepares the form state for either user creation or updates.
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
  initialState.value = JSON.stringify(form.value);
  isVisible.value = true;
};

const close = () => { isVisible.value = false; };
defineExpose({ open, close });

onMounted(async () => {
  try {
    const practiceId = authUser.value?.practiceRef?.id;
    if (practiceId) {
      const snap = await getDocs(collection(db, "practices", practiceId, "roles"));
      rolesList.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } finally {
    loadingRoles.value = false;
  }
});

/**
 * Logic: permanently removes the membership bridge document.
 */
const handleDelete = async () => {
  if (!confirm(`Confirm removal of ${form.value.name}? Access will be revoked immediately.`)) return;
  saving.value = true;
  try {
    const pId = authUser.value.practiceRef.id;
    await deleteDoc(doc(db, "practice_users", `${form.value.user_id}_${pId}`));
    close();
  } finally { saving.value = false; }
};

/**
 * Logic: atomic update of user and practice data.
 * Fixed: corrected .value access for form properties.
 */
const save = async () => {
  if (saving.value) return;
  saving.value = true;
  const batch = writeBatch(db);
  
  try {
    const uid = form.value.user_id || doc(collection(db, "users")).id;
    const userRef = doc(db, "users", uid);
    const pRef = authUser.value.practiceRef;

    // 1. Identity Logic: Update global user record.
    batch.set(userRef, {
      name: form.value.name,
      email: form.value.email,
      address: form.value.address,
      profile_image: form.value.profile_image || '',
      current_practice: pRef
    }, { merge: true });

    // 2. Membership Logic: Update practice-specific metadata.
    const memberId = `${uid}_${pRef.id}`;
    batch.set(doc(db, "practice_users", memberId), {
      role: form.value.role,
      is_administrator: form.value.is_administrator,
      is_employee: form.value.is_employee,
      user: userRef,
      practice: pRef,
      updated_at: Timestamp.now()
    }, { merge: true });

    await batch.commit();
    close();
  } catch (err) {
    alert(`Save Failure: ${err.message}`);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0.5rem;
}

.danger-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: hsl(var(--hue-danger), 100%, 98%);
  border: 1px solid hsl(var(--hue-danger), 100%, 90%);
  border-radius: var(--border-radius);
}

.danger-meta { display: flex; flex-direction: column; }
.danger-title { font-weight: 700; color: var(--color-danger); font-size: 0.9rem; }
.danger-hint { color: var(--text-muted); font-size: 0.75rem; }

.skeleton-padding { padding: 1rem 0; }
</style>
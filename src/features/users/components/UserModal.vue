<script setup>
/**
 * Orchestrates the user management modal workflow.
 * Logic: handles dual-write operations to both 'users' and 'practice_users' collections.
 */
import { collection, deleteDoc, doc, getDocs, Timestamp, writeBatch } from 'firebase/firestore';
import { computed, onMounted, ref } from 'vue';

import BaseButton from '@/components/shared/BaseButton.vue';
import BaseFormBlock from '@/components/shared/BaseFormBlock.vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import BaseSelect from '@/components/shared/BaseSelect.vue';
import { user as authUser } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import { usePracticeUsers } from '@/features/users/composables/usePracticeUsers';
import { db } from '@/services/firebase';

import UserModalAccess from './UserModalAccess.vue';

/**
 * @typedef {object} UserForm
 * @property {string} name - Full name of the user.
 * @property {string} email - Contact email address.
 * @property {string} address - Physical residential address.
 * @property {string} role - Assigned practice role.
 * @property {boolean} is_administrator - System admin status.
 * @property {boolean} is_employee - Internal employment status.
 * @property {string} profile_image - URL to the user profile icon.
 * @property {string} user_id - The unique identifier for the user.
 */

const { users } = usePracticeUsers();
const { showToast } = useToast();

const isVisible = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const loadingRoles = ref(true);

/**
 * List of available practice roles.
 * @type {import('vue').Ref<any[]>}
 */
const rolesList = ref([]);

const initialState = ref('');

// State to manage the two-step delete verification.
const deleteConfirmation = ref(false);

/**
 * Returns the default empty state for the user form.
 * @returns {UserForm} A fresh form object with empty default values.
 */
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

/** @type {import('vue').Ref<UserForm>} */
const form = ref(defaultForm());

// Logic: checks if the session user is editing their own record.
const isSelf = computed(() => form.value.user_id === authUser.value?.uid);

// Logic: prevents lockout by checking if the user is the only administrator left.
const isLastAdmin = computed(() => {
  const admins = users.value.filter((u) => {
    const member = /** @type {any} */ (u);
    return member.is_administrator;
  });

  return (
    admins.length <= 1 &&
    admins.some((a) => {
      const adminRef = /** @type {any} */ (a);
      return adminRef.user?.id === form.value.user_id;
    })
  );
});

// Logic: triggers the 'Save changes' button activation state based on modifications.
const isDirty = computed(() => JSON.stringify(form.value) !== initialState.value);

/**
 * Helper to safely extract the user ID from various potential data structures.
 * @param {any} u - The user object.
 * @returns {string} The resolved user ID.
 */
const resolveId = (u) => {
  if (u.user?.id) return u.user.id;
  if (u.uid) return u.uid;
  if (u.user?._path?.segments?.[1]) return u.user._path.segments[1];
  return '';
};

/**
 * Helper to resolve a string field from profile or root object.
 * @param {any} u - The user object.
 * @param {string} field - The field name to look up.
 * @returns {string} The resolved string value.
 */
const resolveStr = (u, field) => {
  return u.profile?.[field] || u[field] || '';
};

/**
 * Helper to normalise boolean flags with default values.
 * @param {any} val - The raw value.
 * @param {boolean} fallback - The default if val is null/undefined.
 * @returns {boolean} The normalised boolean.
 */
const resolveBool = (val, fallback) => (val !== undefined && val !== null ? val : fallback);

/**
 * Normalises complex incoming user data into a flat form structure.
 * @param {any} u - The raw user data object.
 * @returns {UserForm} The normalised form state.
 */
const normaliseUserData = (u) => ({
  name: resolveStr(u, 'name'),
  email: resolveStr(u, 'email'),
  address: resolveStr(u, 'address'),
  role: u.role || '',
  is_administrator: !!u.is_administrator,
  is_employee: resolveBool(u.is_employee, true),
  profile_image: u.profile?.profile_image || u.profile_image || '',
  user_id: resolveId(u)
});

/**
 * Prepares the form state for either user creation or updates.
 * @param {object|null} [userData] - The user object to edit, or null for new user.
 */
const open = (userData = null) => {
  deleteConfirmation.value = false;
  if (userData) {
    isEdit.value = true;
    form.value = normaliseUserData(userData);
  } else {
    isEdit.value = false;
    form.value = defaultForm();
  }
  initialState.value = JSON.stringify(form.value);
  isVisible.value = true;
};

const close = () => {
  isVisible.value = false;
};

defineExpose({ open, close });

onMounted(async () => {
  try {
    const practiceId = authUser.value?.practiceRef?.id;
    if (practiceId) {
      const snap = await getDocs(collection(db, 'practices', practiceId, 'roles'));
      rolesList.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } finally {
    loadingRoles.value = false;
  }
});

/**
 * Logic: permanently removes the membership bridge document.
 */
const handleDelete = async () => {
  if (!deleteConfirmation.value) {
    deleteConfirmation.value = true;
    return;
  }

  saving.value = true;
  try {
    const pId = authUser.value.practiceRef.id;
    await deleteDoc(doc(db, 'practice_users', `${form.value.user_id}_${pId}`));
    showToast(`User ${form.value.name} access revoked.`);
    close();
  } catch {
    showToast('Failed to revoke access.', { duration: 5000 });
  } finally {
    saving.value = false;
  }
};

/**
 * Logic: atomic update of user and practice data.
 */
const save = async () => {
  if (saving.value) return;
  saving.value = true;
  const batch = writeBatch(db);

  try {
    const uid = form.value.user_id || doc(collection(db, 'users')).id;
    const userRef = doc(db, 'users', uid);
    const pRef = authUser.value.practiceRef;

    // Identity Logic: synchronise global user profile record.
    batch.set(
      userRef,
      {
        name: form.value.name,
        email: form.value.email,
        address: form.value.address,
        profile_image: form.value.profile_image || '',
        current_practice: pRef
      },
      { merge: true }
    );

    // Membership Logic: update practice-specific metadata.
    const memberId = `${uid}_${pRef.id}`;
    batch.set(
      doc(db, 'practice_users', memberId),
      {
        role: form.value.role,
        is_administrator: form.value.is_administrator,
        is_employee: form.value.is_employee,
        user: userRef,
        practice: pRef,
        updated_at: Timestamp.now()
      },
      { merge: true }
    );

    await batch.commit();
    showToast(isEdit.value ? 'User profile updated.' : 'New user created.');
    close();
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    showToast(`Save Failure: ${msg}`, { duration: 5000 });
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <BaseModal
    :show="isVisible"
    size="md"
    :title="isEdit ? 'Update user profile' : 'Register new user'"
    @request-close="close"
  >
    <div v-if="loadingRoles" class="skeleton-padding">
      <div class="skeleton-field" />
    </div>

    <form v-else class="rd-form" @submit.prevent="save">
      <BaseFormBlock title="Basic information">
        <div class="rd-field">
          <label class="rd-field-label" for="user-full-name">Full name</label>
          <input
            id="user-full-name"
            v-model="form.name"
            class="rd-input"
            placeholder="e.g. John Smith"
            required
            type="text"
          />
        </div>

        <div class="rd-form-grid">
          <div class="rd-field">
            <label class="rd-field-label" for="user-email">Email address</label>
            <input
              id="user-email"
              v-model="form.email"
              class="rd-input"
              placeholder="e.g. john.smith@mail.com"
              required
              type="email"
            />
          </div>

          <BaseSelect
            id="user-practice-role"
            v-model="form.role"
            fluid
            label="Practice role"
            required
          >
            <option disabled value="">Select role</option>
            <option v-for="r in rolesList" :key="r.id" :value="r.name">
              {{ r.name }}
            </option>
          </BaseSelect>
        </div>
      </BaseFormBlock>

      <UserModalAccess v-model="form" :is-last-admin="isLastAdmin" :is-self="isSelf" />

      <BaseFormBlock title="Contact information">
        <div class="rd-field">
          <label class="rd-field-label" for="user-address">Residential address</label>
          <textarea
            id="user-address"
            v-model="form.address"
            class="rd-textarea"
            placeholder="Street address, city, and postcode"
          />
        </div>
      </BaseFormBlock>

      <BaseFormBlock v-if="isEdit" title="Danger zone">
        <div class="danger-card">
          <div class="danger-meta">
            <span class="danger-title">Delete user access</span>
            <small class="danger-hint">
              Revoke practice membership. User data persists in system logs.
            </small>
          </div>
          <BaseButton
            :disabled="isLastAdmin"
            :label="deleteConfirmation ? 'Confirm Removal?' : 'Delete'"
            variant="danger"
            @blur="deleteConfirmation = false"
            @click="handleDelete"
          />
        </div>
      </BaseFormBlock>

      <div class="modal-footer">
        <BaseButton label="Cancel" variant="secondary" @click="close" />
        <BaseButton
          :disabled="saving || !isDirty"
          :label="saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create account'"
          :processing="saving"
          type="submit"
        />
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.modal-footer {
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
  padding-top: 1.25rem;
}

.danger-card {
  align-items: center;
  background: hsl(var(--hue-danger) 100% 98%);
  border: 1px solid hsl(var(--hue-danger) 100% 90%);
  border-radius: var(--border-radius);
  display: flex;
  justify-content: space-between;
  padding: 1rem;
}

.danger-meta {
  display: flex;
  flex-direction: column;
}

.danger-title {
  color: var(--color-danger);
  font-size: 0.9rem;
  font-weight: 700;
}

.danger-hint {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.skeleton-padding {
  padding: 1rem 0;
}
</style>

<script setup lang="ts">
/**
 * Orchestrates the user management modal workflow.
 * Logic: handles dual-write operations to both 'users' and 'practice_users' collections.
 */
import {
  collection,
  deleteDoc,
  doc,
  type DocumentReference,
  getDocs,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { computed, onMounted, ref } from 'vue';

import BaseButton from '@/components/shared/BaseButton.vue';
import BaseFormBlock from '@/components/shared/BaseFormBlock.vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import BaseSelect from '@/components/shared/BaseSelect.vue';
import { user as authUser } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import { type PracticeRole } from '@/features/rota/rotaTypes';
import { usePracticeUsers } from '@/features/users/composables/usePracticeUsers';
import { db } from '@/services/firebase';

import UserModalAccess, { type UserAccessForm } from './UserModalAccess.vue';

/**
 * Form shape definition.
 */
interface UserForm extends UserAccessForm {
  name: string;
  email: string;
  address: string;
  role: string;
  profile_image: string;
  user_id: string;
}

/**
 * Interface to safely handle the loose input data structure from various sources.
 * Replaces 'any' to satisfy strict linting.
 */
interface InboundUser {
  uid?: string;
  user?: {
    id?: string;
    _path?: { segments?: string[] };
  };
  profile?: Record<string, unknown>;
  role?: string;
  is_administrator?: unknown;
  is_employee?: unknown;
  profile_image?: string;
  [key: string]: unknown;
}

const { users } = usePracticeUsers();
const { showToast } = useToast();

const isVisible = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const loadingRoles = ref(true);

const rolesList = ref<PracticeRole[]>([]);
const initialState = ref('');

// State to manage the two-step delete verification.
const deleteConfirmation = ref(false);

/**
 * Returns the default empty state for the user form.
 * @returns A fresh form object with empty default values.
 */
const defaultForm = (): UserForm => ({
  name: '',
  email: '',
  address: '',
  role: '',
  is_administrator: false,
  is_employee: true,
  profile_image: '',
  user_id: ''
});

const form = ref<UserForm>(defaultForm());

// Logic: checks if the session user is editing their own record.
const isSelf = computed(() => form.value.user_id === authUser.value?.uid);

// Logic: prevents lockout by checking if the user is the only administrator left.
const isLastAdmin = computed(() => {
  const admins = users.value.filter((u) => u.is_administrator);

  return admins.length <= 1 && admins.some((a) => a.uid === form.value.user_id);
});

// Logic: triggers the 'Save changes' button activation state based on modifications.
const isDirty = computed(() => JSON.stringify(form.value) !== initialState.value);

/**
 * Helper to safely extract the user ID.
 * @param u - The raw user object from Firestore or internal state.
 * @returns The resolved user ID string.
 */
const resolveId = (u: InboundUser): string => {
  if (u.user?.id) return u.user.id;
  if (u.uid) return u.uid;
  if (u.user?._path?.segments?.[1]) return u.user._path.segments[1];
  return '';
};

/**
 * Helper to resolve a string field from profile or root object.
 * @param u - The raw user object.
 * @param field - The key of the field to retrieve.
 * @returns The resolved string value or empty string.
 */
const resolveStr = (u: InboundUser, field: string): string => {
  const profileVal = u.profile?.[field];
  if (typeof profileVal === 'string') {
    return profileVal;
  }

  const rootVal = u[field];
  if (typeof rootVal === 'string') {
    return rootVal;
  }

  return '';
};

/**
 * Helper to determine the correct profile image URL.
 * @param u - The raw user object.
 * @returns The resolved image URL or an empty string.
 */
const resolveProfileImage = (u: InboundUser): string => {
  const profileImg = u.profile?.profile_image;
  if (typeof profileImg === 'string') {
    return profileImg;
  }

  if (typeof u.profile_image === 'string') {
    return u.profile_image;
  }

  return '';
};

/**
 * Helper to normalise boolean flags with default values.
 * @param val - The raw value to check.
 * @param fallback - The default boolean to return if val is null/undefined.
 * @returns The resolved boolean value.
 */
const resolveBool = (val: unknown, fallback: boolean): boolean =>
  val !== undefined && val !== null ? Boolean(val) : fallback;

/**
 * Normalises complex incoming user data into a flat form structure.
 * @param u - The raw user data object.
 * @returns The normalised UserForm object.
 */
const normaliseUserData = (u: InboundUser): UserForm => ({
  name: resolveStr(u, 'name'),
  email: resolveStr(u, 'email'),
  address: resolveStr(u, 'address'),
  role: u.role || '',
  is_administrator: Boolean(u.is_administrator),
  is_employee: resolveBool(u.is_employee, true),
  profile_image: resolveProfileImage(u),
  user_id: resolveId(u)
});

/**
 * Prepares the form state for either user creation or updates.
 * @param userData - The user object to edit, or null for new user.
 */
const open = (userData: unknown = null) => {
  deleteConfirmation.value = false;
  if (userData) {
    isEdit.value = true;
    form.value = normaliseUserData(userData as InboundUser);
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
      rolesList.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PracticeRole);
    }
  } finally {
    loadingRoles.value = false;
  }
});

/**
 * Helper to handle errors during save/delete operations.
 * @param error - The caught error object.
 * @param fallbackMsg - A default error message if the error object is not standard.
 */
const handleError = (error: unknown, fallbackMsg = 'Unknown error') => {
  const msg = error instanceof Error ? error.message : fallbackMsg;
  showToast(`Save Failure: ${msg}`, { duration: 5000 });
};

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
    const currentUser = authUser.value;

    if (!currentUser?.practiceRef?.id) {
      throw new Error('Action requires active practice context.');
    }

    const pId = currentUser.practiceRef.id;
    await deleteDoc(doc(db, 'practice_users', `${form.value.user_id}_${pId}`));
    showToast(`User ${form.value.name} access revoked.`);
    close();
  } catch (error) {
    handleError(error, 'Failed to revoke access.');
  } finally {
    saving.value = false;
  }
};

/**
 * Constructs and commits the batch update for user data.
 * @param pRef - The DocumentReference to the current practice.
 */
const executeBatchSave = async (pRef: DocumentReference) => {
  const batch = writeBatch(db);
  const uid = form.value.user_id || doc(collection(db, 'users')).id;
  const userRef = doc(db, 'users', uid);

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
};

/**
 * Logic: atomic update of user and practice data.
 */
const save = async () => {
  if (saving.value) return;

  const currentUser = authUser.value;
  // Validation: Ensure context exists before attempting writes.
  if (!currentUser?.practiceRef) {
    showToast('Action requires active practice context.', { duration: 5000 });
    return;
  }

  saving.value = true;

  try {
    await executeBatchSave(currentUser.practiceRef);
    showToast(isEdit.value ? 'User profile updated.' : 'New user created.');
    close();
  } catch (error) {
    handleError(error);
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

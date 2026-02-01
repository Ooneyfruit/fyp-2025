<script setup lang="ts">
/**
 * Orchestrates the user management modal workflow.
 * Handles dual-write operations to both 'users' and 'practice_users' collections.
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
import { computed, markRaw, onMounted, ref } from 'vue';

import BaseButton from '@/components/shared/BaseButton.vue';
import BaseFormBlock from '@/components/shared/BaseFormBlock.vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import BaseModalConfirmation from '@/components/shared/BaseModalConfirmation.vue';
import BaseSelect from '@/components/shared/BaseSelect.vue';
import { user as authUser } from '@/composables/useAuth';
import { useModal } from '@/composables/useModal';
import { useToast } from '@/composables/useToast';
import { type PracticeRole } from '@/features/rota/rotaTypes';
import { usePracticeUsers } from '@/features/users/composables/usePracticeUsers';
import { type UserProfile } from '@/features/users/userTypes';
import { db } from '@/services/firebase';

import UserModalAccess, { type UserAccessForm } from './UserModalAccess.vue';
import UserModalFooter from './UserModalFooter.vue';

interface UserForm extends UserAccessForm {
  name: string;
  email: string;
  address: string;
  role: string;
  profile_image: string;
  user_id: string;
}

interface InboundUser {
  uid?: string;
  user?: { id?: string; _path?: { segments?: string[] } };
  profile?: Record<string, unknown>;
  role?: string;
  is_administrator?: unknown;
  is_employee?: unknown;
  profile_image?: string;
  [key: string]: unknown;
}

const { users } = usePracticeUsers();
const { showToast } = useToast();
const { isVisible, data: modalData, open, close } = useModal<InboundUser>();

const saving = ref(false);
const loadingRoles = ref(true);
const rolesList = ref<PracticeRole[]>([]);
const initialState = ref('');
const deleteConfirmation = ref(false);

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

const isSelf = computed(() => form.value.user_id === (authUser.value as UserProfile)?.uid);
const isEdit = computed(() => !!form.value.user_id && !!modalData.value);
const isLastAdmin = computed(() => {
  const admins = users.value.filter((u) => u.is_administrator);
  return admins.length <= 1 && admins.some((a) => a.profile.id === form.value.user_id);
});

// --- Change Detection Logic ---
const isDirty = computed(() => JSON.stringify(form.value) !== initialState.value);

// --- Helpers ---
const resolveId = (u: InboundUser): string => {
  if (u.user?.id) return u.user.id;
  if (u.uid) return u.uid;
  if (u.user?._path?.segments?.[1]) return u.user._path.segments[1];
  return '';
};

const resolveStr = (u: InboundUser, field: string): string => {
  const profileVal = u.profile?.[field];
  if (typeof profileVal === 'string') return profileVal;
  const rootVal = u[field];
  if (typeof rootVal === 'string') return rootVal;
  return '';
};

const resolveProfileImage = (u: InboundUser): string => {
  const profileImg = u.profile?.profile_image;
  if (typeof profileImg === 'string') return profileImg;
  if (typeof u.profile_image === 'string') return u.profile_image;
  return '';
};

const resolveBool = (val: unknown, fallback: boolean): boolean =>
  val !== undefined && val !== null ? Boolean(val) : fallback;

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

const handleOpen = (userData?: InboundUser) => {
  deleteConfirmation.value = false;
  form.value = userData ? normaliseUserData(userData) : defaultForm();
  // Snapshot initial state for dirty checking
  initialState.value = JSON.stringify(form.value);
  open(userData);
};

defineExpose({ open: handleOpen, close });

onMounted(async () => {
  try {
    const practiceId = authUser.value?.practiceRef?.id;
    if (practiceId) {
      const snap = await getDocs(collection(db, 'practices', practiceId, 'roles'));
      rolesList.value = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as PracticeRole)
        .filter((r) => !r.is_deleted);
    }
  } finally {
    loadingRoles.value = false;
  }
});

const handleError = (error: unknown, fallbackMsg = 'Unknown error') => {
  const msg = error instanceof Error ? error.message : fallbackMsg;
  showToast(`Save Failure: ${msg}`, { duration: 5000 });
};

const handleDelete = async () => {
  if (!deleteConfirmation.value) {
    deleteConfirmation.value = true;
    return;
  }
  saving.value = true;
  try {
    const currentUser = authUser.value;
    if (!currentUser?.practiceRef?.id) throw new Error('Action requires active practice context.');
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

const executeBatchSave = async (pRef: DocumentReference) => {
  const batch = writeBatch(db);
  const uid = form.value.user_id || doc(collection(db, 'users')).id;
  const userRef = doc(db, 'users', uid);

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

const save = async () => {
  if (saving.value) return;
  const currentUser = authUser.value;
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

// --- Footer Configurations ---
const footerComponent = markRaw(UserModalFooter);
const footerProps = computed(() => ({
  hasChanges: isDirty.value,
  saving: saving.value,
  isEdit: isEdit.value,
  onClose: close,
  onSave: save
}));

const confirmationFooter = markRaw(BaseModalConfirmation);
const confirmationFooterProps = computed(() => ({
  onSave: save,
  loading: saving.value,
  discardLabel: 'Discard Changes',
  saveLabel: 'Save User'
}));
</script>

<template>
  <BaseModal
    :close-confirmation-footer="confirmationFooter"
    :close-confirmation-footer-props="confirmationFooterProps"
    close-confirmation-message="You have unsaved changes to this user. What would you like to do?"
    close-confirmation-title="Unsaved Changes"
    :footer-component="footerComponent"
    :footer-props="footerProps"
    :prevent-close="isDirty"
    :show="isVisible"
    size="md"
    :title="isEdit ? 'Update user profile' : 'Register new user'"
    @request-close="close"
  >
    <div v-if="loadingRoles" class="skeleton-padding">
      <div class="skeleton-field" />
    </div>

    <form v-else id="user-modal-form" class="rd-form" @submit.prevent="save">
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
    </form>
  </BaseModal>
</template>

<style scoped>
.danger-card {
  align-items: center;
  background: hsl(var(--hue-danger) 100% 98%);
  border: 8px double hsl(var(--hue-danger) 100% 90%);
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

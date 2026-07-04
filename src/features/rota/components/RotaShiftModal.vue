<script setup lang="ts">
/**
 * Rota shift management modal. Allows assigning or removing staff from a specific shift slot.
 */

import { doc, type DocumentReference, Timestamp } from 'firebase/firestore';
import { computed, markRaw, ref } from 'vue';

import BaseModal from '@/components/shared/BaseModal.vue';
import BaseModalConfirmation from '@/components/shared/BaseModalConfirmation.vue';
import { useAuth } from '@/composables/useAuth';
import { useModal } from '@/composables/useModal';
import { useToast } from '@/composables/useToast';
import { type RotaDay } from '@/features/rota/composables/useRotaDates';
import { isRoleMatch } from '@/features/rota/composables/useRotaRoleMatch';
import { createShift, deleteShift } from '@/features/rota/rotaApi';
import type { PracticeRole, PracticeSurgery, Shift } from '@/features/rota/rotaTypes';
import { usePracticeUsers } from '@/features/users/composables/usePracticeUsers';
import { db } from '@/services/firebase';

import RotaAssignedStaff from './RotaAssignedStaff.vue';
import RotaShiftModalFooter from './RotaShiftModalFooter.vue';
import RotaStaffPicker, { type PickerStaffMember } from './RotaStaffPicker.vue';

// Type Definitions

export interface RotaShiftModalData {
  role: PracticeRole;
  surgery: PracticeSurgery;
  date: RotaDay;
  shifts: Shift[];
}

interface MappedMember {
  uid: string;
  membershipId: string;
  userRef: DocumentReference;
  name: string;
  email: string;
  roleName?: string;
  role: string;
  status: 'active' | 'invited' | 'suspended';
  activePracticeName: string;
  is_administrator: boolean;
}

interface ExtendedShift extends Shift {
  isTemp?: boolean;
  originalMember?: MappedMember;
  roleName?: string;
}

const emit = defineEmits<{
  saved: [];
}>();

// Composables
const { user: authUser } = useAuth();
const { showToast } = useToast();
const { users: practiceUsers, isLoading: usersLoading } = usePracticeUsers();
const { isVisible, data: modalData, open, close } = useModal<RotaShiftModalData>();

// Local State
const searchQuery = ref('');
const pendingAdds = ref<MappedMember[]>([]);
const pendingRemoves = ref<string[]>([]);
const saving = ref(false);

const handleOpen = (payload?: RotaShiftModalData) => {
  pendingAdds.value = [];
  pendingRemoves.value = [];
  searchQuery.value = '';
  open(payload);
};

defineExpose({ open: handleOpen, close });

// Computed Data
const role = computed(() => modalData.value?.role || { id: 'unknown', name: 'Unknown' });
const surgery = computed(() => modalData.value?.surgery || { id: 'unknown', name: 'Unknown' });
const date = computed(
  () => modalData.value?.date || { label: '', date: '', iso: '', isToday: false, key: '' }
);
const sourceShifts = computed(() => modalData.value?.shifts || []);
const modalTitle = computed(
  () => `${role.value.name} - ${surgery.value.name} (${date.value.label})`
);

const isAdmin = computed(() => authUser.value?.is_administrator ?? false);
const currentUserId = computed(() => {
  const user = authUser.value as { uid?: string; id?: string; profile?: { id?: string } };
  return user?.uid || user?.id || user?.profile?.id || null;
});

// Data Mapping
const mappedMembers = computed<MappedMember[]>(() => {
  return practiceUsers.value.map((member) => ({
    uid: member.profile.id || '',
    membershipId: member.id,
    userRef: member.user,
    name: member.profile.name || 'Unknown Staff',
    email: member.profile.email || '',
    roleName: member.role,
    role: member.role,
    status: (member.status as 'active' | 'invited' | 'suspended') || 'active',
    activePracticeName: member.profile.activePracticeName || '',
    is_administrator: member.profile.is_administrator || false
  }));
});

const getNormalisedUserId = (val: unknown): string | undefined => {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'id' in val) return (val as { id: string }).id;
  return undefined;
};

const currentStaffList = computed<ExtendedShift[]>(() => {
  const existing: ExtendedShift[] = sourceShifts.value
    .filter((s) => !pendingRemoves.value.includes(s.id))
    .map((s) => {
      const sUserId = getNormalisedUserId(s.user_id);
      const match = mappedMembers.value.find((m) => m.uid === sUserId);
      return { ...s, user_id: sUserId, roleName: match?.roleName };
    });

  // Prepare references for temp shifts
  const practiceRef = authUser.value?.practiceRef;
  const dummyRef = {} as DocumentReference; // Fallback if no practice context

  const newOnes: ExtendedShift[] = pendingAdds.value.map((m) => ({
    id: `temp_${m.uid}`,
    date: Timestamp.now(),
    user_id: m.uid,
    user_name: m.name,
    role_id: practiceRef ? doc(practiceRef, 'roles', role.value.id) : dummyRef,
    surgery_id: practiceRef ? doc(practiceRef, 'surgeries', surgery.value.id) : dummyRef,
    isTemp: true,
    originalMember: m,
    roleName: m.roleName,
    is_resolved: false,
    roster_status: 'draft'
  }));

  return [...existing, ...newOnes];
});

const availableStaffList = computed(() => {
  const currentIds = new Set(currentStaffList.value.map((s) => s.user_id || s.originalMember?.uid));
  const query = searchQuery.value.toLowerCase();
  return mappedMembers.value.filter((m) => {
    if (currentIds.has(m.uid)) return false;
    return m.name.toLowerCase().includes(query);
  });
});

const recommendedStaff = computed(() =>
  availableStaffList.value.filter((m) => isRoleMatch(m.roleName, role.value.name))
);
const otherStaff = computed(() =>
  availableStaffList.value.filter((m) => !isRoleMatch(m.roleName, role.value.name))
);

// Change Detection Logic
const hasChanges = computed(() => pendingAdds.value.length > 0 || pendingRemoves.value.length > 0);

const saveLabel = computed(() => {
  if (!hasChanges.value) return 'No Changes';
  return 'Save Changes';
});

// Actions
const handleAddStaff = (member: PickerStaffMember) => {
  pendingAdds.value.push(member as MappedMember);
};

const markForRemoval = (shift: ExtendedShift) => {
  if (shift.isTemp && shift.originalMember) {
    pendingAdds.value = pendingAdds.value.filter((m) => m.uid !== shift.originalMember!.uid);
  } else {
    pendingRemoves.value.push(shift.id);
  }
};

const saveChanges = async () => {
  if (!hasChanges.value) {
    close();
    return;
  }
  if (!authUser.value?.practiceRef) {
    showToast('No active practice found.');
    return;
  }

  saving.value = true;
  const practiceId = authUser.value.practiceRef.id;

  try {
    await Promise.all(pendingRemoves.value.map((id) => deleteShift(id)));
    await Promise.all(
      pendingAdds.value.map((member) => {
        const roleRef = doc(db, `practices/${practiceId}/roles`, role.value.id);
        const surgeryRef = doc(db, `practices/${practiceId}/surgeries`, surgery.value.id);
        return createShift({
          date: date.value.iso,
          user_id: member.uid,
          user_name: member.name,
          role_id: roleRef,
          role_name: role.value.name,
          surgery_id: surgeryRef,
          surgery_name: surgery.value.name
        });
      })
    );
    showToast('Shift updates saved.');
    emit('saved');
    pendingAdds.value = [];
    pendingRemoves.value = [];
    close();
  } catch {
    showToast('Failed to save changes.');
  } finally {
    saving.value = false;
  }
};

// Footer Configurations
const footerComponent = markRaw(RotaShiftModalFooter);
const footerProps = computed(() => ({
  hasChanges: hasChanges.value,
  saveLabel: saveLabel.value,
  onClose: close,
  onSave: saveChanges,
  loading: saving.value
}));

const confirmationFooter = markRaw(BaseModalConfirmation);
const confirmationFooterProps = computed(() => ({
  onSave: saveChanges,
  loading: saving.value,
  saveLabel: saveLabel.value,
  discardLabel: 'Discard Changes'
}));
</script>

<template>
  <BaseModal
    :close-confirmation-footer="confirmationFooter"
    :close-confirmation-footer-props="confirmationFooterProps"
    close-confirmation-message="You have unsaved changes to this shift. What would you like to do?"
    close-confirmation-title="Unsaved Changes"
    :footer-component="footerComponent"
    :footer-props="footerProps"
    :prevent-close="hasChanges"
    :show="isVisible"
    size="md"
    :title="modalTitle"
    @request-close="close"
  >
    <div class="modal-body-wrapper">
      <RotaAssignedStaff
        :current-user-id="currentUserId"
        :is-admin="isAdmin"
        :staff="currentStaffList"
        :target-role-name="role.name"
        @remove="markForRemoval"
      />
      <hr class="divider" />
      <RotaStaffPicker
        v-model:search-query="searchQuery"
        :is-loading="usersLoading"
        :others="otherStaff"
        :recommended="recommendedStaff"
        :target-role-name="role.name"
        @add="handleAddStaff"
      />
    </div>
  </BaseModal>
</template>

<style scoped>
.modal-body-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: calc(100dvh - 18rem);
  min-height: 31.25rem;
  overflow: hidden;
}

.divider {
  border: 0;
  border-top: 1px solid var(--border-colour);
  margin: 0;
}
</style>

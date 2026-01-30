<script setup lang="ts">
/**
 * Rota shift management modal.
 * Allows assigning or removing staff from a specific shift slot.
 */

import { type DocumentReference, Timestamp } from 'firebase/firestore';
import { computed, markRaw, type PropType, ref, watch } from 'vue';

import BaseModal from '@/components/shared/BaseModal.vue';
import { isRoleMatch } from '@/features/rota/composables/useRotaRoleMatch';
import type { PracticeRole, PracticeSurgery, Shift } from '@/features/rota/rotaTypes';
import { usePracticeUsers } from '@/features/users/composables/usePracticeUsers';

import RotaAssignedStaff from './RotaAssignedStaff.vue';
import RotaShiftModalFooter from './RotaShiftModalFooter.vue';
import RotaStaffPicker, { type PickerStaffMember } from './RotaStaffPicker.vue';

// --- Type Definitions ---

interface RotaDay {
  label: string;
  date: string | Date;
}

/**
 * Represents a flattened view of a practice user for usage within the Rota Modal.
 * Must satisfy the PickerStaffMember interface for compatibility with RotaStaffPicker.
 */
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

// Extension of Shift to handle UI-specific fields and temporary additions
interface ExtendedShift extends Shift {
  isTemp?: boolean;
  originalMember?: MappedMember;
  // This roleName comes from the User Profile, distinct from Shift.role_name
  roleName?: string;
}

const props = defineProps({
  show: { type: Boolean, required: true },
  role: {
    type: Object as PropType<PracticeRole>,
    default: () => ({ id: 'unknown', name: 'Unknown' })
  },
  surgery: {
    type: Object as PropType<PracticeSurgery>,
    default: () => ({ id: 'unknown', name: 'Unknown' })
  },
  date: {
    type: Object as PropType<RotaDay>,
    default: () => ({ label: '' })
  },
  shifts: {
    type: Array as PropType<Shift[]>,
    default: () => []
  }
});

const emit = defineEmits<{
  (e: 'request-close'): void;
  (e: 'save', payload: { additions: MappedMember[]; removals: string[] }): void;
}>();

// --- Use Shared User Logic ---
const { users: practiceUsers, isLoading: usersLoading } = usePracticeUsers();

// --- Local State ---
const searchQuery = ref('');
const pendingAdds = ref<MappedMember[]>([]);
const pendingRemoves = ref<string[]>([]);

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      pendingAdds.value = [];
      pendingRemoves.value = [];
      searchQuery.value = '';
    }
  }
);

const modalTitle = computed(
  () => `${props.role?.name} - ${props.surgery?.name} (${props.date?.label})`
);

// --- Data Mapping ---
const mappedMembers = computed<MappedMember[]>(() => {
  return practiceUsers.value.map((member) => ({
    // Access profile data from the nested 'profile' object
    uid: member.profile.id || '',
    membershipId: member.id,
    userRef: member.user,
    name: member.profile.name || 'Unknown Staff',
    email: member.profile.email || '',
    // Map the membership role to both roleName (display) and role (logic)
    roleName: member.role,
    role: member.role,
    status: (member.status as 'active' | 'invited' | 'suspended') || 'active',
    activePracticeName: member.profile.activePracticeName || '',
    is_administrator: member.profile.is_administrator || false
  }));
});

// --- Helper Functions ---

/**
 * Safely extracts a string ID from a user_id field that might be a string or a DocumentReference.
 * Fixes runtime issues where legacy data might store a Ref instead of an ID.
 * @param val - The user_id field from the shift object.
 */
const getNormalizedUserId = (val: unknown): string | undefined => {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'id' in val) {
    return (val as { id: string }).id;
  }
  return undefined;
};

// --- Computed Lists ---

/**
 * Staff currently assigned (Props - Removals + Additions).
 * ENRICHED: Now looks up the role for existing shifts to detect exceptions.
 */
const currentStaffList = computed<ExtendedShift[]>(() => {
  // 1. Process Existing Shifts
  const existing: ExtendedShift[] = props.shifts
    .filter((s) => !pendingRemoves.value.includes(s.id))
    .map((s) => {
      // Robust ID check: s.user_id might be a string or a Firestore Reference object
      const sUserId = getNormalizedUserId(s.user_id);

      // Find the member to get their current role
      const match = mappedMembers.value.find((m) => m.uid === sUserId);

      return {
        ...s,
        // Ensure user_id is normalized to string for the UI
        user_id: sUserId,
        // Attach the Role Name if found, otherwise undefined (or 'Unknown')
        // This is the CRITICAL field for RotaAssignedStaff to detect exceptions
        roleName: match?.roleName
      };
    });

  // 2. Process Pending Additions
  const newOnes: ExtendedShift[] = pendingAdds.value.map((m) => ({
    id: `temp_${m.uid}`,
    date: Timestamp.now(), // Placeholder date to satisfy Shift interface
    user_id: m.uid,
    user_name: m.name,
    isTemp: true,
    originalMember: m,
    roleName: m.roleName,
    // Default Status flags for new temp shifts
    is_resolved: false,
    roster_status: 'draft'
  }));

  return [...existing, ...newOnes];
});

const availableStaffList = computed(() => {
  // Combine IDs from both sources to exclude them from the picker
  const currentIds = new Set(
    currentStaffList.value.map((s) => {
      // For existing shifts, user_id is already normalized in currentStaffList
      return s.user_id || s.originalMember?.uid;
    })
  );

  const query = searchQuery.value.toLowerCase();

  return mappedMembers.value.filter((m) => {
    if (currentIds.has(m.uid)) return false;
    return m.name.toLowerCase().includes(query);
  });
});

const recommendedStaff = computed(() => {
  // Use shared logic to find matches
  return availableStaffList.value.filter((m) => isRoleMatch(m.roleName, props.role?.name));
});

const otherStaff = computed(() => {
  // Use shared logic to find non-matches
  return availableStaffList.value.filter((m) => !isRoleMatch(m.roleName, props.role?.name));
});

const hasChanges = computed(() => pendingAdds.value.length > 0 || pendingRemoves.value.length > 0);

const saveLabel = computed(() => {
  if (!hasChanges.value) return 'No Changes';
  return 'Save Changes';
});

// --- Actions ---

const stageAddition = (member: MappedMember) => {
  pendingAdds.value.push(member);
};

// Wrapper to satisfy TypeScript event contravariance.
// The picker emits a generic PickerStaffMember, which we cast back to MappedMember.
// This cast is safe because the picker only displays items we passed to it.
const handleAddStaff = (member: PickerStaffMember) => {
  stageAddition(member as MappedMember);
};

const markForRemoval = (shift: ExtendedShift) => {
  if (shift.isTemp && shift.originalMember) {
    pendingAdds.value = pendingAdds.value.filter((m) => m.uid !== shift.originalMember!.uid);
  } else {
    pendingRemoves.value.push(shift.id);
  }
};

const saveChanges = () => {
  emit('save', {
    additions: pendingAdds.value,
    removals: pendingRemoves.value
  });
};

const handleClose = () => emit('request-close');

const isLoading = computed(() => usersLoading.value);

// --- Component Configuration ---
const footerComponent = markRaw(RotaShiftModalFooter);
const footerProps = computed(() => ({
  hasChanges: hasChanges.value,
  saveLabel: saveLabel.value,
  onClose: handleClose,
  onSave: saveChanges
}));
</script>

<template>
  <BaseModal
    :footer-component="footerComponent"
    :footer-props="footerProps"
    :show="show"
    size="md"
    :title="modalTitle"
    @request-close="handleClose"
  >
    <div class="modal-body-wrapper">
      <RotaAssignedStaff
        :staff="currentStaffList"
        :target-role-name="role.name"
        @remove="markForRemoval"
      />

      <hr class="divider" />

      <RotaStaffPicker
        v-model:search-query="searchQuery"
        :is-loading="isLoading"
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
  max-height: 70vh;
  min-height: 500px;
  overflow: hidden;
}

.divider {
  border: 0;
  border-top: 1px solid var(--border-color);
  margin: 0;
}
</style>

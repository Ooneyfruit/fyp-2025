<script setup lang="ts">
import type { DocumentReference } from 'firebase/firestore';
import { computed, ref, watch } from 'vue';

import BaseModal from '@/components/shared/BaseModal.vue';
import type { PracticeRole, PracticeSurgery, Shift } from '@/features/rota/rotaTypes';
import { usePracticeUsers } from '@/features/users/composables/usePracticeUsers';

import RotaAssignedStaff from './RotaAssignedStaff.vue';
import RotaShiftModalFooter from './RotaShiftModalFooter.vue';
import RotaStaffPicker from './RotaStaffPicker.vue';

/**
 * RotaShiftModal.
 * Primary responsibility: provides an interface for assigning staff to rota slots.
 * Logic: coordinates the 'pending' state for additions and removals before saving.
 */

interface Props {
  show: boolean;
  role: PracticeRole;
  surgery: PracticeSurgery;
  date: { label: string };
  shifts: Shift[];
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  shifts: () => []
});

const emit = defineEmits<{
  (e: 'request-close'): void;
  (e: 'save', payload: { additions: MappedStaff[]; removals: string[] }): void;
}>();

// --- Type Definitions ---

interface MappedStaff {
  uid: string;
  membershipId?: string;
  userRef?: DocumentReference | null;
  name: string;
  email?: string;
  roleName?: string;
}

// Logic: Use Omit to strictly override user_id without TypeScript conflict.
// Renamed to UiShift (PascalCase) and removed export (local scope only).
interface UiShift extends Omit<Partial<Shift>, 'user_id'> {
  id: string;
  user_name?: string;
  roleName?: string;
  isTemp?: boolean;
  originalMember?: MappedStaff;
  // Ensure strict typing for the union used in the template.
  user_id?: string | { id: string } | null;
}

// --- Shared State ---

const { users: practiceUsers, isLoading: usersLoading } = usePracticeUsers();

// --- Local Reactive State ---

const searchQuery = ref('');
const pendingAdds = ref<MappedStaff[]>([]);
const pendingRemoves = ref<string[]>([]);

// Logic: reset internal staging area when the modal visibility toggles.
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

const modalTitle = computed(() => {
  return `${props.role?.name || 'Unknown'} - ${props.surgery?.name || 'Unknown'} (${props.date?.label})`;
});

// --- Data Mapping ---

const mappedMembers = computed<MappedStaff[]>(() => {
  return practiceUsers.value.map((member) => ({
    // Logic: PracticeUser is flat, so we access properties directly
    uid: member.uid,
    membershipId: '', // Not available in flattened PracticeUser, defaulting to empty
    userRef: null, // Not available in flattened PracticeUser, defaulting to null
    name: member.name || 'Unknown Staff',
    email: member.email,
    roleName: member.role
  }));
});

// --- Computed Lists ---

const currentStaffList = computed<UiShift[]>(() => {
  // Logic: filter out shifts staged for removal and enrich with current role information.
  const existing: UiShift[] = props.shifts
    .filter((s) => !pendingRemoves.value.includes(s.id))
    .map((s) => {
      // Robust ID check: handles both string and DocumentReference formats safely.
      // Logic: Cast to unknown to allow checking for legacy object structure even if Type implies string.
      const rawUser = s.user_id as unknown;
      const sUserId =
        typeof rawUser === 'object' && rawUser !== null && 'id' in (rawUser as object)
          ? (rawUser as { id: string }).id
          : s.user_id;

      const match = mappedMembers.value.find((m) => m.uid === sUserId);

      return {
        ...s,
        roleName: match?.roleName
      };
    });

  const newOnes: UiShift[] = pendingAdds.value.map((m) => ({
    id: `temp_${m.uid}`,
    user_name: m.name,
    isTemp: true,
    originalMember: m,
    roleName: m.roleName,
    user_id: m.uid
  }));

  return [...existing, ...newOnes];
});

const availableStaffList = computed<MappedStaff[]>(() => {
  // Logic: create a Set of existing IDs to efficiently filter the picker list.
  const currentIds = new Set(
    currentStaffList.value.map((s) => {
      if (typeof s.user_id === 'object' && s.user_id !== null && 'id' in s.user_id) {
        return s.user_id.id;
      }
      return s.user_id || s.originalMember?.uid;
    })
  );

  const query = searchQuery.value.toLowerCase();

  return mappedMembers.value.filter((m) => {
    if (currentIds.has(m.uid)) return false;
    return m.name.toLowerCase().includes(query);
  });
});

const recommendedStaff = computed(() =>
  availableStaffList.value.filter((m) => m.roleName === props.role?.name)
);

const otherStaff = computed(() =>
  availableStaffList.value.filter((m) => m.roleName !== props.role?.name)
);

const hasChanges = computed(() => pendingAdds.value.length > 0 || pendingRemoves.value.length > 0);

const saveLabel = computed(() => (hasChanges.value ? 'Save Changes' : 'No Changes'));

// --- Action Handlers ---

const stageAddition = (member: MappedStaff) => {
  pendingAdds.value.push(member);
};

const markForRemoval = (shift: UiShift) => {
  if (shift.isTemp && shift.originalMember) {
    pendingAdds.value = pendingAdds.value.filter((m) => m.uid !== shift.originalMember!.uid);
  } else {
    pendingRemoves.value.push(shift.id);
  }
};

const saveChanges = () => {
  emit('save', {
    additions: pendingAdds.value,
    removals: pendingRemoves.value // Fix: Use correct variable name (pendingRemoves)
  });
};

const handleClose = () => emit('request-close');
</script>

<template>
  <BaseModal
    :footer-component="RotaShiftModalFooter"
    :footer-listeners="{ close: handleClose, save: saveChanges }"
    :footer-props="{ saveLabel, hasChanges }"
    :show="show"
    size="md"
    :title="modalTitle"
    @request-close="handleClose"
  >
    <div class="modal-body-wrapper">
      <RotaAssignedStaff
        :staff="currentStaffList"
        :target-role-name="role?.name"
        @remove="markForRemoval"
      />

      <hr class="divider" />

      <RotaStaffPicker
        v-model:search-query="searchQuery"
        :is-loading="usersLoading"
        :others="otherStaff"
        :recommended="recommendedStaff"
        :target-role-name="role?.name"
        @add="stageAddition"
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

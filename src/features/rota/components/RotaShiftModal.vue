<script setup>
/**
 * RotaShiftModal.
 * Primary responsibility: provides an interface for assigning staff to rota slots.
 * Refactored to fix path resolution, prop definition, and reactive type safety.
 */
import { computed, ref, watch } from 'vue';

import BaseModal from '@/components/shared/BaseModal.vue';
import { usePracticeUsers } from '@/features/users/composables/usePracticeUsers';

import RotaAssignedStaff from './RotaAssignedStaff.vue';
import RotaShiftModalFooter from './RotaShiftModalFooter.vue';
import RotaStaffPicker from './RotaStaffPicker.vue';

/**
 * uid - Profile identifier.
 * membershipId - Practice membership identifier.
 * userRef - Firestore reference.
 * name - Display name.
 * [email] - Contact email.
 * [roleName] - Job role name.
 */

/**
 * id - Unique identifier.
 * [user_id] - User reference or ID.
 * [user_name] - Name of the user.
 * [roleName] - Name of the role.
 * [isTemp] - Flag for temporary state.
 * [originalMember] - Link back to source data.
 */

const props = defineProps({
  show: { type: Boolean, default: false },
  role: { type: Object, default: () => ({ name: 'Unknown' }) },
  surgery: { type: Object, default: () => ({ name: 'Unknown' }) },
  date: { type: Object, default: () => ({ label: '' }) },
  // Logic: explicitly type the array to prevent 'never' iteration errors.
  shifts: { type: Array, default: () => [] }
});

const emit = defineEmits(['request-close', 'save']);

// --- Shared State ---
const { users: practiceUsers, isLoading: usersLoading } = usePracticeUsers();

// --- Local Reactive State ---
const searchQuery = ref('');
// Logic: initializing with type casts prevents 'Property does not exist on type never' errors.
const pendingAdds = ref([]);
const pendingRemoves = ref([]);

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

const modalTitle = computed(
  () => `${props.role?.name} - ${props.surgery?.name} (${props.date?.label})`
);

// --- Data Mapping ---
const mappedMembers = computed(() => {
  return practiceUsers.value.map((member) => ({
    uid: member.profile.id,
    membershipId: member.id,
    userRef: member.user,
    name: member.profile.name || 'Unknown Staff',
    email: member.profile.email,
    roleName: member.role
  }));
});

// --- Computed Lists ---

const currentStaffList = computed(() => {
  // Logic: filter out shifts staged for removal and enrich with current role information.
  const existing = props.shifts
    .filter((s) => !pendingRemoves.value.includes(s.id))
    .map((s) => {
      // Robust ID check: handles both string and DocumentReference formats safely.
      const sUserId = typeof s.user_id === 'object' ? s.user_id?.id : s.user_id;
      const match = mappedMembers.value.find((m) => m.uid === sUserId);

      return {
        ...s,
        roleName: match?.roleName
      };
    });

  const newOnes = pendingAdds.value.map((m) => ({
    id: `temp_${m.uid}`,
    user_name: m.name,
    isTemp: true,
    originalMember: m,
    roleName: m.roleName,
    // Ensure user_id matches the structure expected by consumers.
    user_id: m.uid
  }));

  return [...existing, ...newOnes];
});

const availableStaffList = computed(() => {
  // Logic: Create a Set of existing IDs to efficiently filter the picker list.
  const currentIds = new Set(
    currentStaffList.value.map((s) => {
      // Explicitly handle the union type for user_id to avoid 'id does not exist on type string' errors.
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

const stageAddition = (member) => {
  pendingAdds.value.push(member);
};

const markForRemoval = (shift) => {
  if (shift.isTemp) {
    pendingAdds.value = pendingAdds.value.filter((m) => m.uid !== shift.originalMember.uid);
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

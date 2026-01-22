<script setup>
import { ref, computed, watch } from 'vue';
import { usePracticeUsers } from '../../users/composables/usePracticeUsers';
import BaseModal from '../../../components/shared/BaseModal.vue';
import BaseButton from '../../../components/shared/BaseButton.vue';
import RotaAssignedStaff from './RotaAssignedStaff.vue';
import RotaStaffPicker from './RotaStaffPicker.vue';

const props = defineProps({
  show: Boolean,
  role: { type: Object, default: () => ({ name: 'Unknown' }) },
  surgery: { type: Object, default: () => ({ name: 'Unknown' }) },
  date: { type: Object, default: () => ({ label: '' }) },
  shifts: { type: Array, default: () => [] }
});

const emit = defineEmits(['request-close', 'save']);

// --- Use Shared User Logic ---
const { users: practiceUsers, isLoading: usersLoading } = usePracticeUsers();

// --- Local State ---
const searchQuery = ref('');
const pendingAdds = ref([]);
const pendingRemoves = ref([]);

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

/**
 * Staff currently assigned (Props - Removals + Additions)
 * ENRICHED: Now looks up the role for existing shifts to detect exceptions.
 */
const currentStaffList = computed(() => {
  // 1. Process Existing Shifts
  const existing = props.shifts
    .filter((s) => !pendingRemoves.value.includes(s.id))
    .map((s) => {
      // Robust ID check: s.user_id might be a string or a Firestore Reference object
      const sUserId = s.user_id?.id || s.user_id;

      // Find the member to get their current role
      const match = mappedMembers.value.find((m) => m.uid === sUserId);

      return {
        ...s,
        // Attach the Role Name if found, otherwise undefined (or 'Unknown')
        roleName: match?.roleName
      };
    });

  // 2. Process Pending Additions
  const newOnes = pendingAdds.value.map((m) => ({
    id: `temp_${m.uid}`,
    user_name: m.name,
    isTemp: true,
    originalMember: m,
    roleName: m.roleName
  }));

  return [...existing, ...newOnes];
});

const availableStaffList = computed(() => {
  // Combine IDs from both sources to exclude them from the picker
  const currentIds = currentStaffList.value.map((s) => {
    // For existing shifts, user_id is the reference/ID
    // For temps, originalMember.uid is the ID
    return s.user_id?.id || s.user_id || s.originalMember?.uid;
  });

  const query = searchQuery.value.toLowerCase();

  return mappedMembers.value.filter((m) => {
    if (currentIds.includes(m.uid)) return false;
    return m.name.toLowerCase().includes(query);
  });
});

const recommendedStaff = computed(() => {
  return availableStaffList.value.filter((m) => m.roleName === props.role?.name);
});

const otherStaff = computed(() => {
  return availableStaffList.value.filter((m) => m.roleName !== props.role?.name);
});

const hasChanges = computed(() => pendingAdds.value.length > 0 || pendingRemoves.value.length > 0);

const saveLabel = computed(() => {
  if (!hasChanges.value) return 'No Changes';
  return 'Save Changes';
});

// --- Actions ---

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
  <BaseModal :show="show" :title="modalTitle" size="md" @request-close="handleClose">
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
        :target-role-name="role.name"
        :recommended="recommendedStaff"
        :others="otherStaff"
        @add="stageAddition"
      />
    </div>

    <template #footer>
      <div class="footer-actions">
        <BaseButton label="Cancel" variant="text" @click="handleClose" />
        <BaseButton :label="saveLabel" :disabled="!hasChanges" @click="saveChanges" />
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.modal-body-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 500px;
  max-height: 70vh;
  overflow: hidden;
}

.divider {
  border: 0;
  border-top: 1px solid var(--border-color);
  margin: 0;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  width: 100%;
}
</style>

<template>
  <BaseModal 
    :show="show" 
    :title="modalTitle"
    size="md"
    @request-close="handleClose"
  >
    <div class="modal-body-wrapper">
      
      <RotaAssignedStaff 
        :staff="currentStaffList"
        @remove="markForRemoval"
      />

      <hr class="divider" />

      <RotaStaffPicker 
        v-model:searchQuery="searchQuery"
        :isLoading="isLoading"
        :targetRoleName="role.name"
        :recommended="recommendedStaff"
        :others="otherStaff"
        @add="stageAddition"
      />

    </div>

    <template #footer>
      <div class="footer-actions">
        <BaseButton label="Cancel" variant="text" @click="handleClose" />
        <BaseButton 
          :label="saveLabel" 
          :disabled="!hasChanges"
          @click="saveChanges" 
        />
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { usePracticeUsers } from '../../users/composables/usePracticeUsers'; // Reuse existing logic
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
// logic: Leveraging the robust syncing and profile resolution from the Users feature
const { users: practiceUsers, isLoading: usersLoading } = usePracticeUsers();

// --- Local State ---
const searchQuery = ref('');
const pendingAdds = ref([]);
const pendingRemoves = ref([]);

// Reset local state on open
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    pendingAdds.value = [];
    pendingRemoves.value = [];
    searchQuery.value = '';
  }
});

const modalTitle = computed(() => 
  `${props.role?.name} - ${props.surgery?.name} (${props.date?.label})`
);

// --- Data Mapping ---

/**
 * Transforms the complex structure from usePracticeUsers into a flat object
 * compatible with the Rota picker components.
 */
const mappedMembers = computed(() => {
  return practiceUsers.value.map(member => ({
    uid: member.profile.id,       // User UID
    membershipId: member.id,      // Practice User Doc ID
    userRef: member.user,         // Firestore Ref (needed for saving)
    name: member.profile.name || 'Unknown Staff',
    email: member.profile.email,
    roleName: member.role         // The string role name (e.g. "Dentist")
  }));
});

// --- Computed Lists ---

/**
 * Staff currently assigned (Props - Removals + Additions)
 */
const currentStaffList = computed(() => {
  // Existing shifts not marked for removal
  const existing = props.shifts.filter(s => !pendingRemoves.value.includes(s.id));
  
  // Pending additions mapped to shift-like objects for display
  const newOnes = pendingAdds.value.map(m => ({
    id: `temp_${m.uid}`,
    user_name: m.name,
    isTemp: true,
    originalMember: m
  }));

  return [...existing, ...newOnes];
});

/**
 * Filtered pool of available members.
 * Excludes anyone already assigned or pending addition.
 */
const availableStaffList = computed(() => {
  const currentIds = currentStaffList.value.map(s => s.user_id?.id || s.originalMember?.uid);
  const query = searchQuery.value.toLowerCase();

  return mappedMembers.value.filter(m => {
    // Exclude if in current list
    if (currentIds.includes(m.uid)) return false;
    // Apply search filter
    return m.name.toLowerCase().includes(query);
  });
});

/**
 * Sub-list: Matching Role
 */
const recommendedStaff = computed(() => {
  return availableStaffList.value.filter(m => m.roleName === props.role?.name);
});

/**
 * Sub-list: Non-matching Role (Exceptions)
 */
const otherStaff = computed(() => {
  return availableStaffList.value.filter(m => m.roleName !== props.role?.name);
});

const hasChanges = computed(() => 
  pendingAdds.value.length > 0 || pendingRemoves.value.length > 0
);

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
    // Just remove from pending array
    pendingAdds.value = pendingAdds.value.filter(m => m.uid !== shift.originalMember.uid);
  } else {
    // Mark real ID for deletion
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

// Expose loading state for the picker component
const isLoading = computed(() => usersLoading.value);
</script>

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
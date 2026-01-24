<script setup lang="ts">
/**
 * RotaShiftModal.
 * Interface for modifying the staff assigned to a specific role/surgery/date slot.
 */
import { computed, ref, watch } from 'vue';

import IconClose from '@/components/icons/IconClose.vue';
import IconPlus from '@/components/icons/IconPlus.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import BaseSelect from '@/components/shared/BaseSelect.vue';
import { type PracticeRole, type PracticeSurgery, type Shift } from '@/features/rota/rotaTypes';
import { usePracticeUsers } from '@/features/users/usersApi';

// --- Type Definitions ---

interface RotaDay {
  iso: string;
  label: string;
}

interface SavePayload {
  additions: Array<{ userRef: string; name: string }>;
  removals: string[];
}

// --- Props & Emits ---

const props = defineProps<{
  show: boolean;
  role: PracticeRole;
  surgery: PracticeSurgery;
  date: RotaDay;
  shifts: Shift[];
}>();

const emit = defineEmits<{
  (e: 'request-close'): void;
  (e: 'save', payload: SavePayload): void;
}>();

// --- Logic ---

const { users } = usePracticeUsers();

// Local state for the dropdown selection
const selectedUserId = ref('');

// Track pending changes
const pendingAdditions = ref<Array<{ userRef: string; name: string }>>([]);
const pendingRemovals = ref<string[]>([]); // Array of Shift IDs to remove

/**
 * Reset local state when the modal opens or the target slot changes.
 */
watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      selectedUserId.value = '';
      pendingAdditions.value = [];
      pendingRemovals.value = [];
    }
  }
);

/**
 * Adds a user to the pending list.
 */
const addUser = () => {
  if (!selectedUserId.value) return;

  const user = users.value.find((u) => u.uid === selectedUserId.value);
  if (!user) return;

  // Prevent duplicates
  const alreadyInShifts = props.shifts.some((s) => s.user_id === user.uid);
  const alreadyInPending = pendingAdditions.value.some((p) => p.userRef === user.uid);

  if (!alreadyInShifts && !alreadyInPending) {
    pendingAdditions.value.push({
      userRef: user.uid,
      name: user.name || 'Unknown'
    });
  }

  selectedUserId.value = '';
};

/**
 * Marks a shift for removal.
 * @param shiftId - The ID of the existing shift.
 */
const removeExistingShift = (shiftId: string) => {
  if (!pendingRemovals.value.includes(shiftId)) {
    pendingRemovals.value.push(shiftId);
  }
};

/**
 * Cancels a pending addition.
 * @param index - Index in the pending additions array.
 */
const removePendingAddition = (index: number) => {
  pendingAdditions.value.splice(index, 1);
};

// Filter users available for selection (exclude those already assigned or pending)
const availableUsers = computed(() => {
  const assignedIds = new Set([
    ...props.shifts.map((s) => s.user_id),
    ...pendingAdditions.value.map((p) => p.userRef)
  ]);

  return users.value.filter((u) => !assignedIds.has(u.uid));
});

// Calculate the final list of shifts to display (Existing - Removals + Additions)
const displayShifts = computed(() => {
  const existing = props.shifts
    .filter((s) => !pendingRemovals.value.includes(s.id))
    .map((s) => ({
      id: s.id,
      name: s.user_name,
      isPending: false,
      isRemoved: false
    }));

  const pending = pendingAdditions.value.map((p) => ({
    id: `pending-${p.userRef}`,
    name: p.name,
    isPending: true,
    isRemoved: false
  }));

  return [...existing, ...pending];
});

const handleSave = () => {
  emit('save', {
    additions: pendingAdditions.value,
    removals: pendingRemovals.value
  });
};
</script>

<template>
  <BaseModal
    :show="show"
    size="sm"
    :title="`Manage Shifts: ${date.label}`"
    @request-close="emit('request-close')"
  >
    <div class="modal-context">
      <span class="context-pill">{{ role.name }}</span>
      <span class="context-separator">@</span>
      <span class="context-pill">{{ surgery.name }}</span>
    </div>

    <div class="modal-body">
      <div class="add-section">
        <div class="select-wrapper">
          <BaseSelect id="shift-user-select" v-model="selectedUserId" fluid label="Assign Staff">
            <option disabled value="">Select user...</option>
            <option v-for="u in availableUsers" :key="u.uid" :value="u.uid">
              {{ u.name }}
            </option>
          </BaseSelect>
        </div>
        <BaseButton
          class="add-btn"
          :disabled="!selectedUserId"
          :icon="IconPlus"
          icon-only
          variant="primary"
          @click="addUser"
        />
      </div>

      <div class="shifts-list">
        <div v-if="displayShifts.length === 0" class="empty-state">No staff assigned</div>

        <div
          v-for="shift in displayShifts"
          :key="shift.id"
          class="shift-row"
          :class="{ 'is-pending': shift.isPending }"
        >
          <span class="user-name">{{ shift.name }}</span>
          <BaseButton
            class="remove-btn"
            :icon="IconClose"
            icon-only
            size="sm"
            variant="ghost"
            @click="
              shift.isPending
                ? removePendingAddition(pendingAdditions.findIndex((p) => p.name === shift.name))
                : removeExistingShift(shift.id)
            "
          />
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <BaseButton label="Cancel" variant="secondary" @click="emit('request-close')" />
      <BaseButton label="Save Changes" variant="primary" @click="handleSave" />
    </div>
  </BaseModal>
</template>

<style scoped>
/* Context Header */
.modal-context {
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
}

.context-pill {
  background: var(--bg-app);
  border-radius: var(--border-radius-sm);
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
}

.context-separator {
  color: var(--text-muted);
}

/* Add Section */
.add-section {
  align-items: flex-end;
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.select-wrapper {
  flex: 1;
}

.add-btn {
  height: 2.5rem;
  margin-bottom: 1px; /* Align with input border */
  width: 2.5rem;
}

/* List Section */
.shifts-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 100px;
}

.empty-state {
  color: var(--text-muted);
  font-style: italic;
  padding: 1rem;
  text-align: center;
}

.shift-row {
  align-items: center;
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
}

.shift-row.is-pending {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Footer */
.modal-footer {
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
}
</style>

<script setup lang="ts">
/**
 * Renders a grid of staff members assigned to a specific shift slot.
 * Provides interactive elements to remove staff from the shift and highlights role discrepancies.
 */

import IconClose from '@/components/icons/IconClose.vue';
import { isRoleMatch } from '@/features/rota/composables/useRotaRoleMatch';
import type { Shift } from '@/features/rota/rotaTypes';

/**
 * Extended interface to support the 'roleName' property injected by RotaShiftModal.
 * This represents the *User's* default role, distinct from the *Shift's* role_name.
 */
interface AssignedShift extends Shift {
  roleName?: string;
}

const props = withDefaults(
  defineProps<{
    staff?: AssignedShift[];
    targetRoleName?: string;
    currentUserId?: string | null;
    isAdmin?: boolean;
  }>(),
  {
    staff: () => [],
    targetRoleName: '',
    currentUserId: null,
    isAdmin: false
  }
);

// Define emits using object syntax for better type inference.
defineEmits<{
  remove: [shift: AssignedShift];
}>();

/**
 * Determines if the assigned shift role differs from the column's target role.
 * Uses the shared utility to ensure consistency with the Staff Picker.
 *
 * @param shift - The shift assignment to check.
 * @returns True if the user's role does NOT match the target role.
 */
const isException = (shift: AssignedShift): boolean => {
  if (!shift.roleName) return false;

  // Use shared logic: Exception = NOT a match
  return !isRoleMatch(shift.roleName, props.targetRoleName);
};

/**
 * Determines if the current user has permission to remove the assigned shift.
 * Admins can remove any shift, regular users can only remove their own.
 */
const canRemove = (shift: AssignedShift): boolean => {
  if (props.isAdmin) return true;

  const shiftUserId =
    typeof shift.user_id === 'object' && shift.user_id !== null && 'id' in shift.user_id
      ? (shift.user_id as { id: string }).id
      : shift.user_id;

  return shiftUserId === props.currentUserId;
};
</script>

<template>
  <div class="assigned-section">
    <h4 class="section-heading">Assigned Staff</h4>

    <div v-if="staff.length > 0" class="staff-grid">
      <button
        v-for="shift in staff"
        :key="shift.id"
        class="staff-card assigned"
        :disabled="!canRemove(shift)"
        :title="canRemove(shift) ? 'Click to remove from shift' : ''"
        type="button"
        @click="$emit('remove', shift)"
      >
        <div class="staff-info">
          <span class="staff-name">{{ shift.user_name }}</span>

          <span v-if="isException(shift)" class="exception-role">
            {{ shift.roleName || 'Unknown Role' }}
          </span>
        </div>

        <div v-if="canRemove(shift)" class="remove-indicator">
          <IconClose :stroke-width="2.5" />
        </div>
      </button>
    </div>
    <p v-else class="empty-text">No staff currently assigned.</p>
  </div>
</template>

<style scoped>
.section-heading {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.staff-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); /* Slightly wider for role text */
}

.staff-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-align: left;
}

.staff-name {
  color: var(--text-main);
  font-size: 0.9rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exception-role {
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  margin-top: 1px;
  text-transform: uppercase;
}

.remove-indicator {
  align-items: center;
  color: #bae6fd; /* Subtle when not hovered */
  display: flex;
  flex-shrink: 0;
  height: 1.25rem;
  justify-content: center;
  margin-left: 0.5rem;
  transition: color 0.2s ease;
  width: 1.25rem;
}

.empty-text {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-style: italic;
  padding: 0.5rem 0;
}

/* Parent Component Styles */

.staff-card {
  align-items: center;
  appearance: none; /* Reset button styles */
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  font-family: inherit; /* Inherit font from parent */
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s ease;
  user-select: none;
  width: 100%;
}

.staff-card:disabled {
  cursor: default;
}

/* Hover State: "Removal" Style */

.staff-card:not(:disabled):hover {
  background-color: #fee2e2; /* Red-50 */
  border-color: #fca5a5; /* Red-300 */
}

/* On hover, change text colours to indicate destructive action */

.staff-card:not(:disabled):hover .staff-name {
  color: #b91c1c; /* Red-700 */
}

.staff-card:not(:disabled):hover .exception-role {
  color: #b91c1c;
  opacity: 0.8;
}

.staff-card:not(:disabled):hover .remove-indicator {
  color: #b91c1c;
}
</style>

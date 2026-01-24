<script setup lang="ts">
/**
 * Rota assigned staff component.
 * Primary responsibility: displays a list of staff members assigned to a specific
 * surgery or role slot, allowing for removal and highlighting role mismatches.
 * Refactored to satisfy strict accessibility, contrast, and TypeScript standards.
 */
import IconClose from '@/components/icons/IconClose.vue';
import type { Shift } from '@/features/rota/rotaTypes';

const props = withDefaults(
  defineProps<{
    /** The collection of shifts assigned to the current slot. */
    staff?: Shift[];
    /** The expected role name for this slot to check for mismatches. */
    targetRoleName?: string;
  }>(),
  {
    staff: () => [],
    targetRoleName: ''
  }
);

/**
 * Emits a removal event when a staff member is deselected.
 */
const emit = defineEmits<{
  remove: [shift: Shift];
}>();

/**
 * Checks if the shift role differs from the target role.
 * @param shift - The shift object.
 * @returns True if the assigned role is an exception to the target.
 */
const isException = (shift: Shift): boolean => {
  // If the role is unknown, do not flag as an exception to avoid visual noise.
  if (!shift.role_name) {
    return false;
  }
  return shift.role_name !== props.targetRoleName;
};
</script>

<template>
  <div class="assigned-section">
    <h4 class="section-heading">Assigned staff</h4>

    <div v-if="staff.length > 0" class="staff-grid">
      <button
        v-for="shift in staff"
        :key="shift.id"
        class="staff-card assigned"
        title="Click to remove from shift"
        type="button"
        @click="emit('remove', shift)"
      >
        <div class="staff-info">
          <span class="staff-name">{{ shift.user_name }}</span>

          <span v-if="isException(shift)" class="exception-role">
            {{ shift.role_name || 'Unknown role' }}
          </span>
        </div>

        <div class="remove-indicator">
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
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.staff-card {
  align-items: center;

  /* Default state: info style. */
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  font-family: inherit; /* Button reset. */
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  text-align: left; /* Button reset. */
  transition: all 0.2s ease;
  user-select: none;
  width: 100%; /* Button reset. */
}

.staff-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Base definitions must come before hover overrides. */

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
  color: #bae6fd;
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

/* Hover state: removal style. */

/* Placed at end to satisfy no-descending-specificity. */

.staff-card:hover {
  background-color: #fee2e2;
  border-color: #fca5a5;
}

.staff-card:hover .staff-name {
  color: #b91c1c;
}

.staff-card:hover .exception-role {
  color: #b91c1c;
  opacity: 0.8;
}

.staff-card:hover .remove-indicator {
  color: #b91c1c;
}
</style>

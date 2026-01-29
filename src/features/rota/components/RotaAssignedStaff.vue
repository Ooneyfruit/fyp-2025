<script setup lang="ts">
/**
 * (needs description).
 */

import IconClose from '@/components/icons/IconClose.vue';

const props = defineProps({
  staff: { type: Array, default: () => [] },
  targetRoleName: { type: String, default: '' }
});

defineEmits(['remove']);

const isException = (shift) => {
  // If we don't know the role (e.g. data load issue), don't flag as exception to avoid noise
  if (!shift.roleName) return false;
  return shift.roleName !== props.targetRoleName;
};
</script>

<template>
  <div class="assigned-section">
    <h4 class="section-heading">Assigned Staff</h4>

    <div v-if="staff.length > 0" class="staff-grid">
      <div
        v-for="shift in staff"
        :key="shift.id"
        class="staff-card assigned"
        role="button"
        tabindex="0"
        title="Click to remove from shift"
        @click="$emit('remove', shift)"
        @keydown.enter="$emit('remove', shift)"
      >
        <div class="staff-info">
          <span class="staff-name">{{ shift.user_name }}</span>

          <span v-if="isException(shift)" class="exception-role">
            {{ shift.roleName || 'Unknown Role' }}
          </span>
        </div>

        <div class="remove-indicator">
          <IconClose :stroke-width="2.5" />
        </div>
      </div>
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

.staff-card {
  align-items: center;

  /* Default State: Info Style */
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s ease;
  user-select: none;
}

/* Hover State: "Removal" Style */
.staff-card:hover {
  background-color: #fee2e2; /* Red-50 */
  border-color: #fca5a5; /* Red-300 */
}

/* On hover, change text colors to indicate destructive action */
.staff-card:hover .staff-name {
  color: #b91c1c; /* Red-700 */
}

.staff-card:hover .exception-role {
  color: #b91c1c;
  opacity: 0.8;
}

.staff-card:hover .remove-indicator {
  color: #b91c1c;
}

.staff-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
</style>

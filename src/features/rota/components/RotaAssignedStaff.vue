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
        @click="$emit('remove', shift)"
        @keydown.enter="$emit('remove', shift)"
        title="Click to remove from shift"
      >
        <div class="staff-info">
          <span class="staff-name">{{ shift.user_name }}</span>
          
          <span 
            v-if="isException(shift)" 
            class="exception-role"
          >
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

<script setup>
import IconClose from '../../../components/icons/IconClose.vue';

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

<style scoped>
.section-heading {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); /* Slightly wider for role text */
  gap: 0.5rem;
}

.staff-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  
  /* Default State: Info Style */
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: var(--border-radius);
  
  user-select: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Hover State: "Removal" Style */
.staff-card:hover {
  background-color: #fee2e2; /* Red-50 */
  border-color: #fca5a5;    /* Red-300 */
}

/* On hover, change text colors to indicate destructive action */
.staff-card:hover .staff-name { color: #b91c1c; /* Red-700 */ }
.staff-card:hover .exception-role { color: #b91c1c; opacity: 0.8; }
.staff-card:hover .remove-indicator { color: #b91c1c; }

.staff-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.staff-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.exception-role {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-top: 1px;
}

.remove-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-left: 0.5rem;
  color: #bae6fd; /* Subtle when not hovered */
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.empty-text {
  font-style: italic;
  color: var(--text-light);
  font-size: 0.9rem;
  padding: 0.5rem 0;
}
</style>
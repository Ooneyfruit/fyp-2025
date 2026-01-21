<template>
  <div class="assigned-section">
    <h4 class="section-heading">Assigned Staff</h4>
    
    <div v-if="staff.length > 0" class="staff-grid">
      <div 
        v-for="shift in staff" 
        :key="shift.id" 
        class="staff-card assigned"
      >
        <div class="staff-info">
          <span class="staff-name" :title="shift.user_name">{{ shift.user_name }}</span>
        </div>
        <button 
          class="action-btn remove" 
          @click="$emit('remove', shift)"
          title="Remove from shift"
        >
          <IconClose :stroke-width="2.5" />
        </button>
      </div>
    </div>
    
    <p v-else class="empty-text">No staff currently assigned.</p>
  </div>
</template>

<script setup>
import IconClose from '../../../components/icons/IconClose.vue';

defineProps({
  staff: { type: Array, default: () => [] }
});

defineEmits(['remove']);
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
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
}

.staff-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  user-select: none;
}

.staff-card.assigned {
  background: #f0f9ff;
  border-color: #bae6fd;
}

.staff-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
  display: block;
}

.action-btn.remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.action-btn.remove:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.empty-text {
  font-style: italic;
  color: var(--text-light);
  font-size: 0.9rem;
  padding: 0.5rem 0;
}
</style>
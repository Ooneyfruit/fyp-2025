<script setup>
/**
 * RotaStaffPicker
 *
 * Displays a searchable list of staff members categorized by their suitability
 * for a specific role. Allows selection of a staff member.
 */
import IconPlus from '../../../components/icons/IconPlus.vue';

// Define props with explicit types and default values to prevent runtime warnings
defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  targetRoleName: {
    type: String,
    default: ''
  },
  recommended: {
    type: Array,
    default: () => []
  },
  others: {
    type: Array,
    default: () => []
  }
});

defineEmits(['update:searchQuery', 'add']);
</script>

<template>
  <div class="picker-section">
    <h4 class="section-heading">Add Staff</h4>

    <div class="filter-bar">
      <input
        :value="searchQuery"
        type="text"
        placeholder="Search employees..."
        class="rd-input"
        @input="$emit('update:searchQuery', $event.target.value)"
      />
    </div>

    <div v-if="isLoading" class="loading-indicator">Loading practice members...</div>

    <div v-else class="available-list">
      <div v-if="recommended.length > 0" class="group">
        <div class="group-label">Recommended ({{ targetRoleName }})</div>
        <div
          v-for="member in recommended"
          :key="member.uid"
          class="staff-card available"
          @click="$emit('add', member)"
        >
          <span class="staff-name">{{ member.name }}</span>
          <IconPlus class="add-icon" />
        </div>
      </div>

      <div v-if="others.length > 0" class="group">
        <div class="group-label warning">
          {{ recommended.length === 0 ? 'All Staff' : 'Other Roles' }}
        </div>
        <div
          v-for="member in others"
          :key="member.uid"
          class="staff-card available warning-card"
          @click="$emit('add', member)"
        >
          <div class="staff-info">
            <span class="staff-name">{{ member.name }}</span>
            <span class="staff-role-badge">{{ member.roleName || 'No Role' }}</span>
          </div>
          <IconPlus class="add-icon" />
        </div>
      </div>

      <p v-if="recommended.length === 0 && others.length === 0" class="empty-text">
        {{ searchQuery ? `No matches for "${searchQuery}"` : 'No eligible staff found.' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Layout: Container for the picker sidebar */
.picker-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden; /* Contains scroll within this section */
}

.section-heading {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.filter-bar {
  margin-bottom: 1rem;
}

.rd-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.95rem;
}

/* Scrollable area for staff list */
.available-list {
  overflow-y: auto;
  padding-right: 4px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.staff-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
}

.staff-card:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

/* Visual cue for staff not matching the primary role */
.staff-card.warning-card {
  border-left: 3px solid #f59e0b;
}

.staff-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-main);
}

.staff-info {
  display: flex;
  flex-direction: column;
}

.staff-role-badge {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.add-icon {
  color: var(--text-light);
  width: 1.25rem;
  height: 1.25rem;
}

.staff-card:hover .add-icon {
  color: #3b82f6;
}

.group-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.5rem;
  padding-bottom: 4px;
}

.group-label.warning {
  color: #d97706;
  border-color: #fcd34d;
}

.loading-indicator {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-style: italic;
}

.empty-text {
  text-align: center;
  color: var(--text-light);
  font-style: italic;
  font-size: 0.9rem;
  padding: 1rem;
}
</style>

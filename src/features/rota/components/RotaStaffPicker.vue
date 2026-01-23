<script setup>
/**
 * RotaStaffPicker.
 * Primary responsibility: provides a searchable interface for selecting staff members
 * to add to the rota, with specific highlighting for recommended matches.
 */
import IconPlus from '@/components/icons/IconPlus.vue';

/**
 * @typedef {object} StaffMember
 * @property {string} uid - Unique identifier for the staff member.
 * @property {string} name - Display name of the staff member.
 * @property {string} [roleName] - Optional display name of the assigned role.
 */

// Logic: use JSDoc annotations for PropType as this is a JavaScript file.
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
    type: /** @type {import('vue').PropType<StaffMember[]>} */ (Array),
    default: () => []
  },
  others: {
    type: /** @type {import('vue').PropType<StaffMember[]>} */ (Array),
    default: () => []
  }
});

const emit = defineEmits(['update:searchQuery', 'add']);

/**
 * Handles the search input event and emits the updated query string.
 * Logic: casts the event target to an HTMLInputElement to satisfy strict type checks.
 * @param {Event} event - The native input event.
 */
const handleSearchInput = (event) => {
  const target = /** @type {HTMLInputElement} */ (event.target);

  if (target) {
    emit('update:searchQuery', target.value);
  }
};
</script>

<template>
  <div class="picker-section">
    <h4 class="section-heading">Add Staff</h4>

    <div class="filter-bar">
      <input
        class="rd-input"
        placeholder="Search employees..."
        type="text"
        :value="searchQuery"
        @input="handleSearchInput"
      />
    </div>

    <div v-if="isLoading" class="loading-indicator">Synchronising practice members...</div>

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
            <span class="staff-role-badge">
              {{ member.roleName || 'No Role' }}
            </span>
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
/* Layout: Picker sidebar container providing internal scrolling */
.picker-section {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.section-heading {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.filter-bar {
  margin-bottom: 1rem;
}

.rd-input {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.95rem;
  padding: 0.6rem;
  width: 100%;
}

/* Scrollable container for the dynamic staff list */
.available-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  padding-right: 4px;
}

.staff-card {
  align-items: center;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s;
}

.staff-card:hover {
  background: #f8fafc;
  border-color: #3b82f6;
}

/* Logic: visual indicator for staff members outside the primary role category */
.staff-card.warning-card {
  border-left: 3px solid #f59e0b;
}

.staff-name {
  color: var(--text-main);
  font-size: 0.9rem;
  font-weight: 500;
}

.staff-info {
  display: flex;
  flex-direction: column;
}

.staff-role-badge {
  color: var(--text-muted);
  font-size: 0.7rem;
}

.add-icon {
  color: var(--text-light);
  height: 1.25rem;
  width: 1.25rem;
}

.staff-card:hover .add-icon {
  color: #3b82f6;
}

.group-label {
  border-bottom: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  padding-bottom: 4px;
}

.group-label.warning {
  border-color: #fcd34d;
  color: #d97706;
}

.loading-indicator {
  color: var(--text-muted);
  font-style: italic;
  padding: 2rem;
  text-align: center;
}

.empty-text {
  color: var(--text-light);
  font-size: 0.9rem;
  font-style: italic;
  padding: 1rem;
  text-align: center;
}
</style>

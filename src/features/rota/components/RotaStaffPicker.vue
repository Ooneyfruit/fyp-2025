<script setup lang="ts">
import IconPlus from '@/components/icons/IconPlus.vue';

defineProps({
  searchQuery: String,
  isLoading: Boolean,
  targetRoleName: String,
  recommended: Array, // Staff matching role
  others: Array // Staff not matching role
});

defineEmits(['update:searchQuery', 'add']);
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
.picker-section {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden; /* Contains scroll within this section */
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

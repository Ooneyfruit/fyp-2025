<template>
  <div 
    class="rota-slot" 
    :class="{ 'has-data': hasData }"
    role="button"
    tabindex="0"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
  >
    <template v-if="hasData">
      <div 
        v-for="shift in shifts" 
        :key="shift.id" 
        class="shift-pill"
      >
        <div class="pill-content">
          <span class="initials">{{ getInitials(shift.user_name) }}</span>
          <span class="name">{{ shift.user_name }}</span>
        </div>
      </div>
    </template>
    
    <div v-else class="empty-placeholder">
      <IconPlus class="plus-icon" :stroke-width="2" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import IconPlus from '../../../components/icons/IconPlus.vue';

const props = defineProps({
  shifts: { type: Array, default: () => [] }
});

const emit = defineEmits(['click']);

const hasData = computed(() => props.shifts.length > 0);

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};
</script>

<style scoped>
.rota-slot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
  
  padding: 0.5rem;
  min-height: 4rem;
  width: 100%;
  height: 100%;
  
  background-color: var(--bg-app); 
  border: 1px solid transparent;
  border-radius: var(--border-radius);
  
  cursor: pointer;
  transition: all 0.2s ease;
}

.rota-slot:hover {
  background-color: white;
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
}

.rota-slot:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.rota-slot.has-data {
  background-color: white;
  border-color: var(--border-color);
}

.rota-slot.has-data:hover {
  border-color: #3b82f6;
}

.empty-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-light);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.rota-slot:hover .empty-placeholder {
  opacity: 1;
  color: #3b82f6;
}

@media (hover: none) {
  .empty-placeholder { opacity: 0.3; }
}

.plus-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.shift-pill {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 999px;
  padding: 0.25rem 0.5rem;
  max-width: 100%;
}

.pill-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
}

.initials {
  font-size: 0.7rem;
  font-weight: 800;
  color: #0284c7;
  flex-shrink: 0;
}

.name {
  font-size: 0.8rem;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
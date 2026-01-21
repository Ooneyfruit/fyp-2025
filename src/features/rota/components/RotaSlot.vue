<template>
  <div 
    class="rota-slot" 
    :class="{ 
      'has-data': hasData,
      'slot-weekend': isWeekend,
      'slot-weekday': !isWeekend,
      'slot-today': isToday
    }"
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
        :style="pillStyles"
      >
        <div class="pill-content">
          <span class="initials" :style="{ color: colors.accent }">
            {{ getInitials(shift.user_name) }}
          </span>
          <span class="name" :style="{ color: colors.accent }">
            {{ shift.user_name }}
          </span>
        </div>
      </div>
      
      <div class="edit-overlay">
        <div class="edit-icon-wrapper">
          <IconEdit class="edit-icon" :stroke-width="2" />
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
import IconEdit from '../../../components/icons/IconEdit.vue';
import { useRotaColors } from '../composables/useRotaColors';

const props = defineProps({
  shifts: { type: Array, default: () => [] },
  roleId: { type: String, default: null },
  isWeekend: { type: Boolean, default: false },
  isToday: { type: Boolean, default: false }
});

defineEmits(['click']);
const { getRoleColor } = useRotaColors();

const hasData = computed(() => props.shifts.length > 0);

const colors = computed(() => getRoleColor(props.roleId));

const pillStyles = computed(() => ({
  backgroundColor: colors.value.bg,
  borderColor: colors.value.accent,
  color: colors.value.accent
}));

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
  
  padding: 0.25rem;
  min-height: 4rem;
  width: 100%;
  height: 100%;
  
  position: relative;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
  
  /* UPDATED: Ensuring cursor is pointer */
  cursor: pointer; 
}

/* --- State Styling --- */

.rota-slot.slot-weekday {
  background-color: white;
  border: 1px solid #e2e8f0; 
}

.rota-slot.slot-weekend {
  background-color: #f3f4f6; 
  border: 1px solid transparent; 
}

.rota-slot.slot-today {
  background-color: #eff6ff; 
  border: 1px solid #93c5fd; 
}

/* Hover States */
.rota-slot:hover {
  background-color: white;
  border-color: #3b82f6 !important; 
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
  z-index: 10; 
}

.rota-slot:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Data Present State */
.rota-slot.has-data.slot-weekday { border-color: #e2e8f0; }
.rota-slot.has-data.slot-weekend { 
  border-color: transparent;
  background-color: #f3f4f6; 
}
.rota-slot.has-data.slot-today {
  border-color: #93c5fd;
  background-color: #eff6ff;
}
.rota-slot.has-data:hover {
  border-color: #3b82f6;
  background-color: white;
}

/* --- Placeholders & Overlays --- */

/* 1. Empty State Plus Icon */
.empty-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  color: #94a3b8; 
  opacity: 0;
  transition: all 0.2s ease;
  pointer-events: none; /* Allows hover/click to pass through to .rota-slot */
}

.rota-slot:hover .empty-placeholder,
.rota-slot.slot-today .empty-placeholder {
  opacity: 1;
}

.rota-slot:hover .empty-placeholder {
  color: #3b82f6;
  transform: scale(1.1);
}

.rota-slot.slot-today .empty-placeholder { color: #93c5fd; }
.rota-slot.slot-today:hover .empty-placeholder { color: #3b82f6; }

/* 2. Occupied State Edit Overlay */
.edit-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.6);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  border-radius: var(--border-radius);
}

.rota-slot:hover .edit-overlay {
  opacity: 1;
}

.edit-icon-wrapper {
  background: white;
  border-radius: 50%;
  padding: 6px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  color: #3b82f6;
  display: flex;
}

.edit-icon { width: 1rem; height: 1rem; }

/* UPDATED: Reduced size to be visually consistent with the edit icon */
.plus-icon { width: 1.15rem; height: 1.15rem; }

/* --- Pill Styling --- */
.shift-pill {
  border-width: 1px;
  border-style: solid;
  border-radius: 999px;
  padding: 0.125rem 0.5rem; 
  max-width: 100%;
}

.pill-content {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  overflow: hidden;
}

.initials {
  font-size: 0.7rem;
  font-weight: 800;
  flex-shrink: 0;
}

.name {
  font-size: 0.75rem;
  font-weight: 600; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
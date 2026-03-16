<script setup lang="ts">
/**
 * Grid component for selecting dates within a calendar interface.
 *
 * This component renders a standard 7-day week grid for a specific month.
 * It visually indicates the currently selected date range, highlights "today",
 * and handles user interactions for selecting a new start date. It is primarily
 * used inside the date picker modal for the mobile rota view.
 */

const props = defineProps<{
  days: { date: Date | null; id: string }[];
  selectedDate: Date;
}>();

const emit = defineEmits<(e: 'day-click', date: Date) => void>();

const THREE_DAY_OFFSET = 2;

const isSelectedRange = (date: Date | null): boolean => {
  if (!date || !props.selectedDate) return false;

  const targetTime = date.getTime();
  const startTime = props.selectedDate.getTime();
  const endTime = new Date(props.selectedDate).setDate(
    props.selectedDate.getDate() + THREE_DAY_OFFSET
  );

  return targetTime >= startTime && targetTime <= endTime;
};

const isStartOfPeriod = (date: Date | null): boolean => {
  return !!(date && props.selectedDate && date.getTime() === props.selectedDate.getTime());
};

const isToday = (date: Date | null): boolean => {
  if (!date) return false;
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

const onDayClick = (date: Date | null) => {
  if (date) {
    emit('day-click', date);
  }
};
</script>

<template>
  <div class="picker-grid">
    <div class="weekday">M</div>
    <div class="weekday">T</div>
    <div class="weekday">W</div>
    <div class="weekday">T</div>
    <div class="weekday">F</div>
    <div class="weekday">S</div>
    <div class="weekday">S</div>

    <div
      v-for="day in days"
      :key="day.id"
      class="day-cell"
      :class="{
        'active-range': isSelectedRange(day.date),
        'range-start': isStartOfPeriod(day.date),
        'is-today': isToday(day.date),
        empty: !day.date
      }"
      @click="onDayClick(day.date)"
    >
      <span class="day-number">{{ day.date ? day.date.getDate() : '' }}</span>
    </div>
  </div>
</template>

<style scoped>
.picker-grid {
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 1rem;
}

.weekday {
  color: #9ca3af;
  font-size: 0.8rem;
  text-align: center;
}

.day-cell {
  align-items: center;
  aspect-ratio: 1;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  font-size: 0.9rem;
  justify-content: center;
}

.day-cell.empty {
  cursor: default;
}

/* Highlighting Logic */
.day-cell.is-today {
  font-weight: 900;
  position: relative;
}

/* Use a dot or underline to indicate 'Today' without conflicting with selection */
.day-cell.is-today::after {
  background-color: var(--primary-color, #3b82f6);
  border-radius: 50%;
  bottom: 2px;
  content: '';
  height: 4px;
  position: absolute;
  width: 4px;
}

.day-cell.range-start.is-today::after {
  background-color: white; /* White dot if selected */
}

.day-cell.active-range {
  background-color: #eff6ff;
  border-top: 1px solid #bfdbfe;
  color: #1e3a8a;
}

.day-cell.range-start {
  background-color: #1d4ed8; /* Darker blue (blue-700) for WCAG contrast compliance */
  border-radius: 4px;
  color: white;
}
</style>

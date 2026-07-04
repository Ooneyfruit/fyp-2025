<script setup lang="ts">
/**
 * A modal with a calendar for selecting a 3-day period for the mobile rota view.
 * Supports month/year navigation and highlights the current day vs selected range.
 */
import { computed, ref } from 'vue';

import IconChevronLeft from '@/components/icons/IconChevronLeft.vue';
import IconChevronRight from '@/components/icons/IconChevronRight.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import BaseSwipeContainer from '@/components/shared/BaseSwipeContainer.vue';
import RotaDatePickerFooter from '@/features/rota/components/RotaDatePickerFooter.vue';
import RotaDayGrid from '@/features/rota/components/RotaDayGrid.vue';
import RotaMonthPicker from '@/features/rota/components/RotaMonthPicker.vue';

const props = withDefaults(
  defineProps<{
    currentDate?: Date;
  }>(),
  { currentDate: () => new Date() }
);

const emit = defineEmits<(e: 'update:date', date: Date) => void>();

// Internal State
// The month being viewed in the picker calendar
const viewDate = ref(new Date()); // Default to Today on load
// The start date of the 3-day period, pending confirmation
const selectedDate = ref(new Date(props.currentDate));
const slideDirection = ref('slide-left');
const isOpen = ref(false);

const isMonthPickerOpen = ref(false);

const SATURDAY_PADDING = 6;
const MIN_YEAR = 2000;
const MAX_YEAR = 2100;
const DOUBLE_CLICK_DELAY = 300;
const CALENDAR_GRID_SIZE = 42;

const open = () => {
  isOpen.value = true;
  // Default view to the currently selected date's month
  viewDate.value = new Date(props.currentDate);
  // Strip time from input date to ensure highlighting comparison works (grid dates are midnight)
  const d = new Date(props.currentDate);
  d.setHours(0, 0, 0, 0);
  selectedDate.value = d;
  isMonthPickerOpen.value = false;
};

// Calendar Grid Generation

const calendarDays = computed<{ date: Date | null; id: string }[]>(() => {
  const year = viewDate.value.getFullYear();
  const month = viewDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];

  // Pad the grid with empty cells to align the first day of the month correctly.
  // (0=Sun, 1=Mon, ..., 6=Sat). We want a Monday start.
  let startPadding = firstDay.getDay() - 1;
  if (startPadding < 0) startPadding = SATURDAY_PADDING; // Adjust for Sunday

  for (let i = 0; i < startPadding; i++) {
    days.push({ date: null, id: `pad-start-${i}` });
  }

  // Fill the grid with actual days of the month.
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), id: `day-${d}` });
  }

  // Pad with empty cells to ensure a constant 6-row height (6 * 7 = 42)
  while (days.length < CALENDAR_GRID_SIZE) {
    days.push({ date: null, id: `pad-end-${days.length}` });
  }

  return days;
});

// Actions

let lastClickTime = 0;
let lastClickedDateVal = 0;

const handleDayClick = (date: Date | null) => {
  if (!date) return;

  const now = Date.now();
  const clickedDateVal = date.getTime();

  if (clickedDateVal === lastClickedDateVal && now - lastClickTime < DOUBLE_CLICK_DELAY) {
    selectedDate.value = new Date(date);
    confirmSelection();
    lastClickTime = 0;
    lastClickedDateVal = 0;
  } else {
    selectedDate.value = new Date(date);
    lastClickTime = now;
    lastClickedDateVal = clickedDateVal;
  }
};

const changeMonth = (delta: number) => {
  slideDirection.value = delta > 0 ? 'slide-left' : 'slide-right';
  const newDate = new Date(viewDate.value);
  newDate.setMonth(newDate.getMonth() + delta);
  viewDate.value = newDate;
};

const setYear = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let val = Number.parseInt(input.value);
  if (!val || val < MIN_YEAR || val > MAX_YEAR) val = new Date().getFullYear();
  const newDate = new Date(viewDate.value);
  newDate.setFullYear(val);
  viewDate.value = newDate;
};

const changeYear = (delta: number) => {
  const newDate = new Date(viewDate.value);
  newDate.setFullYear(newDate.getFullYear() + delta);
  viewDate.value = newDate;
};

const selectToday = () => {
  const now = new Date();
  const viewingYear = viewDate.value.getFullYear();

  now.setHours(0, 0, 0, 0);

  slideDirection.value = now > viewDate.value ? 'slide-left' : 'slide-right';
  selectedDate.value = now;
  viewDate.value = new Date(now);

  if (viewingYear === now.getFullYear()) {
    isMonthPickerOpen.value = false;
  }
};

const selectPickerMonth = (monthIndex: number) => {
  slideDirection.value = monthIndex > viewDate.value.getMonth() ? 'slide-left' : 'slide-right';
  const newDate = new Date(viewDate.value);
  newDate.setMonth(monthIndex);
  viewDate.value = newDate;
  isMonthPickerOpen.value = false;
};

const confirmSelection = () => {
  emit('update:date', new Date(selectedDate.value));
  isOpen.value = false; // Close modal
};

const close = () => {
  isOpen.value = false;
};

const footerProps = computed(() => ({
  onReset: selectToday,
  onCancel: close,
  onConfirm: confirmSelection
}));

defineExpose({ open, close });
</script>

<template>
  <BaseModal
    :footer-component="RotaDatePickerFooter"
    :footer-props="footerProps"
    :show="isOpen"
    size="sm"
    title="Select Date"
    @request-close="close"
  >
    <div class="picker-header">
      <div class="month-nav">
        <BaseButton
          v-if="!isMonthPickerOpen"
          :icon="IconChevronLeft"
          variant="ghost"
          @click="changeMonth(-1)"
        />
        <button
          class="month-label-btn"
          type="button"
          @click="isMonthPickerOpen = !isMonthPickerOpen"
        >
          <Transition :name="slideDirection">
            <span :key="viewDate.toISOString()" class="month-name-text">
              {{ new Date(viewDate).toLocaleString('default', { month: 'long' }) }}
            </span>
          </Transition>
        </button>
        <BaseButton
          v-if="!isMonthPickerOpen"
          :icon="IconChevronRight"
          variant="ghost"
          @click="changeMonth(1)"
        />
      </div>

      <div class="year-selector">
        <input
          class="year-input"
          :max="MAX_YEAR"
          :min="MIN_YEAR"
          type="number"
          :value="viewDate.getFullYear()"
          @change="setYear"
        />
        <div class="year-controls">
          <button class="spin-btn" type="button" @click="changeYear(1)">
            <svg height="10" viewBox="0 0 24 24" width="10">
              <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" fill="currentColor"></path>
            </svg>
          </button>
          <button class="spin-btn" type="button" @click="changeYear(-1)">
            <svg height="10" viewBox="0 0 24 24" width="10">
              <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <RotaMonthPicker
      v-if="isMonthPickerOpen"
      :current-month="viewDate.getMonth()"
      :view-year="viewDate.getFullYear()"
      @select-month="selectPickerMonth"
    />
    <BaseSwipeContainer v-else @swipe-left="changeMonth(1)" @swipe-right="changeMonth(-1)">
      <div class="grid-transition-wrapper">
        <Transition :name="slideDirection">
          <RotaDayGrid
            :key="viewDate.toISOString()"
            :days="calendarDays"
            :selected-date="selectedDate"
            @day-click="handleDayClick"
          />
        </Transition>
      </div>
    </BaseSwipeContainer>
  </BaseModal>
</template>

<style scoped>
.picker-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgb(0 0 0 / 10%);
  max-width: 320px;
  padding: 1rem;
  position: relative;
  width: 100%;
}

.picker-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.year-selector {
  align-items: center;
  display: flex;
  position: relative;
}

.year-input {
  appearance: textfield;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  color: var(--text-main, #374151);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.25rem 1.5rem 0.25rem 0.5rem; /* Space for arrows */
  text-align: left;
  width: 5rem;
}

.year-input::-webkit-inner-spin-button,
.year-input::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}

.year-controls {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: absolute;
  right: 2px;
  top: 0;
}

.spin-btn {
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  height: 12px;
  justify-content: center;
  opacity: 0.5;
  padding: 0;
  width: 16px;
}

.spin-btn:hover {
  background-color: #e5e7eb;
  opacity: 1;
}

.month-nav {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

.month-label-btn {
  background: none;
  border: none;
  border-radius: 4px;
  color: var(--text-main, #374151);
  cursor: pointer;
  font-weight: 700;
  min-width: 5rem;
  overflow: hidden;
  padding: 0.25rem 0.5rem;
  position: relative;
  text-align: center;
  transition: background-color 0.2s;
}

/* Slider Transition Rules */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50%);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50%);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50%);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50%);
}

.month-name-text {
  display: block;
  width: 100%;
}

.month-label-btn .slide-left-leave-active,
.month-label-btn .slide-right-leave-active {
  left: 0;
  position: absolute;
  top: 0.25rem;
  width: 100%;
}

.grid-transition-wrapper {
  overflow: hidden;
  position: relative;
}

.grid-transition-wrapper .slide-left-leave-active,
.grid-transition-wrapper .slide-right-leave-active {
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}
</style>

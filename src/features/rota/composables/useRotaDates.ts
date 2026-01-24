import { computed, type ComputedRef, ref, watch } from 'vue';

import type { UseBreakpointsReturn } from '@/composables/useBreakpoints';

// Constants to eliminate magic numbers and comply with project linting standards.
const STORAGE_KEY = 'rotadent_view_date';
const MOBILE_DAY_COUNT = 3;
const DESKTOP_DAY_COUNT = 7;
const MONDAY_START_OFFSET = 1;
const SUNDAY_INDEX = 0;
const SATURDAY_INDEX = 6;
const MONDAY_ADJUSTMENT = -6;
const MIDNIGHT_HOUR = 0;

/**
 * Interface representing a single day column in the rota grid.
 */
export interface RotaDay {
  key: string;
  iso: string;
  label: string;
  dateObj: Date;
  isWeekend: boolean;
  isToday: boolean;
  isBeforeToday: boolean;
}

/**
 * Return interface for the composable.
 */
export interface UseRotaDatesReturn {
  currentStartDate: ComputedRef<Date>;
  visibleDays: ComputedRef<RotaDay[]>;
  monthLabel: ComputedRef<string>;
  changePeriod: (direction: number) => void;
  changeDay: (direction: number) => void;
  goToToday: () => void;
  jumpMonth: (months: number) => void;
}

/**
 * Adjusts a date object to the start of its week (Monday).
 * @param date - The date to adjust.
 * @returns The Monday of the containing week.
 */
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === SUNDAY_INDEX ? MONDAY_ADJUSTMENT : MONDAY_START_OFFSET);
  d.setDate(diff);
  d.setHours(MIDNIGHT_HOUR, MIDNIGHT_HOUR, MIDNIGHT_HOUR, MIDNIGHT_HOUR);
  return d;
};

/**
 * Retrieves the initial anchor date from local storage or defaults to today.
 * @returns The initialised anchor date.
 */
const getInitialAnchorDate = (): Date => {
  const saved = localStorage.getItem(STORAGE_KEY);
  const now = new Date();
  now.setHours(MIDNIGHT_HOUR, MIDNIGHT_HOUR, MIDNIGHT_HOUR, MIDNIGHT_HOUR);

  if (saved) {
    const d = new Date(saved);
    // Logic: use Number.isNaN as required by unicorn and sonarlint rules.
    if (!Number.isNaN(d.getTime())) {
      return d;
    }
  }
  return now;
};

/**
 * Standardises a date into a long-form month and year string.
 * @param d - The date to format.
 * @returns Formatted month and year (e.g. "January 2025").
 */
const formatMonthYear = (d: Date): string =>
  new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(d);

/**
 * Formats a date range into a readable month label for the header.
 * Logic: uses optional chaining and null checks to resolve "possibly undefined" errors.
 * @param days - The visible days in the current view.
 * @returns Formatted month/year range string.
 */
const formatMonthLabel = (days: RotaDay[]): string => {
  const start = days[SUNDAY_INDEX]?.dateObj;
  const end = days.at(-1)?.dateObj;

  // Verify both boundary dates exist before attempting to format the range label.
  if (!start || !end) {
    return '';
  }

  const startLabel = formatMonthYear(start);
  const endLabel = formatMonthYear(end);

  return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
};

/**
 * Generates an array of day objects for the rota grid view.
 * @param startDate - The beginning of the view range.
 * @param count - Number of days to generate.
 * @returns Collection of day descriptors.
 */
const generateDaysArray = (startDate: Date, count: number): RotaDay[] => {
  const days: RotaDay[] = [];
  const today = new Date();
  today.setHours(MIDNIGHT_HOUR, MIDNIGHT_HOUR, MIDNIGHT_HOUR, MIDNIGHT_HOUR);
  const todayStr = today.toISOString().split('T')[0];

  for (let i = 0; i < count; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    days.push({
      key: iso,
      iso,
      label: new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric' }).format(d),
      dateObj: d,
      isWeekend: d.getDay() === SUNDAY_INDEX || d.getDay() === SATURDAY_INDEX,
      isToday: iso === todayStr,
      isBeforeToday: d < today
    });
  }
  return days;
};

/**
 * Manages date logic for the Rota view with persistence and cross-breakpoint consistency.
 * Logic: ensures a 'universal truth' for the currently viewed date to prevent navigation drift.
 * @param breakpoints - Breakpoints composable for responsive logic.
 * @returns Date state and control methods.
 */
export function useRotaDates(breakpoints: UseBreakpointsReturn): UseRotaDatesReturn {
  const anchorDate = ref(getInitialAnchorDate());

  // Watch for changes to the anchor and persist to local storage.
  watch(anchorDate, (val) => localStorage.setItem(STORAGE_KEY, val.toISOString()));

  const currentStartDate = computed(() =>
    breakpoints.isMobile.value ? anchorDate.value : getStartOfWeek(anchorDate.value)
  );

  const visibleDays = computed(() =>
    generateDaysArray(
      currentStartDate.value,
      breakpoints.isMobile.value ? MOBILE_DAY_COUNT : DESKTOP_DAY_COUNT
    )
  );

  const changePeriod = (direction: number) => {
    const d = new Date(anchorDate.value);
    const offset = breakpoints.isMobile.value ? MOBILE_DAY_COUNT : DESKTOP_DAY_COUNT;
    d.setDate(d.getDate() + direction * offset);
    anchorDate.value = d;
  };

  const jumpMonth = (months: number) => {
    const d = new Date(anchorDate.value);
    const originalDay = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, SUNDAY_INDEX).getDate();
    d.setDate(Math.min(originalDay, lastDay));
    anchorDate.value = d;
  };

  return {
    currentStartDate,
    visibleDays,
    monthLabel: computed(() => formatMonthLabel(visibleDays.value)),
    changePeriod,
    changeDay: (direction: number) => {
      const d = new Date(anchorDate.value);
      d.setDate(d.getDate() + direction);
      anchorDate.value = d;
    },
    goToToday: () => {
      const now = new Date();
      now.setHours(MIDNIGHT_HOUR, MIDNIGHT_HOUR, MIDNIGHT_HOUR, MIDNIGHT_HOUR);
      anchorDate.value = now;
    },
    jumpMonth
  };
}

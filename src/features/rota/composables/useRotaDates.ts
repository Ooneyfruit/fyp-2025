/**
 * (needs description).
 */

import { computed, type ComputedRef, ref, watch } from 'vue';

import type { UseBreakpointsReturn } from '@/composables/useBreakpoints';

/**
 * Interface representing a single day in the rota grid.
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
 * Return type for the useRotaDates composable.
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

const STORAGE_KEY = 'rotadent_view_date';
const DAYS_IN_WEEK = 7;
const MOBILE_DAYS_COUNT = 3;
const SUNDAY = 0;
const SATURDAY = 6;
const MONDAY_INDEX = 1;
const SUNDAY_TO_MONDAY_OFFSET = -6;
const MIDNIGHT = 0;
const MONTH_START = 1;

/**
 * Returns a new Date object set to midnight of the provided date or now.
 * @param date - The date to use. Defaults to current date.
 * @returns The date at midnight.
 */
const getMidnightDate = (date?: Date): Date => {
  const d = date ? new Date(date) : new Date();
  d.setHours(MIDNIGHT, MIDNIGHT, MIDNIGHT, MIDNIGHT);
  return d;
};

/**
 * Adjusts a date object to the start of its week (Monday).
 * @param date - The date to adjust.
 * @returns The Monday of the containing week.
 */
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust to Monday. Sunday requires a larger backward jump than other days.
  const diff = d.getDate() - day + (day === SUNDAY ? SUNDAY_TO_MONDAY_OFFSET : MONDAY_INDEX);
  d.setDate(diff);
  return getMidnightDate(d);
};

/**
 * Checks if a specific date falls within the 7-day week starting from a given Monday.
 * @param target - The date to check.
 * @param monday - The Monday start of the week.
 * @returns True if the target date is within the week.
 */
const isDateInCurrentWeek = (target: Date, monday: Date): boolean => {
  const start = monday.getTime();
  // Calculate the end of the week based on the Monday start.
  const end = new Date(monday).setDate(monday.getDate() + DAYS_IN_WEEK);
  const time = target.getTime();
  return time >= start && time < end;
};

/**
 * Determines the correct anchor date when transitioning to mobile view.
 * @param currentAnchor - The existing anchor date.
 * @returns The new anchor date for mobile.
 */
const getMobileTransitionAnchor = (currentAnchor: Date): Date => {
  const today = getMidnightDate();
  const monday = getStartOfWeek(currentAnchor);
  // Default to Monday (zooming into Mon, Tue, Wed) unless today is visible in the week.
  return isDateInCurrentWeek(today, monday) ? today : monday;
};

/**
 * Generates a date object shifted by a specific number of days.
 * @param base - Initial date.
 * @param days - Number of days to add.
 * @returns New shifted date object.
 */
const createShiftedDate = (base: Date, days: number): Date => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Formats a date to the long month and year format (British English).
 * @param d - The date to format.
 * @returns Formatted month and year.
 */
const formatMonthYear = (d: Date): string =>
  new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(d);

/**
 * Provides a display label for the current month range based on visible days.
 * @param days - The list of visible days.
 * @returns The formatted month label.
 */
const formatViewLabel = (days: RotaDay[]): string => {
  if (days.length === 0) return '';
  const start = formatMonthYear(days[0].dateObj);
  const endObj = days.at(-1)?.dateObj;
  // If the period spans two months, show both labels. Otherwise, show one.
  const end = endObj ? formatMonthYear(endObj) : start;
  return start === end ? start : `${start} - ${end}`;
};

/**
 * Generates an array of rota days based on the start date and count.
 * @param start - The first date of the range.
 * @param count - The number of days to generate.
 * @returns Array of formatted rota day objects.
 */
const generateRotaDays = (start: Date, count: number): RotaDay[] => {
  const today = getMidnightDate();
  const todayStr = today.toISOString().split('T')[0];

  return Array.from({ length: count }, (_, i) => {
    const d = createShiftedDate(start, i);
    const iso = d.toISOString().split('T')[0];
    return {
      key: iso,
      iso,
      label: new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric' }).format(d),
      dateObj: d,
      isWeekend: d.getDay() === SUNDAY || d.getDay() === SATURDAY,
      isToday: iso === todayStr,
      isBeforeToday: d < today
    };
  });
};

/**
 * Calculates a new date by jumping a specific number of months.
 * @param anchor - The current anchor date.
 * @param months - The number of months to jump.
 * @returns The resulting date.
 */
const calculateMonthJump = (anchor: Date, months: number): Date => {
  const d = new Date(anchor);
  const day = d.getDate();
  // Set to the first of the month to avoid clipping on shorter target months.
  d.setDate(MONTH_START);
  d.setMonth(d.getMonth() + months);
  // Cap the day by the actual length of the new month.
  const lastDayInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDayInMonth));
  return d;
};

/**
 * Initialises the anchor date from storage or defaults to today at midnight.
 * @returns The initialised anchor date.
 */
const getInitialDate = (): Date => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const d = new Date(saved);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return getMidnightDate();
};

/**
 * Manages date logic for the Rota view with persistence and cross-breakpoint consistency.
 * @param breakpoints - Breakpoints composable for responsive logic.
 * @returns Date state and control methods.
 */
export function useRotaDates(breakpoints: UseBreakpointsReturn): UseRotaDatesReturn {
  const anchorDate = ref(getInitialDate());

  // Handle snapping logic when the layout shifts between mobile and desktop.
  watch(breakpoints.isMobile, (isMobile) => {
    if (isMobile) {
      anchorDate.value = getMobileTransitionAnchor(anchorDate.value);
    }
  });

  watch(anchorDate, (val) => {
    localStorage.setItem(STORAGE_KEY, val.toISOString());
  });

  const currentStartDate = computed(() =>
    breakpoints.isMobile.value ? anchorDate.value : getStartOfWeek(anchorDate.value)
  );

  const visibleDays = computed(() =>
    generateRotaDays(
      currentStartDate.value,
      breakpoints.isMobile.value ? MOBILE_DAYS_COUNT : DAYS_IN_WEEK
    )
  );

  const monthLabel = computed(() => formatViewLabel(visibleDays.value));

  const changePeriod = (direction: number): void => {
    const offset = breakpoints.isMobile.value ? MOBILE_DAYS_COUNT : DAYS_IN_WEEK;
    anchorDate.value = createShiftedDate(anchorDate.value, direction * offset);
  };

  const changeDay = (direction: number): void => {
    anchorDate.value = createShiftedDate(anchorDate.value, direction);
  };

  const goToToday = (): void => {
    anchorDate.value = getMidnightDate();
  };

  const jumpMonth = (months: number): void => {
    anchorDate.value = calculateMonthJump(anchorDate.value, months);
  };

  return {
    currentStartDate,
    visibleDays,
    monthLabel,
    changePeriod,
    changeDay,
    goToToday,
    jumpMonth
  };
}

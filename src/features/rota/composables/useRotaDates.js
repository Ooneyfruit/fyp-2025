import { computed, ref, watch } from 'vue';

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
 * @typedef {object} RotaDay
 * @property {string} key - Unique key for list rendering.
 * @property {string} iso - ISO date string.
 * @property {string} label - Formatted weekday and day.
 * @property {Date} dateObj - Native date object.
 * @property {boolean} isWeekend - Weekend flag.
 * @property {boolean} isToday - Current date flag.
 * @property {boolean} isBeforeToday - Past date flag.
 */

/**
 * @typedef {object} Breakpoints
 * @property {import('vue').Ref<boolean>} isMobile - Reactive mobile state.
 */

/**
 * Adjusts a date object to the start of its week (Monday).
 * @param {Date} date - The date to adjust.
 * @returns {Date} The Monday of the containing week.
 */
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === SUNDAY_INDEX ? MONDAY_ADJUSTMENT : MONDAY_START_OFFSET);
  d.setDate(diff);
  d.setHours(MIDNIGHT_HOUR, MIDNIGHT_HOUR, MIDNIGHT_HOUR, MIDNIGHT_HOUR);
  return d;
};

/**
 * Retrieves the initial anchor date from local storage or defaults to today.
 * @returns {Date} The initialised anchor date.
 */
const getInitialAnchorDate = () => {
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
 * @param {Date} d - The date to format.
 * @returns {string} Formatted month and year (e.g. "January 2025").
 */
const formatMonthYear = (d) =>
  new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(d);

/**
 * Formats a date range into a readable month label for the header.
 * Logic: uses optional chaining and null checks to resolve "possibly undefined" errors.
 * @param {RotaDay[]} days - The visible days in the current view.
 * @returns {string} Formatted month/year range string.
 */
const formatMonthLabel = (days) => {
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
 * @param {Date} startDate - The beginning of the view range.
 * @param {number} count - Number of days to generate.
 * @returns {RotaDay[]} Collection of day descriptors.
 */
const generateDaysArray = (startDate, count) => {
  const days = [];
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
 * @param {Breakpoints} breakpoints - Breakpoints composable for responsive logic.
 * @returns {object} Date state and control methods.
 */
export function useRotaDates(breakpoints) {
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

  const changePeriod = (/** @type {number} */ direction) => {
    const d = new Date(anchorDate.value);
    const offset = breakpoints.isMobile.value ? MOBILE_DAY_COUNT : DESKTOP_DAY_COUNT;
    d.setDate(d.getDate() + direction * offset);
    anchorDate.value = d;
  };

  const jumpMonth = (/** @type {number} */ months) => {
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
    changeDay: (/** @type {number} */ direction) => {
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

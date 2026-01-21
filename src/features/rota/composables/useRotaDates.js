import { ref, computed, watch } from 'vue';

/**
 * Manages date logic for the Rota view with persistence and cross-breakpoint consistency.
 * Ensures a 'universal truth' for the currently viewed date to prevent navigation drift.
 * @param {Object} breakpoints - Breakpoints composable for responsive logic.
 * @returns {Object} Date state and control methods.
 */
export function useRotaDates(breakpoints) {
  const STORAGE_KEY = 'rotadent_view_date';
  
  // The Anchor Date is the persistent 'point of truth' for the viewer's location in time.
  const anchorDate = ref(new Date());

  /**
   * Adjusts a date object to the start of its week (Monday).
   * @param {Date} date - The date to adjust.
   * @returns {Date} The Monday of the containing week.
   */
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  /**
   * Initialises the view from storage or defaults to today.
   */
  const init = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (saved) {
      const d = new Date(saved);
      if (!isNaN(d.getTime())) {
        anchorDate.value = d;
        return;
      }
    }
    anchorDate.value = now;
  };

  init();

  // Watch for changes to the anchor and persist to local storage.
  watch(anchorDate, (val) => {
    localStorage.setItem(STORAGE_KEY, val.toISOString());
  });

  /**
   * Calculates the start date for the current view.
   * Desktop (7-day) always snaps to Monday. Mobile (3-day) uses the exact anchor.
   */
  const currentStartDate = computed(() => {
    return breakpoints.isMobile.value 
      ? anchorDate.value 
      : getStartOfWeek(anchorDate.value);
  });

  const visibleDays = computed(() => {
    const days = [];
    const count = breakpoints.isMobile.value ? 3 : 7;
    const start = new Date(currentStartDate.value);
    
    // Create a date object for 'today' set to midnight for accurate comparison.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    for (let i = 0; i < count; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      
      const iso = d.toISOString().split('T')[0];
      days.push({
        key: iso,
        iso,
        label: new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric' }).format(d),
        dateObj: d,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        isToday: iso === todayStr,
        isBeforeToday: d < today
      });
    }
    return days;
  });

  const monthLabel = computed(() => {
    if (!visibleDays.value.length) return '';
    const start = visibleDays.value[0].dateObj;
    const end = visibleDays.value[visibleDays.value.length - 1].dateObj;
    const format = (d) => new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(d);
    
    return format(start) === format(end) ? format(start) : `${format(start)} - ${format(end)}`;
  });

  const changePeriod = (direction) => {
    const d = new Date(anchorDate.value);
    const offset = breakpoints.isMobile.value ? 3 : 7;
    d.setDate(d.getDate() + (direction * offset));
    anchorDate.value = d;
  };

  const changeDay = (direction) => {
    const d = new Date(anchorDate.value);
    d.setDate(d.getDate() + direction);
    anchorDate.value = d;
  };

  const goToToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    anchorDate.value = now;
  };

  const jumpMonth = (months) => {
    const d = new Date(anchorDate.value);
    const originalDay = d.getDate();
    // Use the 1st of the month to prevent clipping issues with shorter months.
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    
    // Restore the day, capped by the end of the new month.
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(originalDay, lastDay));
    
    anchorDate.value = d;
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
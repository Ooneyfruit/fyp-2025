import { ref, computed, watch } from 'vue';
import { useRotaResponsiveLogic } from './useRotaResponsiveLogic';

/**
 * Manages date logic for the Rota view, including persistence and navigation.
 * @param {Object} breakpoints - Breakpoints composable for responsive logic
 * @returns {Object} Date state and control methods
 */
export function useRotaDates(breakpoints) {
  const STORAGE_KEY = 'rotadent_view_date';
  const currentStartDate = ref(new Date());

  /**
   * Adjusts a date object to the start of its week (Monday).
   * @param {Date|string} date - The date to adjust
   * @returns {Date} The Monday of the containing week
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
   * Initializes the view date.
   * Checks localStorage for a saved date; otherwise defaults to the current week.
   */
  const initDate = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const d = new Date(saved);
      if (!isNaN(d.getTime())) {
        currentStartDate.value = breakpoints.isMobile.value ? d : getStartOfWeek(d);
        return;
      }
    }
    // Default to today if mobile, or start of week if desktop
    const now = new Date();
    currentStartDate.value = breakpoints.isMobile.value 
      ? new Date(now.setHours(0, 0, 0, 0)) 
      : getStartOfWeek(now);
  };

  initDate();

  // [Logic] Enshrine the responsive switching logic in the dedicated composable
  useRotaResponsiveLogic(breakpoints.isMobile, currentStartDate, getStartOfWeek);

  watch(currentStartDate, (newDate) => {
    localStorage.setItem(STORAGE_KEY, newDate.toISOString());
  });

  const visibleDays = computed(() => {
    const days = [];
    const count = breakpoints.isMobile.value ? 3 : 7;
    const start = new Date(currentStartDate.value);
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < count; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      
      const dayNum = d.getDay(); // 0 = Sun, 1 = Mon ...
      const iso = d.toISOString().split('T')[0];
      
      const isWeekend = dayNum === 0 || dayNum === 6;
      const isToday = iso === todayStr;

      days.push({
        key: iso,
        iso,
        label: new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric' }).format(d),
        dateObj: d,
        isWeekend,
        isToday
      });
    }
    return days;
  });

  const monthLabel = computed(() => {
    if (visibleDays.value.length === 0) return '';
    const start = visibleDays.value[0].dateObj;
    const end = visibleDays.value[visibleDays.value.length - 1].dateObj;
    const startStr = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(start);
    const endStr = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(end);
    return startStr === endStr ? startStr : `${startStr} - ${endStr}`;
  });

  /**
   * Moves the view by a standard period (Week or 3 Days).
   * @param {number} direction - Positive for forward, negative for backward
   */
  const changePeriod = (direction) => {
    const d = new Date(currentStartDate.value);
    const offset = breakpoints.isMobile.value ? 3 : 7;
    d.setDate(d.getDate() + (direction * offset));
    currentStartDate.value = d;
  };

  /**
   * Moves the view by a single day.
   * Used for fine precision navigation in 3-day view.
   * @param {number} direction - Positive for forward, negative for backward
   */
  const changeDay = (direction) => {
    const d = new Date(currentStartDate.value);
    d.setDate(d.getDate() + direction);
    currentStartDate.value = d;
  };

  const goToToday = () => {
    const now = new Date();
    currentStartDate.value = breakpoints.isMobile.value 
      ? new Date(now.setHours(0, 0, 0, 0)) 
      : getStartOfWeek(now);
  };

  /**
   * Jumps the view by a specified number of months.
   * Anchors the jump to the Thursday (middle) of the current view to minimize
   * the "drift" that happens when aligning different length months to Mondays.
   * @param {number} months - Number of months to jump
   */
  const jumpMonth = (months) => {
    const current = new Date(currentStartDate.value);
    // Anchor to Thursday (Start + 3 days)
    const anchor = new Date(current);
    anchor.setDate(current.getDate() + 3);
    
    // Move the month on the anchor date
    anchor.setMonth(anchor.getMonth() + months);
    
    // Snap back to the Monday of that new anchor's week if on desktop
    currentStartDate.value = breakpoints.isMobile.value ? anchor : getStartOfWeek(anchor);
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
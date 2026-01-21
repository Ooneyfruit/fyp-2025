import { ref, computed, watch } from 'vue';

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
   * @param {Date|string} date 
   * @returns {Date} The Monday of the containing week
   */
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
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
        currentStartDate.value = getStartOfWeek(d);
        return;
      }
    }
    currentStartDate.value = getStartOfWeek(new Date());
  };

  initDate();

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

  const changePeriod = (direction) => {
    const d = new Date(currentStartDate.value);
    const offset = breakpoints.isMobile.value ? 3 : 7;
    d.setDate(d.getDate() + (direction * offset));
    currentStartDate.value = d;
  };

  const goToToday = () => {
    currentStartDate.value = getStartOfWeek(new Date());
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
    
    // Snap back to the Monday of that new anchor's week
    currentStartDate.value = getStartOfWeek(anchor);
  };

  watch(() => breakpoints.isMobile.value, (isMobile) => {
    const now = new Date();
    const currentViewStart = new Date(currentStartDate.value);
    const viewWeekStart = getStartOfWeek(currentViewStart);
    const viewWeekEnd = new Date(viewWeekStart);
    viewWeekEnd.setDate(viewWeekEnd.getDate() + 6);
    
    const isCurrentRealTimeWeek = now >= viewWeekStart && now <= viewWeekEnd;

    if (isMobile) {
      if (isCurrentRealTimeWeek) {
        currentStartDate.value = getStartOfWeek(now);
      } else {
        currentStartDate.value = viewWeekStart;
      }
    } else {
      currentStartDate.value = viewWeekStart;
    }
  });

  return {
    currentStartDate,
    visibleDays,
    monthLabel,
    changePeriod,
    goToToday,
    jumpMonth
  };
}
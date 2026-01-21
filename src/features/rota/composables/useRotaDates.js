import { ref, computed, watch } from 'vue';

export function useRotaDates(breakpoints) {
  const currentStartDate = ref(new Date());

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
  };

  currentStartDate.value = getStartOfWeek(new Date());

  const visibleDays = computed(() => {
    const days = [];
    const count = breakpoints.isMobile.value ? 3 : 7;
    const start = new Date(currentStartDate.value);

    for (let i = 0; i < count; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      
      const dayNum = d.getDay(); // 0 = Sun, 1 = Mon ...
      
      // Feature: Color Coding Logic
      // Tuesday (2) & Thursday (4) -> Alt Color
      // Saturday (6) & Sunday (0) -> Weekend Color
      const isAlt = dayNum === 2 || dayNum === 4;
      const isWeekend = dayNum === 0 || dayNum === 6;

      days.push({
        key: d.toISOString().split('T')[0],
        iso: d.toISOString().split('T')[0],
        label: new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric' }).format(d),
        dateObj: d,
        isAlt,
        isWeekend
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

  watch(() => breakpoints.isMobile.value, (isMobile) => {
    const now = new Date();
    const currentViewStart = new Date(currentStartDate.value);
    const viewWeekStart = getStartOfWeek(currentViewStart);
    const viewWeekEnd = new Date(viewWeekStart);
    viewWeekEnd.setDate(viewWeekEnd.getDate() + 6);
    
    const isCurrentRealTimeWeek = now >= viewWeekStart && now <= viewWeekEnd;

    if (isMobile) {
      if (isCurrentRealTimeWeek) {
        currentStartDate.value = now;
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
    changePeriod
  };
}
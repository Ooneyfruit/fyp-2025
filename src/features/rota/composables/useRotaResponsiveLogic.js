import { watch } from 'vue';

/**
 * Manages the logic for preserving or resetting the view date when the viewport changes.
 * Enshrines the rule: switching to mobile (3-day) view during the current week snaps the view to "Today".
 * @param {import('vue').Ref<boolean>} isMobile - Reactive reference indicating if the device is mobile.
 * @param {import('vue').Ref<Date>} currentStartDate - The current start date of the rota view.
 * @param {Function} getStartOfWeek - Helper to calculate the Monday of a given date.
 */
export function useRotaResponsiveLogic(isMobile, currentStartDate, getStartOfWeek) {
  watch(isMobile, (mobileActive) => {
    const now = new Date();
    const currentViewStart = new Date(currentStartDate.value);
    
    // Calculate the boundaries of the week currently being viewed
    const viewWeekStart = getStartOfWeek(currentViewStart);
    const viewWeekEnd = new Date(viewWeekStart);
    viewWeekEnd.setDate(viewWeekEnd.getDate() + 6);
    
    // Check if "Today" falls within the currently viewed week
    const isCurrentRealTimeWeek = now >= viewWeekStart && now <= viewWeekEnd;

    if (mobileActive) {
      if (isCurrentRealTimeWeek) {
        // [Logic] Snap to "Today" if we are viewing the current week on mobile
        // This ensures the current day is the first of the 3 days on the left
        currentStartDate.value = new Date(now.setHours(0, 0, 0, 0));
      } else {
        // Otherwise, maintain the start of the week relative to the previous view
        currentStartDate.value = viewWeekStart;
      }
    } else {
      // [Logic] Always revert to Monday start when returning to desktop (7-day) view
      currentStartDate.value = viewWeekStart;
    }
  });
}
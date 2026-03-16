/**
 * Composable for managing application navigation state.
 * Centralises the menu configuration and permission logic.
 */
import { computed, markRaw } from 'vue';

import IconCalendar from '@/components/icons/IconCalendar.vue';
import IconSettings from '@/components/icons/IconSettings.vue';
import IconUsers from '@/components/icons/IconUsers.vue';
import { useAuth } from '@/composables/useAuth';
import { type NavItem } from '@/features/navbar/navTypes';

/**
 * Provides access to the filtered navigation menu based on user permissions.
 * @returns An object containing the filtered list of menu items.
 */
export function useNavigation() {
  const { user } = useAuth();

  /**
   * Primary navigation configuration.
   * Defines the static map of available system routes.
   */
  const MENU_CONFIG: NavItem[] = [
    { label: 'Rota', icon: markRaw(IconCalendar), to: '/', requiresAdmin: false },
    { label: 'User Management', icon: markRaw(IconUsers), to: '/users', requiresAdmin: true },
    {
      label: 'Practice Settings',
      icon: markRaw(IconSettings),
      to: '/settings',
      requiresAdmin: true
    }
  ];

  const filteredMenuItems = computed(() => {
    // Filter out restricted items if the user does not have administrator privileges.
    return MENU_CONFIG.filter((item) => (item.requiresAdmin ? user.value?.is_administrator : true));
  });

  return {
    filteredMenuItems
  };
}

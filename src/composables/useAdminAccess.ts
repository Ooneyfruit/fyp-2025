/**
 * Security composable to enforce administrator privileges within a view.
 * Watches the authenticated user state and redirects if permissions are revoked
 * (e.g., when switching practices).
 */
import { watch } from 'vue';
import { useRouter } from 'vue-router';

import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';

/**
 * Enforces admin-only access for the current component.
 * Redirects to the root path if the user lacks 'is_administrator' status.
 */
export function useAdminAccess() {
  const { user } = useAuth();
  const router = useRouter();
  const { error: notifyError } = useToast();

  watch(
    () => user.value,
    (currentUser) => {
      // If the user is authenticated but lacks admin privileges, boot them.
      if (currentUser && !currentUser.is_administrator) {
        notifyError('Access denied: You are not an administrator for this practice.');
        router.push('/');
      }
    },
    { deep: true, immediate: true }
  );
}

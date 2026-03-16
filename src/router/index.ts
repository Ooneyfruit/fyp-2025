/**
 * Central routing configuration and navigation guards.
 * Manages access control, authentication state synchronisation, and view mapping.
 */
import { watch } from 'vue';
import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router';

import { isAuthReady, user } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';

/**
 * Interface representing the user properties required by the router.
 * Extracted from original documentation definitions.
 */
interface RouterUser {
  is_administrator?: boolean;
  uid: string;
}

/**
 * Define the application routes.
 * Views are imported dynamically to facilitate code-splitting and reduce the initial bundle size.
 */
const routes = [
  {
    path: '/',
    // Dynamic import for the primary landing view.
    component: () => import('@/views/RotaView.vue')
  },
  {
    path: '/users',
    // Component only loads when the /users path is accessed.
    component: () => import('@/views/UserView.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/repair',
    component: () => import('@/views/AdminRepairView.vue')
  },
  {
    path: '/404',
    component: () => import('@/views/NotFoundView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

/**
 * Navigation guard to enforce authentication and role-based access.
 * Uses return-based navigation control to satisfy modern Vue Router standards.
 * * @param to - Target route.
 * @returns Resolves with a route path for redirection or undefined to proceed.
 */
router.beforeEach(async (to: RouteLocationNormalized): Promise<string | void> => {
  const { error: notifyError } = useToast();

  // Ensure the authentication listener has completed its initial check before proceeding.
  // This prevents race conditions where a user is redirected to login before the session is restored.
  if (!isAuthReady.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(isAuthReady, (ready) => {
        if (ready) {
          unwatch();
          resolve();
        }
      });
    });
  }

  // Cast the generic user ref to our specific RouterUser interface.
  const currentUser = user.value as RouterUser | null;

  // Redirect unauthenticated users to the login page unless they are already navigating there.
  if (!currentUser && to.path !== '/login') {
    return '/login';
  }

  // Restrict access to administrative views based on the user profile flag.
  if (to.meta.requiresAdmin && currentUser?.is_administrator !== true) {
    // Notify the user of the permission failure to improve the feedback loop.
    notifyError('Access denied: administrator privileges required.');
    return '/';
  }
});

export default router;

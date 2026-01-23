/**
 * @file index.js
 * @description Central routing configuration and navigation guards.
 * Manages access control, authentication state synchronisation, and view mapping.
 */
import { watch } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import { isAuthReady, user } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import AdminRepairView from '@/views/AdminRepairView.vue';
import LoginView from '@/views/LoginView.vue';
import RotaView from '@/views/RotaView.vue';
import UserView from '@/views/UserView.vue';

/**
 * @typedef {object} RouterUser
 * @property {boolean} is_administrator - Flag indicating if the user has admin rights.
 * @property {string} uid - Unique identifier for the authenticated user.
 */

const routes = [
  { path: '/', component: RotaView }, // Updated to point to the new Rota view
  {
    path: '/users',
    component: UserView,
    meta: { requiresAdmin: true }
  },
  { path: '/login', component: LoginView },
  { path: '/repair', component: AdminRepairView }
];

const router = createRouter({ history: createWebHistory(), routes });

// Navigation guard to enforce authentication and role-based access.
router.beforeEach(async (to, from, next) => {
  const { error: notifyError } = useToast();

  // Ensure the authentication listener has completed its initial check before proceeding.
  // This prevents race conditions where a user is redirected to login before the session is restored.
  if (!isAuthReady.value) {
    await /** @type {Promise<void>} */ (
      new Promise((resolve) => {
        const unwatch = watch(isAuthReady, (ready) => {
          if (ready) {
            unwatch();
            resolve();
          }
        });
      })
    );
  }

  const currentUser = /** @type {RouterUser | null} */ (user.value);

  // Redirect unauthenticated users to the login page unless they are already navigating there.
  if (!currentUser && to.path !== '/login') {
    return next('/login');
  }

  // Restrict access to administrative views based on the user profile flag.
  if (to.meta.requiresAdmin && (!currentUser || currentUser.is_administrator !== true)) {
    // Notify the user of the permission failure to improve the feedback loop.
    notifyError('Access denied: administrator privileges required.');
    return next('/');
  }

  next();
});

export default router;

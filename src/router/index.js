import { watch } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import { isAuthReady,user } from '../composables/useAuth';
import AdminRepairView from '../views/AdminRepairView.vue';
import LoginView from '../views/LoginView.vue';
import RotaView from '../views/RotaView.vue';
import UserView from '../views/UserView.vue';

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

router.beforeEach(async (to, from, next) => {
  // 1. Wait for Auth and Contextual Permissions to resolve
  if (!isAuthReady.value) {
    await new Promise((resolve) => {
      const unwatch = watch(isAuthReady, (ready) => {
        if (ready) {
          unwatch();
          resolve();
        }
      });
    });
  }

  const currentUser = user.value;

  // 2. Handle Login Redirection
  if (!currentUser && to.path !== '/login') {
    return next('/login');
  }

  // 3. Protect Admin Routes
  if (to.meta.requiresAdmin && (!currentUser || currentUser.is_administrator !== true)) {
      console.error('Router Block: Admin privileges required for', to.path);
      return next('/');
    }

  next();
});

export default router;

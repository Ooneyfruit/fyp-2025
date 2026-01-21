import RotaView from '../views/RotaView.vue';
import UserView from '../views/UserView.vue';
import LoginView from '../views/LoginView.vue';
import AdminRepairView from '../views/AdminRepairView.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { user, isAuthReady } from '../composables/useAuth';
import { watch } from 'vue';

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
    await new Promise(resolve => {
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
  if (to.meta.requiresAdmin) {
    if (!currentUser || currentUser.is_administrator !== true) {
      console.error("Router Block: Admin privileges required for", to.path);
      return next('/');
    }
  }

  next();
});

export default router;
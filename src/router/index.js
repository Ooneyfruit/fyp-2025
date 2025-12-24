import HomeView from '../views/HomeView.vue';
import UserView from '../views/UserView.vue';
import LoginView from '../views/LoginView.vue';
import AdminRepairView from '../views/AdminRepairView.vue'; // Add this import
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { createRouter, createWebHistory } from 'vue-router';
import { user, isAuthReady } from '../composables/useAuth';
import { watch } from 'vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/users', component: UserView, meta: { requiresAdmin: true } },
  { path: '/login', component: LoginView },
  { path: '/repair', component: AdminRepairView } // Add this route temporarily
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach(async (to, from, next) => {
  // 1. Wait for Auth to resolve (Atomic Sync from Step 2)
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

  // 2. Protect Admin Routes
  if (to.meta.requiresAdmin) {
    // Check the verified is_administrator status for the current practice context
    if (!currentUser || !currentUser.is_administrator) {
      console.warn("Security Alert: Unauthorized access attempt to Admin route.");
      return next('/');
    }
  }

  // 3. Protect Authenticated Routes
  if (!currentUser && to.path !== '/login') {
    return next('/login');
  }

  next();
});

export default router;
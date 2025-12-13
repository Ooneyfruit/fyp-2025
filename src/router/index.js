import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import StaffView from '../views/StaffView.vue';
import LoginView from '../views/LoginView.vue';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const routes = [
  { path: '/', component: HomeView },
  { path: '/staff', component: StaffView },
  { path: '/login', component: LoginView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// --- THE FIX: Helper to wait for Firebase to initialize ---
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    // We try to remove the listener immediately after it fires once
    const removeListener = onAuthStateChanged(auth, 
      (user) => {
        removeListener(); // Unsubscribe immediately
        resolve(user);
      },
      reject
    );
  });
};

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  // Await the actual status from Firebase
  const user = await getCurrentUser();
  
  if (to.path === '/login' && user) {
    // If logged in, don't let them go to Login page
    next('/');
  } else if (to.path !== '/login' && !user) {
    // If not logged in, and trying to go elsewhere, send to Login
    next('/login');
  } else {
    // Proceed as normal
    next();
  }
});

export default router;
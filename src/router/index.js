import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import StaffView from '../views/StaffView.vue';
import LoginView from '../views/LoginView.vue';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const routes = [
  { path: '/', component: HomeView },
  { 
    path: '/staff', 
    component: StaffView,
    meta: { requiresAdmin: true } 
  },
  { path: '/login', component: LoginView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Helper to wait for Firebase to initialize
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(auth, 
      (user) => {
        removeListener(); 
        resolve(user);
      },
      reject
    );
  });
};

router.beforeEach(async (to, from, next) => {
  const currentUser = await getCurrentUser();
  
  // 1. Check Admin Status
  let isAdmin = false;
  
  if (currentUser) {
    // Import the exported 'user' ref from the composable
    // Note: We use 'await import' to avoid circular dependency issues
    const { user } = await import('../composables/useAuth');
    
    // Check the value
    isAdmin = user.value?.is_administrator === true;
  }

  // 2. Navigation Logic
  if (to.meta.requiresAdmin && !isAdmin) {
    next('/'); // Redirect unauthorized users to Home
  } else if (!currentUser && to.path !== '/login') {
    next('/login');
  } else if (currentUser && to.path === '/login') {
    next('/');
  } else {
    next();
  }
});

export default router;
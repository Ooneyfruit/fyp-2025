import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import StaffView from '../views/StaffView.vue';
import LoginView from '../views/LoginView.vue';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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

// Helper: Wait for Auth to Initialize
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
  let isAdmin = false;

  if (currentUser) {
    // Must manually fetch the profile here to be 100% sure 
    // it is the latest role before routing.
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists() && userDoc.data().is_administrator) {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Router Admin Check Failed:", e);
    }
  }

  // Navigation Logic
  if (to.meta.requiresAdmin && !isAdmin) {
    // If trying to access Staff but not admin, go Home
    next('/'); 
  } else if (!currentUser && to.path !== '/login') {
    // If not logged in, go to Login
    next('/login');
  } else if (currentUser && to.path === '/login') {
    // If logged in, don't show Login page
    next('/');
  } else {
    // Allow navigation
    next();
  }
});

export default router;
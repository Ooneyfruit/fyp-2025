import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import UserView from '../views/UserView.vue';
import LoginView from '../views/LoginView.vue';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const routes = [
  { path: '/', component: HomeView },
  { path: '/users', component: UserView, meta: { requiresAdmin: true } },
  { path: '/login', component: LoginView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(auth, (user) => {
      removeListener();
      resolve(user);
    }, reject);
  });
};

router.beforeEach(async (to, from, next) => {
  const currentUser = await getCurrentUser();
  let isAdmin = false;

  if (currentUser) {
    try {
      const userSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (userSnap.exists()) {
        const practiceRef = userSnap.data().current_practice;

        const q = query(
          collection(db, "practice_users"),
          where("user", "==", doc(db, "users", currentUser.uid)),
          where("practice", "==", practiceRef)
        );
        
        const intersectSnap = await getDocs(q);
        if (!intersectSnap.empty) {
          // Robust check: explicitly check the boolean
          isAdmin = intersectSnap.docs[0].data().is_administrator === true;
        }
      }
    } catch (e) {
      console.error("Router Admin Check Error:", e);
    }
  }

  // Debug log for the router transition
  console.log(`[Router] Navigating to: ${to.path} | Auth: ${!!currentUser} | Admin: ${isAdmin}`);

  if (to.meta.requiresAdmin && !isAdmin) {
    next('/'); 
  } else if (!currentUser && to.path !== '/login') {
    next('/login');
  } else {
    next();
  }
});
export default router;
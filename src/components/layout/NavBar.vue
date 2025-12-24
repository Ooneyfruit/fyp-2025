<template>
  <nav class="navbar">
    <div class="nav-left">
      <button 
        @click="$emit('toggleSidebar')" 
        class="hamburger-btn" 
        aria-label="Menu"
      >
        <IconMenu class="nav-icon" />
      </button>

      <div class="brand-container">
        <IconClock class="clock-icon" />
        <span class="brand-text">RotaDent</span>
      </div>

      <div v-if="user && practices.length > 1" class="practice-switcher">
        <select 
          :value="user.practiceRef?.id" 
          @change="handleSwitch($event.target.value)" 
          class="switcher-select"
        >
          <option v-for="p in practices" :key="p.id" :value="p.id">
            {{ p.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="nav-actions">
      <div v-if="user" class="user-info">
        <span class="user-email">{{ user.email }}</span>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { db } from '../../services/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc 
} from 'firebase/firestore';
import IconMenu from '../icons/IconMenu.vue';
import IconClock from '../icons/IconClock.vue';

defineEmits(['toggleSidebar']);

const { user, logout } = useAuth();
const practices = ref([]);

/**
 * Identify all practices where the user has a membership bridge.
 */
const loadUserPractices = async () => {
  if (!user.value?.uid) return;
  
  try {
    const bridgeCol = collection(db, "practice_users");
    const userRef = doc(db, "users", user.value.uid);

    // Attempt to find by Reference first
    let q = query(bridgeCol, where("user", "==", userRef));
    let snap = await getDocs(q);

    // Fallback if your DB uses string UIDs instead of references
    if (snap.empty) {
      q = query(bridgeCol, where("user", "==", user.value.uid));
      snap = await getDocs(q);
    }
    
    const practiceList = [];
    
    for (const mDoc of snap.docs) {
      const data = mDoc.data();
      const pRef = data.practice;
      
      if (pRef) {
        // Resolve reference regardless of whether it's stored as a Ref or a String ID
        const actualRef = (typeof pRef === 'string') ? doc(db, "practices", pRef) : pRef;
        const pSnap = await getDoc(actualRef);
        
        if (pSnap.exists()) {
          practiceList.push({ id: pSnap.id, ...pSnap.data() });
        }
      }
    }

    // Sort to keep UI consistent
    practices.value = practiceList.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error("Practice Switcher Load Error:", err);
  }
};

/**
 * Updates the 'current_practice' field.
 * This triggers the onSnapshot listener in useAuth.js to refresh permissions.
 */
const handleSwitch = async (practiceId) => {
  if (!practiceId) return;
  try {
    const userRef = doc(db, "users", user.value.uid);
    const newPracticeRef = doc(db, "practices", practiceId);
    
    await updateDoc(userRef, {
      current_practice: newPracticeRef
    });
  } catch (err) {
    console.error("Switching failed:", err.message);
  }
};

onMounted(loadUserPractices);

watch(() => user.value?.uid, (newUid) => {
  if (newUid) loadUserPractices();
  else practices.value = [];
});

const handleLogout = async () => {
  await logout();
  window.location.href = "/login";
};
</script>

<style scoped>
.navbar {
  position: fixed; 
  top: 0;
  left: 0;
  width: 100%;
  height: var(--navbar-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 0 var(--spacing-md);
  border-bottom: 0.0625rem solid var(--border-color);
  z-index: var(--z-navbar); 
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.02);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.hamburger-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3125rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  transition: background-color var(--anim-speed) ease;
}

.hamburger-btn:hover { background-color: #f0f0f0; }

.nav-icon, .clock-icon {
  width: 1.5rem;
  height: 1.5rem;
  transform: translateY(-0.0625rem);
}

.clock-icon { color: var(--color-primary); }

.brand-container {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
  letter-spacing: -0.03rem;
  line-height: 1;
}

.nav-actions { display: flex; align-items: center; }
.user-info { display: flex; align-items: center; gap: 0.9375rem; }
.user-email { font-size: 0.875rem; color: var(--text-muted); display: none; }

@media (min-width: 48rem) {
  .user-email { display: block; }
}

.logout-btn {
  background-color: #f1f3f4;
  color: var(--text-main);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--anim-speed) ease;
}

.logout-btn:hover { background-color: #e8eaed; }

.practice-switcher {
  margin-left: var(--spacing-md);
  padding-left: var(--spacing-md);
  border-left: 0.0625rem solid var(--border-color);
}

.switcher-select {
  padding: 0.4rem 0.75rem;
  border-radius: var(--border-radius);
  border: 0.0625rem solid var(--border-color);
  background: #f8fafc;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
}
</style>
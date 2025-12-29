<template>
  <nav class="navbar">
    <div class="nav-left">
      <BaseButton 
        :icon="IconMenu"
        variant="secondary"
        icon-only
        label="Menu"
        @click="$emit('toggleSidebar')"
      />

      <div class="brand-container">
        <IconClock class="clock-icon" />
        <span class="brand-text">RotaDent</span>
      </div>
    </div>

    <div class="nav-actions">
      <template v-if="user">
        <div v-if="!isMobile" class="desktop-content">
          <div v-if="practices.length > 1" class="practice-context">
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

          <button 
            class="profile-trigger" 
            @click="openAccountModal"
          >
            <span class="email-label">{{ user.email }}</span>
            <div class="edit-btn-static">
              <IconEdit class="edit-icon" />
            </div>
          </button>

          <BaseButton 
            label="Log Out" 
            variant="secondary" 
            @click="handleLogout" 
          />
        </div>

        <div v-else class="mobile-actions">
          <BaseButton 
            :icon="IconSettings"
            variant="secondary"
            icon-only
            :label="isSettingsOpen ? 'Close Settings' : 'Open Settings'"
            @click="isSettingsOpen = !isSettingsOpen"
          />

          <div v-if="isSettingsOpen" class="settings-dropdown">
            <div class="dropdown-header">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-role">{{ user.role }}</span>
            </div>
            
            <div class="dropdown-body">
              <BaseButton 
                label="Edit Profile"
                :icon="IconEdit"
                variant="secondary"
                class="full-width-dropdown"
                @click="openAccountModal"
              />

              <div v-if="practices.length > 1" class="dropdown-section">
                <div class="section-label">Switch Practice</div>
                <select 
                  :value="user.practiceRef?.id" 
                  @change="handleSwitch($event.target.value)" 
                  class="mobile-select-switcher"
                >
                  <option v-for="p in practices" :key="p.id" :value="p.id">
                    {{ p.name }}
                  </option>
                </select>
              </div>

              <div class="dropdown-footer">
                <BaseButton 
                  label="Log Out"
                  variant="danger"
                  class="full-width-dropdown"
                  @click="handleLogout"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <UserModal ref="userModalRef" />
  </nav>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useToast } from '../../composables/useToast';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

import BaseButton from '../shared/BaseButton.vue';
import UserModal from '../../features/users/components/UserModal.vue';

import IconMenu from '../icons/IconMenu.vue';
import IconClock from '../icons/IconClock.vue';
import IconSettings from '../icons/IconSettings.vue';
import IconEdit from '../icons/IconEdit.vue';

defineEmits(['toggleSidebar']);

const { user, logout } = useAuth();
const { showToast } = useToast();

const practices = ref([]);
const isSettingsOpen = ref(false);
const isMobile = ref(window.innerWidth < 768);

/**
 * 1. TEMPLATE REF
 * Aligns NavBar with HomeView.vue/UserView.vue pattern.
 */
const userModalRef = ref(null);

const currentUserMemberData = computed(() => {
  if (!user.value) return null;
  return {
    ...user.value,
    profile: { 
      name: user.value.name, 
      email: user.value.email, 
      address: user.value.address, 
      profile_image: user.value.profile_image 
    },
    user: { id: user.value.uid }
  };
});

/**
 * 2. REFACTORED TRIGGER
 * Explicitly calls the .open() method exposed by UserModal.vue.
 */
const openAccountModal = () => { 
  isSettingsOpen.value = false; 
  userModalRef.value?.open(currentUserMemberData.value);
};

const loadUserPractices = async () => {
  if (!user.value?.uid) return;
  try {
    const q = query(
      collection(db, "practice_users"), 
      where("user", "==", doc(db, "users", user.value.uid))
    );
    const snap = await getDocs(q);
    const list = [];
    for (const mDoc of snap.docs) {
      const pRef = mDoc.data().practice;
      const actualRef = (typeof pRef === 'string') ? doc(db, "practices", pRef) : pRef;
      const pSnap = await getDoc(actualRef);
      if (pSnap.exists()) list.push({ id: pSnap.id, ...pSnap.data() });
    }
    practices.value = list.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) { 
    console.error(err); 
  }
};

const handleSwitch = async (practiceId) => {
  if (!practiceId || practiceId === user.value.practiceRef?.id) return;
  const selectedPractice = practices.value.find(p => p.id === practiceId);
  try {
    await updateDoc(doc(db, "users", user.value.uid), { 
      current_practice: doc(db, "practices", practiceId) 
    });
    showToast(`Switched to ${selectedPractice?.name || 'new practice'}`);
  } catch (err) {
    console.error("[NavBar] Switch Failed:", err);
    showToast("Failed to switch practice. Please try again.");
  }
};

const handleLogout = async () => { 
  isSettingsOpen.value = false; 
  await logout(); 
  window.location.href = "/login"; 
};

onMounted(() => {
  loadUserPractices();
  window.addEventListener('resize', () => isMobile.value = window.innerWidth < 768);
});

watch(() => user.value?.uid, (uid) => { 
  if (uid) loadUserPractices(); 
});
</script>

<style scoped>
/* (Style section remains largely the same, optimized for BaseButton integration) */
.navbar {
  position: fixed; top: 0; left: 0; width: 100%; height: var(--navbar-height);
  display: flex; justify-content: space-between; align-items: center;
  background: white; padding: 0 var(--spacing-md);
  border-bottom: 1px solid var(--border-color); z-index: var(--z-navbar);
}
.nav-left { display: flex; align-items: center; gap: var(--spacing-md); }
.brand-container { display: flex; align-items: center; gap: 0.625rem; min-width: 140px; }
.brand-text { font-size: 1.25rem; font-weight: 600; color: var(--color-primary); white-space: nowrap; }
.clock-icon { width: 1.5rem; height: 1.5rem; color: var(--color-primary); }
.nav-actions { display: flex; align-items: center; justify-content: flex-end; gap: var(--spacing-lg); }
.desktop-content { display: flex; align-items: center; gap: var(--spacing-lg); }
.profile-trigger {
  display: flex; align-items: center; gap: 0.6rem;
  background: none; border: none; cursor: pointer;
  padding: 0.4rem 0.6rem; border-radius: 0.5rem;
  transition: background 0.2s ease;
}
.email-label { font-size: 0.875rem; color: var(--text-muted); font-weight: 500; transition: color 0.2s; }
.edit-btn-static { width: 1.1rem; height: 1.1rem; display: flex; align-items: center; }
.edit-icon { width: 1.1rem; height: 1.1rem; color: var(--text-muted); transition: color 0.2s; }
.profile-trigger:hover { background: #eff6ff; }
.profile-trigger:hover .email-label, .profile-trigger:hover .edit-icon { color: var(--color-primary); }
.switcher-select {
  padding: 0.4rem 0.75rem; border-radius: var(--border-radius);
  border: 1px solid var(--border-color); background: #f8fafc;
  color: var(--text-muted); font-weight: 600; cursor: pointer;
}
.full-width-dropdown { width: 100%; justify-content: flex-start !important; }
.settings-dropdown {
  position: absolute; top: calc(100% + 0.625rem); right: 0; width: 16rem;
  background: white; border-radius: 0.75rem; border: 1px solid var(--border-color);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden;
  animation: slideIn 0.2s ease-out;
}
@keyframes slideIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
.dropdown-header { padding: 1.25rem; background: #f8fafc; border-bottom: 1px solid var(--border-color); }
.user-name { display: block; font-weight: 600; color: var(--text-main); font-size: 1rem; }
.user-role { display: block; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-top: 0.2rem; }
.dropdown-body { padding: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; }
.dropdown-section { padding: 1rem 0.875rem; border-top: 1px solid #f1f5f9; margin-top: 0.5rem; }
.section-label { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.75rem; }
.mobile-select-switcher { width: 100%; padding: 0.65rem; border-radius: 0.5rem; border: 1px solid var(--border-color); background: #f8fafc; color: var(--text-muted); font-weight: 600; }
.dropdown-footer { border-top: 1px solid #f1f5f9; margin-top: 0.5rem; padding-top: 0.5rem; }
</style>
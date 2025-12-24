<template>
  <AuthGuard>
    <PageContainer class="user-view-container">
      <div class="header-flex-wrapper align-left">
        <PageHeader 
          title="User Management" 
          subtitle="Manage personnel and permissions for your practice."
        />
        <div class="header-button-area">
          <button class="modern-add-btn" @click="openAddModal" :disabled="uiProcessing">
            <svg width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add User</span>
          </button>
        </div>
      </div>

      <AppLoading v-if="loading" />
      
      <div v-else class="content-wrapper">
        <UserDataViewAdapter 
          :users="users" 
          @edit="handleEditUser" 
        />
      </div>

      <UserModal 
        v-if="showModal" 
        :initialData="selectedUser" 
        @close="showModal = false" 
      />
    </PageContainer>
  </AuthGuard>
</template>

<script setup>
import { ref } from 'vue';

// Composables
import { usePracticeUsers } from '../composables/usePracticeUsers';

// Shared Layout Components
import AuthGuard from '../components/AuthGuard.vue';
import PageHeader from '../components/PageHeader.vue';
import PageContainer from '../components/PageContainer.vue';
import UserModal from '../components/UserModal.vue';
import AppLoading from '../components/ui/AppLoading.vue';

// The "Glue" Adapter
import UserDataViewAdapter from '../components/adapters/UserDataViewAdapter.vue';

/**
 * DATA STATE
 */
const { users, loading } = usePracticeUsers();

/**
 * UI STATE
 */
const showModal = ref(false);
const selectedUser = ref(null);
const uiProcessing = ref(false);

/**
 * EVENT HANDLERS
 */
const openAddModal = () => {
  selectedUser.value = null;
  showModal.value = true;
};

const handleEditUser = (user) => {
  selectedUser.value = user;
  showModal.value = true;
};
</script>

<style scoped>
/* FIXING INDEXING */
.user-view-container {
  position: relative;
  z-index: var(--z-normal);
}

/* HEADER FLEX: Modified to keep button close to text 
  Uses REM for consistent scaling 
*/
.header-flex-wrapper.align-left {
  display: flex;
  justify-content: flex-start; 
  align-items: flex-start; /* FIXED: Now aligns with the top of the header */
  gap: 1.5rem;                 
  margin-bottom: 2.5rem; /* Increased spacing for better breathing room */
  flex-wrap: wrap;
}

/* Ensure the button has a slight top margin if it feels too "tight" to the very top edge */
.header-button-area {
  padding-top: 0.25rem; 
}


.modern-add-btn {
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
  background-color: var(--color-primary); 
  color: white;
  border: none; 
  padding: 0.6rem 1.25rem; 
  border-radius: 0.5rem; 
  font-weight: 600; 
  cursor: pointer; 
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.modern-add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* MOBILE HEADER ADJUSTMENT */
@media (max-width: 37.5rem) { /* 600px */
  .header-flex-wrapper.align-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
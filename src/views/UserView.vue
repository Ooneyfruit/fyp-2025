<template>
  <AuthGuard>
    <PageContainer>
      <div class="header-layout-group">
        <PageHeader 
          title="User Management" 
          subtitle="Manage personnel and permissions for your practice."
        />
        <PageAction label="Add User" @click="openAddModal" />
      </div>

      <AppLoading v-if="loading" />
      
      <div v-else class="main-content-area">
        <UserDataViewAdapter :users="users" @edit="handleEditUser" />
      </div>

      <UserModal 
        v-if="showModal" 
        :initialData="selectedUser" 
        @close="handleClose" 
      />
    </PageContainer>
  </AuthGuard>
</template>

<script setup>
import { ref } from 'vue';
import { usePracticeUsers } from '../features/users/composables/usePracticeUsers';
import AuthGuard from '../components/layout/AuthGuard.vue';
import PageHeader from '../components/layout/PageHeader.vue';
import PageContainer from '../components/layout/PageContainer.vue';
import UserModal from '../features/users/components/UserModal.vue';
import AppLoading from '../components/shared/AppLoading.vue';
import PageAction from '../components/shared/PageAction.vue';
import UserDataViewAdapter from '../features/users/components/UserDataViewAdapter.vue';

const { users, loading } = usePracticeUsers();

// Explicitly initialized to false to prevent auto-open
const showModal = ref(false);
const selectedUser = ref(null);

const openAddModal = () => {
  selectedUser.value = null;
  showModal.value = true;
};

const handleEditUser = (user) => {
  selectedUser.value = user;
  showModal.value = true;
};

const handleClose = () => {
  showModal.value = false;
  selectedUser.value = null;
};
</script>

<style scoped>
.header-layout-group {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start; 
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

@media (max-width: 50rem) {
  .header-layout-group {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
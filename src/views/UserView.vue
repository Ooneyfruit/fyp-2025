<template>
  <AppAuthGuard>
    <AppPageContainer>
      <div class="header-layout-group">
        <AppPageHeader 
          title="User Management" 
          subtitle="Manage personnel and permissions for your practice."
        />
        <BaseButton 
          label="Add User" 
          :icon="IconPlus"
          @click="userModal.open()"
        />
      </div>

      <AppLoading v-if="isLoading" />
      
      <div v-else class="main-content-area">
        <UserDataViewAdapter :users="users" @edit="(user) => userModal.open(user)" />
      </div>

      <UserModal ref="userModal" />
    </AppPageContainer>
  </AppAuthGuard>
</template>

<script setup>
import { ref } from 'vue';
import { usePracticeUsers } from '../features/users/composables/usePracticeUsers';
import AppAuthGuard from '../components/layout/AppAuthGuard.vue';
import AppPageHeader from '../components/layout/AppPageHeader.vue';
import AppPageContainer from '../components/layout/AppPageContainer.vue';
import UserModal from '../features/users/components/UserModal.vue';
import AppLoading from '../components/shared/AppLoading.vue';
import BaseButton from '../components/shared/BaseButton.vue';
import UserDataViewAdapter from '../features/users/components/UserDataViewAdapter.vue';
import IconPlus from '../components/icons/IconPlus.vue';

const { users, isLoading } = usePracticeUsers();

// The only state the view needs is a reference to the component
const userModal = ref(null);
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
  .header-layout-group { flex-direction: column; gap: var(--spacing-sm); }
}
</style>
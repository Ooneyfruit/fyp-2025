<template>
  <AppAuthGuard>
    <AppPageContainer>
      <AppPageHeaderGroup
        title="User Management"
        subtitle="Manage personnel and permissions for your practice."
      >
        <BaseButton label="Add User" :icon="IconPlus" @click="userModal.open()" />
      </AppPageHeaderGroup>

      <AppLoading v-if="isLoading" />

      <div v-else class="main-content-area">
        <UserDataViewAdapter :users="users" @edit="(user) => userModal.open(user)" />
      </div>

      <UserModal ref="userModal" />
    </AppPageContainer>
  </AppAuthGuard>
</template>

<script setup>
/**
 * Administrative view for managing practice personnel.
 * Handles the display of the user list and coordinates creation/editing workflows.
 */
import { ref } from 'vue';
import { usePracticeUsers } from '../features/users/composables/usePracticeUsers';

// Layout & Core Components
import AppAuthGuard from '../components/layout/AppAuthGuard.vue';
import AppPageHeaderGroup from '../components/layout/AppPageHeaderGroup.vue';
import AppPageContainer from '../components/layout/AppPageContainer.vue';
import BaseButton from '../components/shared/BaseButton.vue';
import AppLoading from '../components/shared/AppLoading.vue';

// Feature Components
import UserModal from '../features/users/components/UserModal.vue';
import UserDataViewAdapter from '../features/users/components/UserDataViewAdapter.vue';

// Icons
import IconPlus from '../components/icons/IconPlus.vue';

const { users, isLoading } = usePracticeUsers();

// Template reference for the shared user modal instance
const userModal = ref(null);
</script>

<style scoped>
/* Main Content: container for the user data adapter */
.main-content-area {
  display: flex;
  flex-direction: column;
}
</style>

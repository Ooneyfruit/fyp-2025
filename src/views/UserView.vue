<script setup lang="ts">
/**
 * Administrative view for managing practice personnel.
 * Handles the display of the user list and coordinates creation/editing workflows.
 */
import { ref } from 'vue';

// Icons.
import IconPlus from '@/components/icons/IconPlus.vue';
// Layout and core components.
import AppAuthGuard from '@/components/layout/AppAuthGuard.vue';
import AppPageContainer from '@/components/layout/AppPageContainer.vue';
import AppPageHeaderGroup from '@/components/layout/AppPageHeaderGroup.vue';
import AppLoading from '@/components/shared/AppLoading.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import { useAdminAccess } from '@/composables/useAdminAccess';
// Feature API.
import { usePracticeUsers, UserDataViewAdapter, UserModal } from '@/features/users/usersApi';
import { type PracticeUser } from '@/features/users/userTypes';

// --- Type Definitions ---

/**
 * Interface defining the methods exposed by the UserModal component.
 */
interface UserModalInstance {
  open: (user?: PracticeUser) => void;
}

// --- Logic and State ---

// Enforce admin privileges for this view.
useAdminAccess();

// Logic: retrieves practice-specific users and loading state.
const { users, isLoading } = usePracticeUsers();

/**
 * Template reference for the shared user modal instance.
 */
const userModal = ref<UserModalInstance | null>(null);
</script>

<template>
  <AppAuthGuard>
    <AppPageContainer>
      <AppPageHeaderGroup
        subtitle="Manage personnel and permissions for your practice."
        title="User Management"
      >
        <BaseButton :icon="IconPlus" label="Add User" @click="userModal?.open()" />
      </AppPageHeaderGroup>

      <AppLoading v-if="isLoading" />

      <div v-else class="main-content-area">
        <UserDataViewAdapter :users="users" @edit="(user: PracticeUser) => userModal?.open(user)" />
      </div>

      <UserModal ref="userModal" />
    </AppPageContainer>
  </AppAuthGuard>
</template>

<style scoped>
/* Main Content: container for the user data adapter. */
.main-content-area {
  display: flex;
  flex-direction: column;
}
</style>

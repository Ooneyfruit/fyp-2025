<script setup>
/**
 * @file UserView.vue
 * @description Administrative view for managing practice personnel.
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
// Feature API.
import { usePracticeUsers, UserDataViewAdapter, UserModal } from '@/features/users/usersApi';

// --- Type Definitions ---

/**
 * @typedef {object} UserProfile
 * @property {string} id - The unique identifier for the user profile.
 * @property {string} [name] - The full name of the user.
 * @property {string} [email] - The email address of the user.
 */

/**
 * @typedef {object} User
 * @property {string} id - The unique membership identifier.
 * @property {UserProfile} profile - The detailed profile information for the user.
 * @property {string} role - The assigned practice role.
 * @property {boolean} is_administrator - Administrative status flag.
 * @property {boolean} is_employee - Employment status flag.
 * @property {any} start_date - Initial joining date.
 * @property {any} [end_date] - Optional contract end date.
 */

/**
 * @typedef {object} UserModalInstance
 * @property {(user?: User) => void} open - Opens the modal, optionally pre-filled with user data.
 */

/**
 * Local interface for the composable return value.
 * Explicitly defining this here resolves issues with importing types from JS files.
 * @typedef {object} UserViewLogic
 * @property {import('vue').ComputedRef<User[]>} users - The reactive list of personnel for the current practice.
 * @property {import('vue').Ref<boolean>} isLoading - Indicates if the user data is currently being fetched.
 */

// --- Logic and state ---

/** @type {UserViewLogic} */
const { users, isLoading } = usePracticeUsers();

/**
 * Template reference for the shared user modal instance.
 * @type {import('vue').Ref<UserModalInstance | null>}
 */
const userModal = ref(null);
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
        <UserDataViewAdapter :users="users" @edit="(user) => userModal?.open(user)" />
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

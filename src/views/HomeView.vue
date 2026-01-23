<script setup>
/**
 * @file HomeView.vue
 * @description Main dashboard landing page.
 * Provides quick access to user profile settings and UI component demonstrations.
 */
import { ref } from 'vue';

// Components
import IconClock from '../components/icons/IconClock.vue';
import IconEdit from '../components/icons/IconEdit.vue';
import IconPlus from '../components/icons/IconPlus.vue';
import AppPageContainer from '../components/layout/AppPageContainer.vue';
import AppPageHeaderGroup from '../components/layout/AppPageHeaderGroup.vue';
import BaseButton from '../components/shared/BaseButton.vue';
import BaseModal from '../components/shared/BaseModal.vue';
import { useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';
import { UserModal } from '../features/users/usersApi';

// --- Type Definitions ---

/**
 * @typedef {object} User
 * @property {string} [name] - The user's display name.
 */

/**
 * @typedef {object} AuthInterface
 * @property {import('vue').Ref<User | null>} user - The current authenticated user.
 */

/**
 * @typedef {object} ToastInterface
 * @property {Function} showToast - Displays a generic toast notification.
 */

/**
 * @typedef {object} UserModalInstance
 * @property {(user?: User | null) => void} open - Opens the modal, optionally pre-filled with user data.
 */

// --- Logic & State ---

// Explicit casting ensures the compiler recognises the destructured properties from the auth composable.
const { user } = /** @type {AuthInterface} */ (useAuth());

// The toast interface uses the Function type to match the composable's return signature.
const { showToast } = /** @type {ToastInterface} */ (useToast());

/**
 * State management for the user profile modal.
 * @type {import('vue').Ref<UserModalInstance | null>}
 */
const userModal = ref(null);

// Visibility state for the demonstration modal.
const showTestModal = ref(false);

/**
 * Triggers a system toast notification for testing purposes.
 */
const handleTestToast = () => {
  showToast('Feedback system operational: this is a test toast.');
};
</script>

<template>
  <AppPageContainer>
    <AppPageHeaderGroup
      :subtitle="'Welcome to the RotaDent management dashboard.'"
      :title="`Hello, ${user?.name || 'User'}!`"
    >
      <BaseButton :icon="IconEdit" label="Edit My Profile" @click="userModal?.open(user)" />

      <BaseButton :icon="IconPlus" label="Open Test Modal" @click="showTestModal = true" />

      <BaseButton :icon="IconClock" label="Trigger Test Toast" @click="handleTestToast" />
    </AppPageHeaderGroup>

    <UserModal ref="userModal" />

    <BaseModal
      :show="showTestModal"
      title="Test Component Modal"
      @request-close="showTestModal = false"
    >
      <div class="test-content">
        <p>This is a blank BaseModal.vue instance being used directly in HomeView.vue.</p>
        <p>The close icon is now correctly utilising /src/components/icons/IconClose.vue.</p>
      </div>
    </BaseModal>
  </AppPageContainer>
</template>

<style scoped>
/* Content: typography and spacing for test elements. */
.test-content {
  color: var(--text-muted);
  line-height: 1.6;
}
</style>

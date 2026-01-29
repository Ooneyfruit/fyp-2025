<script setup>
/**
 * Main dashboard landing page.
 * Default landing page. Not currently in use but held as an archive.
 */
import { ref } from 'vue';

import IconClock from '@/components/icons/IconClock.vue';
import IconEdit from '@/components/icons/IconEdit.vue';
import IconPlus from '@/components/icons/IconPlus.vue';
import AppPageContainer from '@/components/layout/AppPageContainer.vue';
import AppPageHeaderGroup from '@/components/layout/AppPageHeaderGroup.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
// Standardised casing and alias usage.
import { UserModal } from '@/features/users/usersApi';

// --- Type Definitions ---

/**
 * [name] - The user's display name.
 */

/**
 * User - The current authenticated user.
 */

/**
 * ShowToast - Displays a generic toast notification.
 */

/**
 * Open - Opens the modal.
 */

// --- Logic & State ---

const { user } = useAuth();
const { showToast } = useToast();

/**
 * State management for the user profile modal.
 */
const userModal = ref(null);

const showTestModal = ref(false);

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
      </div>
    </BaseModal>
  </AppPageContainer>
</template>

<style scoped>
.test-content {
  color: var(--text-muted);
  line-height: 1.6;
}
</style>

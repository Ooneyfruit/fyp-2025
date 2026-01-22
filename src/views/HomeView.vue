<script setup>
/**
 * Main dashboard landing page.
 * Provides quick access to user profile settings and UI component demonstrations.
 */
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';

// Layout & UI Components
import AppPageHeaderGroup from '../components/layout/AppPageHeaderGroup.vue';
import AppPageContainer from '../components/layout/AppPageContainer.vue';
import BaseButton from '../components/shared/BaseButton.vue';
import BaseModal from '../components/shared/BaseModal.vue';
import UserModal from '../features/users/components/UserModal.vue';

// Icons
import IconClock from '../components/icons/IconClock.vue';
import IconEdit from '../components/icons/IconEdit.vue';
import IconPlus from '../components/icons/IconPlus.vue';

const { user } = useAuth();
const { showToast } = useToast();

// State management for the user profile modal
const userModal = ref(null);

// Visibility state for the demonstration modal
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
      :title="`Hello, ${user?.name || 'User'}!`"
      subtitle="Welcome to the RotaDent management dashboard."
    >
      <BaseButton label="Edit My Profile" :icon="IconEdit" @click="userModal.open(user)" />

      <BaseButton label="Open Test Modal" :icon="IconPlus" @click="showTestModal = true" />

      <BaseButton label="Trigger Test Toast" :icon="IconClock" @click="handleTestToast" />
    </AppPageHeaderGroup>

    <UserModal ref="userModal" />

    <BaseModal
      :show="showTestModal"
      title="Test Component Modal"
      @request-close="showTestModal = false"
    >
      <div class="test-content">
        <p>This is a blank BaseModal.vue instance being used directly in HomeView.vue.</p>
        <p>The close icon is now correctly utilizing /src/components/icons/IconClose.vue.</p>
      </div>
    </BaseModal>
  </AppPageContainer>
</template>

<style scoped>
/* Content: typography and spacing for test elements */
.test-content {
  color: var(--text-muted);
  line-height: 1.6;
}

@media (max-width: 50rem) {
  .header-layout-group {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  .action-stack {
    width: 100%;
  }
}
</style>

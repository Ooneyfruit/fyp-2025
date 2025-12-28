<template>
  <PageContainer>
    <div class="header-layout-group">
      <PageHeader 
        title="Hello, world!" 
        :subtitle="`Welcome to RotaDent, ${user?.name || 'User'}.`"
      />
      
      <div class="action-stack">
        <PageAction 
          label="Edit My Profile" 
          @click="userModal.open(user)"
        >
          <template #icon><IconEdit /></template>
        </PageAction>

        <PageAction 
          label="Open Test Modal" 
          @click="showTestModal = true"
        >
          <template #icon><IconPlus /></template>
        </PageAction>

        <PageAction 
          label="Trigger Test Toast" 
          @click="handleTestToast"
        >
          <template #icon><IconClock /></template>
        </PageAction>
      </div>
    </div>

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

  </PageContainer>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';

// Layout & Modal Components
import PageHeader from '../components/layout/PageHeader.vue';
import PageContainer from '../components/layout/PageContainer.vue';
import PageAction from '../components/shared/PageAction.vue';
import BaseModal from '../components/shared/BaseModal.vue';
import UserModal from '../features/users/components/UserModal.vue';

// Icons
import IconClock from '../components/icons/IconClock.vue';
import IconEdit from '../components/icons/IconEdit.vue';
import IconPlus from '../components/icons/IconPlus.vue';

const { user } = useAuth();
const { showToast } = useToast();

// State for the managed UserModal
const userModal = ref(null);

// State for the blank test BaseModal
const showTestModal = ref(false);

const handleTestToast = () => {
  showToast("Feedback System Operational: This is a test toast.");
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

.action-stack {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.test-content {
  color: var(--text-muted);
  line-height: 1.6;
}

@media (max-width: 50rem) {
  .header-layout-group { flex-direction: column; gap: var(--spacing-sm); }
  .action-stack { width: 100%; }
}
</style>
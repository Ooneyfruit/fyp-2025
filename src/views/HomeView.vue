<template>
  <PageContainer>
    <div class="header-layout-group">
      <PageHeader 
        title="Hello, world!" 
        subtitle="Welcome to RotaDent."
      />
      
      <div class="action-stack">
        <PageAction 
          label="Go to User Management" 
          to="/users"
        >
          <template #icon>
            <IconUsers />
          </template>
        </PageAction>

        <PageAction 
          label="Trigger Test Toast" 
          @click="handleTestToast"
        >
          <template #icon>
            <IconClock />
          </template>
        </PageAction>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { useToast } from '../composables/useToast';

// Shared Layout Components
import PageHeader from '../components/layout/PageHeader.vue';
import PageContainer from '../components/layout/PageContainer.vue';
import PageAction from '../components/shared/PageAction.vue';

// Icons
import IconUsers from '../components/icons/IconUsers.vue';
import IconClock from '../components/icons/IconClock.vue';

const { showToast } = useToast();

const handleTestToast = () => {
  showToast("Feedback System Operational: This is a test toast.");
};
</script>

<style scoped>
/* LAYOUT ORCHESTRATION ONLY */
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
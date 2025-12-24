<template>
  <PageContainer>
    <div class="header-layout-group">
      <PageHeader 
        title="Hello, world!" 
        subtitle="Welcome to RotaDent."
      />
      
      <PageAction 
        label="Go to User Management" 
        to="/users"
      >
        <template #icon>
          <IconUsers />
        </template>
      </PageAction>
    </div>
  </PageContainer>
</template>

<script setup>
// Shared Layout Components
import PageHeader from '../components/PageHeader.vue';
import PageContainer from '../components/PageContainer.vue';
import PageAction from '../components/ui/PageAction.vue';
import IconUsers from '../components/icons/IconUsers.vue';
</script>

<style scoped>
/* LAYOUT ORCHESTRATION ONLY: 
  The aesthetic (padding, colors, typography) is defined in the components.
*/
.header-layout-group {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start; /* Aligns PageAction with the cap-height of the title */
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

@media (max-width: 50rem) {
  .header-layout-group {
    flex-direction: column;
    gap: var(--spacing-sm); /* Logical padding for mobile wrap */
  }
}
</style>
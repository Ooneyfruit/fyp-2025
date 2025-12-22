<template>
  <PageContainer>
    <PageHeader 
      title="Hello, world!" 
      subtitle="Welcome to RotaDent."
    />
    
    <button @click="$router.push('/users')" class="action-btn">
      Go to User Management
    </button>
  </PageContainer>
</template>

<script setup>
import PageHeader from '../components/PageHeader.vue';
import PageContainer from '../components/PageContainer.vue';
</script>

<style scoped>

.action-btn {
  padding: 0.625rem 1.25rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s;
}

.action-btn:hover {
  background-color: #357ae8;
}
</style>
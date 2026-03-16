<script setup lang="ts">
/**
 * 404 Not Found View.
 * Displays a friendly message when a user navigates to a non-existent route.
 */
import AppPageContainer from '@/components/layout/AppPageContainer.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
</script>

<template>
  <AppPageContainer>
    <div class="not-found">
      <h1 class="title">404 - Page Not Found</h1>
      <p class="subtitle">
        The page you are looking for does not exist, has been moved, or you do not have permission
        to view it.
      </p>
      <div class="actions">
        <BaseButton label="Return to Home" to="/" variant="primary" />
      </div>
    </div>
  </AppPageContainer>
</template>

<style scoped>
.not-found {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.title {
  color: var(--text-main);
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1rem;
  margin-bottom: 2rem;
  max-width: 30rem;
}
</style>

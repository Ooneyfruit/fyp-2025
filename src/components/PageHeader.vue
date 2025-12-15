<template>
  <header class="page-header">
    <div class="title-group">
      <div class="title-line">
        <h1>{{ title }}</h1>
        <slot />
      </div>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.title-line {
  display: flex;
  align-items: center;
  gap: 0.9375rem; 
  margin-bottom: 0.5rem;
  flex-wrap: wrap; /* Good for mobile if title is long */
}

h1 {
  font-size: 1.75rem;
  font-weight: 500;
  margin: 0;
  color: var(--text-main);
}

.subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--text-muted);
}
</style>
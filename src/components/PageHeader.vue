<template>
  <header class="page-header">
    <div class="title-line">
      <h1>{{ title }}</h1>
      <slot />
    </div>
    <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
});
</script>

<style scoped>
.page-header {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.title-line {
  display: flex;
  align-items: baseline; /* Align slots (like badges) to the text baseline */
  gap: var(--spacing-sm);
}

h1 {
  font-size: 1.75rem;
  font-weight: 500;
  margin: 0;
  line-height: 1.1;
  color: var(--text-main);
}

.subtitle {
  margin: var(--spacing-xs) 0 0 0;
  font-size: 1rem;
  color: var(--text-muted);
  line-height: 1.4;
}
</style>
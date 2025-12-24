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
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
});
</script>

<style scoped>
.page-header {
  /* FIXED: Removed margin-bottom and flex properties. 
     The parent wrapper now handles the layout and spacing. */
  margin: 0; 
  padding: 0;
}

.title-line {
  display: flex;
  align-items: center;
  gap: 0.9375rem; 
  /* Space between Title and Subtitle */
  margin-bottom: 0.25rem; /* Reduced from 0.5rem for a tighter look */
  flex-wrap: wrap;
}

h1 {
  font-size: 1.75rem;
  font-weight: 500;
  margin: 0;
  line-height: 1.1; /* Ensures no extra vertical height from line-height */
  color: var(--text-main);
}

.subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--text-muted);
  line-height: 1.4;
}
</style>
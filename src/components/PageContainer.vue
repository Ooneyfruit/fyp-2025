<template>
  <div class="page-container">
    <slot />
  </div>
</template>

<style scoped>
.page-container {
  /* The Standard Layout for your App */
  padding: var(--spacing-lg);
  max-width: 75rem; /* 1200px */
  margin: 0 auto;   /* Center horizontally */
}
</style>
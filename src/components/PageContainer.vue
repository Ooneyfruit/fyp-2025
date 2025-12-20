<template>
  <div class="page-container">
    <slot />
  </div>
</template>

<style scoped>
.page-container {
  /* Standard layout for each page */
  padding: var(--spacing-lg);
  max-width: 75rem;
  margin: 0 auto;   /* Centre horizontally */
}
</style>
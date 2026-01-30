<script setup lang="ts">
/**
 * Primary page heading component.
 * Provides a standardized visual hierarchy for page titles and subtitles.
 */
defineProps({
  // The primary text displayed in the H1 tag.
  title: { type: String, required: true },

  // Optional secondary text displayed below the title.
  subtitle: { type: String, default: '' }
});
</script>

<template>
  <header class="page-header">
    <div class="title-line">
      <h1>{{ title }}</h1>

      <slot />
    </div>

    <p v-if="subtitle" class="subtitle">
      {{ subtitle }}
    </p>
  </header>
</template>

<style scoped>
/* Layout: standard vertical spacing for the header block */
.page-header {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

/* Title Line: horizontal alignment for the heading and optional badges */
.title-line {
  align-items: baseline;
  display: flex;
  gap: var(--spacing-sm);
}

/* Typography: primary page title styles */
h1 {
  color: var(--text-main);
  font-size: 1.75rem;
  font-weight: 500;
  line-height: 1.1;
  margin: 0;
}

/* Typography: subtitle styling for muted context */
.subtitle {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.4;
  margin-block-start: var(--spacing-xs);
}
</style>

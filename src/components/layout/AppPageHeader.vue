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

<script setup>
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

<style scoped>
/* Layout: standard vertical spacing for the header block */
.page-header {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* Title Line: horizontal alignment for the heading and optional badges */
.title-line {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
}

/* Typography: primary page title styles */
h1 {
  font-size: 1.75rem;
  font-weight: 500;
  margin: 0;
  line-height: 1.1;
  color: var(--text-main);
}

/* Typography: subtitle styling for muted context */
.subtitle {
  margin-block-start: var(--spacing-xs);
  font-size: 1rem;
  color: var(--text-muted);
  line-height: 1.4;
}
</style>

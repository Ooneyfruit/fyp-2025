<script setup lang="ts">
/**
 * Component to display the high-level practice details.
 */
import BaseCard from '@/components/shared/BaseCard.vue';
import { type PracticeDetails } from '@/features/settings/settingsTypes';

defineProps<{
  details: PracticeDetails;
}>();
</script>

<template>
  <BaseCard>
    <div class="details-grid">
      <div class="field">
        <div class="label">Practice Name</div>
        <div class="value">{{ details.name }}</div>
      </div>
      <div class="field">
        <div class="label">Address</div>
        <div class="value address">{{ details.address }}</div>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.details-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.field .label {
  color: var(--text-muted);
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.value {
  color: var(--text-main);
  font-size: 1rem;
}

.address {
  white-space: pre-wrap; /* Preserve line breaks in the address. */
}
</style>

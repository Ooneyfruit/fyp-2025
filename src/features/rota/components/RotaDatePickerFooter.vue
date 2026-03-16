<script setup lang="ts">
/**
 * Footer component for the rota date picker modal.
 *
 * Provides standardized action buttons for the date picker modal,
 * including "Cancel", "Confirm View", and a specialized "Reset to Today"
 * button. It wraps the generic BaseModalFooter to provide context-specific
 * labels and styling for the rota feature.
 */

import BaseModalFooter from '@/components/shared/BaseModalFooter.vue';

defineProps<{
  onReset?: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
}>();
</script>

<template>
  <BaseModalFooter
    cancel-label="Cancel"
    confirm-label="Confirm View"
    helper-text="Select start day for 3-day view"
    prepend-label="Reset to Today"
    prepend-variant="outline"
    @cancel="onCancel"
    @confirm="onConfirm"
    @prepend="onReset"
  />
</template>

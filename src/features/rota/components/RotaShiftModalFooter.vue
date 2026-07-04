<script setup lang="ts">
/**
 * Footer actions for the Rota Shift Modal.
 */
import BaseButton from '@/components/shared/BaseButton.vue';

defineProps<{
  hasChanges: boolean;
  saveLabel: string;
  onClose: () => void;
  onSave: () => void;
}>();
</script>

<template>
  <div class="footer-actions">
    <BaseButton label="Cancel" variant="secondary" @click="onClose" />
    <BaseButton :disabled="!hasChanges" :label="saveLabel" @click="onSave" />
  </div>
</template>

<style scoped>
.footer-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  width: 100%;
}
</style>

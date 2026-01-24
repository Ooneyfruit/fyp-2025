<script setup lang="ts">
/**
 * RotaShiftModalFooter.
 * Primary responsibility: provides the action buttons for the shift modal footer.
 * Extracted to satisfy the flat-template requirement of the parent modal.
 */
import BaseButton from '@/components/shared/BaseButton.vue';

defineProps({
  saveLabel: { type: String, required: true },
  hasChanges: { type: Boolean, required: true }
});

defineEmits(['close', 'save']);
</script>

<template>
  <div class="footer-actions">
    <BaseButton label="Cancel" variant="text" @click="$emit('close')" />

    <BaseButton :disabled="!hasChanges" :label="saveLabel" @click="$emit('save')" />
  </div>
</template>

<style scoped>
/* Layout: standardises action placement at the bottom-right of the modal. */
.footer-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  width: 100%;
}
</style>

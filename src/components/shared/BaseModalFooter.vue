<script setup lang="ts">
/**
 * Generic footer component for BaseModal.
 * Standardises the "Cancel" and "Confirm/Save" action layout.
 */
import BaseButton from '@/components/shared/BaseButton.vue';

withDefaults(
  defineProps<{
    cancelLabel?: string;
    confirmLabel?: string;
    confirmVariant?: 'primary' | 'danger' | 'secondary';
    disableConfirm?: boolean;
    loading?: boolean;
  }>(),
  {
    cancelLabel: 'Cancel',
    confirmLabel: 'Save Changes',
    confirmVariant: 'primary',
    disableConfirm: false,
    loading: false
  }
);

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'confirm'): void;
}>();
</script>

<template>
  <div class="modal-footer-actions">
    <BaseButton
      :disabled="loading"
      :label="cancelLabel"
      type="button"
      variant="secondary"
      @click="emit('cancel')"
    />
    <BaseButton
      :disabled="disableConfirm"
      :label="confirmLabel"
      :loading="loading"
      type="submit"
      :variant="confirmVariant"
      @click="emit('confirm')"
    />
  </div>
</template>

<style scoped>
.modal-footer-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  width: 100%;
}
</style>

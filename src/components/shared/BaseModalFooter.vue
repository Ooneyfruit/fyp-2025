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
    helperText?: string;
    prependLabel?: string;
    prependVariant?: 'primary' | 'danger' | 'secondary' | 'outline' | 'ghost';
  }>(),
  {
    cancelLabel: 'Cancel',
    confirmLabel: 'Save Changes',
    confirmVariant: 'primary',
    disableConfirm: false,
    helperText: undefined,
    loading: false,
    prependLabel: undefined,
    prependVariant: 'outline'
  }
);

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'confirm'): void;
  (e: 'prepend'): void;
}>();
</script>

<template>
  <div class="modal-footer-container">
    <div v-if="helperText || $slots.helper" class="modal-footer-helper">
      <slot name="helper">
        <span class="helper-text">{{ helperText }}</span>
      </slot>
    </div>
    <div class="modal-footer-actions">
      <slot name="prepend">
        <BaseButton
          v-if="prependLabel"
          :label="prependLabel"
          type="button"
          :variant="prependVariant"
          @click="emit('prepend')"
        />
      </slot>
      <slot>
        <BaseButton
          class="btn-cancel"
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
      </slot>
    </div>
  </div>
</template>

<style scoped>
.modal-footer-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 100%;
}

.modal-footer-helper {
  text-align: center;
}

.modal-footer-actions {
  display: flex;
  flex: 1;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

.helper-text {
  color: var(--text-muted);
  font-size: 0.8rem;
}

/* Condition: Not enough horizontal, but enough vertical -> Vertically stacked */
@media (width <= 480px) and (height >= 501px) {
  .modal-footer-actions {
    align-items: stretch;
    flex-direction: column;
  }
}

/* Condition: Not enough vertical AND not enough horizontal -> Hide cancel to save space, keep horizontal */
@media (width <= 480px) and (height <= 500px) {
  .modal-footer-actions .btn-cancel {
    display: none;
  }
}
</style>

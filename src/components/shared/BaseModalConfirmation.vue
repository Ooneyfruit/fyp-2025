<script setup lang="ts">
/**
 * Shared confirmation footer for modals with unsaved changes.
 *
 * Usage:
 * Pass this component to BaseModal's `closeConfirmationFooter` prop.
 * BaseModal automatically injects `onStay` and `onDiscard`.
 */
import BaseButton from '@/components/shared/BaseButton.vue';

withDefaults(
  defineProps<{
    // Injected by BaseModal
    onStay: () => void;
    onDiscard: () => void;
    // Optional Customisation
    onSave?: () => void;
    saveLabel?: string;
    discardLabel?: string;
    continueLabel?: string;
    loading?: boolean;
  }>(),
  {
    onSave: undefined,
    saveLabel: 'Save changes',
    discardLabel: 'Discard changes',
    continueLabel: 'Keep editing',
    loading: false
  }
);
</script>

<template>
  <div class="confirmation-footer">
    <div class="footer-left">
      <BaseButton :label="discardLabel" variant="danger-ghost" @click="onDiscard" />
    </div>

    <div class="footer-right">
      <BaseButton :label="continueLabel" variant="secondary" @click="onStay" />
      <BaseButton
        v-if="onSave"
        :label="saveLabel"
        :loading="loading"
        variant="primary"
        @click="onSave"
      />
    </div>
  </div>
</template>

<style scoped>
.confirmation-footer {
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.footer-right {
  display: flex;
  gap: 0.75rem;
}
</style>

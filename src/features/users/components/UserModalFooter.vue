<script setup lang="ts">
/**
 * Footer actions for the User Management Modal.
 */
import BaseButton from '@/components/shared/BaseButton.vue';

defineProps<{
  hasChanges: boolean;
  saving: boolean;
  isEdit: boolean;
  onClose: () => void;
}>();
</script>

<template>
  <div class="footer-actions">
    <BaseButton label="Cancel" variant="secondary" @click="onClose" />
    <BaseButton
      :disabled="saving || !hasChanges"
      form="user-modal-form"
      :label="saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create account'"
      :processing="saving"
      type="submit"
    />
  </div>
</template>

<style scoped>
.footer-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  width: 100%;
}
</style>

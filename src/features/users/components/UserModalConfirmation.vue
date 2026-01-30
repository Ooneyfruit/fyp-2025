<script setup lang="ts">
/**
 * Footer actions for the User Modal 'Unsaved Changes' confirmation dialog.
 * Extracted to avoid nested template restrictions.
 */
import BaseButton from '@/components/shared/BaseButton.vue';

defineProps<{
  onStay: () => void;
  onDiscard: () => void;
  onSave: () => void;
}>();
</script>

<template>
  <div class="confirmation-actions">
    <BaseButton label="Stay" variant="text" @click="onStay" />
    <BaseButton label="Discard" variant="danger-outline" @click="onDiscard" />
    <BaseButton label="Save Changes" variant="primary" @click="onSave" />
  </div>
</template>

<style scoped>
.confirmation-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  width: 100%;
}
</style>

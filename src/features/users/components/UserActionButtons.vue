<script setup lang="ts">
/**
 * Component providing action buttons for user management.
 *
 * This component is intended to be used within a table or list view
 * where user records are displayed. It currently provides an "Edit User"
 * button that emits an `edit` event when clicked, allowing the parent
 * component to handle the editing logic (e.g., opening a modal).
 */
import IconEdit from '@/components/icons/IconEdit.vue';
import BaseButton from '@/components/shared/BaseButton.vue';

defineEmits<(e: 'edit') => void>();
</script>

<template>
  <div class="user-actions">
    <BaseButton
      :icon="IconEdit"
      icon-only
      label="Edit User"
      variant="secondary"
      @click="$emit('edit')"
    />
  </div>
</template>

<style scoped>
.user-actions {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
}
</style>

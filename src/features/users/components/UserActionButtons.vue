<script setup>
import IconEdit from '../../../components/icons/IconEdit.vue';
import BaseButton from '../../../components/shared/BaseButton.vue';

defineEmits(['edit']);
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

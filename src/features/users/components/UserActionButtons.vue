<template>
  <div class="user-actions">
    <BaseButton 
      label="Edit User" 
      :icon="IconEdit" 
      variant="secondary"
      icon-only
      @click="$emit('edit')" 
    />
    
    </div>
</template>

<script setup>
import BaseButton from '../../../components/shared/BaseButton.vue';
import IconEdit from '../../../components/icons/IconEdit.vue';

defineEmits(['edit']);
</script>

<style scoped>
.user-actions {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
}
</style>
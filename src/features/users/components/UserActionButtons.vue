<template>
  <button class="edit-action-btn" @click="$emit('edit')">
    <IconEdit class="icon-edit" />
  </button>
</template>

<script setup>
import IconEdit from '../../../components/icons/IconEdit.vue';
</script>

<style scoped>
.edit-action-btn { 
  display: flex; justify-content: center; align-items: center;
  background: none; border: 0.0625rem solid var(--border-color); 
  color: var(--text-muted); padding: 0.45rem; border-radius: 0.375rem; 
  cursor: pointer; transition: all var(--anim-speed) ease;
}
.icon-edit {
  width: 1.125rem;
  height: 1.125rem;
}
</style>
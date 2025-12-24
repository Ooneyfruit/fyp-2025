<template>
  <button class="edit-action-btn" @click="$emit('edit')">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  </button>
</template>

<style scoped>
.edit-action-btn { 
  display: flex; justify-content: center; align-items: center;
  background: none; border: 1px solid var(--border-color); 
  color: var(--text-muted); padding: 0.45rem; border-radius: 0.375rem; 
  cursor: pointer; transition: all 0.2s ease;
}
.edit-action-btn:hover { 
  border-color: var(--color-primary); 
  color: var(--color-primary); 
  background-color: #f8fafc; 
}
</style>
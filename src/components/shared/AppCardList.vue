<template>
  <div class="card-grid">
    <div v-for="(item, index) in items" :key="item.id || index" class="base-card">
      <div class="card-header">
        <slot name="card-header" :item="item" />
      </div>
      <div class="card-body">
        <slot name="card-body" :item="item" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true }
});
</script>

<style scoped>
.card-grid { display: flex; flex-direction: column; gap: 1.5rem; }
.base-card { 
  background: white; border: 1px solid var(--border-color); 
  border-radius: 0.75rem; padding: 1.25rem; width: 100%; 
  box-sizing: border-box; overflow: hidden; 
}
.card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
.card-body { border-top: 1px solid #f1f5f9; padding-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
</style>
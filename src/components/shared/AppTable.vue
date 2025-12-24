<template>
  <div class="grid-container">
    <div class="grid-header">
      <div 
        v-for="col in headers" 
        :key="col.key" 
        class="grid-cell grid-th"
        :style="col.style"
      >
        {{ col.label }}
      </div>
    </div>
    
    <div class="grid-body">
      <div v-for="(item, index) in items" :key="item.id || index" class="grid-tr">
        <div 
          v-for="col in headers" 
          :key="col.key" 
          class="grid-cell grid-td"
          :style="col.style"
        >
          <slot :name="`cell(${col.key})`" :item="item">
            {{ item[col.key] }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  headers: { type: Array, required: true },
  items: { type: Array, required: true }
});
</script>

<style scoped>
.grid-container {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
  width: 100%;
  overflow: hidden;
}

.grid-header, .grid-tr {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Keeps columns tight to the left */
  width: 100%;
  border-bottom: 1px solid #f1f5f9;
}

.grid-header { background: #f8fafc; }

.grid-cell {
  padding: 0.75rem 1rem; /* Standardized cell padding */
  min-width: 0; 
  box-sizing: border-box;
  overflow: hidden; /* Ensures column stability */
}

.grid-th {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.grid-tr:last-child { border-bottom: none; }
</style>
<template>
  <div class="table-container">
    <table class="generic-table">
      <thead>
        <tr>
          <th 
            v-for="col in headers" 
            :key="col.key"
            :class="[col.class, { 'shrink-col': col.shrink }]"
            :style="{ width: col.width }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in items" :key="item.id || index">
          <td v-for="col in headers" :key="col.key" :class="col.class">
            <slot :name="`cell(${col.key})`" :item="item">
              {{ item[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  headers: { type: Array, required: true }, // e.g. [{key: 'name', label: 'Name'}]
  items: { type: Array, required: true }
});
</script>

<style scoped>
.table-container { 
  background: white; border-radius: 0.75rem; border: 1px solid var(--border-color); 
  overflow-x: auto;
}
.generic-table { width: 100%; border-collapse: collapse; }
.generic-table th { 
  padding: 1rem; text-align: left; font-size: 0.7rem; 
  text-transform: uppercase; color: var(--text-muted); 
  background: #f8fafc; border-bottom: 1px solid var(--border-color);
}
.generic-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.shrink-col { width: 1%; white-space: nowrap; }
</style>
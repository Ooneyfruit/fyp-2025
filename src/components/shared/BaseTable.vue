<template>
  <div class="rd-card base-table-wrapper">
    <div 
      class="base-table" 
      :style="{ gridTemplateColumns: gridTemplate }"
      role="table"
    >
      <div class="table-header-group" role="rowgroup">
        <div 
          v-for="col in headers" 
          :key="col.key" 
          class="cell header-cell"
          :class="[`align-${col.align || 'left'}`]"
          role="columnheader"
        >
          {{ col.label }}
        </div>
      </div>

      <div class="table-body-group" role="rowgroup">
        <template v-if="items.length > 0">
          <div 
            v-for="(item, index) in items" 
            :key="item.id || index" 
            class="table-row"
            role="row"
          >
            <div 
              v-for="col in headers" 
              :key="col.key" 
              class="cell body-cell"
              :class="[`align-${col.align || 'left'}`]"
              role="cell"
            >
              <slot :name="`cell(${col.key})`" :item="item">
                {{ item[col.key] }}
              </slot>
            </div>
          </div>
        </template>

        <div v-else class="empty-state">
          <slot name="empty">No records found.</slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  headers: { type: Array, required: true },
  items: { type: Array, required: true }
});

const gridTemplate = computed(() => {
  return props.headers
    .map(h => h.width || '1fr')
    .join(' ');
});
</script>

<style scoped>
/* The container uses .rd-card from main.css to handle primary surface styling */
.base-table-wrapper {
  overflow: hidden;
}

.base-table {
  display: grid;
  width: 100%;
}

/* Shared Cell Properties */
.cell {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
  overflow: hidden;
  transition: background-color var(--anim-speed) ease;
}

/* Header Cells */
.table-header-group {
  display: contents;
}

.header-cell {
  background: var(--table-header-bg);
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  border-bottom: 1px solid var(--border-color);
  letter-spacing: 0.05em;
  height: 3.5rem;
}

/* Body Rows/Cells */
.table-body-group {
  display: contents;
}

.table-row {
  display: contents;
}

.body-cell {
  background: white;
  font-size: 0.9375rem;
  color: var(--text-main);
  border-bottom: 1px solid var(--table-row-border);
  min-height: 4.5rem;
}

.table-row:last-child .body-cell {
  border-bottom: none;
}

/* Interaction: Coordinated Hover with main.css variables */
.table-row:hover .body-cell {
  background-color: var(--table-row-hover);
}

/* Alignment Helpers */
.align-left { justify-content: flex-start; text-align: left; }
.align-center { justify-content: center; text-align: center; }
.align-right { justify-content: flex-end; text-align: right; }

/* Empty State Handling */
.empty-state {
  grid-column: 1 / -1;
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  background: white;
}
</style>
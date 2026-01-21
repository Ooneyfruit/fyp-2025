<template>
  <div class="rd-card base-table-wrapper">
    <div 
      class="base-table" 
      :class="{ 'has-vertical-lines': verticalLines }"
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
            :class="getRowClasses(item)"
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
/**
 * Primary responsibility: provides a flexible, grid-based data table component designed for 
 * accessibility and dynamic content rendering.
 * * Update 2.1: Added verticalLines prop for distinct column separation.
 */
import { computed } from 'vue';

const props = defineProps({
  headers: { type: Array, required: true },
  items: { type: Array, required: true },
  rowClass: { type: Function, default: () => [] },
  verticalLines: { type: Boolean, default: false }
});

const gridTemplate = computed(() => {
  return props.headers
    .map(h => h.width || '1fr')
    .join(' ');
});

const getRowClasses = (item) => {
  const classes = props.rowClass(item);
  return Array.isArray(classes) ? classes : [classes];
};
</script>

<style scoped>
.base-table-wrapper {
  overflow-x: auto; 
}

.base-table {
  display: grid;
  width: 100%;
  min-width: 600px; 
}

.cell {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
  overflow: hidden;
}

/* Header Styling */
.table-header-group { display: contents; }

.header-cell {
  background: var(--table-header-bg);
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  border-bottom: 1px solid var(--border-color);
  letter-spacing: 0.05em;
  height: 3.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Body Styling */
.table-body-group { display: contents; }
.table-row { display: contents; }

.body-cell {
  background: white;
  font-size: 0.9375rem;
  color: var(--text-main);
  border-bottom: 1px solid var(--table-row-border);
  min-height: 5.5rem; 
}

/* --- Vertical Lines Feature --- */
.base-table.has-vertical-lines .header-cell:not(:last-child),
.base-table.has-vertical-lines .body-cell:not(:last-child) {
  border-right: 1px solid #f1f5f9; /* Subtle divider */
}

/* Grouping Logic (Used by RotaView via :row-class) */
.table-row.role-group-middle .body-cell {
  border-bottom: 1px dashed var(--border-color); 
}

.table-row:last-child .body-cell {
  border-bottom: none;
}

.align-left { justify-content: flex-start; text-align: left; }
.align-center { justify-content: center; text-align: center; }
.align-right { justify-content: flex-end; text-align: right; }

.empty-state {
  grid-column: 1 / -1;
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  background: white;
}
</style>
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
/**
 * Primary responsibility: provides a flexible, grid-based data table component designed for 
 * accessibility and dynamic content rendering.
 */
import { computed } from 'vue';

// Define configuration for table structure and data items.
const props = defineProps({
  headers: { type: Array, required: true },
  items: { type: Array, required: true }
});

/**
 * Calculates a css grid template string based on the width property of each header object.
 * Defaults to fractional units if no width is specified.
 * @returns {string} A space-separated list of column widths.
 */
const gridTemplate = computed(() => {
  return props.headers
    .map(h => h.width || '1fr')
    .join(' ');
});
</script>

<style scoped>
/* Layout: handles container constraints and overflow behavior. */
.base-table-wrapper {
  overflow: hidden;
}

.base-table {
  display: grid;
  width: 100%;
}

/* Cells: shared structural properties for both header and body segments. */
.cell {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
  overflow: hidden;
  transition: background-color var(--anim-speed) ease;
}

/* Header: visual treatment for column labels and branding-aligned backgrounds. */
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

/* Body: interactive row styling and minimum height definitions. */
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

/* Cleanup: removes the trailing border from the final row to maintain container integrity. */
.table-row:last-child .body-cell {
  border-bottom: none;
}

/* Interaction: coordinated hover state using unified theme variables. */
.table-row:hover .body-cell {
  background-color: var(--table-row-hover);
}

/* Alignment: utility classes for positioning content horizontally within cells. */
.align-left { justify-content: flex-start; text-align: left; }
.align-center { justify-content: center; text-align: center; }
.align-right { justify-content: flex-end; text-align: right; }

/* State: styling and layout for the empty data message. */
.empty-state {
  grid-column: 1 / -1;
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  background: white;
}
</style>
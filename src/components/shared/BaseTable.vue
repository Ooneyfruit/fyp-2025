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
          :class="[
            `align-${col.align || 'left'}`,
            col.headerClass
          ]"
          role="columnheader"
        >
          {{ col.label }}
        </div>
      </div>

      <div class="table-body-group" role="rowgroup">
        <template v-if="items.length > 0">
          <div 
            v-for="(item, index) in enrichedItems" 
            :key="item.id || index" 
            class="table-row"
            :class="[
              ...getRowClasses(item),
              { 
                'group-start': item._isGroupStart,
                'group-end': item._isGroupEnd,
                'group-middle': item._isGroupMiddle
              }
            ]"
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
 * Primary responsibility: provides a flexible, grid-based data table component.
 * Supports visual grouping of rows via the 'groupBy' prop.
 */
import { computed } from 'vue';

const props = defineProps({
  headers: { type: Array, required: true },
  items: { type: Array, required: true },
  rowClass: { type: Function, default: () => [] },
  verticalLines: { type: Boolean, default: false },
  /**
   * Dot-notation path to the property used for grouping rows.
   * Example: "role.id"
   */
  groupBy: { type: String, default: null }
});

// Helper to access nested properties safely
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const enrichedItems = computed(() => {
  if (!props.groupBy) return props.items;

  return props.items.map((item, index, arr) => {
    const currentGroup = getNestedValue(item, props.groupBy);
    const prevGroup = index > 0 ? getNestedValue(arr[index - 1], props.groupBy) : null;
    const nextGroup = index < arr.length - 1 ? getNestedValue(arr[index + 1], props.groupBy) : null;

    return {
      ...item,
      _isGroupStart: currentGroup !== prevGroup,
      _isGroupEnd: currentGroup !== nextGroup,
      _isGroupMiddle: currentGroup === prevGroup && currentGroup === nextGroup
    };
  });
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
  background: transparent; /* Wrapper shouldn't have bg, allows spacing to show */
  border: none; /* Override standard card border */
  box-shadow: none;
}

.base-table {
  display: grid;
  width: 100%;
  min-width: 600px;
}

/* Base Cell Styling */
.cell {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
}

/* --- Header Styling --- */
.table-header-group { display: contents; }

.header-cell {
  background: white;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  border-bottom: 2px solid var(--border-color);
  letter-spacing: 0.05em;
  height: 3.5rem;
  position: sticky;
  top: 0;
  z-index: 20; /* Ensure headers stay above content */
}

/* --- Body Styling --- */
.table-body-group { display: contents; }
.table-row { display: contents; }

.body-cell {
  background: white;
  font-size: 0.9375rem;
  color: var(--text-main);
  min-height: 5.5rem;
  position: relative; /* Context for children */
  z-index: 1;
}

/* --- Vertical Lines --- */
.base-table.has-vertical-lines .header-cell:not(:last-child),
.base-table.has-vertical-lines .body-cell:not(:last-child) {
  border-right: 1px solid #f1f5f9;
}

/* --- Grouping & Spacing Logic --- */

/* 1. The Gap: Apply margin-top to the cells of the first row in a group */
.table-row.group-start .body-cell {
  margin-top: 1rem; /* The visual gap between groups */
  border-top: 1px solid var(--border-color);
}

/* 2. Top Rounded Corners for the group */
.table-row.group-start .body-cell:first-child { border-top-left-radius: 8px; }
.table-row.group-start .body-cell:last-child { border-top-right-radius: 8px; }

/* 3. Bottom Rounded Corners for the group */
.table-row.group-end .body-cell { border-bottom: 1px solid var(--border-color); }
.table-row.group-end .body-cell:first-child { border-bottom-left-radius: 8px; }
.table-row.group-end .body-cell:last-child { border-bottom-right-radius: 8px; }

/* 4. Middle Rows: Connect visually */
.table-row.group-middle .body-cell,
.table-row.group-start .body-cell {
  border-bottom: 1px solid #f8fafc; /* Very subtle divider inside group */
}

/* Alignment Utilities */
.align-left { justify-content: flex-start; text-align: left; }
.align-center { justify-content: center; text-align: center; }
.align-right { justify-content: flex-end; text-align: right; }

.empty-state {
  grid-column: 1 / -1;
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
  background: white;
  border-radius: 8px;
  margin-top: 1rem;
}
</style>
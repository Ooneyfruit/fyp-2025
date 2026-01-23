<script setup>
/**
 * Primary responsibility: provides a flexible, semantic data table component.
 * Supports visual grouping of rows via the 'groupBy' prop and dynamic component rendering.
 * Refactored to use native table elements for accessibility and flatter template structure.
 */
import { computed } from 'vue';

/**
 * @typedef {object} HeaderConfig
 * @property {string} key - Unique identifier for the column.
 * @property {string} label - Display text for the header.
 * @property {string} [width] - CSS grid column width.
 * @property {string} [align] - Text alignment.
 * @property {string} [headerClass] - Custom class for header cells.
 * @property {string} [cellClass] - Custom class for body cells.
 * @property {object} [component] - Dynamic component to render in cells.
 * @property {Function} [props] - Function returning props for the dynamic component.
 * @property {Function} [listeners] - Function returning event listeners for the dynamic component.
 * @property {Function} [formatter] - Function to format raw values.
 */

/**
 * @typedef {Record<string, any>} TableItem
 */

const props = defineProps({
  headers: { type: Array, required: true },
  items: { type: Array, required: true },
  rowClass: { type: Function, default: () => [] },
  verticalLines: { type: Boolean, default: false },
  groupBy: { type: String, default: null },
  emptyComponent: { type: Object, default: null },
  emptyProps: { type: Object, default: () => ({}) }
});

/**
 * Helper to access nested properties safely without using reduce.
 * @param {any} obj - The source object.
 * @param {string} path - Dot-notation path string.
 * @returns {any} The resolved value or undefined.
 */
const getNestedValue = (obj, path) => {
  if (!obj || !path) return;
  let current = obj;
  const parts = path.split('.');

  for (const part of parts) {
    if (current === null || current === undefined) return;
    current = current[part];
  }
  return current;
};

// Computed property to strictly type headers for the template loop
const typedHeaders = computed(() => {
  return /** @type {HeaderConfig[]} */ (props.headers);
});

const enrichedItems = computed(() => {
  if (!props.groupBy) return /** @type {TableItem[]} */ (props.items);

  const mapped = props.items.map((item, index, arr) => {
    const currentGroup = getNestedValue(item, props.groupBy);
    const prevGroup = index > 0 ? getNestedValue(arr[index - 1], props.groupBy) : null;
    const nextGroup = index < arr.length - 1 ? getNestedValue(arr[index + 1], props.groupBy) : null;

    // Cast item to object to satisfy spread operator requirements in TS
    const rawItem = /** @type {object} */ (item);

    return {
      ...rawItem,
      _isGroupStart: currentGroup !== prevGroup,
      _isGroupEnd: currentGroup !== nextGroup,
      _isGroupMiddle: currentGroup === prevGroup && currentGroup === nextGroup
    };
  });

  return /** @type {TableItem[]} */ (mapped);
});

const gridTemplate = computed(() => {
  return typedHeaders.value.map((h) => h.width || '1fr').join(' ');
});

/**
 * Resolves classes for a specific row.
 * @param {object} item - Row data item.
 * @returns {string[]} List of classes.
 */
const getRowClasses = (item) => {
  const classes = props.rowClass(item);
  return Array.isArray(classes) ? classes : [classes];
};

/**
 * Resolves the props object for a dynamic component cell.
 * @param {HeaderConfig} col - Header configuration object.
 * @param {object} item - Row data item.
 * @returns {object} Props object.
 */
const resolveProps = (col, item) => {
  if (typeof col.props === 'function') {
    return col.props(item);
  }
  return col.props || {};
};

/**
 * Resolves the event listeners for a dynamic component cell.
 * @param {HeaderConfig} col - Header configuration object.
 * @param {object} item - Row data item.
 * @returns {object} Listeners object.
 */
const resolveListeners = (col, item) => {
  if (typeof col.listeners === 'function') {
    return col.listeners(item);
  }
  return col.listeners || {};
};
</script>

<template>
  <div class="rd-card base-table-wrapper">
    <table
      class="base-table"
      :class="{ 'has-vertical-lines': verticalLines }"
      :style="{ gridTemplateColumns: gridTemplate }"
    >
      <thead>
        <tr class="table-header-row">
          <th
            v-for="col in typedHeaders"
            :key="col.key"
            class="cell header-cell"
            :class="[`align-${col.align || 'left'}`, col.headerClass]"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>

      <tbody v-if="items.length > 0">
        <tr
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
        >
          <td
            v-for="col in typedHeaders"
            :key="col.key"
            class="cell body-cell"
            :class="[`align-${col.align || 'left'}`, col.cellClass]"
          >
            <component
              :is="col.component"
              v-if="col.component"
              v-bind="resolveProps(col, item)"
              v-on="resolveListeners(col, item)"
            />

            <slot v-else :item="item" :name="`cell(${col.key})`">
              {{ col.formatter ? col.formatter(item[col.key], item) : item[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr>
          <td class="empty-state" :colspan="headers.length">
            <component :is="emptyComponent" v-if="emptyComponent" v-bind="emptyProps" />
            <slot v-else name="empty"> No records found. </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.base-table-wrapper {
  background: transparent;
  border: none;
  box-shadow: none;
  overflow-x: auto;
}

.base-table {
  display: grid;
  min-width: 600px;
  width: 100%;
}

/* --- Body Row Layout --- */
thead,
tbody,
tr {
  display: contents;
}

/* --- Header Styling --- */
.header-cell {
  background: white;
  border-bottom: 2px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  height: 3.5rem;
  letter-spacing: 0.05em;
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 20;
}

/* --- Body Styling --- */
.cell {
  align-items: center;
  display: flex;
  padding: var(--spacing-sm) var(--spacing-md);
}

.body-cell {
  background: white;
  color: var(--text-main);
  font-size: 0.9375rem;
  min-height: 5.5rem;
  position: relative;
  z-index: 1;
}

/* --- Grouping & Spacing Logic (Base Selectors) --- */

/* These must appear BEFORE any pseudo-class overrides to satisfy Stylelint */

.table-row.group-start .body-cell {
  border-bottom: 1px solid #f8fafc;
  border-top: 1px solid var(--border-color);
  margin-top: 1rem;
}

.table-row.group-end .body-cell {
  border-bottom: 1px solid var(--border-color);
}

.table-row.group-middle .body-cell {
  border-bottom: 1px solid #f8fafc;
}

/* --- Alignment Utilities --- */
.align-left {
  justify-content: flex-start;
  text-align: left;
}

.align-center {
  justify-content: center;
  text-align: center;
}

.align-right {
  justify-content: flex-end;
  text-align: right;
}

.empty-state {
  background: white;
  border-radius: 8px;
  color: var(--text-muted);
  grid-column: 1 / -1;
  margin-top: 1rem;
  padding: 3rem;
  text-align: center;
}

/* --- Specificity Overrides & Pseudo-Classes --- */

/* Placed at the end to ensure they override base styles and respect descending specificity rules */

/* Pseudo-classes (Highest Specificity in this context) */
.table-row.group-start .body-cell:first-child {
  border-top-left-radius: 8px;
}

.table-row.group-start .body-cell:last-child {
  border-top-right-radius: 8px;
}

.table-row.group-end .body-cell:first-child {
  border-bottom-left-radius: 8px;
}

.table-row.group-end .body-cell:last-child {
  border-bottom-right-radius: 8px;
}

/* Vertical lines logic must be last to override border settings */
.base-table.has-vertical-lines .header-cell:not(:last-child),
.base-table.has-vertical-lines .body-cell:not(:last-child) {
  border-right: 1px solid #f1f5f9;
}
</style>

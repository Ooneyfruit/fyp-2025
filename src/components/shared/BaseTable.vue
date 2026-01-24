<script setup lang="ts">
/**
 * BaseTable.
 * Primary responsibility: provides a flexible, semantic data table component.
 * Supports visual grouping of rows via the 'groupBy' prop and dynamic component rendering.
 * Refactored to eliminate 'any' types and satisfy strict TypeScript standards.
 */
import { type Component, computed } from 'vue';

import { type Dict } from '@/types/generic';

/**
 * Configuration for a single table column.
 */
interface HeaderConfig {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'centre' | 'right';
  headerClass?: string;
  cellClass?: string;
  component?: Component;
  props?: Dict | ((item: TableItem) => Dict);
  listeners?: Dict | ((item: TableItem) => Dict);
  formatter?: (value: unknown, item: TableItem) => unknown;
}

/**
 * Represents a raw data row in the table.
 */
interface TableItem extends Record<string, unknown> {
  id?: string | number;
}

/**
 * Internal interface for items with added grouping metadata.
 */
interface EnrichedTableItem extends TableItem {
  _isGroupStart?: boolean;
  _isGroupEnd?: boolean;
  _isGroupMiddle?: boolean;
}

const props = withDefaults(
  defineProps<{
    headers: HeaderConfig[];
    items: TableItem[];
    rowClass?: (item: TableItem) => string | string[];
    verticalLines?: boolean;
    groupBy?: string | null;
    emptyComponent?: Component | null;
    emptyProps?: Dict;
  }>(),
  {
    rowClass: () => [],
    verticalLines: false,
    groupBy: null,
    emptyComponent: null,
    emptyProps: () => ({})
  }
);

/**
 * Helper to access nested properties safely using a string path.
 * @param obj - The source object to traverse.
 * @param path - Dot-notation path string (e.g. "user.profile.name").
 * @returns The resolved value or undefined if the path is invalid.
 */
const getNestedValue = (obj: TableItem, path: string | null): unknown => {
  if (!obj || !path) {
    return;
  }

  let current: unknown = obj;
  const parts = path.split('.');

  for (const part of parts) {
    if (current === null || typeof current !== 'object') {
      return;
    }
    current = (current as Dict)[part];
  }

  return current;
};

// Logic: maps the raw items to include grouping metadata if required by the view.
const enrichedItems = computed<EnrichedTableItem[]>(() => {
  if (!props.groupBy) {
    return props.items as EnrichedTableItem[];
  }

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

// Logic: calculates the grid template columns based on header width configurations.
const gridTemplate = computed(() => {
  return props.headers.map((h) => h.width || '1fr').join(' ');
});

/**
 * Resolves classes for a specific row based on the rowClass prop function.
 * @param item - The specific row data item.
 * @returns An array of CSS classes.
 */
const getRowClasses = (item: EnrichedTableItem): string[] => {
  if (!props.rowClass) {
    return [];
  }
  const classes = props.rowClass(item);
  return Array.isArray(classes) ? classes : [classes];
};

/**
 * Resolves the props object for a dynamic component cell.
 * @param col - The header configuration for the current column.
 * @param item - The current row data item.
 * @returns A dictionary of props for the component.
 */
const resolveProps = (col: HeaderConfig, item: EnrichedTableItem): Dict => {
  if (typeof col.props === 'function') {
    return col.props(item);
  }
  return col.props || {};
};

/**
 * Resolves the event listeners for a dynamic component cell.
 * @param col - The header configuration for the current column.
 * @param item - The current row data item.
 * @returns A dictionary of event listeners.
 */
const resolveListeners = (col: HeaderConfig, item: EnrichedTableItem): Dict => {
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
            v-for="col in headers"
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
            v-for="col in headers"
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
              {{
                col.formatter
                  ? col.formatter(item[col.key], item)
                  : (item[col.key] as string | number)
              }}
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

/* These must appear BEFORE any pseudo-class overrides to satisfy Stylelint. */

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

.align-centre {
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

/* Placed at the end to ensure they override base styles and respect descending specificity rules. */

/* Pseudo-classes (Highest Specificity in this context). */
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

/* Vertical lines logic must be last to override border settings. */
.base-table.has-vertical-lines .header-cell:not(:last-child),
.base-table.has-vertical-lines .body-cell:not(:last-child) {
  border-right: 1px solid #f1f5f9;
}
</style>

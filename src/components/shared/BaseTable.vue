<script setup lang="ts">
/**
 * Primary responsibility: Provides a flexible, grid-based data table component.
 * This module supports visual grouping of rows via the 'groupBy' prop and ensures
 * high accessibility through semantic HTML elements.
 */
import { type Component, computed } from 'vue';

export interface TableHeader {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  headerClass?: string;
  cellClass?: string;
  cellComponent?: Component;
  meta?: unknown;
}

type EnrichedItem = Record<string, unknown> & {
  _isGroupStart: boolean;
  _isGroupEnd: boolean;
  _isGroupMiddle: boolean;
};

interface Props {
  headers: TableHeader[];
  items: Record<string, unknown>[];
  rowClass?: (item: Record<string, unknown>) => string | string[];
  verticalLines?: boolean;
  groupBy?: string | null;
  emptyComponent?: Component;
  /**
   * Optional comparison function to sort the items before rendering.
   */
  sortFunction?: (a: Record<string, unknown>, b: Record<string, unknown>) => number;
}

const props = withDefaults(defineProps<Props>(), {
  rowClass: () => [],
  verticalLines: false,
  groupBy: null,
  emptyComponent: undefined,
  sortFunction: undefined
});

const getNestedValue = (obj: Record<string, unknown> | null | undefined, path: string): unknown => {
  if (!obj) {
    return null;
  }
  let current: unknown = obj;
  const parts = path.split('.');

  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as object)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }

  return current;
};

/**
 * Enriches the input items with grouping metadata based on the 'groupBy' property.
 */
const enrichedItems = computed<EnrichedItem[]>(() => {
  // Apply sorting if provided
  const sourceItems = props.sortFunction ? props.items.toSorted(props.sortFunction) : props.items;

  if (!props.groupBy) {
    return sourceItems.map((item) => ({
      ...item,
      _isGroupStart: false,
      _isGroupEnd: false,
      _isGroupMiddle: false
    }));
  }

  const groupPath = props.groupBy;
  return sourceItems.map((item, index, arr): EnrichedItem => {
    const currentGroup = getNestedValue(item, groupPath);
    const prevGroup = getNestedValue(arr[index - 1], groupPath);
    const nextGroup = getNestedValue(arr[index + 1], groupPath);

    return {
      ...item,
      _isGroupStart: currentGroup !== prevGroup,
      _isGroupEnd: currentGroup !== nextGroup,
      _isGroupMiddle: currentGroup === prevGroup && currentGroup === nextGroup
    };
  });
});

const gridTemplate = computed(() => {
  return props.headers.map((h) => h.width || '1fr').join(' ');
});

const getRowClasses = (item: Record<string, unknown>) => {
  const classes = props.rowClass(item);
  return Array.isArray(classes) ? classes : [classes];
};
</script>

<template>
  <div class="rd-card base-table-wrapper">
    <table
      class="base-table"
      :class="{ 'has-vertical-lines': verticalLines }"
      :style="{ gridTemplateColumns: gridTemplate }"
    >
      <thead class="table-header-group">
        <tr>
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

      <tbody v-if="items.length > 0" class="table-body-group">
        <tr
          v-for="(item, index) in enrichedItems"
          :key="(item['id'] as string | number) || index"
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
              :is="col.cellComponent"
              v-if="col.cellComponent"
              :header="col"
              :item="item"
            />
            <slot v-else :item="item" :name="`cell(${col.key})`">
              {{ item[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>

      <tbody v-else class="table-body-group">
        <tr class="empty-state-row">
          <td class="empty-state">
            <component :is="emptyComponent" v-if="emptyComponent" />
            <slot v-else name="empty">No records found.</slot>
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

.cell {
  align-items: center;
  display: flex;
  padding: var(--spacing-sm) var(--spacing-md);
}

.table-header-group {
  display: contents;
}

.table-header-group tr {
  display: contents;
}

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

.table-body-group {
  display: contents;
}

.table-row {
  display: contents;
}

.body-cell {
  background: white;
  color: var(--text-main);
  font-size: 0.9375rem;
  min-height: 5.5rem;
  position: relative;
  z-index: 1;
}

.table-row.group-start .body-cell {
  border-top: 1px solid var(--border-color);
  margin-top: 1rem;
}

.table-row.group-end .body-cell {
  border-bottom: 1px solid var(--border-color);
}

.table-row.group-middle .body-cell,
.table-row.group-start .body-cell {
  border-bottom: 1px solid #f8fafc;
}

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

.base-table.has-vertical-lines .header-cell:not(:last-child),
.base-table.has-vertical-lines .body-cell:not(:last-child) {
  border-right: 1px solid #f1f5f9;
}

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

.empty-state-row {
  display: contents;
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
</style>

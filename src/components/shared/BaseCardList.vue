<script setup lang="ts">
/**
 * Provides a flexible grid layout for rendering data objects. Automatically adjusts columns based on available width using CSS Grid and supports slot forwarding via props.
 */
import { type Component, type PropType, useSlots } from 'vue';

import BaseCard from './BaseCard.vue';

// Retrieve slots to pass them programmatically to children.
const slots = useSlots();

defineProps({
  // The array of data objects to be transformed into card elements.
  items: {
    // Uses Record<string, unknown> to avoid 'any' while allowing dynamic property access.
    type: Array as PropType<Array<Record<string, unknown>>>,
    required: true
  },
  // The object property name used to provide a unique key for list reconciliation.
  keyField: {
    type: String,
    default: 'id'
  },
  // The gap between list items, defined using standard css units.
  gap: {
    type: String,
    default: '1.5rem'
  },
  // The minimum width a card can shrink to before wrapping to a new row.
  minCardWidth: {
    type: String,
    default: '300px'
  },
  /**
   * Optional component to render in the card header.
   * passed down to BaseCard for rendering.
   */
  headerComponent: {
    type: Object as PropType<Component>,
    default: null
  },
  /**
   * Optional props object to pass to the header component.
   * Merged with the default `{ item }` prop.
   */
  headerProps: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({})
  },
  /**
   * Optional component to render in the card body.
   * Replaces the default slot if provided.
   */
  bodyComponent: {
    type: Object as PropType<Component>,
    default: null
  },
  /**
   * Optional props object to pass to the body component.
   * Merged with the default `{ item }` prop.
   */
  bodyProps: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({})
  }
});
</script>

<template>
  <div
    class="card-list"
    :style="{
      '--list-gap': gap,
      '--min-card-width': minCardWidth
    }"
  >
    <BaseCard
      v-for="(item, index) in items"
      :key="(item[keyField] as string | number) || index"
      :header-component="headerComponent"
      :header-props="{ item, ...headerProps }"
      :header-slot="slots['card-header']"
    >
      <component :is="bodyComponent" v-if="bodyComponent" v-bind="{ item, ...bodyProps }" />
      <slot v-else :item="item" name="card-body" />
    </BaseCard>
  </div>
</template>

<style scoped>
/* * Layout: Responsive grid container using auto-fit.
 * 'auto-fit' collapses empty tracks, ensuring items expand to fill the row 
 * even if there are fewer items than available columns (space filling).
 */
.card-list {
  display: grid;
  gap: var(--list-gap);
  grid-template-columns: repeat(auto-fit, minmax(var(--min-card-width), 1fr));
  width: 100%;
}
</style>

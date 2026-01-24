<script setup>
/**
 * Primary responsibility: provides a flexible grid layout for rendering data objects.
 * Automatically adjusts columns based on available width using CSS Grid.
 * Reconfigured to use component injection instead of slots to avoid template nesting.
 */
import { computed } from 'vue';

const props = defineProps({
  // The array of data objects to be transformed into card elements.
  items: {
    type: (Array),
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
   * Component to render for each item.
   * This component must accept an 'item' prop and handle its own internal layout.
   */
  cardComponent: {
    type: Object,
    required: true
  }
});

/**
 * Accessor for list items with type safety.
 * Logic: ensures 'item' is treated as a record for key access.
 */
const typedItems = computed(() => (props.items));
</script>

<template>
  <div
    class="card-list"
    :style="{
      '--list-gap': gap,
      '--min-card-width': minCardWidth
    }"
  >
    <component
      :is="cardComponent"
      v-for="(item, index) in typedItems"
      :key="item[keyField] || index"
      :item="item"
      v-on="$attrs"
    />
  </div>
</template>

<style scoped>
/* * Layout: Responsive grid container using auto-fit.
 * 'auto-fit' collapses empty tracks, ensuring items expand to fill the row.
 */
.card-list {
  display: grid;
  gap: var(--list-gap);
  grid-template-columns: repeat(auto-fit, minmax(var(--min-card-width), 1fr));
  width: 100%;
}
</style>

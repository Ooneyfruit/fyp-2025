<script setup>
/**
 * Primary responsibility: provides a flexible grid layout for rendering data objects.
 * Automatically adjusts columns based on available width using CSS Grid.
 */
import BaseCard from './BaseCard.vue';

// Define the configuration properties for the list data and its visual presentation.
defineProps({
  // The array of data objects to be transformed into card elements.
  items: {
    type: Array,
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
    <BaseCard v-for="(item, index) in items" :key="item[keyField] || index">
      <template v-if="$slots['card-header']" #header>
        <slot name="card-header" :item="item" />
      </template>

      <slot name="card-body" :item="item" />
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
  grid-template-columns: repeat(auto-fit, minmax(var(--min-card-width), 1fr));
  gap: var(--list-gap);
  width: 100%;
}
</style>

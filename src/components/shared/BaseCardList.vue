<template>
  <div class="card-list" :style="{ '--list-gap': gap }">
    <BaseCard v-for="(item, index) in items" :key="item[keyField] || index">
      <template v-if="$slots['card-header']" #header>
        <slot name="card-header" :item="item" />
      </template>

      <slot name="card-body" :item="item" />
    </BaseCard>
  </div>
</template>

<script setup>
/**
 * Primary responsibility: provides a flexible layout utility for rendering a collection 
 * of data objects into a standardized vertical list of card components.
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
  // The vertical gap between list items, defined using standard css units.
  gap: { 
    type: String, 
    default: '1.5rem' 
  }
});
</script>

<style scoped>
/* Layout: flexible column container utilizing custom properties for vertical spacing. */
.card-list {
  display: flex;
  flex-direction: column;
  gap: var(--list-gap);
  width: 100%;
}
</style>
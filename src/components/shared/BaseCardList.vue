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
import BaseCard from './BaseCard.vue';

defineProps({
  items: { 
    type: Array, 
    required: true 
  },
  // Allows the user to specify which field to use for the Vue key
  keyField: { 
    type: String, 
    default: 'id' 
  },
  // Controls the vertical spacing between cards
  gap: { 
    type: String, 
    default: '1.5rem' 
  }
});
</script>

<style scoped>
.card-list {
  display: flex;
  flex-direction: column;
  gap: var(--list-gap);
  width: 100%;
}
</style>
<script setup lang="ts">
/**
 * (needs description).
 */

import IconEdit from '@/components/icons/IconEdit.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import { type TableHeader } from '@/components/shared/BaseTable.vue';

const props = defineProps<{
  item: Record<string, unknown>;
  header: TableHeader;
}>();

// Access the callback injected via the column definition
const handleAction = () => {
  const callback = (props.header.meta as { onEdit?: (i: Record<string, unknown>) => void })?.onEdit;
  if (callback) {
    callback(props.item);
  }
};
</script>

<template>
  <div class="cell-actions">
    <BaseButton class="icon-only-btn" :icon="IconEdit" variant="secondary" @click="handleAction" />
  </div>
</template>

<style scoped>
.cell-actions {
  display: flex;
  justify-content: center;
}

.icon-only-btn {
  border-color: transparent;
  padding: 0.3rem;
}
</style>

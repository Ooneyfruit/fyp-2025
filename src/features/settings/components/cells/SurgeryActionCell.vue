<script setup lang="ts">
/**
 * (needs description).
 */

import { computed } from 'vue';

import IconArchiveRestore from '@/components/icons/IconArchiveRestore.vue';
import IconEdit from '@/components/icons/IconEdit.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import { type TableHeader } from '@/components/shared/BaseTable.vue';

const props = defineProps<{
  item: Record<string, unknown>;
  header: TableHeader;
}>();

const isDeleted = computed(() => !!props.item.is_deleted);

const handleAction = () => {
  const meta = props.header.meta as {
    onEdit?: (i: Record<string, unknown>) => void;
    onRestore?: (i: Record<string, unknown>) => void;
  };

  if (isDeleted.value && meta?.onRestore) {
    meta.onRestore(props.item);
  } else if (!isDeleted.value && meta?.onEdit) {
    meta.onEdit(props.item);
  }
};
</script>

<template>
  <div class="cell-actions">
    <BaseButton
      class="btn-square"
      :class="isDeleted ? 'restore-btn' : 'edit-btn'"
      :icon="isDeleted ? IconArchiveRestore : IconEdit"
      :title="isDeleted ? 'Restore Surgery' : 'Edit Surgery'"
      variant="secondary"
      @click="handleAction"
    />
  </div>
</template>

<style scoped>
.cell-actions {
  display: flex;
  justify-content: center;
  width: 100%;
}

/* Force perfect centering and square aspect ratio for icon-only buttons */
.btn-square {
  align-items: center;
  border-color: transparent;
  display: flex;
  height: 2rem;
  justify-content: center;
  padding: 0 !important;
  width: 2rem;
}

.restore-btn:hover {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.edit-btn:hover {
  background-color: #eff6ff;
  color: var(--color-primary);
}
</style>

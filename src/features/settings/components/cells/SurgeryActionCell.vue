<script setup lang="ts">
/**
 * Table cell component for surgery actions (edit/restore).
 *
 * Rendered within the surgeries data table, this component displays
 * context-sensitive action buttons based on the surgery's status.
 * If the surgery is active, it shows an "Edit" button. If it's archived
 * (deleted), it shows a "Restore" button. Actions are delegated to
 * callbacks provided via the table header metadata.
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
      :class="isDeleted ? 'restore-btn' : 'edit-btn'"
      :icon="isDeleted ? IconArchiveRestore : IconEdit"
      icon-only
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

.restore-btn:hover {
  background-color: var(--colour-success-bg);
  color: var(--colour-success);
}

.edit-btn:hover {
  background-color: #eff6ff;
  color: var(--colour-primary);
}
</style>

<script setup lang="ts">
/**
 * (needs description).
 */

import IconEdit from '@/components/icons/IconEdit.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import { type TableHeader } from '@/components/shared/BaseTable.vue';
import { type PracticeRoleConfig } from '@/features/settings/settingsTypes';

const props = defineProps<{
  item: Record<string, unknown>;
  header: TableHeader;
}>();

const handleAction = () => {
  const callback = (props.header.meta as { onEdit?: (i: PracticeRoleConfig) => void })?.onEdit;
  if (callback) {
    // Safe cast as we control the data flow in the parent
    callback(props.item as unknown as PracticeRoleConfig);
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

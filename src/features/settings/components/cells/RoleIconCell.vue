<script setup lang="ts">
/**
 * Renders the chosen role icon SVG or a placeholder if missing.
 */
import { computed } from 'vue';

import { type TableHeader } from '@/components/shared/BaseTable.vue';
import { getRoleIcon } from '@/features/settings/composables/useRoleIcons';

const props = defineProps<{
  item: Record<string, unknown>;
  header: TableHeader;
}>();

/**
 * Resolves the SVG component based on the stored icon ID.
 */
const iconComponent = computed(() => {
  const iconId = props.item.icon_id as string | undefined | null;
  return getRoleIcon(iconId);
});
</script>

<template>
  <div class="icon-wrapper">
    <component :is="iconComponent" v-if="iconComponent" class="role-icon-svg" />
    <span v-else aria-hidden="true" class="no-icon-placeholder">&mdash;</span>
  </div>
</template>

<style scoped>
.icon-wrapper {
  align-items: center;
  display: flex;
  height: 2rem;
  justify-content: center;
  width: 2rem;
}

.role-icon-svg {
  color: var(--text-main);
  height: 1.25rem;
  width: 1.25rem;
}

.no-icon-placeholder {
  color: var(--text-muted);
  font-weight: 300;
  opacity: 0.5;
}
</style>

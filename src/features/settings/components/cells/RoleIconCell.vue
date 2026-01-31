<script setup lang="ts">
/**
 * Renders the role icon or a placeholder if missing.
 */
import { type TableHeader } from '@/components/shared/BaseTable.vue';

defineProps<{
  item: Record<string, unknown>;
  header: TableHeader;
}>();
</script>

<template>
  <div class="icon-wrapper">
    <img v-if="item.icon_url" alt="Role Icon" class="role-icon" :src="item.icon_url as string" />
    <span v-else class="no-icon">&mdash;</span>
  </div>
</template>

<style scoped>
.role-icon {
  border-radius: 50%;
  height: 2rem;
  object-fit: cover;
  width: 2rem;
}

.no-icon {
  color: var(--text-muted);
}
</style>

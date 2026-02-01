<script setup lang="ts">
/**
 * (needs description).
 */

import { computed } from 'vue';

import { useRotaColors } from '@/features/rota/composables/useRotaColors';
import { type PracticeRoleConfig } from '@/features/settings/settingsTypes';

const props = defineProps<{
  item: Record<string, unknown>;
}>();

const { getRoleColor } = useRotaColors();

const roleData = computed(() => props.item as unknown as PracticeRoleConfig);
const isOverridden = computed(() => roleData.value.color_index !== undefined);
const color = computed(() => getRoleColor(roleData.value.name));
</script>

<template>
  <div class="color-cell">
    <div
      v-if="isOverridden"
      class="swatch"
      :style="{ backgroundColor: color.bg, borderColor: color.accent }"
      title="Color Override Active"
    />
  </div>
</template>

<style scoped>
.color-cell {
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
}

.swatch {
  border: 2px solid transparent;
  border-radius: 50%;
  height: 1.25rem;
  width: 1.25rem;
}
</style>

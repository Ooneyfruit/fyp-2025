<script setup lang="ts">
/**
 * Table cell component displaying a color swatch for a practice role.
 *
 * Used in the roles configuration table, this component conditionally
 * renders a circular color swatch if the role has a custom color assigned.
 * It integrates with the `useRotaColors` composable to retrieve the
 * appropriate background and border colors based on the role's name or index.
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

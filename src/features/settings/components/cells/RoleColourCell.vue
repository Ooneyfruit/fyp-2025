<script setup lang="ts">
/**
 * Table cell component displaying a colour swatch for a practice role.
 *
 * Used in the roles configuration table, this component conditionally
 * renders a circular colour swatch if the role has a custom colour assigned.
 * It integrates with the `ROLE_PALETTE` constant to retrieve the
 * appropriate background and border colours based on the role's index.
 */

import { computed } from 'vue';

import { ROLE_PALETTE } from '@/features/rota/composables/useRotaColours';
import { type PracticeRoleConfig } from '@/features/settings/settingsTypes';

const props = defineProps<{
  item: Record<string, unknown>;
}>();

const roleData = computed(() => props.item as unknown as PracticeRoleConfig);
const isOverridden = computed(
  () => roleData.value.colour_index !== null && roleData.value.colour_index !== undefined
);
const colour = computed(() =>
  isOverridden.value ? ROLE_PALETTE[roleData.value.colour_index as number] : null
);
</script>

<template>
  <div class="colour-cell">
    <div
      v-if="isOverridden && colour"
      class="swatch"
      :style="{ backgroundColor: colour.bg, borderColor: colour.accent }"
      title="Colour Override Active"
    />
  </div>
</template>

<style scoped>
.colour-cell {
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

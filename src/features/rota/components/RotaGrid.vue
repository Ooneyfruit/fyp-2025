<script lang="ts">
/**
 * (needs description).
 */

const defaultIsRequirementUnmet = () => false;
</script>

<script setup lang="ts">
/**
 * Rota grid component for displaying shifts in a tabular format.
 * Orchestrates switching between desktop and mobile grid views.
 */

import { type PropType, ref } from 'vue';

import { useBreakpoints } from '@/composables/useBreakpoints';
import type { RotaDay } from '@/features/rota/composables/useRotaDates';
import type { RotaRow, Shift } from '@/features/rota/rotaTypes';

import RotaGridDesktop from './RotaGridDesktop.vue';
import RotaGridMobile from './RotaGridMobile.vue';

defineProps({
  days: {
    type: Array as PropType<RotaDay[]>,
    required: true
  },
  rows: {
    type: Array as PropType<RotaRow[]>,
    required: true
  },
  getShifts: {
    type: Function as PropType<(roleId: string, surgeryId: string, dateIso: string) => Shift[]>,
    required: true
  },
  isRequirementUnmet: {
    type: Function as PropType<(roleId: string, surgeryId: string, day: RotaDay) => boolean>,
    default: () => defaultIsRequirementUnmet
  }
});

const emit = defineEmits(['slot-click']);

const MOBILE_BREAKPOINT_REM = 50;
const bodyRef = ref<HTMLElement | null>(typeof document === 'undefined' ? null : document.body);
const { isMobile } = useBreakpoints(bodyRef, MOBILE_BREAKPOINT_REM);

const handleSlotClick = (payload: { rowItem: unknown; day: RotaDay }) => {
  emit('slot-click', payload);
};
</script>

<template>
  <div class="rota-grid-wrapper">
    <RotaGridMobile
      v-if="isMobile"
      :days="days"
      :get-shifts="getShifts"
      :is-requirement-unmet="isRequirementUnmet"
      :rows="rows"
      @slot-click="handleSlotClick"
    />
    <RotaGridDesktop
      v-else
      :days="days"
      :get-shifts="getShifts"
      :is-requirement-unmet="isRequirementUnmet"
      :rows="rows"
      @slot-click="handleSlotClick"
    />
  </div>
</template>

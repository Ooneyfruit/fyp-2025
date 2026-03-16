<script setup lang="ts">
/**
 * Rota grid component for displaying shifts in a tabular format.
 * Orchestrates switching between desktop and mobile grid views.
 */

import { type PropType, ref } from 'vue';

import { useBreakpoints } from '@/composables/useBreakpoints';
import type { RotaDay } from '@/features/rota/composables/useRotaDates';
import type { PracticeRole, PracticeSurgery, Shift } from '@/features/rota/rotaTypes';

import RotaGridDesktop from './RotaGridDesktop.vue';
import RotaGridMobile from './RotaGridMobile.vue';

/**
 * Represents a row in the rota grid.
 * Includes denormalised role and surgery data.
 * The index signature is required to ensure compatibility with BaseTable's Record type.
 */
interface RotaRow {
  [key: string]: unknown;
  id: string;
  role: PracticeRole;
  surgery: PracticeSurgery;
  _isGroupStart?: boolean;
}

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
      :rows="rows"
      @slot-click="handleSlotClick"
    />
    <RotaGridDesktop
      v-else
      :days="days"
      :get-shifts="getShifts"
      :rows="rows"
      @slot-click="handleSlotClick"
    />
  </div>
</template>

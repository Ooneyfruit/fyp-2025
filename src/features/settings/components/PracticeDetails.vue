<script setup lang="ts">
/**
 * Component to display the high-level practice details.
 */
import { ref } from 'vue';

import IconEdit from '@/components/icons/IconEdit.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import BaseCard from '@/components/shared/BaseCard.vue';
import PracticeDetailsModal from '@/features/settings/components/modals/PracticeDetailsModal.vue';
import { type PracticeDetails } from '@/features/settings/settingsTypes';

defineProps<{
  details: PracticeDetails;
}>();

const isModalOpen = ref(false);
</script>

<template>
  <div class="details-wrapper">
    <BaseCard>
      <div class="rd-card-header">
        <h4 class="card-title">General Information</h4>
        <BaseButton
          aria-label="Edit Details"
          :icon="IconEdit"
          icon-only
          variant="secondary"
          @click="isModalOpen = true"
        />
      </div>
      <div class="rd-card-body">
        <div class="field">
          <div class="label">Practice Name</div>
          <div class="value">{{ details.name }}</div>
        </div>
        <div class="field">
          <div class="label">Address</div>
          <div class="value address">{{ details.address }}</div>
        </div>
      </div>
    </BaseCard>

    <PracticeDetailsModal
      :initial-data="details"
      :show="isModalOpen"
      @close="isModalOpen = false"
    />
  </div>
</template>

<style scoped>
.details-wrapper {
  width: 100%;
}

.rd-card-header {
  border-bottom: none;
  justify-content: space-between;
  padding-bottom: 0;
}

.card-title {
  color: var(--text-main);
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.edit-btn {
  padding: 0.4rem;
}

.rd-card-body {
  border-top: none;
  padding-top: 0;
}

.field {
  margin-bottom: 0.5rem;
}

.field .label {
  color: var(--text-muted);
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.value {
  color: var(--text-main);
  font-size: 1rem;
}

.address {
  white-space: pre-wrap;
}
</style>

<script setup lang="ts">
/**
 * (needs description).
 */

/**
 * Default footer for the BaseModal exit confirmation.
 * Provides standard 'Discard' and 'Keep Editing' actions.
 */
import BaseButton from '@/components/shared/BaseButton.vue';

// Define the interface for the actions passed by BaseModal.
// Removed 'const props =' to fix ESLint "assigned but never used" error.
withDefaults(
  defineProps<{
    onStay?: () => void;
    onDiscard?: () => void;
    stayLabel?: string;
    discardLabel?: string;
  }>(),
  {
    onStay: () => {},
    onDiscard: () => {},
    stayLabel: 'Keep editing',
    discardLabel: 'Discard changes'
  }
);
</script>

<template>
  <div class="confirmation-footer">
    <BaseButton :label="stayLabel" variant="secondary" @click="onStay" />
    <BaseButton :label="discardLabel" variant="danger" @click="onDiscard" />
  </div>
</template>

<style scoped>
.confirmation-footer {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  width: 100%;
}
</style>

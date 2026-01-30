<script setup lang="ts">
/**
 * Manages user permission states and security constraints.
 * Logic: prevents self-promotion for non-admins and triggers warnings for self-demotion.
 */
import { computed, ref } from 'vue';

import BaseButton from '@/components/shared/BaseButton.vue';
import BaseFormBlock from '@/components/shared/BaseFormBlock.vue';
import BaseToggleDescription from '@/components/shared/BaseToggleDescription.vue';
import { user as authUser } from '@/composables/useAuth';
import { type UserProfile } from '@/features/users/userTypes';

// Define the shape of the form data we are editing
export interface UserAccessForm {
  is_administrator: boolean;
  is_employee: boolean;
  [key: string]: unknown; // Allow other properties to pass through spread
}

const props = defineProps<{
  modelValue: UserAccessForm;
  isLastAdmin: boolean;
  isSelf: boolean;
}>();

const emit = defineEmits<(e: 'update:modelValue', val: UserAccessForm) => void>();

// Controls the visibility of the privilege de-escalation warning banner.
const showDemotionWarning = ref(false);

/**
 * Logic: determines if the administrative toggle should be interactive.
 */
const isAdminToggleDisabled = computed(() => {
  // We can safely cast/check authUser here because useAuth is strictly typed now.
  const currentUser = authUser.value as UserProfile | null;
  const currentUserIsAdmin = currentUser?.is_administrator ?? false;

  // The toggle is disabled if the viewer lacks admin rights or is the sole admin.
  return !currentUserIsAdmin || (props.isLastAdmin && props.isSelf);
});

/**
 * Logic: handles administrative toggle changes and manages demotion state.
 * @param val - The target state for administrative access.
 */
const handleToggleAdmin = (val: boolean) => {
  // If the current user attempts to remove their own admin rights, display a warning.
  if (props.isSelf && props.modelValue.is_administrator && !val) {
    showDemotionWarning.value = true;
  }

  emit('update:modelValue', { ...props.modelValue, is_administrator: val });
};

/**
 * Logic: handles employment status changes.
 * @param val - The target state for internal employment.
 */
const handleToggleEmployee = (val: boolean) => {
  emit('update:modelValue', { ...props.modelValue, is_employee: val });
};

/**
 * Logic: reverts administrative changes and dismisses the warning.
 */
const abortDemotion = () => {
  showDemotionWarning.value = false;
  emit('update:modelValue', { ...props.modelValue, is_administrator: true });
};
</script>

<template>
  <BaseFormBlock title="Employment & Access">
    <div class="rd-form-grid">
      <BaseToggleDescription
        :disabled="isAdminToggleDisabled"
        :model-value="modelValue.is_administrator"
        subtitle="Full administrative control"
        title="System admin"
        @update:model-value="handleToggleAdmin"
      />

      <BaseToggleDescription
        :model-value="modelValue.is_employee"
        subtitle="Contractor if toggled off"
        title="Internal employee"
        @update:model-value="handleToggleEmployee"
      />
    </div>

    <Transition name="fade">
      <div v-if="showDemotionWarning" class="demotion-warning">
        <div class="warning-text">
          <strong>Privilege de-escalation.</strong>
          <span>
            You are removing your own admin access. You will lose access to this dashboard after
            saving.
          </span>
        </div>
        <BaseButton label="Cancel" variant="secondary" @click="abortDemotion" />
      </div>
    </Transition>
  </BaseFormBlock>
</template>

<style scoped>
/* Layout: warning banner for privilege changes */
.demotion-warning {
  align-items: center;
  background: hsl(var(--hue-warning) 100% 96%);
  border: 1px solid var(--color-warning);
  border-radius: var(--border-radius);
  display: flex;
  gap: 1.5rem;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding: 1rem;
}

/* Typography: styling for the warning description */
.warning-text {
  color: var(--color-warning);
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

.warning-text strong {
  font-weight: 700;
}
</style>

<script setup>
/**
 * Manages user permission states and security constraints.
 * Logic: prevents self-promotion for non-admins and triggers warnings for self-demotion.
 */
import { computed, ref } from 'vue';

import BaseButton from '@/components/shared/BaseButton.vue';
import BaseFormBlock from '@/components/shared/BaseFormBlock.vue';
import BaseToggleDescription from '@/components/shared/BaseToggleDescription.vue';
import { user as authUser } from '@/composables/useAuth';

const props = defineProps({
  // The member object containing permission flags.
  modelValue: { type: Object, required: true },
  // Flag indicating if this user is the final administrator in the practice.
  isLastAdmin: { type: Boolean, default: false },
  // Flag indicating if the user being edited is the active session user.
  isSelf: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

// Controls the visibility of the privilege de-escalation warning banner.
const showDemotionWarning = ref(false);

/**
 * Logic: determines if the administrative toggle should be interactive.
 * Utilises a type cast to resolve the 'never' inference error from the authUser ref.
 * @type {import('vue').ComputedRef<boolean>}
 */
const isAdminToggleDisabled = computed(() => {
  // Cast the value to an object to bypass TypeScript's restrictive null inference.
  const userData = /** @type {any} */ (authUser.value);
  const currentUserIsAdmin = userData?.is_administrator;

  // The toggle is disabled if the viewer lacks admin rights or is the sole admin.
  return !currentUserIsAdmin || (props.isLastAdmin && props.isSelf);
});

/**
 * Logic: handles administrative toggle changes and manages demotion state.
 * @param {boolean} val - The target state for administrative access.
 */
const handleToggleAdmin = (val) => {
  // If the current user attempts to remove their own admin rights, display a warning.
  if (props.isSelf && props.modelValue.is_administrator && !val) {
    showDemotionWarning.value = true;
  }

  emit('update:modelValue', { ...props.modelValue, is_administrator: val });
};

/**
 * Logic: handles employment status changes.
 * @param {boolean} val - The target state for internal employment.
 */
const handleToggleEmployee = (val) => {
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

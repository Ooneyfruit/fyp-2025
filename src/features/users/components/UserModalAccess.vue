<script setup>
/**
 * Manages user permission states and security constraints.
 * Logic: prevents self-promotion for non-admins and triggers warnings for demotion.
 */
import { computed,ref } from 'vue';

import BaseButton from '../../../components/shared/BaseButton.vue';
import BaseFormBlock from '../../../components/shared/BaseFormBlock.vue';
import BaseToggleDescription from '../../../components/shared/BaseToggleDescription.vue';
import { user as authUser } from '../../../composables/useAuth';

const props = defineProps({
  modelValue: { type: Object, required: true },
  isLastAdmin: { type: Boolean, default: false },
  isSelf: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);
const showDemotionWarning = ref(false);

/**
 * Logic: determines if the admin switch should be interactive.
 * - Disabled if the viewing user is not an admin (prevents self-promotion).
 * - Disabled if the user is the last admin and editing themselves (prevents lockout).
 */
const isAdminToggleDisabled = computed(() => {
  const currentUserIsAdmin = authUser.value?.is_administrator;
  if (!currentUserIsAdmin) return true;
  if (props.isLastAdmin && props.isSelf) return true;
  return false;
});

/**
 * Logic: handles administrative toggle changes and demotion warnings.
 * @param {boolean} val - The new active state of the admin toggle.
 */
const handleToggleAdmin = (val) => {
  if (props.isSelf && props.modelValue.is_administrator && !val) {
    showDemotionWarning.value = true;
  }
  emit('update:modelValue', { ...props.modelValue, is_administrator: val });
};

/**
 * Logic: handles employment status changes.
 * @param {boolean} val - The new active state of the employee toggle.
 */
const handleToggleEmployee = (val) => {
  emit('update:modelValue', { ...props.modelValue, is_employee: val });
};

/**
 * Logic: reverts administrative changes and hides the warning.
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
          <span
            >You are removing your own admin access. You will lose access to this dashboard after
            saving.</span
          >
        </div>
        <BaseButton label="Cancel" variant="secondary" @click="abortDemotion" />
      </div>
    </Transition>
  </BaseFormBlock>
</template>

<style scoped>
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

<script setup lang="ts">
/**
 * (needs description).
 */

import { computed, markRaw, reactive, ref, watch } from 'vue';

import BaseInput from '@/components/shared/BaseInput.vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import BaseModalFooter from '@/components/shared/BaseModalFooter.vue';
import BaseSelect from '@/components/shared/BaseSelect.vue';
import { usePracticeActions } from '@/features/settings/composables/usePracticeActions';
import { type PracticeRoleConfig } from '@/features/settings/settingsTypes';

const props = defineProps<{
  show: boolean;
  roleToEdit?: PracticeRoleConfig | null;
}>();

// Updated syntax to satisfy SonarLint (S6598)
const emit = defineEmits<(e: 'close') => void>();

const { saveRole } = usePracticeActions();

const ROLE_TYPES = [
  { value: 'Practitioner', label: 'Practitioner' },
  { value: 'Assistant', label: 'Assistant' },
  { value: 'Administrative', label: 'Administrative' }
];

const isSubmitting = ref(false);
const initialJson = ref('');

const form = reactive<PracticeRoleConfig>({
  id: '',
  name: '',
  type: 'Practitioner',
  icon_url: ''
});

const isEditMode = computed(() => !!props.roleToEdit);
const isDirty = computed(() => JSON.stringify(form) !== initialJson.value);

watch(
  () => props.roleToEdit,
  (role) => {
    if (role) {
      form.id = role.id;
      form.name = role.name;
      form.type = role.type;
      form.icon_url = role.icon_url || '';
    } else {
      form.id = '';
      form.name = '';
      form.type = 'Practitioner';
      form.icon_url = '';
    }
    initialJson.value = JSON.stringify(form);
  },
  { immediate: true }
);

const handleSubmit = async () => {
  isSubmitting.value = true;
  await saveRole({ ...form });
  isSubmitting.value = false;
  emit('close');
};

const footerProps = computed(() => ({
  confirmLabel: isEditMode.value ? 'Update Role' : 'Create Role',
  loading: isSubmitting.value,
  onCancel: () => emit('close'),
  onConfirm: handleSubmit
}));
</script>

<template>
  <BaseModal
    :footer-component="markRaw(BaseModalFooter)"
    :footer-props="footerProps"
    :prevent-close="isDirty"
    :show="show"
    :title="isEditMode ? 'Edit Role' : 'Add New Role'"
    @request-close="emit('close')"
  >
    <form class="rd-form" @submit.prevent="handleSubmit">
      <div class="rd-form-section">
        <div class="rd-field">
          <label class="rd-field-label" for="role-name">Role Name</label>
          <BaseInput
            id="role-name"
            v-model="form.name"
            placeholder="e.g. Senior Dentist"
            required
          />
        </div>

        <div class="rd-field">
          <label class="rd-field-label" for="role-type">Classification</label>
          <BaseSelect id="role-type" v-model="form.type">
            <option v-for="option in ROLE_TYPES" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </BaseSelect>
        </div>

        <div class="rd-field">
          <label class="rd-field-label" for="role-icon">Icon URL</label>
          <BaseInput id="role-icon" v-model="form.icon_url" placeholder="https://..." />
          <p class="help-text">Enter a valid image URL for the role avatar.</p>
        </div>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.help-text {
  color: var(--text-muted);
  font-size: 0.75rem;
}
</style>

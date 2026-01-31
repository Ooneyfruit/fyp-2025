<script setup lang="ts">
/**
 * (needs description).
 */

import { computed, markRaw, reactive, ref, watch } from 'vue';

import BaseInput from '@/components/shared/BaseInput.vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import BaseModalFooter from '@/components/shared/BaseModalFooter.vue';
import { usePracticeActions } from '@/features/settings/composables/usePracticeActions';
import { type PracticeDetails } from '@/features/settings/settingsTypes';

const props = defineProps<{
  show: boolean; // Renamed
  initialData: PracticeDetails;
}>();

const emit = defineEmits<(e: 'close') => void>();

const { updateDetails } = usePracticeActions();

const isSubmitting = ref(false);
const initialJson = ref('');

const form = reactive<PracticeDetails>({
  name: '',
  address: ''
});

const isDirty = computed(() => JSON.stringify(form) !== initialJson.value);

watch(
  () => props.initialData,
  (newData) => {
    form.name = newData.name;
    form.address = newData.address;
    initialJson.value = JSON.stringify(form);
  },
  { deep: true, immediate: true }
);

const handleSubmit = async () => {
  isSubmitting.value = true;
  await updateDetails({ ...form });
  isSubmitting.value = false;
  emit('close');
};

const footerProps = computed(() => ({
  confirmLabel: 'Save Details',
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
    title="Edit Practice Details"
    @request-close="emit('close')"
  >
    <form class="rd-form" @submit.prevent="handleSubmit">
      <div class="rd-form-section">
        <div class="rd-field">
          <label class="rd-field-label" for="p-name">Practice Name</label>
          <BaseInput id="p-name" v-model="form.name" required />
        </div>

        <div class="rd-field">
          <label class="rd-field-label" for="p-address">Address</label>
          <textarea
            id="p-address"
            v-model="form.address"
            class="rd-textarea"
            required
            rows="4"
          ></textarea>
        </div>
      </div>
    </form>
  </BaseModal>
</template>

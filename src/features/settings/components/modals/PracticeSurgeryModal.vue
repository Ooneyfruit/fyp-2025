<script setup lang="ts">
/**
 * Modal component for creating and editing practice surgery configurations.
 *
 * This complex form allows administrators to define the general information
 * of a surgery (name, start/end times), its days of operation, and the
 * minimum staff requirements for each practice role. It supports both
 * creation of new surgeries and editing of existing ones, and includes
 * a "Danger Zone" for archiving or restoring surgeries.
 */

import { Timestamp } from 'firebase/firestore';
import { computed, markRaw, reactive, ref, watch } from 'vue';

import IconChevronDown from '@/components/icons/IconChevronDown.vue';
import IconChevronUp from '@/components/icons/IconChevronUp.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import BaseInput from '@/components/shared/BaseInput.vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import BaseModalFooter from '@/components/shared/BaseModalFooter.vue';
import { useToast } from '@/composables/useToast';
import { usePracticeActions } from '@/features/settings/composables/usePracticeActions';
import { type PracticeRoleConfig, type SurgeryConfig } from '@/features/settings/settingsTypes';

const props = defineProps<{
  show: boolean;
  surgeryToEdit?: SurgeryConfig | null;
  allRoles: PracticeRoleConfig[];
}>();

const emit = defineEmits<(e: 'close') => void>();

const { saveSurgery, toggleSurgeryArchive } = usePracticeActions();
const { error: notifyError } = useToast();

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MS_PER_SEC = 1000;

const isSubmitting = ref(false);
const initialFingerprint = ref('');
const isConfirmDeleteOpen = ref(false);

const form = reactive({
  id: '',
  name: '',
  startTime: '09:00',
  endTime: '17:00',
  days: [] as string[],
  staffCounts: {} as Record<string, number>
});

const toTimestamp = (timeStr: string) => {
  const parts = timeStr.split(':');
  const h = Number.parseInt(parts[0] || '0', 10);
  const m = Number.parseInt(parts[1] || '0', 10);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return Timestamp.fromDate(d);
};

const fromTimestamp = (timestamp: unknown) => {
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    const d = new Date((timestamp as Timestamp).seconds * MS_PER_SEC);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return '09:00';
};

const isEditMode = computed(() => !!props.surgeryToEdit);
const isDeleted = computed(() => !!props.surgeryToEdit?.is_deleted);
const isDirty = computed(() => JSON.stringify(form) !== initialFingerprint.value);

const populateForm = (surgery: SurgeryConfig) => {
  form.id = surgery.id || '';
  form.name = surgery.name || '';
  form.startTime = fromTimestamp(surgery.start_time);
  form.endTime = fromTimestamp(surgery.end_time);
  form.days = surgery.days_of_operation || [];

  form.staffCounts = {};
  const dynamicSurgery = surgery as unknown as Record<string, number | undefined>;
  for (const role of props.allRoles) {
    const key = `role_${role.id}`;
    form.staffCounts[role.id] = dynamicSurgery[key] ?? 0;
  }
};

const resetForm = () => {
  form.id = '';
  form.name = '';
  form.startTime = '09:00';
  form.endTime = '17:00';
  form.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  form.staffCounts = {};
  for (const r of props.allRoles) form.staffCounts[r.id] = 0;
};

const syncFormState = () => {
  if (props.surgeryToEdit) populateForm(props.surgeryToEdit);
  else resetForm();
  initialFingerprint.value = JSON.stringify(form);
};

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      syncFormState();
      isConfirmDeleteOpen.value = false;
    }
  }
);

watch(() => props.surgeryToEdit, syncFormState);

const adjustCount = (roleId: string, delta: number) => {
  const next = (form.staffCounts[roleId] || 0) + delta;
  if (next >= 0) form.staffCounts[roleId] = next;
};

const handleSubmit = async () => {
  if (form.startTime >= form.endTime) {
    notifyError('Start time must be earlier than end time.');
    return;
  }
  isSubmitting.value = true;
  await saveSurgery(
    {
      id: form.id,
      name: form.name,
      days_of_operation: form.days,
      start_time: toTimestamp(form.startTime),
      end_time: toTimestamp(form.endTime)
    },
    form.staffCounts,
    props.allRoles
  );

  isSubmitting.value = false;
  emit('close');
};

const handleArchiveToggle = async () => {
  if (!form.id) return;
  if (isDeleted.value) {
    await toggleSurgeryArchive(form.id, false);
    emit('close');
  } else {
    isConfirmDeleteOpen.value = true;
  }
};

const confirmDelete = async () => {
  await toggleSurgeryArchive(form.id, true);
  isConfirmDeleteOpen.value = false;
  emit('close');
};

const footerProps = computed(() => ({
  confirmLabel: 'Save Configuration',
  loading: isSubmitting.value,
  onCancel: () => emit('close'),
  onConfirm: handleSubmit
}));

// Using BaseModalFooter ensures consistent button styling
const archiveFooterProps = computed(() => ({
  confirmLabel: 'Yes, Archive',
  confirmVariant: 'danger',
  cancelLabel: 'Cancel',
  onCancel: () => (isConfirmDeleteOpen.value = false),
  onConfirm: confirmDelete
}));
</script>

<template>
  <BaseModal
    :footer-component="markRaw(BaseModalFooter)"
    :footer-props="footerProps"
    :prevent-close="isDirty"
    :show="show"
    :title="isEditMode ? 'Edit Surgery' : 'Add Surgery'"
    @request-close="emit('close')"
  >
    <form class="rd-form" @submit.prevent="handleSubmit">
      <div class="rd-form-section">
        <h4 class="rd-section-header">General Information</h4>
        <div class="rd-field">
          <label class="rd-field-label" for="s-name">Surgery Name</label>
          <BaseInput id="s-name" v-model="form.name" required />
        </div>
        <div class="rd-form-grid">
          <div class="rd-field">
            <label class="rd-field-label" for="s-start">Start Time</label>
            <input id="s-start" v-model="form.startTime" class="rd-input" required type="time" />
          </div>
          <div class="rd-field">
            <label class="rd-field-label" for="s-end">End Time</label>
            <input id="s-end" v-model="form.endTime" class="rd-input" required type="time" />
          </div>
        </div>
      </div>

      <div class="rd-form-section">
        <h4 class="rd-section-header">Days of Operation</h4>
        <div class="days-grid">
          <label v-for="day in DAYS" :key="day" class="checkbox-label">
            <input v-model="form.days" type="checkbox" :value="day" />
            <span class="day-text">{{ day }}</span>
          </label>
        </div>
      </div>

      <div class="rd-form-section">
        <h4 class="rd-section-header">Minimum Staff Requirements</h4>
        <div class="staff-list">
          <div v-for="role in allRoles" :key="role.id" class="staff-row">
            <span class="role-name">{{ role.name }}</span>
            <div class="stepper">
              <button class="step-btn" type="button" @click="adjustCount(role.id, -1)">
                <IconChevronDown class="icon-small" />
              </button>
              <input
                v-model.number="form.staffCounts[role.id]"
                class="step-input"
                min="0"
                type="number"
              />
              <button class="step-btn" type="button" @click="adjustCount(role.id, 1)">
                <IconChevronUp class="icon-small" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isEditMode" class="rd-danger-zone">
        <h4 class="rd-section-header" style="color: var(--colour-danger)">Danger Zone</h4>
        <div class="danger-actions">
          <p v-if="!isDeleted" class="danger-text">
            Archiving removes this surgery from the rota view.
          </p>
          <p v-else class="danger-text">Restore this surgery to make it active again.</p>

          <BaseButton
            :label="isDeleted ? 'Restore Surgery' : 'Archive Surgery'"
            type="button"
            :variant="isDeleted ? 'secondary' : 'danger'"
            @click="handleArchiveToggle"
          />
        </div>
      </div>
    </form>

    <BaseModal
      :footer-component="markRaw(BaseModalFooter)"
      :footer-props="archiveFooterProps"
      :show="isConfirmDeleteOpen"
      size="sm"
      title="Confirm Archive"
      @request-close="isConfirmDeleteOpen = false"
    >
      <p>Are you sure you want to archive this surgery? It will no longer appear on the rota.</p>
    </BaseModal>
  </BaseModal>
</template>

<style scoped>
.days-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}

.checkbox-label {
  align-items: center;
  cursor: pointer;
  display: flex;
  font-size: 0.9rem;
  gap: 0.5rem;
}

.staff-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.staff-row {
  align-items: center;
  background: var(--bg-app);
  border-radius: var(--border-radius);
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
}

.role-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.stepper {
  align-items: center;
  display: flex;
  gap: 0.25rem;
}

.step-input {
  appearance: textfield;
  border: 1px solid var(--border-colour);
  border-radius: 4px;
  font-weight: 600;
  height: 2rem;
  text-align: center;
  width: 3rem;
}

.step-input::-webkit-outer-spin-button,
.step-input::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}

.step-btn {
  align-items: center;
  background: white;
  border: 1px solid var(--border-colour);
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  height: 2rem;
  justify-content: center;
  width: 2rem;
}

.step-btn:hover {
  background: var(--table-row-hover);
  color: var(--colour-primary);
}

.icon-small {
  height: 1rem;
  width: 1rem;
}

.danger-actions {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.danger-text {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0;
}
</style>

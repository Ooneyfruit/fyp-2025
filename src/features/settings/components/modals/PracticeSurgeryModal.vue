<script setup lang="ts">
/**
 * (needs description).
 */

import { Timestamp } from 'firebase/firestore';
import { computed, markRaw, reactive, ref, watch } from 'vue';

import IconChevronDown from '@/components/icons/IconChevronDown.vue';
import IconChevronUp from '@/components/icons/IconChevronUp.vue';
import BaseInput from '@/components/shared/BaseInput.vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import BaseModalFooter from '@/components/shared/BaseModalFooter.vue';
import { useToast } from '@/composables/useToast';
import { usePracticeActions } from '@/features/settings/composables/usePracticeActions';
import { type PracticeRoleConfig, type SurgeryConfig } from '@/features/settings/settingsTypes';

const props = defineProps<{
  show: boolean;
  surgeryToEdit?: Record<string, unknown> | null;
  allRoles: PracticeRoleConfig[];
}>();

// Updated syntax to satisfy SonarLint (S6598)
const emit = defineEmits<(e: 'close') => void>();

const { saveSurgery } = usePracticeActions();
const { error: notifyError } = useToast();

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MS_PER_SEC = 1000;

const isSubmitting = ref(false);
const initialFingerprint = ref('');

const form = reactive({
  id: '',
  name: '',
  startTime: '09:00',
  endTime: '17:00',
  days: [] as string[],
  staffCounts: {} as Record<string, number>
});

const toTimestamp = (timeStr: string): Timestamp => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return Timestamp.fromDate(date);
};

const fromTimestamp = (ts: unknown): string => {
  if (ts && typeof ts === 'object' && 'seconds' in ts) {
    const date = new Date((ts as Timestamp).seconds * MS_PER_SEC);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return '09:00';
};

const generateFingerprint = (data: typeof form) => JSON.stringify(data);

const isEditMode = computed(() => !!props.surgeryToEdit);
const isDirty = computed(() => generateFingerprint(form) !== initialFingerprint.value);

const populateForm = (surgery: Record<string, unknown>) => {
  form.id = (surgery.id as string) || '';
  form.name = (surgery.name as string) || '';
  form.startTime = fromTimestamp(surgery.start_time);
  form.endTime = fromTimestamp(surgery.end_time);
  form.days = (surgery.days_of_operation as string[]) || [];

  form.staffCounts = {};
  for (const role of props.allRoles) {
    const key = `role_${role.id}`;
    form.staffCounts[role.id] = (key in surgery ? surgery[key] : 0) as number;
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

watch(
  () => props.surgeryToEdit,
  (newVal) => {
    if (newVal) populateForm(newVal);
    else resetForm();
    initialFingerprint.value = generateFingerprint(form);
  },
  { immediate: true }
);

const adjustCount = (roleId: string, delta: number) => {
  const current = form.staffCounts[roleId] || 0;
  const next = current + delta;
  if (next >= 0) form.staffCounts[roleId] = next;
};

const handleSubmit = async () => {
  if (form.startTime >= form.endTime) {
    notifyError('Start time must be earlier than end time.');
    return;
  }

  isSubmitting.value = true;
  const surgeryData: SurgeryConfig = {
    id: form.id,
    name: form.name,
    days_of_operation: form.days,
    start_time: toTimestamp(form.startTime),
    end_time: toTimestamp(form.endTime)
  };

  await saveSurgery(surgeryData, form.staffCounts, props.allRoles);
  isSubmitting.value = false;
  emit('close');
};

const footerProps = computed(() => ({
  confirmLabel: 'Save Configuration',
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
    :title="isEditMode ? 'Edit Surgery' : 'Add Surgery'"
    @request-close="emit('close')"
  >
    <form class="rd-form" @submit.prevent="handleSubmit">
      <div class="rd-form-section">
        <h4 class="rd-section-header">General Information</h4>
        <div class="rd-field">
          <label class="rd-field-label" for="s-name">Surgery Name</label>
          <BaseInput id="s-name" v-model="form.name" placeholder="e.g. Surgery 1" required />
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
                :id="`role-count-${role.id}`"
                v-model.number="form.staffCounts[role.id]"
                aria-label="Staff count"
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
    </form>
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
  border: 1px solid var(--border-color);
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
  border: 1px solid var(--border-color);
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
  color: var(--color-primary);
}

.icon-small {
  height: 1rem;
  width: 1rem;
}
</style>

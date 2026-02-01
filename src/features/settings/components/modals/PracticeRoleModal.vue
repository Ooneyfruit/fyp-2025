<script setup lang="ts">
/**
 * Modal for creating or editing practice roles.
 * Allows setting name, type, icon, and colour override.
 */

import { computed, markRaw, reactive, ref, watch } from 'vue';

import IconMagicWand from '@/components/icons/IconMagicWand.vue';
import BaseInput from '@/components/shared/BaseInput.vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import BaseModalFooter from '@/components/shared/BaseModalFooter.vue';
import BaseSelect from '@/components/shared/BaseSelect.vue';
import { ROLE_PALETTE } from '@/features/rota/composables/useRotaColors';
import { usePracticeActions } from '@/features/settings/composables/usePracticeActions';
import { ROLE_ICONS } from '@/features/settings/composables/useRoleIcons';
import { type PracticeRoleConfig } from '@/features/settings/settingsTypes';

const props = defineProps<{
  show: boolean;
  roleToEdit?: PracticeRoleConfig | null;
}>();

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
  icon_id: undefined,
  color_index: undefined
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
      form.icon_id = role.icon_id || undefined;
      form.color_index = role.color_index;
    } else {
      form.id = '';
      form.name = '';
      form.type = 'Practitioner';
      form.icon_id = undefined;
      form.color_index = undefined;
    }
    initialJson.value = JSON.stringify(form);
  },
  { immediate: true }
);

const handleSubmit = async () => {
  isSubmitting.value = true;
  // Convert undefined back to null if 'No Icon' was selected for the payload.
  const payload = { ...form, icon_id: form.icon_id || null };
  await saveRole(payload as PracticeRoleConfig);
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
          <fieldset class="selection-fieldset">
            <legend class="rd-field-label">Role Icon</legend>
            <div class="icon-grid">
              <div v-for="icon in ROLE_ICONS" :key="icon.id ?? 'none'" class="icon-option-wrapper">
                <input
                  :id="`icon-${icon.id ?? 'none'}`"
                  v-model="form.icon_id"
                  class="sr-only"
                  name="roleIcon"
                  type="radio"
                  :value="icon.id === null ? undefined : icon.id"
                />
                <label
                  class="icon-selection-tile"
                  :class="{
                    active: form.icon_id === icon.id || (icon.id === null && !form.icon_id),
                    'no-icon-tile': icon.id === null
                  }"
                  :for="`icon-${icon.id ?? 'none'}`"
                  :title="icon.label"
                >
                  <component :is="icon.component" class="role-svg" />
                  <span class="sr-only">{{ icon.label }}</span>
                </label>
              </div>
            </div>
          </fieldset>
        </div>

        <div class="rd-field">
          <fieldset class="selection-fieldset">
            <legend class="rd-field-label">Theme Colour</legend>
            <div class="color-grid">
              <div class="color-option-wrapper">
                <input
                  id="color-auto"
                  v-model="form.color_index"
                  class="sr-only"
                  name="roleColor"
                  type="radio"
                  :value="undefined"
                />
                <label
                  class="color-swatch auto-swatch"
                  :class="{ active: form.color_index === undefined }"
                  for="color-auto"
                  title="Automatic Assignment"
                >
                  <IconMagicWand class="auto-icon" />
                  <span class="sr-only">Automatic Assignment</span>
                </label>
              </div>

              <div v-for="(color, index) in ROLE_PALETTE" :key="index" class="color-option-wrapper">
                <input
                  :id="`color-${index}`"
                  v-model="form.color_index"
                  class="sr-only"
                  name="roleColor"
                  type="radio"
                  :value="index"
                />
                <label
                  class="color-swatch"
                  :class="{ active: form.color_index === index }"
                  :for="`color-${index}`"
                  :style="{ backgroundColor: color.bg, borderColor: color.accent }"
                  :title="`Colour ${index + 1}`"
                >
                  <span class="sr-only">Colour {{ index + 1 }}</span>
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.selection-fieldset {
  border: none;
  margin: 0;
  min-width: 0;
  padding: 0;
}

.icon-grid,
.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.icon-option-wrapper,
.color-option-wrapper {
  display: flex;
}

.icon-selection-tile {
  align-items: center;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  height: 3rem;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  width: 3rem;
}

.icon-selection-tile:hover {
  border-color: var(--color-primary-light);
  transform: translateY(-1px);
}

.no-icon-tile {
  background-color: var(--bg-app);
  opacity: 0.6;
}

.role-svg {
  color: var(--text-main);
  height: 1.25rem;
  width: 1.25rem;
}

.color-swatch {
  align-items: center;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  height: 2.25rem;
  justify-content: center;
  transition: transform 0.1s;
  width: 2.25rem;
}

.auto-swatch {
  background-color: var(--bg-app);
  border-color: var(--border-color);
  color: var(--text-muted);
}

.auto-icon {
  height: 1.1rem;
  width: 1.1rem;
}

/* Selection States */
input:checked + .icon-selection-tile {
  background-color: var(--color-primary-faint);
  border-color: var(--color-primary);
  border-width: 2px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 5%);
}

input:checked + .icon-selection-tile .role-svg {
  color: var(--color-primary);
}

input:checked + .color-swatch {
  border-color: var(--color-primary);
  box-shadow:
    0 0 0 2px white,
    0 0 0 4px var(--color-primary);
}

.sr-only {
  border-width: 0;
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
</style>

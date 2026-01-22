<template>
  <div v-if="practices.length > 1" class="practice-switcher">
    <BaseSelect
      id="practice-context-selector"
      name="practice_id"
      :model-value="user.practiceRef?.id"
      :label="label"
      @update:model-value="handleSwitch"
    >
      <option v-for="p in practices" :key="p.id" :value="p.id">
        {{ p.name }}
      </option>
    </BaseSelect>
  </div>
</template>

<script setup>
/**
 * Atomic practice context switcher.
 * Utilizes the id prefix method to reliably capture all user clinic associations.
 */
import { useAuth } from '../../../composables/useAuth';
import { useUserPractices } from '../composables/useUserPractices';
import BaseSelect from '../../../components/shared/BaseSelect.vue';

defineProps({
  label: { type: String, default: '' }
});

const { user } = useAuth();
const { practices, handleSwitch } = useUserPractices();
</script>

<style scoped>
/* Layout: base container for the switcher logic. */
.practice-switcher {
  width: 100%;
}
</style>

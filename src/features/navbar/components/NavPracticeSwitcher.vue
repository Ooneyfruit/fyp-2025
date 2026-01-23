<script setup>
/**
 * Atomic practice context switcher.
 * Utilizes the id prefix method to reliably capture all user clinic associations.
 */
import BaseSelect from '../../../components/shared/BaseSelect.vue';
import { useAuth } from '../../../composables/useAuth';
import { useUserPractices } from '../composables/useUserPractices';

defineProps({
  label: { type: String, default: '' }
});

const { user } = useAuth();
const { practices, handleSwitch } = useUserPractices();
</script>

<template>
  <div v-if="practices.length > 1" class="practice-switcher">
    <BaseSelect
      id="practice-context-selector"
      :label="label"
      :model-value="user.practiceRef?.id"
      name="practice_id"
      @update:model-value="handleSwitch"
    >
      <option v-for="p in practices" :key="p.id" :value="p.id">
        {{ p.name }}
      </option>
    </BaseSelect>
  </div>
</template>

<style scoped>
/* Layout: base container for the switcher logic. */
.practice-switcher {
  width: 100%;
}
</style>

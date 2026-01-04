<template>
    <div v-if="practices.length > 1" class="practice-switcher">
      <label v-if="label" class="switcher-label">{{ label }}</label>
      <select 
        :value="user.practiceRef?.id" 
        class="rd-select"
        :class="variant"
        @change="handleSwitch($event.target.value)"
      >
        <option v-for="p in practices" :key="p.id" :value="p.id">
          {{ p.name }}
        </option>
      </select>
    </div>
  </template>
  
  <script setup>
  /**
   * Atomic practice context switcher.
   * Utilizes the id prefix method to reliably capture all user clinic associations.
   */
  import { useAuth } from '../../../composables/useAuth';
  import { useUserPractices } from '../composables/useUserPractices';
  
  defineProps({
    label: { type: String, default: '' },
    variant: { type: String, default: 'desktop' } // desktop or mobile.
  });
  
  const { user } = useAuth();
  const { practices, handleSwitch } = useUserPractices();
  </script>
  
  <style scoped>
  /* Layout: core container for the switcher element. */
  .practice-switcher {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .switcher-label {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
  }
  
  /* Logic: base select styling using the shared design tokens. */
  .rd-select {
    padding: 0.4rem 0.75rem;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    background: #f8fafc;
    color: var(--text-muted);
    font-weight: 600;
    cursor: pointer;
    width: 100%;
  }
  
  .rd-select.desktop {
    width: auto;
  }
  </style>
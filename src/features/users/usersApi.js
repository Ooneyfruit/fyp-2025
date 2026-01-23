/**
 * @file usersApi.js
 * @description Centralises access to user-related components and logic.
 * Standardised to lowercase 'Api' to prevent casing conflicts on Windows/CI.
 */

export { default as UserDataViewAdapter } from './components/UserDataViewAdapter.vue';
export { default as UserIdentity } from './components/UserIdentity.vue';
export { default as UserModal } from './components/UserModal.vue';
export { usePracticeUsers } from './composables/usePracticeUsers';

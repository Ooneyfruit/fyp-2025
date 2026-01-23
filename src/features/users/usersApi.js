/**
 * @file usersApi.js
 * @description Centralises access to user-related components and logic.
 * Serves as the public API for the users feature module to ensure consistent imports.
 */

// Primary user interface components for identity and management.
export { default as UserIdentity } from './components/UserIdentity.vue';
export { default as UserModal } from './components/UserModal.vue';

// Data adapters and layout helpers for displaying user collections.
export { default as UserDataViewAdapter } from './components/UserDataViewAdapter.vue';

// Logic and state management for practice-specific member data.
export { usePracticeUsers } from './composables/usePracticeUsers';

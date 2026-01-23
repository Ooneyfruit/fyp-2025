/**
 * Users Feature API.
 * Provides access to user identity components, management modals, and practice-specific member logic.
 */

// Primary UI Components
export { default as UserIdentity } from './components/UserIdentity.vue';
export { default as UserModal } from './components/UserModal.vue';
export { default as UserStatusPills } from './components/UserStatusPills.vue';

// Data Adapters and Layout Helpers
export { default as UserDataViewAdapter } from './components/UserDataViewAdapter.vue';

// Logic and State Management
export { usePracticeUsers } from './composables/usePracticeUsers';

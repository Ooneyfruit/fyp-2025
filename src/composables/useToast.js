/**
 * Primary responsibility: manages the global state for the notification system.
 */
import { ref } from 'vue';

const DEFAULT_DURATION = 4000;

// Global Singleton State
// These refs are defined outside the function to ensure state persistence across components.

/** @type {import('vue').Ref<string>} */
const message = ref('');

/** @type {import('vue').Ref<boolean>} */
const isVisible = ref(false);

/** @type {import('vue').Ref<string|null>} */
const actionLabel = ref(null);

/** @type {import('vue').Ref<(() => void)|null>} */
const actionCallback = ref(null);

/** @type {ReturnType<typeof setTimeout>|null} */
let timeout = null;

/**
 * Helper to clear the active timeout if one exists.
 */
const clearActiveTimeout = () => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
};

/**
 * Helper to update the reactive state variables.
 * @param {string} msg - The message to display.
 * @param {ToastAction|null} action - The action configuration.
 */
const updateState = (msg, action) => {
  message.value = msg;
  isVisible.value = true;
  if (action) {
    actionLabel.value = action.label;
    actionCallback.value = action.callback;
  } else {
    actionLabel.value = null;
    actionCallback.value = null;
  }
};

/**
 * Dismisses the current toast notification immediately.
 * Clears any active timeout to prevent race conditions.
 */
const hideToast = () => {
  isVisible.value = false;
  clearActiveTimeout();
};

/**
 * Triggers a global toast notification.
 * @param {string} msg - The message to display.
 * @param {ToastOptions} [options] - Configuration for duration and actions.
 */
const showToast = (msg, { duration = DEFAULT_DURATION, action = null } = {}) => {
  clearActiveTimeout();
  updateState(msg, action);

  // Only set a timer if duration is greater than zero.
  // This allows for persistent "sticky" toasts.
  if (duration > 0) {
    timeout = setTimeout(() => {
      isVisible.value = false;
      timeout = null;
    }, duration);
  }
};

/**
 * Executes the action callback if present, then closes the toast.
 */
const handleAction = () => {
  if (actionCallback.value) {
    actionCallback.value();
  }
  hideToast();
};

/**
 * Definition of the action button structure.
 * @typedef {object} ToastAction
 * @property {string} label - The text to display on the action button.
 * @property {() => void} callback - The function to execute when clicked.
 */

/**
 * Definition of the toast configuration options.
 * @typedef {object} ToastOptions
 * @property {number} [duration=4000] - Time in ms before auto-close. Set to 0 for persistent.
 * @property {ToastAction|null} [action] - Optional action button configuration.
 */

/**
 * Definition of the UseToast return object.
 * @typedef {object} UseToastReturn
 * @property {import('vue').Ref<string>} message - The current toast message.
 * @property {import('vue').Ref<boolean>} isVisible - Whether the toast is currently visible.
 * @property {import('vue').Ref<string|null>} actionLabel - Label for the action button, if any.
 * @property {Function} showToast - Method to trigger a new toast.
 * @property {Function} hideToast - Method to dismiss the toast.
 * @property {Function} handleAction - Executes the action callback and closes the toast.
 */

/**
 * Composable for interacting with the global toast notification system.
 * Provides methods to show and hide toast messages, and access current state.
 * @returns {UseToastReturn} The toast state and control methods.
 */
export function useToast() {
  return {
    message,
    isVisible,
    actionLabel,
    showToast,
    hideToast,
    handleAction
  };
}

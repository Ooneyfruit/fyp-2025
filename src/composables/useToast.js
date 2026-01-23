/**
 * @file useToast.js
 * @description Manages the global state for the notification system.
 * Provides a centralised way to trigger alerts across the application.
 */
import { ref } from 'vue';

const DEFAULT_DURATION = 4000;

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
 * Clears the active timeout if one exists to prevent overlaps.
 */
const clearActiveTimeout = () => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
};

/**
 * Updates the reactive state variables for the toast UI.
 * @param {string} msg - The message to display.
 * @param {ToastAction|null} action - The optional action configuration.
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
 */
const hideToast = () => {
  isVisible.value = false;
  clearActiveTimeout();
};

/**
 * Triggers a global toast notification with customisable duration.
 * @param {string} msg - The message to display.
 * @param {ToastOptions} [options] - Configuration for duration and actions.
 */
const showToast = (msg, { duration = DEFAULT_DURATION, action = null } = {}) => {
  clearActiveTimeout();
  updateState(msg, action);

  // A duration of 0 allows the toast to remain visible until manually dismissed.
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
 * @typedef {object} ToastAction
 * @property {string} label - The text to display on the action button.
 * @property {() => void} callback - The function to execute when clicked.
 */

/**
 * @typedef {object} ToastOptions
 * @property {number} [duration=4000] - Time in ms before auto-close.
 * @property {ToastAction|null} [action] - Optional action button configuration.
 */

/**
 * @typedef {object} UseToastReturn
 * @property {import('vue').Ref<string>} message - The current toast message.
 * @property {import('vue').Ref<boolean>} isVisible - Whether the toast is currently visible.
 * @property {import('vue').Ref<string|null>} actionLabel - Label for the action button.
 * @property {Function} showToast - Generic method to trigger a toast.
 * @property {(msg: string) => void} success - Helper for success notifications.
 * @property {(msg: string) => void} error - Helper for error notifications.
 * @property {Function} hideToast - Method to dismiss the toast.
 * @property {Function} handleAction - Executes the action and closes the toast.
 */

/**
 * Composable for interacting with the global toast notification system.
 * Returns methods to trigger styled alerts and manage state.
 * @returns {UseToastReturn} The toast state and control methods.
 */
export function useToast() {
  return {
    message,
    isVisible,
    actionLabel,
    showToast,
    success: (msg) => showToast(msg, { duration: 3000 }),
    error: (msg) => showToast(msg, { duration: 5000 }),
    hideToast,
    handleAction
  };
}

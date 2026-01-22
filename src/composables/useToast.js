/**
 * Primary responsibility: manages the global state for the notification system.
 */
import { ref } from 'vue';

// Global Singleton State
// These refs are defined outside the function to ensure state persistence across components.
const message = ref('');
const isVisible = ref(false);
const actionLabel = ref(null);
const actionCallback = ref(null);
let timeout = null;

/**
 * Definition of the action button structure.
 * @typedef {object} ToastAction
 * @property {string} label - The text to display on the action button.
 * @property {Function} callback - The function to execute when clicked.
 */

/**
 * Definition of the toast configuration options.
 * @typedef {object} ToastOptions
 * @property {number} [duration=4000] - Time in ms before auto-close. Set to 0 for persistent.
 * @property {ToastAction} [action] - Optional action button configuration.
 */

/**
 * Composable for interacting with the global toast notification system.
 * Provides methods to show and hide toast messages, and access current state.
 * @returns {object} The toast state and control methods.
 */
export function useToast() {
  /**
   * Triggers a global toast notification.
   * @param {string} msg - The message to display.
   * @param {ToastOptions} [options] - Configuration for duration and actions.
   */
  const showToast = (msg, { duration = 4000, action = null } = {}) => {
    if (timeout) clearTimeout(timeout);

    message.value = msg;
    isVisible.value = true;
    actionLabel.value = action?.label || null;
    actionCallback.value = action?.callback || null;

    // Only set a timer if duration is greater than zero.
    // This allows for persistent "sticky" toasts.
    if (duration > 0) {
      timeout = setTimeout(() => {
        isVisible.value = false;
      }, duration);
    }
  };

  /**
   * Dismisses the current toast notification immediately.
   * Clears any active timeout to prevent race conditions.
   */
  const hideToast = () => {
    isVisible.value = false;
    if (timeout) clearTimeout(timeout);
  };

  return {
    message,
    isVisible,
    actionLabel,
    showToast,
    hideToast,
    handleAction: () => {
      if (actionCallback.value) actionCallback.value();
      hideToast();
    }
  };
}

/**
 * file: ooneyfruit/fyp-2025/fyp-2025-ui-testing/src/composables/useToast.js
 * Primary responsibility: manages the global state for the notification system.
 */
import { ref } from 'vue';

// Global Singleton State
// These refs are defined outside the function to ensure state persistence across components.
const message = ref("");
const isVisible = ref(false);
const actionLabel = ref(null);
const actionCallback = ref(null);
let timeout = null;

export function useToast() {
  /**
   * Triggers a global toast notification.
   * @param {string} msg - The message to display.
   * @param {Object} options - Configuration for duration and actions.
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
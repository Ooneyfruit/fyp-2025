/**
 * Manages the global state for the notification system.
 * Provides a centralised way to trigger alerts across the application.
 */
import { type Ref, ref } from 'vue';

// Default visibility duration for notifications in milliseconds.
const DEFAULT_DURATION = 4000;

/**
 * Defines the structure for an interactive action within a toast.
 */
interface ToastAction {
  label: string;
  callback: () => void;
}

/**
 * Options for customising the appearance and behaviour of the toast.
 */
interface ToastOptions {
  duration?: number;
  action?: ToastAction | null;
}

/**
 * Interface representing the reactive state and methods for toast management.
 */
interface UseToastReturn {
  message: Ref<string>;
  isVisible: Ref<boolean>;
  actionLabel: Ref<string | null>;
  showToast: (msg: string, options?: ToastOptions) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  hideToast: () => void;
  handleAction: () => void;
}

// Global state using a singleton pattern to maintain consistency across components.
const message = ref('');
const isVisible = ref(false);
const actionLabel = ref<string | null>(null);
const actionCallback = ref<(() => void) | null>(null);
let timeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Clears the active timeout if one exists to prevent notification overlaps.
 */
const clearActiveTimeout = (): void => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
};

/**
 * Updates the reactive state variables for the toast user interface.
 * @param msg - The text content to display in the toast.
 * @param action - The optional action button configuration.
 */
const updateState = (msg: string, action?: ToastAction | null): void => {
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
const hideToast = (): void => {
  isVisible.value = false;
  clearActiveTimeout();
};

/**
 * Triggers a global toast notification with a customisable duration.
 * @param msg - The message content to display.
 * @param options - Configuration options for the toast.
 */
const showToast = (msg: string, options: ToastOptions = {}): void => {
  const { duration = DEFAULT_DURATION, action = null } = options;
  clearActiveTimeout();
  updateState(msg, action);

  // A duration of zero allows the toast to remain visible until manually dismissed.
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
const handleAction = (): void => {
  if (actionCallback.value) {
    actionCallback.value();
  }
  hideToast();
};

/**
 * Composable for interacting with the global toast notification system.
 * @returns The interface for controlling the toast notifications.
 */
export function useToast(): UseToastReturn {
  return {
    message,
    isVisible,
    actionLabel,
    showToast,
    // Success notifications use a shorter default duration for quick feedback.
    success: (msg) => showToast(msg, { duration: 3000 }),
    // Error notifications persist longer to ensure the user has time to read them.
    error: (msg) => showToast(msg, { duration: 5000 }),
    hideToast,
    handleAction
  };
}

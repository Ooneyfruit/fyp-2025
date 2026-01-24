/**
 * @file useToast.ts
 * @description Manages the global state for the notification system.
 * Provides a centralised way to trigger alerts across the application.
 */
import { type Ref,ref } from 'vue';

const DEFAULT_DURATION = 4000;

export interface ToastAction {
  label: string;
  callback: () => void;
}

export interface ToastOptions {
  duration?: number;
  action?: ToastAction | null;
}

export interface UseToastReturn {
  message: Ref<string>;
  isVisible: Ref<boolean>;
  actionLabel: Ref<string | null>;
  showToast: (msg: string, options?: ToastOptions) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  hideToast: () => void;
  handleAction: () => void;
}

// Global State (Singleton pattern)
const message = ref('');
const isVisible = ref(false);
const actionLabel = ref<string | null>(null);
const actionCallback = ref<(() => void) | null>(null);
let timeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Clears the active timeout if one exists to prevent overlaps.
 */
const clearActiveTimeout = (): void => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
};

/**
 * Updates the reactive state variables for the toast UI.
 * @param msg
 * @param action
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
 * Triggers a global toast notification with customisable duration.
 * @param msg
 * @param root0
 * @param root0.duration
 * @param root0.action
 */
const showToast = (
  msg: string,
  { duration = DEFAULT_DURATION, action = null }: ToastOptions = {}
): void => {
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
const handleAction = (): void => {
  if (actionCallback.value) {
    actionCallback.value();
  }
  hideToast();
};

/**
 * Composable for interacting with the global toast notification system.
 */
export function useToast(): UseToastReturn {
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

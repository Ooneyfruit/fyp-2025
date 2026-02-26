/**
 * Composable for managing modal visibility and data state.
 * Reduces boilerplate for 'open(data)' and 'close()' patterns.
 */
import { readonly, type Ref, ref } from 'vue';

interface UseModalReturn<T> {
  isVisible: Ref<boolean>;
  data: Ref<T | null>;
  open: (payload?: T) => void;
  close: () => void;
}

/**
 * Creates a reactive controller for a modal.
 * @returns An object containing visibility state, data, and control methods.
 */
export function useModal<T = unknown>(): UseModalReturn<T> {
  const isVisible = ref(false);
  const data = ref<T | null>(null) as Ref<T | null>;

  /**
   * Opens the modal and optionally sets the context data.
   * @param payload - The data to initialize the modal with.
   */
  const open = (payload?: T) => {
    if (payload !== undefined) {
      data.value = payload;
    }
    isVisible.value = true;
  };

  /**
   * Closes the modal and resets visibility.
   * Does not automatically clear data to allow for exit animations.
   */
  const close = () => {
    isVisible.value = false;
  };

  return {
    isVisible,
    data: readonly(data) as Ref<T | null>,
    open,
    close
  };
}

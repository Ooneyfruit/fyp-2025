/**
 * Manages event listeners to detect clicks outside a specific DOM element.
 */
import { onMounted, onUnmounted, type Ref } from 'vue';

/**
 * Handles detection of interactions outside a specific element.
 * Useful for closing modals, dropdowns, and menus.
 * @param elRef - Vue template ref for the target element.
 * @param callback - Function to execute on outside click or escape.
 */
export function useClickOutside(
  elRef: Ref<HTMLElement | null | undefined>,
  callback: (event: MouseEvent | KeyboardEvent) => void
): void {
  /**
   * Global event listener for mouse and keyboard interactions.
   * @param event - The DOM event object.
   */
  const listener = (event: Event): void => {
    // Process escape key interactions to trigger the callback sequence.
    if (event instanceof KeyboardEvent && event.key === 'Escape') {
      callback(event);
      return;
    }

    // Identify mouse interactions occurring outside the referenced element.
    if (
      event instanceof MouseEvent &&
      event.target instanceof Node &&
      !elRef.value?.contains(event.target)
    ) {
      callback(event);
    }
  };

  onMounted(() => {
    document.addEventListener('mousedown', listener);
    document.addEventListener('keydown', listener);
  });

  onUnmounted(() => {
    document.removeEventListener('mousedown', listener);
    document.removeEventListener('keydown', listener);
  });
}

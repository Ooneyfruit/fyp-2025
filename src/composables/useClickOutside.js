/**
 * Manages event listeners to detect clicks outside a specific DOM element.
 * Essential for the closing logic of interactive UI overlays.
 */
import { onMounted, onUnmounted } from 'vue';

/**
 * Handles detection of interactions outside a specific element.
 * Useful for closing modals, dropdowns, and menus.
 * @param {import('vue').Ref<HTMLElement | null>} elRef - Vue template ref for the target element.
 * @param {Function} callback - Function to execute on outside click or escape.
 * @returns {void}
 */
export function useClickOutside(elRef, callback) {
  /**
   * Global event listener for mouse and keyboard interactions.
   * @param {Event} event - The DOM event object.
   */
  const listener = (event) => {
    // Determine if the interaction happened outside the referenced element.
    // We checks instance types to satisfy the compiler and ensure safe property access.
    const isClickOutside =
      event instanceof MouseEvent &&
      event.target instanceof Node &&
      !elRef.value?.contains(event.target);

    // Identify if the escape key was pressed to trigger the callback sequence.
    const isEscKey = event instanceof KeyboardEvent && event.key === 'Escape';

    // Execute the callback if either an outside click or an escape key press occurred.
    if (isClickOutside || isEscKey) {
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

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
   * @param {Event} event - The DOM event.
   */
  const listener = (event) => {
    const isClickOutside = event.type === 'mousedown' && !elRef.value?.contains(event.target);
    const isEscKey = event.type === 'keydown' && event.key === 'Escape';

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

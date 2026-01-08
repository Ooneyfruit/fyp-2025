import { onMounted, onUnmounted } from 'vue';

/**
 * Handles detection of interactions outside a specific element.
 * Useful for closing modals, dropdowns, and menus.
 * @param {Ref} elRef - vue template ref for the target element.
 * @param {Function} callback - function to execute on outside click or escape.
 */
export function useClickOutside(elRef, callback) {
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
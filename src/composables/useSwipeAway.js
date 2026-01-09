/**
 * Provides reusable logic for horizontal swipe gestures with visual tracking.
 * Typically used for 'swipe-to-dismiss' patterns in mobile interfaces.
 */
import { ref, computed } from 'vue';

/**
 * Manages touch states and calculates displacement.
 * @param {Object} options - Configuration for the swipe behavior.
 * @param {Function} options.onTrigger - Callback executed when swipe exceeds threshold.
 * @param {number} options.threshold - Distance in pixels required to trigger the action.
 * @param {import('vue').Ref<boolean>} options.enabled - Reactive toggle to activate logic.
 * @returns {Object} Touch handlers and reactive displacement states.
 */
export function useSwipeAway({ onTrigger, threshold = 80, enabled }) {
  const touchStartX = ref(0);
  const touchCurrentX = ref(0);
  const isSwiping = ref(false);

  // Calculate horizontal displacement; restricted to negative values for left-swipe.
  const swipeOffset = computed(() => {
    if (!isSwiping.value || !enabled.value) return 0;
    const delta = touchCurrentX.value - touchStartX.value;
    return Math.min(0, delta);
  });

  // Reactive transform object for direct template binding.
  const swipeTransform = computed(() => {
    if (!isSwiping.value || swipeOffset.value === 0) return {};
    return {
      transform: `translateX(${swipeOffset.value}px)`,
      transition: 'none'
    };
  });

  /**
   * Initializes the touch tracking sequence.
   * @param {TouchEvent} event - Native touch start event.
   */
  const handleTouchStart = (event) => {
    if (!enabled.value) return;
    touchStartX.value = event.touches[0].clientX;
    touchCurrentX.value = event.touches[0].clientX;
    isSwiping.value = true;
  };

  /**
   * Updates current position to provide real-time visual feedback.
   * @param {TouchEvent} event - Native touch move event.
   */
  const handleTouchMove = (event) => {
    if (!isSwiping.value) return;
    touchCurrentX.value = event.touches[0].clientX;
  };

  /**
   * Evaluates gesture completion and resets state.
   */
  const handleTouchEnd = () => {
    if (!isSwiping.value) return;
    
    // Trigger dismissal if the move exceeds the defined pixel threshold.
    if (Math.abs(swipeOffset.value) > threshold) {
      onTrigger();
    }
    
    isSwiping.value = false;
    touchStartX.value = 0;
    touchCurrentX.value = 0;
  };

  return {
    isSwiping,
    swipeOffset,
    swipeTransform,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}
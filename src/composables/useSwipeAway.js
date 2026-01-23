/**
 * Provides reusable logic for horizontal swipe gestures with visual tracking.
 * Typically used for 'swipe-to-dismiss' patterns in mobile interfaces.
 */
import { computed, ref } from 'vue';

const DEFAULT_SWIPE_THRESHOLD = 80;

/**
 * Manages touch states and calculates horizontal displacement.
 * @param {object} options - Configuration for the swipe behaviour.
 * @param {Function} options.onTrigger - Callback executed when swipe exceeds threshold.
 * @param {number} options.threshold - Distance in pixels required to trigger the action.
 * @param {import('vue').Ref<boolean>} options.enabled - Reactive Vue Ref used to toggle the logic state.
 * @returns {{
 * isSwiping: import('vue').Ref<boolean>,
 * swipeOffset: import('vue').ComputedRef<number>,
 * swipeTransform: import('vue').ComputedRef<import('vue').StyleValue>,
 * handleTouchStart: (event: TouchEvent) => void,
 * handleTouchMove: (event: TouchEvent) => void,
 * handleTouchEnd: () => void
 * }} Touch handlers and reactive displacement states.
 */
export function useSwipeAway({ onTrigger, threshold = DEFAULT_SWIPE_THRESHOLD, enabled }) {
  const touchStartX = ref(0);
  const touchCurrentX = ref(0);
  const isSwiping = ref(false);

  // Calculate horizontal displacement; restricted to negative values for left-swipe.
  const swipeOffset = computed(() => {
    if (!isSwiping.value || !enabled.value) return 0;
    const delta = touchCurrentX.value - touchStartX.value;
    return Math.min(0, delta);
  });

  // Reactive transform object for direct template binding in the component.
  const swipeTransform = computed(() => {
    if (!isSwiping.value || swipeOffset.value === 0) return {};
    return {
      transform: `translateX(${swipeOffset.value}px)`,
      transition: 'none'
    };
  });

  /**
   * Initialises the touch tracking sequence.
   * @param {TouchEvent} event - Native touch start event.
   */
  const handleTouchStart = (event) => {
    // Prevent tracking if the swipe logic is explicitly disabled via the reactive prop.
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
    // Only track movement if the initial touch sequence was successfully validated.
    if (!isSwiping.value) return;
    touchCurrentX.value = event.touches[0].clientX;
  };

  /**
   * Evaluates gesture completion and resets internal state.
   */
  const handleTouchEnd = () => {
    if (!isSwiping.value) return;

    // Trigger dismissal if the move exceeds the defined pixel threshold.
    if (Math.abs(swipeOffset.value) > threshold) {
      onTrigger();
    }

    // Reset all tracking states to prepare for the next user interaction.
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

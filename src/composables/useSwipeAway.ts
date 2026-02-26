/**
 * Provides reusable logic for horizontal swipe gestures with visual tracking.
 * Typically used for 'swipe-to-dismiss' patterns in mobile interfaces.
 */
import { computed, type Ref, ref, type StyleValue } from 'vue';

// Define the standard pixel threshold for triggering a swipe action if not specified.
const DEFAULT_SWIPE_THRESHOLD = 80;

/**
 * Configuration for the swipe-away gesture logic.
 */
interface UseSwipeAwayOptions {
  /** Callback executed when the swipe exceeds the defined pixel threshold. */
  onTrigger: () => void;
  /** Distance in pixels required to trigger the dismissal action. */
  threshold?: number;
  /** Reactive Vue Ref used to toggle the logic state on or off. */
  enabled: Ref<boolean>;
}

/**
 * Creates touch event handlers for the swipe-away gesture.
 * @param options - Configuration for the swipe behaviour.
 * @param state - Reactive state for tracking swipe interactions.
 * @returns Object containing touch event handlers.
 */
function createSwipeHandlers(
  { onTrigger, threshold = DEFAULT_SWIPE_THRESHOLD, enabled }: UseSwipeAwayOptions,
  state: {
    touchStartX: Ref<number>;
    touchCurrentX: Ref<number>;
    isSwiping: Ref<boolean>;
    swipeOffset: Readonly<Ref<number>>;
  }
) {
  const { touchStartX, touchCurrentX, isSwiping, swipeOffset } = state;

  /**
   * Initialises the touch tracking sequence.
   * @param event - Native touch start event.
   */
  const handleTouchStart = (event: TouchEvent) => {
    // Prevent tracking if the swipe logic is explicitly disabled via the reactive prop.
    if (!enabled.value) return;
    const touch = event.touches[0];
    if (!touch) return;
    touchStartX.value = touch.clientX;
    touchCurrentX.value = touch.clientX;
    isSwiping.value = true;
  };

  /**
   * Updates current position to provide real-time visual feedback.
   * @param event - Native touch move event.
   */
  const handleTouchMove = (event: TouchEvent) => {
    // Only track movement if the initial touch sequence was successfully validated.
    if (!isSwiping.value) return;
    const touch = event.touches[0];
    if (!touch) return;
    touchCurrentX.value = touch.clientX;
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

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
}

/**
 * Manages touch states and calculates horizontal displacement for swipe interactions.
 * @param options - Configuration for the swipe behaviour.
 * @returns Touch handlers and reactive displacement states.
 */
export function useSwipeAway(options: UseSwipeAwayOptions) {
  const touchStartX = ref(0);
  const touchCurrentX = ref(0);
  const isSwiping = ref(false);

  // Calculate horizontal displacement; restricted to negative values for left-swipe.
  const swipeOffset = computed(() => {
    if (!isSwiping.value || !options.enabled.value) return 0;
    const delta = touchCurrentX.value - touchStartX.value;
    return Math.min(0, delta);
  });

  // Reactive transform object for direct template binding in the component.
  const swipeTransform = computed((): StyleValue => {
    if (!isSwiping.value || swipeOffset.value === 0) return {};
    return {
      transform: `translateX(${swipeOffset.value}px)`,
      transition: 'none'
    };
  });

  const handlers = createSwipeHandlers(options, {
    touchStartX,
    touchCurrentX,
    isSwiping,
    swipeOffset
  });

  return {
    isSwiping,
    swipeOffset,
    swipeTransform,
    ...handlers
  };
}

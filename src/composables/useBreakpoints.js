import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Monitors the container width to determine layout mode.
 * Allows components to specify a custom threshold for switching to mobile view.
 * Updated to use borderBoxSize for more accurate layout measurements.
 * @param {object} targetRef - The Vue template ref to observe.
 * @param {number} [threshold] - The width in REMs at which to switch to mobile mode.
 * @returns {object} An object containing the isMobile reactive boolean.
 */
export function useBreakpoints(targetRef, threshold = 50) {
  const isMobile = ref(false);

  // Calculate the root font size to convert pixels to REMs.
  const getRemValue = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

  // Observe resize events to dynamically update the state.
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      // Prefer borderBoxSize to include padding in the width calculation.
      // Fallback to contentRect if borderBoxSize is unavailable (legacy support).
      const widthPx = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
      const widthRem = widthPx / getRemValue();

      // Compare the current width against the provided threshold.
      // This allows the consumer to dictate when the layout breaks.
      isMobile.value = widthRem < threshold;
    }
  });

  onMounted(() => {
    // Ensure the element exists before observing.
    if (targetRef.value) {
      observer.observe(targetRef.value);
    }
  });

  onUnmounted(() => observer.disconnect());

  return { isMobile };
}

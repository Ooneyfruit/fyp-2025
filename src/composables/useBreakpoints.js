import { onMounted, onUnmounted, ref } from 'vue';

// Default width threshold in REMs for mobile layout breaks.
const DEFAULT_MOBILE_THRESHOLD = 50;
const BASE_FONT_SIZE = 16;

/**
 * Logic: calculates the root font size to convert pixels to REMs accurately.
 * Moved to the outer scope to satisfy consistent function scoping rules.
 * @returns {number} The current root font size in pixels.
 */
const getRemValue = () => {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || BASE_FONT_SIZE;
};

/**
 * Monitors the container width to determine layout mode.
 * Allows components to specify a custom threshold for switching to mobile view.
 * @param {import('vue').Ref<HTMLElement | null>} targetRef - The Vue template ref to observe.
 * @param {number} [threshold] - The width in REMs at which to switch to mobile mode.
 * @returns {{ isMobile: import('vue').Ref<boolean> }} An object containing the isMobile reactive boolean.
 */
export function useBreakpoints(targetRef, threshold = DEFAULT_MOBILE_THRESHOLD) {
  const isMobile = ref(false);

  /**
   * Logic: observe resize events to dynamically update the layout state.
   */
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      // Prefer borderBoxSize to include padding in the width calculation for accuracy.
      const widthPx = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
      const widthRem = widthPx / getRemValue();

      // Compare the current width against the provided threshold.
      isMobile.value = widthRem < threshold;
    }
  });

  onMounted(() => {
    // Ensure the element exists before initiating the observation.
    if (targetRef.value) {
      observer.observe(targetRef.value);
    }
  });

  onUnmounted(() => observer.disconnect());

  return { isMobile };
}

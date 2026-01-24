import { onMounted, onUnmounted, ref, type Ref } from 'vue';

// Default width threshold in REMs for mobile layout breaks.
const DEFAULT_MOBILE_THRESHOLD = 50;
const BASE_FONT_SIZE = 16;

export interface UseBreakpointsReturn {
  isMobile: Ref<boolean>;
}

/**
 * Logic: calculates the root font size to convert pixels to REMs accurately.
 */
const getRemValue = (): number => {
  if (typeof document === 'undefined') return BASE_FONT_SIZE;
  const fontSize = getComputedStyle(document.documentElement).fontSize;
  return Number.parseFloat(fontSize) || BASE_FONT_SIZE;
};

/**
 * Monitors the container width to determine layout mode.
 */
export function useBreakpoints(
  targetRef: Ref<HTMLElement | null>,
  threshold: number = DEFAULT_MOBILE_THRESHOLD
): UseBreakpointsReturn {
  const isMobile = ref(false);

  /**
   * Logic: observe resize events to dynamically update the layout state.
   */
  let observer: ResizeObserver | null = null;

  onMounted(() => {
    // Only initialise ResizeObserver in a browser environment
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Prefer borderBoxSize to include padding in the width calculation for accuracy.
          const boxSize = entry.borderBoxSize?.[0];
          const widthPx = boxSize ? boxSize.inlineSize : entry.contentRect.width;
          const widthRem = widthPx / getRemValue();

          isMobile.value = widthRem < threshold;
        }
      });
    }

    if (targetRef.value && observer) {
      observer.observe(targetRef.value);
    }
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  return { isMobile };
}

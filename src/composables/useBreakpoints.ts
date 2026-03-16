/**
 * Provides logic for detecting layout breakpoints based on element dimensions.
 * Converts pixel values to REMs to ensure consistent behaviour across different browser zoom levels.
 */
import { onMounted, onUnmounted, type Ref, ref } from 'vue';

// Default width threshold in REMs for mobile layout breaks.
const DEFAULT_MOBILE_THRESHOLD = 50;
const BASE_FONT_SIZE = 16;

export interface UseBreakpointsReturn {
  isMobile: Ref<boolean>;
}

/**
 * Calculates the current root font size to convert pixels to REMs accurately.
 * @returns The root font size in pixels.
 */
const getRemValue = (): number => {
  if (typeof document === 'undefined') {
    return BASE_FONT_SIZE;
  }
  const fontSize = getComputedStyle(document.documentElement).fontSize;
  return Number.parseFloat(fontSize) || BASE_FONT_SIZE;
};

/**
 * Monitors the container width to determine the layout mode.
 * @param targetRef - Vue template ref for the target element to observe.
 * @param threshold - Width threshold in REMs for the mobile layout break.
 * @returns An object containing the reactive mobile state.
 */
export function useBreakpoints(
  targetRef: Ref<HTMLElement | null>,
  threshold: number = DEFAULT_MOBILE_THRESHOLD
): UseBreakpointsReturn {
  const isMobile = ref(false);

  // Internal observer instance for tracking resize events.
  let observer: ResizeObserver | null = null;

  const evaluateBreakpoints = (element: HTMLElement) => {
    // Use window.innerWidth if the target is the root document body/html.
    // This ensures JS breakpoints perfectly align with CSS media queries
    // which evaluate viewport width including the scrollbars.
    const isViewport = element === document.body || element === document.documentElement;
    const widthPx = isViewport ? window.innerWidth : element.getBoundingClientRect().width;

    const widthRem = widthPx / getRemValue();

    // CSS media queries typically use inclusive <= for max-width.
    isMobile.value = widthRem <= threshold;
  };

  const handleResize = () => {
    if (targetRef.value) {
      evaluateBreakpoints(targetRef.value);
    }
  };

  onMounted(() => {
    if (targetRef.value) {
      evaluateBreakpoints(targetRef.value); // Initial evaluation
    }

    // Only initialise ResizeObserver in a browser environment.
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver((entries) => {
        // requestAnimationFrame guards against "ResizeObserver loop limit exceeded"
        // errors during sudden layout shifts.
        globalThis.requestAnimationFrame(() => {
          for (const entry of entries) {
            evaluateBreakpoints(entry.target as HTMLElement);
          }
        });
      });
    }

    if (targetRef.value && observer) {
      observer.observe(targetRef.value);
    }

    if (globalThis.window !== undefined) {
      window.addEventListener('resize', handleResize, { passive: true });
    }
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
    if (globalThis.window !== undefined) {
      window.removeEventListener('resize', handleResize);
    }
  });

  return { isMobile };
}

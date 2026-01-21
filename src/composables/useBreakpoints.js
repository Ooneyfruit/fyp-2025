import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Monitors the container width to determine layout mode.
 * Allows components to specify a custom threshold for switching to mobile view.
 * @param {Object} targetRef - The Vue template ref to observe.
 * @param {number} [threshold=50] - The width in rems at which to switch to mobile mode.
 * @returns {Object} An object containing the isMobile reactive boolean.
 */
export function useBreakpoints(targetRef, threshold = 50) {
  const isMobile = ref(false);
  
  // Calculate the root font size to convert pixels to rems.
  const getRemValue = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

  // Observe resize events to dynamically update the state.
  const observer = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const widthRem = entry.contentRect.width / getRemValue();
      
      // Compare the current width against the provided threshold.
      // This allows the consumer to dictate when the layout breaks.
      isMobile.value = widthRem < threshold; 
    }
  });

  onMounted(() => {
    if (targetRef.value) observer.observe(targetRef.value);
  });

  onUnmounted(() => observer.disconnect());

  return { isMobile };
}
import { ref, onMounted, onUnmounted } from 'vue';

export function useBreakpoints(targetRef) {
  const isMobile = ref(false);
  // Threshold: The table needs roughly 55rem to display comfortably
  const THRESHOLD_REM = 55; 

  const getRemValue = () => {
    return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  };

  const observer = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const widthPx = entry.contentRect.width;
      const widthRem = widthPx / getRemValue();
      
      // Accuracy: If the available space is less than our REM threshold, 
      // switch to cards, regardless of sidebar state or window size.
      isMobile.value = widthRem < THRESHOLD_REM;
    }
  });

  onMounted(() => {
    if (targetRef.value) observer.observe(targetRef.value);
  });

  onUnmounted(() => {
    observer.disconnect();
  });

  return { isMobile };
}
import { ref, onMounted, onUnmounted } from 'vue';

export function useBreakpoints(targetRef) {
  const isMobile = ref(false);
  const getRemValue = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

  const observer = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const widthRem = entry.contentRect.width / getRemValue();
      // Switches when space becomes tighter than the sum of min-widths
      isMobile.value = widthRem < 50; 
    }
  });

  onMounted(() => {
    if (targetRef.value) observer.observe(targetRef.value);
  });

  onUnmounted(() => observer.disconnect());

  return { isMobile };
}
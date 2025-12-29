import { ref } from 'vue';

// GLOBAL SINGLETON STATE
// Moving these outside the function ensures every component shares 
// the same reactive references.
const message = ref("");
const isVisible = ref(false);
let timeout = null;

export function useToast() {
  /**
   * Triggers a global toast notification.
   * @param {string} msg - The message to display.
   * @param {number} duration - Time in ms before auto-hiding.
   */
  const showToast = (msg, duration = 4000) => {
    // Clear any existing timer to prevent overlapping hide events
    console.log(`%c[useToast] TRIGGERED: "${msg}"`, "color: #3b82f6; font-weight: bold");
    
    // Clear existing timer if user spams the button
    if (timeout) {
      console.log("[useToast] Clearing existing timeout.");
      clearTimeout(timeout);
    }

    message.value = msg;
    isVisible.value = true;
    
    timeout = setTimeout(() => {
      isVisible.value = false;
      console.log("[useToast] Hide animation started.");
    }, duration);
  };

  /**
   * Immediately hides the active toast.
   */
  const hideToast = () => {
    isVisible.value = false;
    if (timeout) clearTimeout(timeout);
  };

  return { 
    message, 
    isVisible, 
    showToast,
    hideToast 
  };
}
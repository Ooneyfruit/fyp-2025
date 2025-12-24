import { ref } from 'vue';

const message = ref("");
const isVisible = ref(false);
let timeout = null;

export function useToast() {
  const showToast = (msg, duration = 4000) => {
    if (timeout) clearTimeout(timeout);
    message.value = msg;
    isVisible.value = true;
    
    timeout = setTimeout(() => {
      isVisible.value = false;
    }, duration);
  };

  return { message, isVisible, showToast };
}
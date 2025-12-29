import { ref } from 'vue';

// Global state shared across the app
const isSidebarOpen = ref(false);

export function useLayout() {
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  const closeSidebar = () => {
    isSidebarOpen.value = false;
  };

  return {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar
  };
}
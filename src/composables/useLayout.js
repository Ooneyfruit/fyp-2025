/**
 * Global layout manager and responsive state provider.
 * Centralizes viewport detection, sidebar state memory, and multi-stage stabilization.
 */
import { ref, watch } from 'vue';

const MOBILE_BREAKPOINT = 768;

// Initial state helpers for immediate application.
const getInitialMobileState = () => typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false;
const getInitialPreference = () => typeof window !== 'undefined' ? localStorage.getItem('isSidebarOpen') === 'true' : false;

// Shared reactive states.
const isMobile = ref(getInitialMobileState());
const canAnimate = ref(false);

// Memory: tracks the intended desktop state when returning from mobile view.
const desktopPreference = ref(getInitialPreference());

/**
 * Initial Sidebar State:
 * Desktop users receive their saved preference; mobile users start closed.
 */
const isSidebarOpen = ref(!isMobile.value ? desktopPreference.value : false);

/**
 * Syncs layout classes to the document root for CSS variable scoping.
 * Provides immediate positioning for the side menu and main content.
 */
function syncRootClasses() {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  
  root.classList.toggle('initial-layout-wide', isSidebarOpen.value && !isMobile.value);
  root.classList.toggle('initial-layout-slim', !isSidebarOpen.value && !isMobile.value);
  root.classList.toggle('initial-layout-mobile', isMobile.value);
}

/**
 * Executes an ultra-conservative stabilization check.
 * Transitions are only enabled after the browser proves sustained idle behavior.
 */
export function initLayoutStabilization() {
  if (typeof window === 'undefined') return;

  let idleCheckCount = 0;
  const REQUIRED_STABLE_CHECKS = 3; // Must pass 3 consecutive idle checks.

  const verifyStability = () => {
    const wait = window.requestIdleCallback || ((cb) => setTimeout(cb, 50));
    
    wait((deadline) => {
      // If the browser is under heavy load (little time remaining), reset the count.
      if (deadline.timeRemaining() < 10) {
        idleCheckCount = 0;
        return setTimeout(verifyStability, 200);
      }

      idleCheckCount++;

      if (idleCheckCount >= REQUIRED_STABLE_CHECKS) {
        // Final "cool-down" to allow for hardware-specific display refresh syncing.
        setTimeout(() => {
          canAnimate.value = true;
          console.log("[App] Sustained stability achieved. Transitions enabled.");
        }, 500);
      } else {
        // Recursive check to ensure stability is persistent, not a momentary pause.
        setTimeout(verifyStability, 100);
      }
    });
  };

  // Wait for the full window load event before beginning the idle verification sequence.
  if (document.readyState === 'complete') {
    verifyStability();
  } else {
    window.addEventListener('load', verifyStability, { once: true });
  }
}

/**
 * Manages layout transitions and state memory during viewport resizes.
 */
const updateLayoutState = () => {
  if (typeof window === 'undefined') return;
  
  const wasMobile = isMobile.value;
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;

  if (isMobile.value && !wasMobile) {
    desktopPreference.value = isSidebarOpen.value;
    isSidebarOpen.value = false;
  }

  if (!isMobile.value && wasMobile) {
    isSidebarOpen.value = desktopPreference.value;
  }
};

// Global reactive synchronization for document-level classes.
watch([isSidebarOpen, isMobile], () => syncRootClasses(), { immediate: true });

if (typeof window !== 'undefined') {
  window.addEventListener('resize', updateLayoutState);
}

/**
 * Provides access to centralized layout states and control methods.
 * @returns {Object} Reactive layout properties and mutation functions.
 */
export function useLayout() {
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
    desktopPreference.value = isSidebarOpen.value;

    if (!isMobile.value) {
      localStorage.setItem('isSidebarOpen', isSidebarOpen.value.toString());
    }
  };

  const closeSidebar = () => {
    isSidebarOpen.value = false;
  };

  return {
    isMobile,
    isSidebarOpen,
    canAnimate,
    toggleSidebar,
    closeSidebar
  };
}
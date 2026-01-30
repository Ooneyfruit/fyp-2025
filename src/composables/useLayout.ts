/**
 * Global layout manager and responsive state provider.
 * Centralises viewport detection, sidebar state memory, and multi-stage stabilisation.
 */
import { ref, watch } from 'vue';

const MOBILE_BREAKPOINT = 768;

// Initial state helpers for immediate application.
const getInitialMobileState = () =>
  typeof globalThis === 'undefined' ? false : window.innerWidth < MOBILE_BREAKPOINT;
const getInitialPreference = () =>
  typeof globalThis === 'undefined' ? false : localStorage.getItem('isSidebarOpen') === 'true';

// Shared reactive states.
const isMobile = ref(getInitialMobileState());
const canAnimate = ref(false);

// Memory: tracks the intended desktop state when returning from mobile view.
const desktopPreference = ref(getInitialPreference());

// Constants to satisfy the no-magic-numbers rule.
const IDLE_CALLBACK_FALLBACK_MS = 50;
const MIN_TIME_REMAINING_MS = 10;
const BUSY_RETRY_DELAY_MS = 200;
const STABILISATION_COOLDOWN_MS = 500;
const CHECK_INTERVAL_MS = 100;
const REQUIRED_STABLE_CHECKS = 6;

/**
 * Initial Sidebar State:
 * Desktop users receive their saved preference; mobile users start closed.
 */
const isSidebarOpen = ref(isMobile.value ? false : desktopPreference.value);

/**
 * Syncs layout classes to the document root for CSS variable scoping.
 * Provides immediate positioning for the side menu and main content.
 */
function syncRootClasses() {
  if (typeof globalThis === 'undefined') return;
  const root = document.documentElement;

  root.classList.toggle('initial-layout-wide', isSidebarOpen.value && !isMobile.value);
  root.classList.toggle('initial-layout-slim', !isSidebarOpen.value && !isMobile.value);
  root.classList.toggle('initial-layout-mobile', isMobile.value);
}

/**
 * Executes an ultra-conservative stabilisation check.
 * Transitions are only enabled after the browser proves sustained idle behaviour.
 */
export function initLayoutStabilisation() {
  if (typeof globalThis === 'undefined') return;

  let idleCheckCount = 0;

  const verifyStability = () => {
    const wait =
      globalThis.requestIdleCallback || ((cb) => setTimeout(cb, IDLE_CALLBACK_FALLBACK_MS));

    wait((deadline) => {
      // If the browser is under heavy load (little time remaining), reset the count.
      if (deadline.timeRemaining() < MIN_TIME_REMAINING_MS) {
        idleCheckCount = 0;
        return setTimeout(verifyStability, BUSY_RETRY_DELAY_MS);
      }

      idleCheckCount++;

      if (idleCheckCount >= REQUIRED_STABLE_CHECKS) {
        // Final "cool-down" to allow for hardware-specific display refresh syncing.
        setTimeout(() => {
          canAnimate.value = true;
        }, STABILISATION_COOLDOWN_MS);
      } else {
        // Recursive check to ensure stability is persistent, not a momentary pause.
        setTimeout(verifyStability, CHECK_INTERVAL_MS);
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
  if (typeof globalThis === 'undefined') return;

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

// Global reactive synchronisation for document-level classes.
watch([isSidebarOpen, isMobile], () => syncRootClasses(), { immediate: true });

if (typeof globalThis !== 'undefined') {
  window.addEventListener('resize', updateLayoutState);
}

/**
 * Definition of the UseLayout return object.
 * IsMobile - Reactive state indicating if viewport is mobile.
 * IsSidebarOpen - Reactive state for sidebar visibility.
 * CanAnimate - State indicating if layout animations are allowed.
 * ToggleSidebar - Toggles the sidebar open/closed state.
 * CloseSidebar - Forces the sidebar to close.
 */

/**
 * Provides access to centralised layout states and control methods.
 * @returns Reactive layout properties and mutation functions.
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

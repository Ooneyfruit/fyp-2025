/**
 * ShimsVue.d.ts.
 * Global type definitions for Vue single-file components and virtual modules.
 */

/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<object, object, unknown>;
  export default component;
}

/**
 * Ambient module declaration for the Vite PWA virtual registry.
 */
declare module 'virtual:pwa-register/vue' {
  import { type Ref } from 'vue';

  /**
   * Configuration options for the service worker registration.
   */
  export interface RegisterSWOptions {
    /**
     * Whether the service worker should be registered immediately.
     */
    immediate?: boolean;
    /**
     * Callback executed when new content is available for refresh.
     */
    onNeedRefresh?: () => void;
    /**
     * Callback executed when the application is ready for offline use.
     */
    onOfflineReady?: () => void;
    /**
     * Callback executed upon successful registration.
     */
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    /**
     * Callback executed if registration fails.
     */
    onRegisterError?: (error: unknown) => void;
  }

  /**
   * Vue composable for managing Vite PWA service worker lifecycle events.
   * @param options - Configuration for lifecycle callbacks and registration.
   * @returns An object containing reactive state and the update function.
   */
  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: Ref<boolean>;
    offlineReady: Ref<boolean>;
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}

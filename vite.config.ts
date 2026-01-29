/**
 * PWA configuration options.
 * Defines behaviour for offline access, asset caching, and manifest generation.
 */
import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa';

const pwaOptions: Partial<VitePWAOptions> = {
  registerType: 'prompt',
  injectRegister: 'auto',

  // Asset management: define which files are pre-cached for offline availability.
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,vue}'],
    navigateFallback: 'index.html',

    // Performance: exclude firestore sync endpoints from service worker interception.
    // This ensures the SDK-level persistence handles data synchronisation without conflicts.
    navigateFallbackDenylist: [/^\/__/]
  },

  // Manifest: metadata for platform-level integration and home screen installation.
  manifest: {
    name: 'RotaDent',
    short_name: 'RotaDent',
    description: 'Advanced Dental Practice Rota Management',
    theme_color: '#1d4ed8', // Synchronised with --color-primary.
    background_color: '#f8fafc', // Synchronised with --bg-app.
    display: 'standalone',

    icons: [
      {
        src: 'android/android-launchericon-192-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'android/android-launchericon-512-512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: 'android/android-launchericon-512-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  }
};

/**
 * Generates a mock PWA registration module for the test environment.
 * This prevents the build from failing when vite-plugin-pwa virtual modules are missing.
 * @returns A vite plugin object.
 */
const getPwaMockPlugin = (): Plugin => ({
  name: 'virtual-pwa-mock',
  resolveId(id) {
    // Intercept the virtual import used in App.vue.
    if (id === 'virtual:pwa-register/vue') {
      return 'virtual:pwa-register/vue';
    }
  },
  load(id) {
    // Return a dummy implementation so imports do not crash the build.
    if (id === 'virtual:pwa-register/vue') {
      return `
        import { ref } from 'vue';
        export const useRegisterSW = () => ({
          needRefresh: ref(false),
          updateServiceWorker: () => {}
        });
      `;
    }
  }
});

/**
 * Strategy for segregating vendor libraries into dedicated chunks.
 * Isolates heavier dependencies (Firestore) to prevent bundle bloat warnings.
 * @param id - The absolute path of the module being processed.
 * @returns The name of the chunk or undefined.
 */
const getManualChunks = (id: string): string | undefined => {
  // Only process third-party dependencies located in node_modules.
  if (id.includes('node_modules')) {
    // Separate Firestore as it is the largest component of the Firebase SDK.
    if (id.includes('firestore')) {
      return 'vendor-firebase-firestore';
    }

    // Group remaining Firebase modules (Auth, App, etc.) together.
    if (id.includes('firebase')) {
      return 'vendor-firebase-core';
    }

    // Group Vue ecosystem libraries to keep the main bundle light.
    if (id.includes('vue')) {
      return 'vendor-vue';
    }
  }
};

/**
 * Primary Vite configuration.
 * Orchestrates build tooling, plugin integrations, and development server behaviour.
 */
export default defineConfig(({ mode }) => {
  const plugins = [vue()];

  /**
   * PWA configuration: manages service worker generation and web manifest.
   * - Development/Production: Uses the real VitePWA plugin.
   * - Test: Uses a custom mock plugin to resolve the virtual module.
   */
  if (mode === 'test') {
    plugins.push(getPwaMockPlugin());
  } else {
    plugins.push(...VitePWA(pwaOptions));
  }

  return {
    plugins,

    resolve: {
      alias: {
        // Path aliasing: maps the '@' symbol to the physical 'src' directory.
        '@': fileURLToPath(new URL('src', import.meta.url))
      }
    },

    /**
     * Build optimisation configuration.
     * Implements manual chunking and adjusts warning limits for large dependencies.
     */
    build: {
      // Increase the warning limit to 1MB to accommodate the Firestore SDK size.
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: getManualChunks
        }
      }
    },

    /**
     * Development server: local configuration for port mapping and environment stability.
     */
    server: {
      port: 3000,
      strictPort: true
    },

    /**
     * Vitest configuration.
     * Sets up the happy-dom environment for component testing.
     */
    test: {
      environment: 'happy-dom',
      globals: true,
      include: ['src/**/*.{test,spec}.{js,ts,vue}']
    }
  };
});

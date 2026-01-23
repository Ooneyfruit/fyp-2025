import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

/**
 * PWA configuration options.
 * Defines behaviour for offline access, asset caching, and manifest generation.
 * @type {Partial<import('vite-plugin-pwa').VitePWAOptions>}
 */
const pwaOptions = {
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
 * Primary vite configuration.
 * Orchestrates build tooling, plugin integrations, and development server behaviour.
 * @param {object} configEnv - The environment configuration object.
 * @param {string} configEnv.mode - The current execution mode (e.g., 'development', 'production', 'test').
 * @returns {object} The resolved Vite configuration.
 */
export default defineConfig(({ mode }) => {
  const plugins = [vue()];

  /**
   * PWA configuration: manages service worker generation and web manifest.
   * - Development/Production: Uses the real VitePWA plugin.
   * - Test: Uses a custom mock plugin to resolve the virtual module.
   */
  if (mode === 'test') {
    plugins.push({
      name: 'virtual-pwa-mock',
      resolveId(id) {
        // Intercept the virtual import used in App.vue
        if (id === 'virtual:pwa-register/vue') {
          return 'virtual:pwa-register/vue';
        }
      },
      load(id) {
        // Return a dummy implementation so imports don't crash the build
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
  } else {
    plugins.push(...VitePWA(pwaOptions));
  }

  return {
    plugins,

    resolve: {
      alias: {
        // Path aliasing: maps the '@' symbol to the physical 'src' directory for absolute-style imports.
        '@': fileURLToPath(new URL('src', import.meta.url))
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

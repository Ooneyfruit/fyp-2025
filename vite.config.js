import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

/**
 * Primary vite configuration.
 * Orchestrates build tooling, plugin integrations, and development server behaviour.
 */
export default defineConfig({
  plugins: [
    vue(),

    /**
     * PWA configuration: manages service worker generation and web manifest.
     * Implements an offline-first strategy for the application shell.
     */
    VitePWA({
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
    })
  ],

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
});

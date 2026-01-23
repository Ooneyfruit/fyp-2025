import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

/**
 * Primary Vite configuration.
 * Orchestrates build tooling, plugin integrations, and development server behaviour.
 */
export default defineConfig({
  plugins: [
    vue(),

    /**
     * PWA Configuration: Manages service worker generation and web manifest.
     * Implements an offline-first strategy for the application shell.
     */
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',

      // Asset Management: Define which files are pre-cached for offline availability.
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,vue}'],
        navigateFallback: 'index.html',

        // Performance: Exclude Firestore sync endpoints from service worker interception.
        // This ensures the SDK-level persistence handles data synchronisation without conflicts.
        navigateFallbackDenylist: [/^\/__/]
      },

      // Manifest: Metadata for platform-level integration and home screen installation.
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

  /**
   * Development Server: Local configuration for port mapping and environment stability.
   */
  server: {
    port: 3000,
    strictPort: true
  },

  /**
   * Vitest Configuration.
   * Sets up the happy-dom environment for component testing.
   */
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts,vue}']
  }
});

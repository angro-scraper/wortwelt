import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  publicDir: 'static',
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icons/wortwelt-icon-192.png', 'icons/wortwelt-icon-512.png'],
    manifest: {
      name: 'WortWelt — Deutsch lernen mit Spaß',
      short_name: 'WortWelt',
      description: 'Offline deutsche Buchstaben, Wörter, Spiele, Zahlen und Geschichten für Kinder.',
      theme_color: '#2563eb',
      background_color: '#fffaf0',
      display: 'standalone',
      orientation: 'portrait',
      lang: 'de',
      icons: [
        { src: '/icons/wortwelt-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: '/icons/wortwelt-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    },
    workbox: {
      // Audio stays in the native package but must not delay the first screen by
      // precaching all 273 clips. The browser version saves clips after use.
      globPatterns: ['**/*.{js,css,html,svg,json,woff2}'],
      runtimeCaching: [{
        urlPattern: /\/audio\/de\/.*\.mp3$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'wortwelt-audio',
          expiration: { maxEntries: 273, maxAgeSeconds: 60 * 60 * 24 * 180 },
          cacheableResponse: { statuses: [0, 200] }
        }
      }],
      navigateFallback: '/index.html'
    }
  })],
  build: { sourcemap: true }
});

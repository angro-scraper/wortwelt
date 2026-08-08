import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  publicDir: 'static',
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icons/wortwelt-icon.svg'],
    manifest: {
      name: 'WortWelt — Deutsch lernen mit Spaß',
      short_name: 'WortWelt',
      description: 'Offline deutsche Buchstaben, Wörter, Spiele, Zahlen und Geschichten für Kinder.',
      theme_color: '#2563eb',
      background_color: '#fffaf0',
      display: 'standalone',
      orientation: 'portrait',
      lang: 'de',
      icons: [{ src: '/icons/wortwelt-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,json,woff2,mp3}'],
      navigateFallback: '/index.html'
    }
  })],
  build: { sourcemap: true }
});

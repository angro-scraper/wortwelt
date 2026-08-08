import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    include: [
      'src/WortWeltApp.test.tsx',
      'src/domain/germanLetters.test.ts',
      'src/domain/wortweltMvp.test.ts',
      'src/services/wortweltAudio.test.ts',
      'src/pwa.wortwelt.test.ts'
    ]
  }
});

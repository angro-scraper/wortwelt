import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('WortWelt PWA i native osnova', () => {
  it('gradi samo nove WortWelt statičke resurse i radi offline', () => {
    const vite = read('vite.config.ts');
    expect(vite).toContain("publicDir: 'static'");
    expect(vite).toContain("display: 'standalone'");
    expect(vite).toContain("lang: 'de'");
    expect(vite).toContain('mp3');
  });

  it('preusmerava javne privacy i support rute na PWA ulaz na Renderu', () => {
    const render = read('render.yaml');
    expect(render).toContain('type: rewrite');
    expect(render).toContain('source: /*');
    expect(render).toContain('destination: /index.html');
  });

  it('native omoti koriste isti lokalni dist, bez udaljenog WebView URL-a', () => {
    const capacitor = read('capacitor.config.ts');
    expect(capacitor).toContain("appId: 'de.wortwelt.app'");
    expect(capacitor).toContain("webDir: 'dist'");
    expect(capacitor).not.toContain('server:');
  });

  it('TypeScript build ne uvlači nasleđene Slovolov module', () => {
    const config = read('tsconfig.app.json');
    expect(config).toContain('src/WortWeltApp.tsx');
    expect(config).not.toContain('"include": ["src"]');
  });

  it('isporučuje kompletan lokalni nemački audio paket bez TTS fallback-a', () => {
    const audioRoot = resolve(root, 'static/audio/de');
    const count = (path: string): number => readdirSync(path, { withFileTypes: true }).reduce(
      (total, item) => total + (item.isDirectory() ? count(resolve(path, item.name)) : item.name.endsWith('.mp3') ? 1 : 0), 0
    );
    // 30 slova + 91 reč + 101 broj + povratne poruke + 12 priča sa rečenicama.
    expect(count(audioRoot)).toBe(273);
    const audioService = read('src/services/wortweltAudio.ts');
    expect(audioService).not.toContain('speechSynthesis');
    expect(audioService).not.toContain('SpeechSynthesis');
  });
});

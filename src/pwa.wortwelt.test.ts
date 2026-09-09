import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { germanLetters } from './domain/germanLetters';
import { COUNTING_LESSONS, READING_STORIES } from './domain/wortweltMvp';
import { germanAudioUrl } from './services/wortweltAudio';

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

  it('isporučuje fizičku stranicu privatnosti i za validatore koji koriste HEAD', () => {
    const privacy = read('static/privacy/index.html');
    expect(privacy).toContain('<title>WortWelt Datenschutz</title>');
    expect(privacy).toContain('keine Werbung');
    expect(privacy).toContain('kein Tracking');
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

  it('ima stvarni snimak za svaki zvuk koji dostupni tokovi mogu da zatraže', () => {
    const audioPath = (asset: string) => resolve(root, 'static', germanAudioUrl(asset).replace(/^\//, ''));
    const requested = [
      ...germanLetters.map(({ upper }) => `letters/${upper}`),
      ...germanLetters.flatMap(({ words }) => words.map(({ word }) => `words/${word}`)),
      ...COUNTING_LESSONS.map(({ value }) => `numbers/${value}`),
      ...READING_STORIES.flatMap((story) => story.sentences.map((_, index) => `stories/${story.id}-${index + 1}`)),
      'feedback/bravo', 'feedback/bravo-next-letter', 'feedback/try-again'
    ];

    expect(requested.every((asset) => existsSync(audioPath(asset)))).toBe(true);
  });

  it('ne isporučuje mikrofon, snimanje glasa ni govornu vežbu za decu', () => {
    const app = read('src/WortWeltApp.tsx');
    expect(app).not.toContain('VoicePractice');
    expect(app).not.toContain('voiceEnabled');
    expect(app).not.toContain('Sprechwerkstatt');
    expect(existsSync(resolve(root, 'src/components/VoicePractice.tsx'))).toBe(false);
    const privacy = read('static/privacy/index.html');
    expect(privacy).toContain('fordert keine Mikrofonberechtigung an');
    expect(privacy).not.toContain('Sprechübung');
  });

  it('isporučuje fizičku stranicu podrške kada hosting ne primenjuje SPA rewrite', () => {
    const support = read('static/support/index.html');
    expect(support).toContain('<title>WortWelt Hilfe &amp; Support</title>');
    expect(support).toContain('ohne Konto');
    expect(support).toContain('Datenschutz');
  });
});

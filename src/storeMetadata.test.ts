import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const metadataFiles = [
  'store-listing/apple/de-DE/name.txt',
  'store-listing/apple/de-DE/subtitle.txt',
  'store-listing/apple/de-DE/description.txt',
  'store-listing/apple/de-DE/review-notes.txt',
  'store-listing/google-play/de-DE/title.txt',
  'store-listing/google-play/de-DE/short-description.txt',
  'store-listing/google-play/de-DE/full-description.txt',
  'store-listing/google-play/de-DE/release-notes-1.1.txt'
];

describe('WortWelt prodavnički metapodaci', () => {
  it('ne sadrže naziv niti ponudu druge aplikacije', () => {
    const metadata = metadataFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
    expect(metadata).not.toMatch(/Slovolov|srpsk|ćirilic|jednokratna kupovina/i);
  });

  it('jasno opisuju mesečnu pretplatu, probni period i privatnost', () => {
    const apple = readFileSync('store-listing/apple/de-DE/description.txt', 'utf8');
    const google = readFileSync('store-listing/google-play/de-DE/full-description.txt', 'utf8');
    for (const metadata of [apple, google]) {
      expect(metadata).toContain('7 Tage kostenlos');
      expect(metadata).toContain('3,99 €');
      expect(metadata).toMatch(/monatlich/i);
      expect(metadata).toMatch(/kündig/i);
      expect(metadata).toMatch(/keine Werbung/i);
    }
  });

  it('ima čitljiv iPhone snimak Premium ekrana za Apple pregled', () => {
    const screenshot = readFileSync('store-listing/wortwelt-iphone-premium-review.png');
    expect(screenshot.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(screenshot.readUInt32BE(16)).toBe(1242);
    expect(screenshot.readUInt32BE(20)).toBe(2688);
  });
});

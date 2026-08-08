import { describe, expect, it } from 'vitest';
import { germanAudioUrl } from './wortweltAudio';

describe('lokalni WortWelt audio', () => {
  it('normalizuje nemačka slova u isključivo lokalne mp3 putanje', () => {
    expect(germanAudioUrl('letters/Ä')).toBe('/audio/de/letters/ae.mp3');
    expect(germanAudioUrl('words/Straße')).toBe('/audio/de/words/strasse.mp3');
  });
});

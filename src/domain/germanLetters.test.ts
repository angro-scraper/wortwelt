import { describe, expect, it } from 'vitest';
import { germanLetters, isGermanAlphabetComplete } from './germanLetters';

describe('WortWelt nemačka abeceda', () => {
  it('obuhvata 26 slova i nemačke posebne znakove bez duplikata', () => {
    expect(isGermanAlphabetComplete()).toBe(true);
    expect(germanLetters).toHaveLength(30);
    expect(new Set(germanLetters.map((letter) => letter.upper)).size).toBe(30);
  });

  it('svako slovo ima tri smislene reči i pripadajuću ilustraciju', () => {
    germanLetters.forEach((letter) => {
      expect(letter.words).toHaveLength(3);
      letter.words.forEach((word) => {
        expect(word.word.length).toBeGreaterThan(1);
        expect(word.emoji).not.toBe('');
      });
    });
  });

  it('posebno tretira ß kao slovo koje se uči kroz reč Straße', () => {
    const eszett = germanLetters.at(-1);
    expect(eszett).toMatchObject({ upper: 'ẞ', lower: 'ß', name: 'Eszett' });
    expect(eszett?.words[0].word).toBe('Straße');
  });
});

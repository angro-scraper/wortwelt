import { describe, expect, it } from 'vitest';
import { germanLetters } from './germanLetters';
import { COUNTING_LESSONS, READING_STORIES, gameChoicesFor } from './wortweltMvp';

describe('WortWelt nemački sadržaj', () => {
  it('ima zatvoren tok brojanja od nule do deset', () => {
    expect(COUNTING_LESSONS.map(({ value }) => value)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(COUNTING_LESSONS[2]).toMatchObject({ word: 'zwei', label: 'Bälle' });
  });

  it('nudi tri originalne kratke nemačke priče sa proverom razumevanja', () => {
    expect(READING_STORIES).toHaveLength(3);
    for (const story of READING_STORIES) {
      expect(story.sentences.length).toBeGreaterThanOrEqual(3);
      expect(story.answers).toContain(story.correct);
    }
  });

  it('igra uvek sadrži jednu tačnu i dve različite pogrešne nemačke reči', () => {
    const choices = gameChoicesFor(germanLetters[0], germanLetters);
    expect(choices.map(({ word }) => word)).toContain('Affe');
    expect(new Set(choices.map(({ word }) => word)).size).toBe(3);
  });
});

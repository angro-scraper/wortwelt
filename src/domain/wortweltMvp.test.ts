import { describe, expect, it } from 'vitest';
import { germanLetters } from './germanLetters';
import { COUNTING_LESSONS, DAILY_CHALLENGES, FAIRY_TALES, GAME_MODES, READING_STORIES, gameChoicesFor } from './wortweltMvp';

describe('WortWelt nemački sadržaj', () => {
  it('ima zatvoren tok brojanja od nule do deset', () => {
    expect(COUNTING_LESSONS.map(({ value }) => value)).toEqual(Array.from({ length: 101 }, (_, value) => value));
    expect(COUNTING_LESSONS[2]).toMatchObject({ word: 'zwei', label: 'Bälle' });
    expect(COUNTING_LESSONS[42].word).toBe('zweiundvierzig');
  });

  it('nudi tri originalne kratke nemačke priče sa proverom razumevanja', () => {
    expect(READING_STORIES.length).toBeGreaterThanOrEqual(12);
    for (const story of READING_STORIES) {
      expect(story.sentences.length).toBeGreaterThanOrEqual(3);
      expect(story.answers).toContain(story.correct);
    }
  });

  it('nudi odvojene, nežne bajke sa proverom razumevanja', () => {
    expect(FAIRY_TALES.length).toBeGreaterThanOrEqual(3);
    for (const story of FAIRY_TALES) {
      expect(story.sentences.length).toBeGreaterThanOrEqual(4);
      expect(story.answers).toContain(story.correct);
      expect(story.title.length).toBeGreaterThan(4);
    }
  });

  it('igra uvek sadrži jednu tačnu i dve različite pogrešne nemačke reči', () => {
    const choices = gameChoicesFor(germanLetters[0], germanLetters);
    expect(choices.map(({ word }) => word)).toContain('Affe');
    expect(new Set(choices.map(({ word }) => word)).size).toBe(3);
  });

  it('pokriva dnevnu vežbu i četiri različite igre kao Slovolov, ali na nemačkom', () => {
    expect(DAILY_CHALLENGES).toHaveLength(3);
    expect(GAME_MODES.map(({ id }) => id)).toEqual(['word', 'listen', 'memory', 'build']);
    expect(DAILY_CHALLENGES.every(({ title, action }) => title.length > 0 && action.length > 0)).toBe(true);
  });
});

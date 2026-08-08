import rawLetters from '../data/germanLetters.json';

export type GermanWord = { word: string; emoji: string };
export type GermanLetter = {
  upper: string;
  lower: string;
  name: string;
  words: GermanWord[];
};

export const GERMAN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜẞ';
export const germanLetters = rawLetters as GermanLetter[];

export function isGermanAlphabetComplete(): boolean {
  return germanLetters.map((letter) => letter.upper).join('') === GERMAN_ALPHABET;
}

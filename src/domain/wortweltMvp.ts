import type { GermanLetter, GermanWord } from './germanLetters';

export type CountingLesson = { value: number; word: string; emoji: string; label: string };
export type ReadingStory = { id: string; title: string; emoji: string; sentences: string[]; question: string; answers: string[]; correct: string };

export const COUNTING_LESSONS: CountingLesson[] = [
  ['null', 'leer'], ['eins', 'Apfel'], ['zwei', 'Bälle'], ['drei', 'Sterne'], ['vier', 'Fische'], ['fünf', 'Blumen'], ['sechs', 'Autos'], ['sieben', 'Käfer'], ['acht', 'Wolken'], ['neun', 'Katzen'], ['zehn', 'Luftballons']
].map(([word, label], value) => ({ value, word, label, emoji: ['○', '🍎', '⚽', '⭐', '🐟', '🌷', '🚗', '🐞', '☁️', '🐱', '🎈'][value] }));

export const READING_STORIES: ReadingStory[] = [
  { id: 'mila-mond', title: 'Mila und der Mond', emoji: '🌙', sentences: ['Mila sieht den Mond.', 'Der Mond ist rund und hell.', 'Mila winkt dem Mond zu.'], question: 'Wem winkt Mila zu?', answers: ['dem Mond', 'dem Auto', 'dem Hund'], correct: 'dem Mond' },
  { id: 'fuchs-weg', title: 'Der kleine Fuchs', emoji: '🦊', sentences: ['Ein kleiner Fuchs läuft im Wald.', 'Er findet eine rote Beere.', 'Der Fuchs freut sich sehr.'], question: 'Was findet der Fuchs?', answers: ['eine Beere', 'einen Ball', 'eine Uhr'], correct: 'eine Beere' },
  { id: 'lina-regenbogen', title: 'Lina und der Regenbogen', emoji: '🌈', sentences: ['Nach dem Regen schaut Lina nach oben.', 'Ein Regenbogen leuchtet am Himmel.', 'Lina zählt seine Farben.'], question: 'Was leuchtet am Himmel?', answers: ['ein Regenbogen', 'ein Zug', 'eine Katze'], correct: 'ein Regenbogen' }
];

export function gameChoicesFor(letter: GermanLetter, alphabet: GermanLetter[]): GermanWord[] {
  const index = alphabet.findIndex(({ upper }) => upper === letter.upper);
  const target = letter.words[0];
  const other = alphabet.filter(({ upper }) => upper !== letter.upper).flatMap(({ words }) => words);
  return [other[(index * 5) % other.length], target, other[(index * 11 + 7) % other.length]];
}

import type { GermanLetter, GermanWord } from './germanLetters';

export type CountingLesson = { value: number; word: string; emoji: string; label: string };
export type ReadingStory = { id: string; title: string; emoji: string; sentences: string[]; question: string; answers: string[]; correct: string };
export type GameMode = { id: 'word' | 'listen' | 'memory' | 'build'; title: string; description: string; emoji: string };
export type DailyChallenge = { id: string; title: string; action: string; emoji: string };

const ones = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
const teens = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const tens = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];

/** Nemački zapis celih brojeva u opsegu koji WortWelt vežba (0–100). */
export function germanNumberWord(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 100) throw new RangeError('WortWelt unterstützt Zahlen von 0 bis 100.');
  if (value < 10) return ones[value];
  if (value < 20) return teens[value - 10];
  if (value === 100) return 'hundert';
  const ten = Math.floor(value / 10);
  const unit = value % 10;
  return unit === 0 ? tens[ten] : `${unit === 1 ? 'ein' : ones[unit]}und${tens[ten]}`;
}

const countingObjects = [
  ['○', 'Punkte'], ['🍎', 'Äpfel'], ['⚽', 'Bälle'], ['⭐', 'Sterne'], ['🐟', 'Fische'], ['🌷', 'Blumen'], ['🚗', 'Autos'], ['🐞', 'Käfer'], ['☁️', 'Wolken'], ['🐱', 'Katzen'], ['🎈', 'Luftballons']
] as const;

export const COUNTING_LESSONS: CountingLesson[] = Array.from({ length: 101 }, (_, value) => {
  const item = countingObjects[value % countingObjects.length];
  return { value, word: germanNumberWord(value), emoji: item[0], label: value === 0 ? 'leer' : item[1] };
});

export const GAME_MODES: GameMode[] = [
  { id: 'word', title: 'Wort finden', description: 'Bild und Anfangsbuchstabe verbinden', emoji: '🖼️' },
  { id: 'listen', title: 'Genau hören', description: 'Den gehörten Buchstaben erkennen', emoji: '👂' },
  { id: 'memory', title: 'Memory', description: 'Passende Paare aufdecken', emoji: '🧠' },
  { id: 'build', title: 'Wort bauen', description: 'Buchstaben in die richtige Reihenfolge legen', emoji: '🧩' }
];

export const DAILY_CHALLENGES: DailyChallenge[] = [
  { id: 'letter', title: 'Buchstaben-Stern', action: 'Lerne oder schreibe einen Buchstaben.', emoji: '🔤' },
  { id: 'number', title: 'Zahlen-Forscher', action: 'Zähle eine neue Menge richtig.', emoji: '🔢' },
  { id: 'story', title: 'Geschichten-Detektiv', action: 'Beantworte eine Frage zu einer Geschichte.', emoji: '📚' }
];

export const READING_STORIES: ReadingStory[] = [
  { id: 'mila-mond', title: 'Mila und der Mond', emoji: '🌙', sentences: ['Mila sieht den Mond.', 'Der Mond ist rund und hell.', 'Mila winkt dem Mond zu.'], question: 'Wem winkt Mila zu?', answers: ['dem Mond', 'dem Auto', 'dem Hund'], correct: 'dem Mond' },
  { id: 'fuchs-weg', title: 'Der kleine Fuchs', emoji: '🦊', sentences: ['Ein kleiner Fuchs läuft im Wald.', 'Er findet eine rote Beere.', 'Der Fuchs freut sich sehr.'], question: 'Was findet der Fuchs?', answers: ['eine Beere', 'einen Ball', 'eine Uhr'], correct: 'eine Beere' },
  { id: 'lina-regenbogen', title: 'Lina und der Regenbogen', emoji: '🌈', sentences: ['Nach dem Regen schaut Lina nach oben.', 'Ein Regenbogen leuchtet am Himmel.', 'Lina zählt seine Farben.'], question: 'Was leuchtet am Himmel?', answers: ['ein Regenbogen', 'ein Zug', 'eine Katze'], correct: 'ein Regenbogen' },
  { id: 'otto-ei', title: 'Otto und das Ei', emoji: '🥚', sentences: ['Otto findet ein warmes Ei.', 'Im Ei piepst ein Küken.', 'Otto baut ein weiches Nest.'], question: 'Was piepst im Ei?', answers: ['ein Küken', 'ein Fisch', 'ein Stern'], correct: 'ein Küken' },
  { id: 'mia-maus', title: 'Mia Maus malt', emoji: '🎨', sentences: ['Mia Maus hat einen Pinsel.', 'Sie malt einen blauen See.', 'Neben dem See steht ein Baum.'], question: 'Welche Farbe hat der See?', answers: ['blau', 'rot', 'schwarz'], correct: 'blau' },
  { id: 'ben-brot', title: 'Ben backt Brot', emoji: '🍞', sentences: ['Ben mischt Mehl und Wasser.', 'Der Teig wird groß und rund.', 'Das Brot duftet gut.'], question: 'Was wird groß und rund?', answers: ['der Teig', 'der Mond', 'der Schuh'], correct: 'der Teig' },
  { id: 'tina-turm', title: 'Tina baut einen Turm', emoji: '🧱', sentences: ['Tina hat viele Bauklötze.', 'Sie baut einen hohen Turm.', 'Ein gelber Klotz kommt ganz oben hin.'], question: 'Welche Farbe hat der oberste Klotz?', answers: ['gelb', 'grün', 'lila'], correct: 'gelb' },
  { id: 'paul-park', title: 'Paul im Park', emoji: '🛝', sentences: ['Paul fährt mit dem Roller zum Park.', 'Dort trifft er seine Freundin Lea.', 'Zusammen rutschen sie um die Wette.'], question: 'Wen trifft Paul?', answers: ['Lea', 'Mila', 'Otto'], correct: 'Lea' },
  { id: 'ada-ameise', title: 'Ada Ameise hilft', emoji: '🐜', sentences: ['Ada sieht einen schweren Krümel.', 'Zwei Ameisen helfen ihr tragen.', 'Gemeinsam schaffen sie den Weg nach Hause.'], question: 'Wer hilft Ada?', answers: ['zwei Ameisen', 'drei Katzen', 'ein Fuchs'], correct: 'zwei Ameisen' },
  { id: 'noah-nacht', title: 'Noahs Nachtlicht', emoji: '✨', sentences: ['Noah hat ein kleines Nachtlicht.', 'Es leuchtet wie ein Stern.', 'Jetzt schläft Noah ruhig ein.'], question: 'Wie leuchtet das Nachtlicht?', answers: ['wie ein Stern', 'wie ein Auto', 'wie Regen'], correct: 'wie ein Stern' },
  { id: 'sara-samen', title: 'Sara pflanzt Samen', emoji: '🌱', sentences: ['Sara legt Samen in die Erde.', 'Sie gießt sie mit einer kleinen Kanne.', 'Nach einigen Tagen wachsen grüne Blätter.'], question: 'Was wächst nach einigen Tagen?', answers: ['grüne Blätter', 'blaue Bälle', 'rote Schuhe'], correct: 'grüne Blätter' },
  { id: 'leo-laterne', title: 'Leos Laterne', emoji: '🏮', sentences: ['Leo trägt eine bunte Laterne.', 'Er geht langsam durch die dunkle Straße.', 'Seine Laterne zeigt ihm den Weg.'], question: 'Was zeigt Leo den Weg?', answers: ['seine Laterne', 'sein Ball', 'sein Buch'], correct: 'seine Laterne' }
];

/**
 * Kratke, nežne prerade klasičnih bajki u javnom vlasništvu. Tekst je
 * prilagođen početnicima i ostaje potpuno u aplikaciji, bez mreže ili naloga.
 */
export const FAIRY_TALES: ReadingStory[] = [
  { id: 'rotkaeppchen', title: 'Rotkäppchen', emoji: '🧺', sentences: ['Rotkäppchen bringt ihrer Großmutter einen Korb mit Essen.', 'Im Wald bleibt sie auf dem Weg und pflückt schöne Blumen.', 'Ein freundlicher Förster achtet darauf, dass alle sicher nach Hause kommen.', 'Bei der Großmutter teilen sie den Kuchen und erzählen vom Wald.'], question: 'Wohin bringt Rotkäppchen den Korb?', answers: ['zur Großmutter', 'zur Schule', 'zum Bahnhof'], correct: 'zur Großmutter' },
  { id: 'bremer-musikanten', title: 'Die Bremer Stadtmusikanten', emoji: '🎵', sentences: ['Ein Esel, ein Hund, eine Katze und ein Hahn möchten Musik machen.', 'Sie gehen zusammen nach Bremen und helfen einander.', 'Als sie laut singen, finden sie ein warmes Haus für die Nacht.', 'Die vier Freunde bleiben zusammen und machen jeden Tag Musik.'], question: 'Wohin gehen die vier Freunde?', answers: ['nach Bremen', 'ans Meer', 'in einen Zoo'], correct: 'nach Bremen' },
  { id: 'sterntaler', title: 'Die Sterntaler', emoji: '✨', sentences: ['Ein Kind teilt sein Brot und hilft Menschen, die es braucht.', 'Am Abend schaut es in den dunklen Himmel.', 'Viele helle Sterne fallen wie kleine Taler auf die Wiese.', 'Das Kind freut sich und bleibt freundlich zu allen.'], question: 'Was fällt vom Himmel?', answers: ['helle Sterne', 'rote Äpfel', 'kleine Boote'], correct: 'helle Sterne' }
];

export function gameChoicesFor(letter: GermanLetter, alphabet: GermanLetter[]): GermanWord[] {
  const index = alphabet.findIndex(({ upper }) => upper === letter.upper);
  const target = letter.words[0];
  const other = alphabet.filter(({ upper }) => upper !== letter.upper).flatMap(({ words }) => words);
  return [other[(index * 5) % other.length], target, other[(index * 11 + 7) % other.length]];
}

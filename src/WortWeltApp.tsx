import { useEffect, useMemo, useState } from 'react';
import { TracePad } from './components/TracePad';
import { ColoringPad } from './components/ColoringPad';
import { germanLetters, type GermanLetter, type GermanWord } from './domain/germanLetters';
import {
  COUNTING_LESSONS,
  DAILY_CHALLENGES,
  FAIRY_TALES,
  GAME_MODES,
  READING_STORIES,
  gameChoicesFor,
  type ReadingStory
} from './domain/wortweltMvp';
import { playGermanAudio } from './services/wortweltAudio';

type Screen = 'home' | 'alphabet' | 'lesson' | 'write' | 'games' | 'count' | 'read' | 'fairy' | 'my-stories' | 'parent' | 'progress' | 'daily' | 'coloring' | 'quiz' | 'adventure' | 'creative' | 'family' | 'logic' | 'culture' | 'adaptive';
type SavedCreativeStory = { id: string; title: string; emoji: string; pages: string[] };
type SavedProgress = {
  stars: number;
  learned: string[];
  gamesWon: number;
  counted: number[];
  storiesRead: string[];
  profiles: string[];
  activeProfile: number;
  soundEnabled: boolean;
  dailyWins: string[];
  colorings: string[];
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  createdStories: SavedCreativeStory[];
};

const progressKey = 'wortwelt-progress-v2';
const colors = ['#2563eb', '#f59e0b', '#16a34a', '#7c3aed', '#ec4899', '#ea580c'];

function readProgress(): SavedProgress {
  try {
    const value = JSON.parse(localStorage.getItem(progressKey) ?? '{}') as Partial<SavedProgress>;
    return {
      stars: value.stars ?? 0,
      learned: value.learned ?? [],
      gamesWon: value.gamesWon ?? 0,
      counted: value.counted ?? [],
      storiesRead: value.storiesRead ?? [],
      profiles: value.profiles?.length ? value.profiles : ['Kind'],
      activeProfile: value.activeProfile ?? 0,
      soundEnabled: value.soundEnabled ?? true,
      dailyWins: value.dailyWins ?? [],
      colorings: value.colorings ?? [],
      largeText: value.largeText ?? false,
      highContrast: value.highContrast ?? false,
      reducedMotion: value.reducedMotion ?? false,
      createdStories: value.createdStories ?? []
    };
  } catch {
    return { stars: 0, learned: [], gamesWon: 0, counted: [], storiesRead: [], profiles: ['Kind'], activeProfile: 0, soundEnabled: true, dailyWins: [], colorings: [], largeText: false, highContrast: false, reducedMotion: false, createdStories: [] };
  }
}

function Header({ title, stars, onBack }: { title: string; stars: number; onBack?: () => void }) {
  return <header className="screen-header wortwelt-header">
    {onBack ? <button className="back" onClick={onBack} aria-label="Zurück">←</button> : <div className="wortwelt-mascot" aria-hidden="true">🦊</div>}
    <div><small>WORTWELT</small><h1>{title}</h1></div>
    <span className="star-pill">⭐ {stars}</span>
  </header>;
}

function WordIllustration({ word }: { word: GermanWord }) {
  return <span aria-hidden="true">{word.emoji}</span>;
}

function awardOnce(list: string[], key: string): string[] {
  return list.includes(key) ? list : [...list, key];
}

function ParentGate({ onOpen, onBack }: { onOpen: () => void; onBack: () => void }) {
  const [answer, setAnswer] = useState('');
  const valid = answer.trim() === '7';
  return <div className="wortwelt-app single-screen">
    <Header title="Für Eltern" stars={0} onBack={onBack} />
    <main className="wortwelt-panel parent-gate">
      <span aria-hidden="true">🔒</span>
      <h2>Nur für Erwachsene</h2>
      <p>Bitte löse die Aufgabe, damit Kinder diesen Bereich nicht versehentlich öffnen.</p>
      <label htmlFor="parent-answer">4 + 3 =</label>
      <input id="parent-answer" inputMode="numeric" value={answer} onChange={(event) => setAnswer(event.target.value)} />
      <button className="primary" disabled={!valid} onClick={onOpen}>Elternbereich öffnen</button>
    </main>
  </div>;
}

function ParentScreen({ progress, update, onBack }: { progress: SavedProgress; update: (next: (current: SavedProgress) => SavedProgress) => void; onBack: () => void }) {
  const activeName = progress.profiles[progress.activeProfile] ?? progress.profiles[0];
  return <div className="wortwelt-app">
    <Header title="Für Eltern" stars={progress.stars} onBack={onBack} />
    <main className="parent-settings">
      <section className="wortwelt-panel"><h2>Datenschutz zuerst</h2><p>Keine Werbung, kein Konto, kein Mikrofon und kein Tracking. Der Lernfortschritt bleibt auf diesem Gerät.</p></section>
      <section className="wortwelt-panel"><h2>Kindprofil</h2><p>Aktiv: <strong>{activeName}</strong></p><div className="profile-chips">{progress.profiles.map((profile, index) => <button key={profile} className={index === progress.activeProfile ? 'active' : ''} onClick={() => update((current) => ({ ...current, activeProfile: index }))}>{profile}</button>)}</div><button className="secondary" onClick={() => update((current) => current.profiles.length >= 3 ? current : ({ ...current, profiles: [...current.profiles, `Kind ${current.profiles.length + 1}`] }))}>+ Profil hinzufügen</button></section>
      <section className="wortwelt-panel"><h2>Ton</h2><label className="setting-toggle"><span>Lokale deutsche Aufnahmen</span><input type="checkbox" checked={progress.soundEnabled} onChange={() => update((current) => ({ ...current, soundEnabled: !current.soundEnabled }))} /></label><small>WortWelt verwendet ausschließlich mitgelieferte Audio-Dateien und keinen System-TTS.</small></section>
      <section className="wortwelt-panel"><h2>Barrierearme Ansicht</h2><label className="setting-toggle"><span>Größere Schrift</span><input type="checkbox" checked={progress.largeText} onChange={() => update((current) => ({ ...current, largeText: !current.largeText }))} /></label><label className="setting-toggle"><span>Hoher Kontrast</span><input type="checkbox" checked={progress.highContrast} onChange={() => update((current) => ({ ...current, highContrast: !current.highContrast }))} /></label><label className="setting-toggle"><span>Weniger Bewegung</span><input type="checkbox" checked={progress.reducedMotion} onChange={() => update((current) => ({ ...current, reducedMotion: !current.reducedMotion }))} /></label></section>
      <section className="wortwelt-panel"><h2>Fortschritt von {activeName}</h2><p>{progress.learned.length} Buchstaben, {progress.counted.length} Zahlen, {progress.storiesRead.length} Geschichten, {progress.createdStories.length} eigene Bücher und {progress.colorings.length} Bilder abgeschlossen.</p><button className="secondary" onClick={() => update((current) => ({ ...current, stars: 0, learned: [], gamesWon: 0, counted: [], storiesRead: [], dailyWins: [], colorings: [], createdStories: [] }))}>Lernfortschritt zurücksetzen</button></section>
    </main>
  </div>;
}

function PublicInfoPage({ page }: { page: 'privacy' | 'support' }) {
  const privacy = page === 'privacy';
  return <div className="wortwelt-app public-info-page">
    <header className="screen-header wortwelt-header">
      <div className="wortwelt-mascot" aria-hidden="true">🦊</div>
      <div><small>WORTWELT</small><h1>{privacy ? 'Datenschutz' : 'Hilfe & Support'}</h1></div>
      <span className="star-pill" aria-hidden="true">⭐</span>
    </header>
    <main className="wortwelt-panel public-info-content">
      {privacy ? <>
        <h2>Datenschutz auf einen Blick</h2>
        <p>WortWelt ist eine Lern-App für Kinder. Die App erstellt kein Konto, zeigt keine Werbung und verwendet kein Tracking.</p>
        <h2>Lokale Daten</h2>
        <p>Lernfortschritt, Kindprofile und gespeicherte Bilder bleiben ausschließlich auf dem verwendeten Gerät. WortWelt überträgt diese Daten nicht an einen Server.</p>
        <h2>Mikrofon</h2>
        <p>WortWelt verwendet kein Mikrofon und fordert keine Mikrofonberechtigung an.</p>
        <h2>Kontakt</h2>
        <p>Für Hilfe mit der App öffne bitte den Elternbereich in WortWelt. Dort findest du alle Einstellungen für Ton, Sprache und lokale Daten.</p>
      </> : <>
        <h2>Hilfe mit WortWelt</h2>
        <p>WortWelt funktioniert ohne Konto und speichert den Lernfortschritt direkt auf dem Gerät.</p>
        <p>Für Einstellungen zu Ton, Kontrast und lokalem Fortschritt öffne in der App den Bereich „Für Eltern”.</p>
        <p>Datenschutzinformationen findest du auf der <a href="/privacy">Datenschutzseite</a>.</p>
      </>}
      <a className="primary public-info-link" href="/">Zur WortWelt-App</a>
    </main>
  </div>;
}

export function WortWeltApp() {
  const publicPath = window.location.pathname.replace(/\/+$/, '') || '/';
  if (publicPath === '/privacy') return <PublicInfoPage page="privacy" />;
  if (publicPath === '/support') return <PublicInfoPage page="support" />;
  const [screen, setScreen] = useState<Screen>('home');
  const [selected, setSelected] = useState<GermanLetter>(germanLetters[0]);
  const [progress, setProgress] = useState<SavedProgress>(readProgress);
  const [message, setMessage] = useState('Wähle ein Bild für das Wort Affe.');
  const [celebrate, setCelebrate] = useState(false);
  const [rewardText, setRewardText] = useState('⭐ Bravo!');
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [countIndex, setCountIndex] = useState(0);
  const [story, setStory] = useState<ReadingStory>(READING_STORIES[0]);
  const [fairyTale, setFairyTale] = useState<ReadingStory>(FAIRY_TALES[0]);
  const [gameMode, setGameMode] = useState<'word' | 'listen' | 'memory' | 'build'>('word');
  const [memoryOpen, setMemoryOpen] = useState<number[]>([]);
  const [memoryMatched, setMemoryMatched] = useState<number[]>([]);
  const [builtWord, setBuiltWord] = useState('');
  const [creative, setCreative] = useState({ hero: 'Fuchs', place: 'Wald', treasure: 'Stern' });
  const [openedStoryId, setOpenedStoryId] = useState<string | null>(null);
  const [writingNeedsContinue, setWritingNeedsContinue] = useState(false);
  const [lessonStage, setLessonStage] = useState<'words' | 'challenge'>('words');

  useEffect(() => { localStorage.setItem(progressKey, JSON.stringify(progress)); }, [progress]);
  const update = (next: (current: SavedProgress) => SavedProgress) => setProgress(next);
  const audio = (asset: string) => { void playGermanAudio(asset, progress.soundEnabled); };
  const learnedCount = progress.learned.length;
  const completion = Math.round(((learnedCount + progress.counted.length + progress.storiesRead.length) / (germanLetters.length + COUNTING_LESSONS.length + READING_STORIES.length)) * 100);

  const openLesson = (letter: GermanLetter) => {
    setSelected(letter);
    setLessonStage('words');
    setMessage('Schau dir die Wörter an und tippe dann auf das passende Bild.');
    setScreen('lesson');
    audio(`letters/${letter.upper}`);
  };
  const openAlphabet = () => {
    const next = germanLetters.find((letter) => !progress.learned.includes(letter.upper)) ?? germanLetters[0];
    setSelected(next);
    setMessage(`Dein nächster Buchstabe ist ${next.upper}.`);
    setScreen('alphabet');
  };
  const openWriting = (letter = selected) => {
    setSelected(letter);
    setWritingNeedsContinue(false);
    setMessage(`Schreibe ${letter.upper} nach und höre auf deine Hand.`);
    setScreen('write');
  };
  const award = (kind: 'letter' | 'game' | 'count' | 'story', key: string, nextScreen?: Screen, reward = '⭐ Bravo! Du hast einen Stern!', audioAsset = 'feedback/bravo') => {
    update((current) => {
      if (kind === 'letter') return { ...current, learned: awardOnce(current.learned, key), stars: current.learned.includes(key) ? current.stars : current.stars + 1 };
      if (kind === 'count') return { ...current, counted: awardOnce(current.counted.map(String), key).map(Number), stars: current.counted.includes(Number(key)) ? current.stars : current.stars + 1 };
      if (kind === 'story') return { ...current, storiesRead: awardOnce(current.storiesRead, key), stars: current.storiesRead.includes(key) ? current.stars : current.stars + 1 };
      return { ...current, gamesWon: current.gamesWon + 1, stars: current.stars + 1 };
    });
    setRewardText(reward); setCelebrate(true); audio(audioAsset);
    window.setTimeout(() => { setCelebrate(false); if (nextScreen) setScreen(nextScreen); }, 900);
  };
  const choices = useMemo(() => gameChoicesFor(selected, germanLetters), [selected]);
  const nextLetter = (letter: GermanLetter) => germanLetters[(germanLetters.indexOf(letter) + 1) % germanLetters.length];
  const completeLetter = (letter: GermanLetter, source: 'lesson' | 'writing' | 'coloring') => {
    const next = nextLetter(letter);
    setSelected(next);
    setLessonStage('words');
    setWritingNeedsContinue(false);
    setMessage(`Bravo! ${letter.upper} ist geschafft. Als Nächstes: ${next.upper}.`);
    award('letter', letter.upper, undefined, `⭐ Bravo! Als Nächstes: ${next.upper}`, source === 'lesson' ? 'feedback/bravo-next-letter' : 'feedback/bravo');
    if (source === 'lesson') window.setTimeout(() => setMessage('Schau dir die drei Wörter an. Danach kommt die Bildaufgabe.'), 900);
  };
  const appearance = [progress.largeText && 'large-ui-text', progress.highContrast && 'high-contrast', progress.reducedMotion && 'reduced-motion'].filter(Boolean).join(' ');
  const memoryLetters = [selected.upper, germanLetters[(germanLetters.indexOf(selected) + 1) % germanLetters.length].upper, germanLetters[(germanLetters.indexOf(selected) + 2) % germanLetters.length].upper];
  const memoryCards = [...memoryLetters, ...memoryLetters];
  const openMemoryCard = (index: number) => {
    if (memoryOpen.includes(index) || memoryMatched.includes(index) || memoryOpen.length === 2) return;
    const open = [...memoryOpen, index];
    setMemoryOpen(open);
    if (open.length === 2) {
      if (memoryCards[open[0]] === memoryCards[open[1]]) {
        window.setTimeout(() => { setMemoryMatched((current) => [...current, ...open]); setMemoryOpen([]); if (memoryMatched.length + 2 === memoryCards.length) award('game', 'memory'); }, 250);
      } else window.setTimeout(() => setMemoryOpen([]), 650);
    }
  };

  if (screen === 'alphabet') {
    const nextIndex = germanLetters.findIndex((letter) => !progress.learned.includes(letter.upper));
    const activeIndex = nextIndex === -1 ? 0 : nextIndex;
    const activeLetter = germanLetters[activeIndex];
    return <div className={`wortwelt-app ${appearance}`}><Header title="Das Alphabet" stars={progress.stars} onBack={() => setScreen('home')} /><main className="alphabet-path"><section className="next-letter-card"><span aria-hidden="true">🚀</span><div><small>DEIN LERNWEG</small><h2>Dein nächster Buchstabe: {activeLetter.upper}</h2><p>Du lernst Buchstabe für Buchstabe. So bleibt alles übersichtlich.</p></div><button className="primary" onClick={() => openLesson(activeLetter)}>Jetzt {activeLetter.upper} lernen</button></section><p className="alphabet-hint">Fertige Buchstaben kannst du jederzeit wiederholen. Neue Buchstaben werden nacheinander freigeschaltet.</p><div className="letter-grid" aria-label="Deutsches Alphabet">{germanLetters.map((letter, index) => { const locked = index > activeIndex; const learned = progress.learned.includes(letter.upper); return <button key={letter.upper} disabled={locked} className={`letter-button ${locked ? 'locked' : ''} ${letter.upper === activeLetter.upper ? 'next' : ''}`} style={{ '--letter-color': colors[index % colors.length] } as React.CSSProperties} onClick={() => openLesson(letter)} aria-label={locked ? `${letter.upper} ${letter.lower} – noch gesperrt` : `${letter.upper} ${letter.lower}`}><strong>{letter.upper}</strong><small>{letter.lower}</small>{learned && <span>★</span>}{locked && <em>🔒</em>}</button>; })}</div></main></div>;
  }

  if (screen === 'lesson') return <div className="wortwelt-app single-screen"><Header title={`Buchstabe ${selected.upper} ${selected.lower}`} stars={progress.stars} onBack={() => setScreen('alphabet')} /><main className="lesson" aria-live="polite"><button className="audio-button" onClick={() => audio(`letters/${selected.upper}`)}>🔊 Hör den Buchstaben</button><div className="giant-letter" aria-label={`${selected.upper} und ${selected.lower}`}>{selected.upper} <small>{selected.lower}</small></div>{lessonStage === 'words' ? <><section className="word-row" aria-label={`Wörter mit ${selected.upper}`}>{selected.words.map((word) => <button className="word-card" key={word.word} onClick={() => { audio(`words/${word.word}`); setMessage(`${word.word} beginnt mit ${selected.upper}.`); }}><WordIllustration word={word} /><strong>{word.word}</strong></button>)}</section><p className="lesson-stage-copy">Höre dir die drei Wörter an. Danach zeigst du auf das passende Bild.</p><button className="primary lesson-stage-button" onClick={() => { setLessonStage('challenge'); setMessage('Tippe auf das Bild, das zu deinem Wort passt.'); }}>Weiter zur Bildaufgabe →</button></> : <><section className="picture-challenge"><h2>Jetzt bist du dran!</h2><p>Finde das Bild: <strong>{selected.words[0].word}</strong></p><div className="picture-options">{choices.map((word) => <button key={word.word} aria-label={`Bild auswählen: ${word.word}`} onClick={() => { if (word.word === selected.words[0].word) completeLetter(selected, 'lesson'); else { setMessage('Fast! Schau noch einmal genau hin.'); audio('feedback/try-again'); } }}><WordIllustration word={word} /></button>)}</div></section><button className="secondary lesson-back-button" onClick={() => setLessonStage('words')}>← Wörter noch einmal ansehen</button></>}<p className="wortwelt-status">{message}</p><button className="primary" onClick={() => openWriting()}>✍️ Buchstaben schreiben</button></main>{celebrate && <div className="celebrate" role="status">{rewardText}</div>}</div>;

  if (screen === 'write') return <div className="wortwelt-app single-screen"><Header title={`Schreibe ${selected.upper}`} stars={progress.stars} onBack={() => setScreen('home')} /><main className="practice"><div className="practice-letters" aria-label="Buchstaben zum Schreiben">{germanLetters.map((letter) => <button key={letter.upper} className={letter.upper === selected.upper ? 'active' : ''} onClick={() => openWriting(letter)}>{letter.upper}</button>)}</div><p className="instruction" role="status">{message}</p><TracePad key={selected.upper} letter={selected.upper} canvasLabel={`Schreibfläche für den Buchstaben ${selected.upper}`} clearLabel="Löschen" onAttempt={(success) => { if (!success) { setWritingNeedsContinue(true); setMessage('Gut probiert! Wenn du fertig bist, geht es weiter.'); } }} onComplete={() => completeLetter(selected, 'writing')} />{writingNeedsContinue && <button className="primary writing-next" onClick={() => completeLetter(selected, 'writing')}>✓ Fertig! Weiter mit {nextLetter(selected).upper}</button>}</main>{celebrate && <div className="celebrate" role="status">{rewardText}</div>}</div>;

  if (screen === 'games') {
    const mode = GAME_MODES.find(({ id }) => id === gameMode)!;
    const targetWord = selected.words[0].word;
    const wordTiles = [...targetWord.toLocaleUpperCase('de-DE')].sort((a, b) => (a > b ? 1 : -1));
    const selectTile = (tile: string) => {
      const next = builtWord + tile;
      setBuiltWord(next);
      if (next === targetWord.toLocaleUpperCase('de-DE')) { award('game', `build-${targetWord}`); setBuiltWord(''); }
      else if (!targetWord.toLocaleUpperCase('de-DE').startsWith(next)) { setBuiltWord(''); setMessage('Fast! Baue das Wort noch einmal.'); audio('feedback/try-again'); }
    };
    return <div className={`wortwelt-app single-screen ${appearance}`}><Header title="Spiele" stars={progress.stars} onBack={() => setScreen('home')} /><main className="game"><div className="game-tabs">{GAME_MODES.map((item) => <button key={item.id} className={item.id === gameMode ? 'active' : ''} onClick={() => { setGameMode(item.id); setBuiltWord(''); setMemoryOpen([]); setMemoryMatched([]); }}>{item.emoji} {item.title}</button>)}</div><div className="game-letter">{gameMode === 'memory' ? '🧠' : selected.upper}</div><h2>{mode.title}</h2><p>{mode.description}</p>{gameMode === 'memory' ? <div className="memory-grid" aria-label="Memory-Spiel">{memoryCards.map((letter, index) => <button key={`${letter}-${index}`} className={memoryMatched.includes(index) ? 'matched' : ''} aria-label={`Memory-Karte ${index + 1}`} onClick={() => openMemoryCard(index)}>{memoryOpen.includes(index) || memoryMatched.includes(index) ? letter : '?'}</button>)}</div> : gameMode === 'build' ? <><strong className="literacy-input" aria-label="gebautes Wort">{builtWord || '…'}</strong><button className="audio-button" onClick={() => audio(`words/${targetWord}`)}>🔊 Wort hören</button><div className="literacy-tiles">{wordTiles.map((tile, index) => <button key={`${tile}-${index}`} onClick={() => selectTile(tile)}>{tile}</button>)}</div></> : <><button className="audio-button" onClick={() => audio(gameMode === 'listen' ? `letters/${selected.upper}` : `words/${targetWord}`)}>🔊 Noch einmal hören</button><div className="answer-grid">{gameMode === 'listen' ? choices.map((word) => <button key={word.word} onClick={() => { if (word.word === targetWord) { award('game', `listen-${word.word}`); } else { setMessage('Versuche es noch einmal.'); audio('feedback/try-again'); } }}><strong>{word.word[0].toLocaleUpperCase('de-DE')}</strong><small>{word.word}</small></button>) : choices.map((word) => <button key={word.word} aria-label={`Spielantwort ${word.word}`} onClick={() => { if (word.word === targetWord) { award('game', word.word); setSelected(germanLetters[(germanLetters.indexOf(selected) + 1) % germanLetters.length]); } else { setMessage('Versuche es noch einmal.'); audio('feedback/try-again'); } }}><WordIllustration word={word} /><strong>{word.word}</strong></button>)}</div></>}<p role="status">{message}</p></main>{celebrate && <div className="celebrate">⭐ Spiel gewonnen!</div>}</div>;
  }

  if (screen === 'count') {
    const lesson = COUNTING_LESSONS[countIndex];
    const answers = lesson.value === 0 ? [0, 1, 2] : lesson.value === 10 ? [8, 9, 10] : [lesson.value - 1, lesson.value, lesson.value + 1];
    return <div className={`wortwelt-app single-screen ${appearance}`}><Header title="Zählen bis 100" stars={progress.stars} onBack={() => setScreen('home')} /><main className="numbers-screen"><div className="number-strip">{COUNTING_LESSONS.map((entry, index) => <button key={entry.value} className={index === countIndex ? 'active' : ''} onClick={() => setCountIndex(index)}>{entry.value}{progress.counted.includes(entry.value) && <small>★</small>}</button>)}</div><section className="number-card"><button className="big-number" onClick={() => audio(`numbers/${lesson.value}`)}><strong>{lesson.value}</strong><small>🔊 {lesson.word}</small></button><div className={`counting-row ${lesson.value > 7 ? 'counting-medium' : 'counting-low'}`}>{lesson.value === 0 ? <span className="empty-set">leer</span> : <>{Array.from({ length: Math.min(lesson.value, 10) }, (_, index) => <span key={index}>{lesson.emoji}</span>)}{lesson.value > 10 && <strong>+ {lesson.value - 10}</strong>}</>}</div><h2>Wie viele {lesson.label} siehst du?</h2><div className="number-options">{answers.map((answer) => <button key={answer} onClick={() => { if (answer === lesson.value) { const nextValue = Math.min(lesson.value + 1, COUNTING_LESSONS.length - 1); setMessage(`Bravo! Richtig gezählt. Als Nächstes: ${nextValue}.`); award('count', String(answer), undefined, `⭐ Bravo! Als Nächstes: ${nextValue}`); setCountIndex(nextValue); } else { setMessage('Zähle noch einmal langsam.'); audio('feedback/try-again'); } }}>{answer}</button>)}</div><p role="status">{message}</p></section></main>{celebrate && <div className="celebrate">{rewardText}</div>}</div>;
  }

  if (screen === 'read') {
    const storyIndex = READING_STORIES.findIndex((entry) => entry.id === story.id);
    const selectStory = (offset: number) => setStory(READING_STORIES[(storyIndex + offset + READING_STORIES.length) % READING_STORIES.length]);
    return <div className={`wortwelt-app ${appearance}`}><Header title="Lesen & Geschichten" stars={progress.stars} onBack={() => setScreen('home')} /><main className="story-library"><section className="story-library-intro"><span>📚</span><div><small>DEINE LESEZEIT</small><h2>Kurze Geschichten</h2><p>Wähle eine Geschichte. Lies sie Satz für Satz und beantworte die Frage.</p></div><button className="secondary" onClick={() => setScreen('fairy')}>🌙 Zu den Märchen</button></section><div className="story-picker" aria-label="Geschichten auswählen">{READING_STORIES.map((entry, index) => <button key={entry.id} className={entry.id === story.id ? 'active' : ''} onClick={() => setStory(entry)}><span>{entry.emoji}</span><strong>{entry.title}</strong><small>Geschichte {index + 1}</small></button>)}</div><section className="story-reader"><div className="story-reader-title"><span>{story.emoji}</span><div><small>GESCHICHTE {storyIndex + 1} VON {READING_STORIES.length}</small><h2>{story.title}</h2></div><div><button aria-label="Vorherige Geschichte" onClick={() => selectStory(-1)}>←</button><button aria-label="Nächste Geschichte" onClick={() => selectStory(1)}>→</button></div></div>{story.sentences.map((sentence, index) => <p className="sentence" key={sentence}><button className="sentence-audio" aria-label={`Satz ${index + 1} hören`} onClick={() => audio(`stories/${story.id}-${index + 1}`)}>🔊</button>{sentence}</p>)}<p className="reading-question">{story.question}</p><div className="story-answers">{story.answers.map((answer) => <button key={answer} onClick={() => { if (answer === story.correct) { award('story', story.id); setMessage('Prima, du hast die Geschichte verstanden!'); } else { setMessage('Lies die Geschichte noch einmal.'); audio('feedback/try-again'); } }}>{answer}</button>)}</div><p className="wortwelt-status" role="status">{message}</p></section></main>{celebrate && <div className="celebrate">⭐ Geschichte verstanden!</div>}</div>;
  }

  if (screen === 'fairy') return <div className={`wortwelt-app ${appearance}`}><Header title="Märchenwald" stars={progress.stars} onBack={() => setScreen('home')} /><main className="story-library fairy-library"><section className="story-library-intro"><span>🌙</span><div><small>MÄRCHENZEIT</small><h2>Märchen zum Lesen und Vorlesen</h2><p>Sanfte, kurze Fassungen klassischer Märchen für deine WortWelt.</p></div><button className="secondary" onClick={() => setScreen('read')}>📚 Geschichten</button></section><div className="fairy-picker" aria-label="Märchen auswählen">{FAIRY_TALES.map((entry) => <button key={entry.id} className={entry.id === fairyTale.id ? 'active' : ''} onClick={() => setFairyTale(entry)}><span>{entry.emoji}</span><strong>{entry.title}</strong><small>Öffnen und lesen</small></button>)}</div><section className="story-reader fairy-reader"><div className="story-reader-title"><span>{fairyTale.emoji}</span><div><small>KLASSISCHES MÄRCHEN</small><h2>{fairyTale.title}</h2></div></div>{fairyTale.sentences.map((sentence) => <p className="sentence" key={sentence}>{sentence}</p>)}<p className="reading-question">{fairyTale.question}</p><div className="story-answers">{fairyTale.answers.map((answer) => <button key={answer} onClick={() => { if (answer === fairyTale.correct) { award('story', fairyTale.id); setMessage('Wunderbar, du hast das Märchen verstanden!'); } else setMessage('Schau noch einmal in das Märchen.'); }}>{answer}</button>)}</div><p className="wortwelt-status" role="status">{message}</p></section></main>{celebrate && <div className="celebrate">⭐ Märchen verstanden!</div>}</div>;

  if (screen === 'daily') return <div className={`wortwelt-app single-screen ${appearance}`}><Header title="Tägliche Herausforderung" stars={progress.stars} onBack={() => setScreen('home')} /><main className="daily-challenge"><section className="daily-hero"><span>☀️</span><div><h2>Dein kleiner Lernweg</h2><p>Drei abwechslungsreiche Aufgaben für heute.</p></div></section>{DAILY_CHALLENGES.map((challenge, index) => <button key={challenge.id} className={`daily-step ${progress.dailyWins.includes(challenge.id) ? 'done' : ''}`} onClick={() => { update((current) => current.dailyWins.includes(challenge.id) ? current : ({ ...current, dailyWins: [...current.dailyWins, challenge.id], stars: current.stars + 1 })); if (index === 0) openAlphabet(); else setScreen(index === 1 ? 'count' : 'read'); }}><strong>{challenge.emoji}</strong><span><b>{challenge.title}</b><small>{challenge.action}</small></span><em>{progress.dailyWins.includes(challenge.id) ? '✓' : '›'}</em></button>)}</main></div>;

  if (screen === 'coloring') return <div className={`wortwelt-app single-screen ${appearance}`}><Header title="Meine Malwelt" stars={progress.stars} onBack={() => setScreen('home')} /><main className="coloring"><p className="instruction">Male den Buchstaben und das Bild in deinen Lieblingsfarben.</p><ColoringPad letter={selected.upper} illustration={selected.words[0].emoji} storageKey={`wortwelt-${selected.upper}`} canvasLabel={`Malfläche für ${selected.upper}`} onSaved={(letter) => { const completed = germanLetters.find(({ upper }) => upper === letter) ?? selected; const next = nextLetter(completed); update((current) => ({ ...current, colorings: awardOnce(current.colorings, letter), stars: current.colorings.includes(letter) ? current.stars : current.stars + 1 })); setSelected(next); setMessage(`Bravo! Dein Bild ist gespeichert. Als Nächstes: ${next.upper}.`); }} /><p className="coloring-feedback" role="status">{message}</p></main></div>;

  if (screen === 'quiz') return <div className={`wortwelt-app single-screen ${appearance}`}><Header title="Wort-Quiz" stars={progress.stars} onBack={() => setScreen('home')} /><main className="quiz"><div className="quiz-emoji">{selected.words[0].emoji}</div><h2>Was siehst du?</h2><button className="audio-button" onClick={() => audio(`words/${selected.words[0].word}`)}>🔊 Wort hören</button><div className="quiz-choices">{choices.map((word) => <button key={word.word} aria-label={word.word} onClick={() => { if (word.word === selected.words[0].word) { award('game', `quiz-${word.word}`); setSelected(germanLetters[(germanLetters.indexOf(selected) + 1) % germanLetters.length]); } else { setMessage('Schau noch einmal genau hin.'); audio('feedback/try-again'); } }}>{word.word[0].toLocaleUpperCase('de-DE')}</button>)}</div><p role="status">{message}</p></main></div>;

  if (screen === 'adventure') return <div className={`wortwelt-app ${appearance}`}><Header title="WortWelt-Abenteuer" stars={progress.stars} onBack={() => setScreen('home')} /><main className="adventure-map"><section className="adventure-summary"><div><small>DEINE ENTDECKERREISE</small><h2>Acht Lerninseln</h2><p>Wähle einen Ort und sammle Sterne.</p></div><span>🗺️</span></section><div className="menu-grid">{[{ screen: 'games' as Screen, icon: '🧠', title: 'Spieleinsel', text: 'Hören, merken, bauen' }, { screen: 'count' as Screen, icon: '🔢', title: 'Zahlenberg', text: 'Bis 100 zählen' }, { screen: 'read' as Screen, icon: '📖', title: 'Lesewald', text: 'Sätze und Geschichten' }, { screen: 'fairy' as Screen, icon: '🌙', title: 'Märchenwald', text: 'Klassische Märchen lesen' }, { screen: 'creative' as Screen, icon: '✨', title: 'Ideenwerkstatt', text: 'Eine eigene Geschichte' }, { screen: 'family' as Screen, icon: '👨‍👩‍👧', title: 'Familien-Missionen', text: 'Gemeinsam ohne Bildschirm' }, { screen: 'logic' as Screen, icon: '🧩', title: 'Denk-Labor', text: 'Muster und Rechnen' }, { screen: 'culture' as Screen, icon: '🏰', title: 'Entdeckerland', text: 'Deutsch im Alltag' }].map((world) => <button className="menu-card menu-adventure" key={world.title} onClick={() => setScreen(world.screen)}><span className="menu-icon">{world.icon}</span><span><strong>{world.title}</strong><small>{world.text}</small></span><b>›</b></button>)}</div></main></div>;

  if (screen === 'my-stories') {
    const openedStory = progress.createdStories.find((story) => story.id === openedStoryId) ?? null;
    return <div className={`wortwelt-app ${appearance}`}><Header title="Meine Geschichten" stars={progress.stars} onBack={() => setScreen('home')} /><main className="story-library my-story-library"><section className="story-library-intro"><span>📖</span><div><small>DEINE BÜCHER</small><h2>Deine eigenen Bücher wohnen hier</h2><p>Erfinde eine Geschichte, speichere sie und lies sie später wieder.</p></div><button className="primary" onClick={() => setScreen('creative')}>✨ Neue Geschichte erfinden</button></section>{openedStory ? <section className="story-reader saved-story-reader"><div className="story-reader-title"><span>{openedStory.emoji}</span><div><small>DEINE GESCHICHTE</small><h2>{openedStory.title}</h2></div></div>{openedStory.pages.map((page, index) => <p className="sentence" key={page}><strong>{['Am Anfang', 'Dann passiert etwas', 'Ein gutes Ende'][index]}</strong><br />{page}</p>)}<button className="secondary" onClick={() => setOpenedStoryId(null)}>← Zur Bücherregal</button></section> : progress.createdStories.length ? <section className="saved-story-shelf" aria-label="Gespeicherte Geschichten">{progress.createdStories.slice().reverse().map((saved) => <button key={saved.id} onClick={() => setOpenedStoryId(saved.id)}><span>{saved.emoji}</span><strong>{saved.title}</strong><small>Öffnen und lesen</small></button>)}</section> : <section className="empty-story-shelf"><span>🌟</span><h2>Hier ist noch Platz für dein erstes Buch.</h2><p>Wähle Held, Ort und Fundstück. Deine Geschichte bleibt auf diesem Gerät.</p><button className="secondary" onClick={() => setScreen('creative')}>Meine erste Geschichte</button></section>}</main></div>;
  }

  if (screen === 'creative') { const title = `${creative.hero} und der ${creative.treasure}`; const pages = [`Heute geht ${creative.hero} in den ${creative.place}.`, `Dort findet ${creative.hero} einen leuchtenden ${creative.treasure}.`, `${creative.hero} nimmt den ${creative.treasure} mit nach Hause und freut sich.`]; return <div className={`wortwelt-app creative-screen ${appearance}`}><Header title="Meine Geschichte" stars={progress.stars} onBack={() => setScreen('my-stories')} /><main className="creative-studio"><section className="creative-preview"><div className="creative-cover"><span>📝</span><div><small>DEINE GESCHICHTE</small><h2>{title}</h2><p>Eine Geschichte aus deiner WortWelt.</p></div></div><div className="creative-story-pages"><article><strong>Am Anfang</strong><p>{pages[0]}</p></article><article><strong>Dann passiert etwas</strong><p>{pages[1]}</p></article><article><strong>Ein gutes Ende</strong><p>{pages[2]}</p></article></div><button className="primary" onClick={() => { const created: SavedCreativeStory = { id: `${Date.now()}-${title}`, title, emoji: creative.hero === 'Fuchs' ? '🦊' : creative.hero === 'Maus' ? '🐭' : creative.hero === 'Drache' ? '🐲' : '🧒', pages }; update((current) => ({ ...current, createdStories: [...current.createdStories, created] })); award('game', `creative-${title}`); setOpenedStoryId(created.id); setMessage('Deine Geschichte ist sicher auf diesem Gerät gespeichert.'); }}>⭐ Geschichte speichern</button></section><section className="creative-options"><fieldset><legend>Held oder Heldin</legend><div>{['Fuchs', 'Maus', 'Kind', 'Drache'].map((hero) => <button key={hero} className={creative.hero === hero ? 'active' : ''} onClick={() => setCreative((current) => ({ ...current, hero }))}>{hero}</button>)}</div></fieldset><fieldset><legend>Ort</legend><div>{['Wald', 'Park', 'Meer', 'Mond'].map((place) => <button key={place} className={creative.place === place ? 'active' : ''} onClick={() => setCreative((current) => ({ ...current, place }))}>{place}</button>)}</div></fieldset><fieldset><legend>Fundstück</legend><div>{['Stern', 'Schatz', 'Ball', 'Buch'].map((treasure) => <button key={treasure} className={creative.treasure === treasure ? 'active' : ''} onClick={() => setCreative((current) => ({ ...current, treasure }))}>{treasure}</button>)}</div></fieldset></section></main></div>; }


  if (screen === 'family') return <div className={`wortwelt-app single-screen ${appearance}`}><Header title="Familien-Missionen" stars={progress.stars} onBack={() => setScreen('adventure')} /><main className="daily-challenge"><section className="daily-hero"><span>👨‍👩‍👧</span><div><h2>Gemeinsam entdecken</h2><p>Diese Aufgaben funktionieren ohne Internet und ohne Punkte-Druck.</p></div></section>{[{ icon: '🔎', title: 'Buchstaben-Suche', text: 'Finde drei Dinge mit dem Anfangslaut M.' }, { icon: '🥄', title: 'Küchen-Zählen', text: 'Zähle vier Löffel und lege einen dazu.' }, { icon: '🎵', title: 'Reime finden', text: 'Welche Wörter klingen wie Haus?' }, { icon: '🎭', title: 'Familien-Theater', text: 'Spielt eine kurze Geschichte mit drei Szenen.' }].map((mission) => <button className="daily-step" key={mission.title} onClick={() => award('game', `family-${mission.title}`)}><strong>{mission.icon}</strong><span><b>{mission.title}</b><small>{mission.text}</small></span><em>✓</em></button>)}</main></div>;

  if (screen === 'logic') return <div className={`wortwelt-app single-screen ${appearance}`}><Header title="Denk-Labor" stars={progress.stars} onBack={() => setScreen('adventure')} /><main className="logic-lab"><section className="logic-card"><div className="logic-level"><span>🧠</span><small>LOGIK UND MATHE</small></div><h2>Welche Zahl fehlt?</h2><div className="logic-visual">2 + 3 = ?</div><div className="logic-answers">{[4, 5, 6].map((answer) => <button key={answer} onClick={() => answer === 5 ? award('game', 'logic-five') : setMessage('Schau dir die Menge noch einmal an.')}>{answer}</button>)}</div><p role="status">{message}</p></section></main></div>;

  if (screen === 'culture') return <div className={`wortwelt-app single-screen ${appearance}`}><Header title="Deutschland entdecken" stars={progress.stars} onBack={() => setScreen('adventure')} /><main className="culture-explorer"><section className="culture-card"><span>🏰</span><small>SPRACHE UND ALLTAG</small><h2>Ein Wort aus Deutschland</h2><p>Ein <strong>Schloss</strong> ist ein großes, altes Haus für Könige oder Königinnen. Viele Schlösser stehen an Flüssen und in Bergen.</p><button className="audio-button" onClick={() => audio('words/Schloss')}>🔊 Schloss hören</button><button className="primary" onClick={() => award('game', 'culture-schloss')}>Das habe ich entdeckt</button></section></main></div>;

  if (screen === 'adaptive') { const recommended = germanLetters.find((letter) => !progress.learned.includes(letter.upper)) ?? germanLetters[0]; return <div className={`wortwelt-app single-screen ${appearance}`}><Header title="Meine nächste Lektion" stars={progress.stars} onBack={() => setScreen('home')} /><main className="daily-challenge"><section className="daily-hero"><span>✨</span><div><h2>Passend für dich</h2><p>Wir wählen den nächsten noch offenen Buchstaben auf diesem Gerät.</p></div></section><section className="wortwelt-panel"><div className="giant-letter">{recommended.upper}</div><h2>Heute: {recommended.upper} wie {recommended.words[0].word}</h2><p>Hören, erkennen und schreiben — in deinem Tempo.</p><button className="primary" onClick={() => openLesson(recommended)}>Diese Lektion starten</button></section></main></div>; }

  if (screen === 'home') return <div className={`wortwelt-app ${appearance}`}><Header title="Hallo, kleine Entdecker!" stars={progress.stars} /><section className="hero wortwelt-hero"><div><span className="eyebrow">DEUTSCH LERNEN MIT SPASS</span><h2>Entdecke deine<br />neue WortWelt!</h2></div><div className="hero-art" aria-hidden="true">🦊<span>A</span></div></section><main className="menu-grid">{[{ screen: 'daily' as Screen, icon: '☀️', title: 'Tägliche Herausforderung', text: 'Drei kleine Aufgaben', kind: 'daily' }, { screen: 'adventure' as Screen, icon: '🗺️', title: 'Abenteuer', text: 'Acht Lerninseln entdecken', kind: 'adventure' }, { screen: 'adaptive' as Screen, icon: '✨', title: 'Meine nächste Lektion', text: 'Passend zu deinem Lernweg', kind: 'learn' }, { screen: 'alphabet' as Screen, icon: '🔤', title: 'Buchstaben lernen', text: 'Schritt für Schritt lernen', kind: 'learn' }, { screen: 'write' as Screen, icon: '✍️', title: 'Schreiben', text: 'Mit dem Finger nachzeichnen', kind: 'write' }, { screen: 'coloring' as Screen, icon: '🎨', title: 'Malwelt', text: 'Bilder und Buchstaben malen', kind: 'coloring' }, { screen: 'games' as Screen, icon: '🎮', title: 'Spiele', text: 'Hören, Memory, Wörter bauen', kind: 'games' }, { screen: 'quiz' as Screen, icon: '❓', title: 'Quiz', text: 'Wörter und Bilder erkennen', kind: 'quiz' }, { screen: 'count' as Screen, icon: '🔢', title: 'Zählen bis 100', text: 'Mengen und Zahlen entdecken', kind: 'numbers' }, { screen: 'read' as Screen, icon: '📚', title: 'Lesen & Geschichten', text: 'Kurze Geschichten lesen', kind: 'reading' }, { screen: 'fairy' as Screen, icon: '🌙', title: 'Märchenwelt', text: 'Märchen gemeinsam lesen', kind: 'fairy-tales' }, { screen: 'my-stories' as Screen, icon: '📖', title: 'Meine Geschichten', text: 'Eigene Bücher erfinden', kind: 'my-stories' }, { screen: 'progress' as Screen, icon: '⭐', title: 'Mein Fortschritt', text: 'Sterne und Lernweg', kind: 'progress' }, { screen: 'parent' as Screen, icon: '🔒', title: 'Für Eltern', text: 'Profile, Schutz und Ansicht', kind: 'parent' }].map((item) => <button className={`menu-card menu-${item.kind}`} key={item.title} onClick={() => { if (item.screen === 'write') { openWriting(germanLetters[0]); return; } if (item.screen === 'alphabet') { openAlphabet(); return; } setScreen(item.screen); }}><span className="menu-icon">{item.icon}</span><span><strong>{item.title}</strong><small>{item.text}</small></span><b>›</b></button>)}</main></div>;

  if (screen === 'parent') return parentUnlocked ? <ParentScreen progress={progress} update={update} onBack={() => setScreen('home')} /> : <ParentGate onBack={() => setScreen('home')} onOpen={() => setParentUnlocked(true)} />;
  if (screen === 'progress') return <div className={`wortwelt-app ${appearance}`}><Header title="Mein Fortschritt" stars={progress.stars} onBack={() => setScreen('home')} /><main className="wortwelt-progress"><section><span>⭐</span><strong>{progress.stars}</strong><small>Sterne gesammelt</small></section><section><span>🔤</span><strong>{learnedCount}/30</strong><small>Buchstaben gelernt</small></section><section><span>🔢</span><strong>{progress.counted.length}/101</strong><small>Zahlen gezählt</small></section><section><span>📚</span><strong>{progress.storiesRead.length}/{READING_STORIES.length}</strong><small>Geschichten verstanden</small></section><section><span>🎨</span><strong>{progress.colorings.length}</strong><small>Bilder gespeichert</small></section><section className="progress-wide"><strong>{completion}%</strong><div><i style={{ width: `${completion}%` }} /></div><small>Dein Lernweg</small></section></main></div>;

  return <div className={`wortwelt-app ${appearance}`}><Header title="Hallo, kleine Entdecker!" stars={progress.stars} /><section className="hero wortwelt-hero"><div><span className="eyebrow">DEUTSCH LERNEN MIT SPASS</span><h2>Entdecke deine<br />neue WortWelt!</h2></div><div className="hero-art" aria-hidden="true">🦊<span>A</span></div></section><main className="menu-grid"><button className="menu-card menu-daily" onClick={() => setScreen('daily')}><span className="menu-icon">☀️</span><span><strong>Tägliche Herausforderung</strong><small>Drei kleine Aufgaben</small></span><b>›</b></button><button className="menu-card menu-adventure" onClick={() => setScreen('adventure')}><span className="menu-icon">🗺️</span><span><strong>Abenteuer</strong><small>Vier Lerninseln entdecken</small></span><b>›</b></button><button className="menu-card menu-learn" onClick={() => setScreen('alphabet')}><span className="menu-icon">🔤</span><span><strong>Buchstaben lernen</strong><small>Sehen, hören und merken</small></span><b>›</b></button><button className="menu-card menu-write" onClick={() => { setSelected(germanLetters[0]); setScreen('write'); }}><span className="menu-icon">✍️</span><span><strong>Schreiben</strong><small>Mit dem Finger nachzeichnen</small></span><b>›</b></button><button className="menu-card menu-coloring" onClick={() => setScreen('coloring')}><span className="menu-icon">🎨</span><span><strong>Malwelt</strong><small>Bilder und Buchstaben malen</small></span><b>›</b></button><button className="menu-card menu-games" onClick={() => setScreen('games')}><span className="menu-icon">🎮</span><span><strong>Spiele</strong><small>Hören, Memory, Wörter bauen</small></span><b>›</b></button><button className="menu-card menu-quiz" onClick={() => setScreen('quiz')}><span className="menu-icon">❓</span><span><strong>Quiz</strong><small>Wörter und Bilder erkennen</small></span><b>›</b></button><button className="menu-card menu-numbers" onClick={() => setScreen('count')}><span className="menu-icon">🔢</span><span><strong>Zählen bis 100</strong><small>Mengen und Zahlen entdecken</small></span><b>›</b></button><button className="menu-card menu-reading" onClick={() => setScreen('read')}><span className="menu-icon">📚</span><span><strong>Lesen & Geschichten</strong><small>Zwölf Geschichten verstehen</small></span><b>›</b></button><button className="menu-card menu-fairy-tales" onClick={() => setScreen('read')}><span className="menu-icon">🌙</span><span><strong>Geschichtenwelt</strong><small>Vorlesen und Satz für Satz hören</small></span><b>›</b></button><button className="menu-card menu-progress" onClick={() => setScreen('progress')}><span className="menu-icon">⭐</span><span><strong>Mein Fortschritt</strong><small>Sterne und Lernweg</small></span><b>›</b></button><button className="menu-card menu-parent" onClick={() => setScreen('parent')}><span className="menu-icon">🔒</span><span><strong>Für Eltern</strong><small>Profile, Schutz und Ansicht</small></span><b>›</b></button></main></div>;
}

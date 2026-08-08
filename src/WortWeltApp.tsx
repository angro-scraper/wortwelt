import { useEffect, useMemo, useState } from 'react';
import { TracePad } from './components/TracePad';
import { germanLetters, type GermanLetter, type GermanWord } from './domain/germanLetters';
import {
  COUNTING_LESSONS,
  READING_STORIES,
  gameChoicesFor,
  type ReadingStory
} from './domain/wortweltMvp';
import { playGermanAudio } from './services/wortweltAudio';

type Screen = 'home' | 'alphabet' | 'lesson' | 'write' | 'games' | 'count' | 'read' | 'parent' | 'progress';
type SavedProgress = {
  stars: number;
  learned: string[];
  gamesWon: number;
  counted: number[];
  storiesRead: string[];
  profiles: string[];
  activeProfile: number;
  soundEnabled: boolean;
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
      soundEnabled: value.soundEnabled ?? true
    };
  } catch {
    return { stars: 0, learned: [], gamesWon: 0, counted: [], storiesRead: [], profiles: ['Kind'], activeProfile: 0, soundEnabled: true };
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
      <section className="wortwelt-panel"><h2>Fortschritt von {activeName}</h2><p>{progress.learned.length} Buchstaben, {progress.counted.length} Zahlen und {progress.storiesRead.length} Geschichten abgeschlossen.</p><button className="secondary" onClick={() => update((current) => ({ ...current, stars: 0, learned: [], gamesWon: 0, counted: [], storiesRead: [] }))}>Lernfortschritt zurücksetzen</button></section>
    </main>
  </div>;
}

export function WortWeltApp() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selected, setSelected] = useState<GermanLetter>(germanLetters[0]);
  const [progress, setProgress] = useState<SavedProgress>(readProgress);
  const [message, setMessage] = useState('Wähle ein Bild für das Wort Affe.');
  const [celebrate, setCelebrate] = useState(false);
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [countIndex, setCountIndex] = useState(0);
  const [story, setStory] = useState<ReadingStory>(READING_STORIES[0]);

  useEffect(() => { localStorage.setItem(progressKey, JSON.stringify(progress)); }, [progress]);
  const update = (next: (current: SavedProgress) => SavedProgress) => setProgress(next);
  const audio = (asset: string) => { void playGermanAudio(asset, progress.soundEnabled); };
  const learnedCount = progress.learned.length;
  const completion = Math.round(((learnedCount + progress.counted.length + progress.storiesRead.length) / (germanLetters.length + COUNTING_LESSONS.length + READING_STORIES.length)) * 100);

  const openLesson = (letter: GermanLetter) => {
    setSelected(letter);
    setMessage(`Wähle das Bild für das Wort ${letter.words[0].word}.`);
    setScreen('lesson');
    audio(`letters/${letter.upper}`);
  };
  const award = (kind: 'letter' | 'game' | 'count' | 'story', key: string, nextScreen?: Screen) => {
    update((current) => {
      if (kind === 'letter') return { ...current, learned: awardOnce(current.learned, key), stars: current.learned.includes(key) ? current.stars : current.stars + 1 };
      if (kind === 'count') return { ...current, counted: awardOnce(current.counted.map(String), key).map(Number), stars: current.counted.includes(Number(key)) ? current.stars : current.stars + 1 };
      if (kind === 'story') return { ...current, storiesRead: awardOnce(current.storiesRead, key), stars: current.storiesRead.includes(key) ? current.stars : current.stars + 1 };
      return { ...current, gamesWon: current.gamesWon + 1, stars: current.stars + 1 };
    });
    setCelebrate(true); audio('feedback/bravo');
    window.setTimeout(() => { setCelebrate(false); if (nextScreen) setScreen(nextScreen); }, 900);
  };
  const choices = useMemo(() => gameChoicesFor(selected, germanLetters), [selected]);

  if (screen === 'alphabet') return <div className="wortwelt-app"><Header title="Das Alphabet" stars={progress.stars} onBack={() => setScreen('home')} /><main className="letter-grid" aria-label="Deutsches Alphabet">{germanLetters.map((letter, index) => <button key={letter.upper} className="letter-button" style={{ '--letter-color': colors[index % colors.length] } as React.CSSProperties} onClick={() => openLesson(letter)} aria-label={`${letter.upper} ${letter.lower}`}><strong>{letter.upper}</strong><small>{letter.lower}</small>{progress.learned.includes(letter.upper) && <span>★</span>}</button>)}</main></div>;

  if (screen === 'lesson') return <div className="wortwelt-app single-screen"><Header title={`Buchstabe ${selected.upper} ${selected.lower}`} stars={progress.stars} onBack={() => setScreen('alphabet')} /><main className="lesson" aria-live="polite"><button className="audio-button" onClick={() => audio(`letters/${selected.upper}`)}>🔊 Hör den Buchstaben</button><div className="giant-letter" aria-label={`${selected.upper} und ${selected.lower}`}>{selected.upper} <small>{selected.lower}</small></div><section className="word-row" aria-label={`Wörter mit ${selected.upper}`}>{selected.words.map((word) => <button className="word-card" key={word.word} onClick={() => { audio(`words/${word.word}`); setMessage(`${word.word} beginnt mit ${selected.upper}.`); }}><WordIllustration word={word} /><strong>{word.word}</strong></button>)}</section><section className="picture-challenge"><h2>Finde das Bild: {selected.words[0].word}</h2><div className="picture-options">{choices.map((word) => <button key={word.word} aria-label={`Bild auswählen: ${word.word}`} onClick={() => { if (word.word === selected.words[0].word) { setMessage(`Prima! ${word.word} beginnt mit ${selected.upper}.`); award('letter', selected.upper); } else { setMessage('Fast! Schau noch einmal genau hin.'); audio('feedback/try-again'); } }}><WordIllustration word={word} /><strong>{word.word}</strong></button>)}</div></section><p className="wortwelt-status">{message}</p><button className="primary" onClick={() => setScreen('write')}>✍️ Buchstaben schreiben</button></main>{celebrate && <div className="celebrate" role="status">⭐ Prima! Du hast einen Stern!</div>}</div>;

  if (screen === 'write') return <div className="wortwelt-app single-screen"><Header title={`Schreibe ${selected.upper}`} stars={progress.stars} onBack={() => setScreen('lesson')} /><main className="practice"><p className="instruction">Folge dem hellen Buchstaben mit deinem Finger.</p><TracePad letter={selected.upper} canvasLabel={`Schreibfläche für den Buchstaben ${selected.upper}`} clearLabel="Löschen" onComplete={() => award('letter', selected.upper, 'alphabet')} /></main>{celebrate && <div className="celebrate" role="status">⭐ Super! Buchstabe gelernt!</div>}</div>;

  if (screen === 'games') return <div className="wortwelt-app single-screen"><Header title="Spiele" stars={progress.stars} onBack={() => setScreen('home')} /><main className="game"><div className="game-letter">{selected.upper}</div><h2>Welches Wort beginnt mit {selected.upper}?</h2><p>Höre genau hin und wähle das richtige Bild.</p><button className="audio-button" onClick={() => audio(`letters/${selected.upper}`)}>🔊 Noch einmal hören</button><div className="answer-grid">{choices.map((word) => <button key={word.word} aria-label={`Spielantwort ${word.word}`} onClick={() => { if (word.word === selected.words[0].word) { award('game', word.word); setSelected(germanLetters[(germanLetters.indexOf(selected) + 1) % germanLetters.length]); } else { setMessage('Versuche es noch einmal.'); audio('feedback/try-again'); } }}><WordIllustration word={word} /><strong>{word.word}</strong></button>)}</div><p role="status">{message}</p></main>{celebrate && <div className="celebrate">⭐ Spiel gewonnen!</div>}</div>;

  if (screen === 'count') {
    const lesson = COUNTING_LESSONS[countIndex];
    const answers = lesson.value === 0 ? [0, 1, 2] : lesson.value === 10 ? [8, 9, 10] : [lesson.value - 1, lesson.value, lesson.value + 1];
    return <div className="wortwelt-app single-screen"><Header title="Zählen" stars={progress.stars} onBack={() => setScreen('home')} /><main className="numbers-screen"><div className="number-strip">{COUNTING_LESSONS.map((entry, index) => <button key={entry.value} className={index === countIndex ? 'active' : ''} onClick={() => setCountIndex(index)}>{entry.value}{progress.counted.includes(entry.value) && <small>★</small>}</button>)}</div><section className="number-card"><button className="big-number" onClick={() => audio(`numbers/${lesson.value}`)}><strong>{lesson.value}</strong><small>🔊 {lesson.word}</small></button><div className={`counting-row ${lesson.value > 7 ? 'counting-medium' : 'counting-low'}`}>{lesson.value === 0 ? <span className="empty-set">leer</span> : Array.from({ length: lesson.value }, (_, index) => <span key={index}>{lesson.emoji}</span>)}</div><h2>Wie viele {lesson.label} siehst du?</h2><div className="number-options">{answers.map((answer) => <button key={answer} onClick={() => { if (answer === lesson.value) { award('count', String(answer)); setCountIndex((current) => Math.min(current + 1, COUNTING_LESSONS.length - 1)); } else { setMessage('Zähle noch einmal langsam.'); audio('feedback/try-again'); } }}>{answer}</button>)}</div><p role="status">{message}</p></section></main>{celebrate && <div className="celebrate">⭐ Richtig gezählt!</div>}</div>;
  }

  if (screen === 'read') return <div className="wortwelt-app"><Header title="Lesen & Geschichten" stars={progress.stars} onBack={() => setScreen('home')} /><main className="reading"><div className="age-tabs">{READING_STORIES.map((entry) => <button key={entry.id} className={entry.id === story.id ? 'active' : ''} onClick={() => setStory(entry)}>{entry.title}</button>)}</div><div className="story-art">{story.emoji}</div><h2>{story.title}</h2><button className="audio-button" onClick={() => audio(`stories/${story.id}`)}>🔊 Geschichte anhören</button>{story.sentences.map((sentence, index) => <p className="sentence" key={sentence}><button className="sentence-audio" aria-label={`Satz ${index + 1} hören`} onClick={() => audio(`stories/${story.id}-${index + 1}`)}>🔊</button>{sentence}</p>)}<p className="reading-question">{story.question}</p><div className="quiz-choices">{story.answers.map((answer) => <button key={answer} onClick={() => { if (answer === story.correct) { award('story', story.id); setMessage('Prima, du hast die Geschichte verstanden!'); } else { setMessage('Lies die Geschichte noch einmal.'); audio('feedback/try-again'); } }}>{answer}</button>)}</div><p role="status">{message}</p></main>{celebrate && <div className="celebrate">⭐ Geschichte verstanden!</div>}</div>;

  if (screen === 'parent') return parentUnlocked ? <ParentScreen progress={progress} update={update} onBack={() => setScreen('home')} /> : <ParentGate onBack={() => setScreen('home')} onOpen={() => setParentUnlocked(true)} />;
  if (screen === 'progress') return <div className="wortwelt-app"><Header title="Mein Fortschritt" stars={progress.stars} onBack={() => setScreen('home')} /><main className="wortwelt-progress"><section><span>⭐</span><strong>{progress.stars}</strong><small>Sterne gesammelt</small></section><section><span>🔤</span><strong>{learnedCount}/30</strong><small>Buchstaben gelernt</small></section><section><span>🔢</span><strong>{progress.counted.length}/11</strong><small>Zahlen gezählt</small></section><section><span>📚</span><strong>{progress.storiesRead.length}/3</strong><small>Geschichten verstanden</small></section><section className="progress-wide"><strong>{completion}%</strong><div><i style={{ width: `${completion}%` }} /></div><small>Dein Lernweg</small></section></main></div>;

  return <div className="wortwelt-app"><Header title="Hallo, kleine Entdecker!" stars={progress.stars} /><section className="hero wortwelt-hero"><div><span className="eyebrow">DEUTSCH LERNEN MIT SPASS</span><h2>Entdecke deine<br />neue WortWelt!</h2></div><div className="hero-art" aria-hidden="true">🦊<span>A</span></div></section><main className="menu-grid"><button className="menu-card menu-learn" onClick={() => setScreen('alphabet')}><span className="menu-icon">🔤</span><span><strong>Buchstaben lernen</strong><small>Sehen, hören und merken</small></span><b>›</b></button><button className="menu-card menu-write" onClick={() => { setSelected(germanLetters[0]); setScreen('write'); }}><span className="menu-icon">✍️</span><span><strong>Schreiben</strong><small>Mit dem Finger nachzeichnen</small></span><b>›</b></button><button className="menu-card menu-games" onClick={() => setScreen('games')}><span className="menu-icon">🎮</span><span><strong>Spiele</strong><small>Wörter hören und finden</small></span><b>›</b></button><button className="menu-card menu-numbers" onClick={() => setScreen('count')}><span className="menu-icon">🔢</span><span><strong>Zählen</strong><small>Mengen entdecken</small></span><b>›</b></button><button className="menu-card menu-reading" onClick={() => setScreen('read')}><span className="menu-icon">📚</span><span><strong>Lesen & Geschichten</strong><small>Hören, lesen, verstehen</small></span><b>›</b></button><button className="menu-card menu-progress" onClick={() => setScreen('progress')}><span className="menu-icon">⭐</span><span><strong>Mein Fortschritt</strong><small>Sterne und Lernweg</small></span><b>›</b></button><button className="menu-card menu-parent" onClick={() => setScreen('parent')}><span className="menu-icon">🔒</span><span><strong>Für Eltern</strong><small>Profile und Datenschutz</small></span><b>›</b></button></main></div>;
}

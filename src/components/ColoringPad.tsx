import { useEffect, useRef, useState } from 'react';

const palette = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#17213b'];

type ColoringPadProps = {
  letter: string;
  illustration?: string;
  illustrationImage?: string;
  onSaved?: (letter: string) => void;
  storageKey?: string;
  canvasLabel?: string;
};

export function ColoringPad({
  letter,
  illustration = '🌈',
  illustrationImage,
  onSaved,
  storageKey,
  canvasLabel
}: ColoringPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(palette[0]);
  const [drawing, setDrawing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const bounds = canvas.getBoundingClientRect();
    canvas.width = bounds.width * ratio;
    canvas.height = bounds.height * ratio;
    const context = canvas.getContext('2d');
    context?.scale(ratio, ratio);
    const saved = localStorage.getItem(`wortwelt-coloring-${storageKey ?? letter}`);
    if (saved) {
      const image = new Image();
      image.onload = () => context?.drawImage(image, 0, 0, bounds.width, bounds.height);
      image.src = saved;
    }
  }, [letter, storageKey]);

  const drawPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');
    if (!context) return;
    context.globalCompositeOperation = color === 'transparent' ? 'destination-out' : 'source-over';
    context.fillStyle = color === 'transparent' ? '#000000' : color;
    context.beginPath();
    context.arc(event.clientX - bounds.left, event.clientY - bounds.top, color === 'transparent' ? 25 : 13, 0, Math.PI * 2);
    context.fill();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setMessage('Das Bild konnte nicht gespeichert werden. Bitte versuche es noch einmal.');
      return;
    }
    try {
      const image = canvas.toDataURL('image/png');
      localStorage.setItem(`wortwelt-coloring-${storageKey ?? letter}`, image);
      setMessage('Dein Bild ist gespeichert!');
      onSaved?.(letter);
    } catch {
      setMessage('Das Bild konnte nicht gespeichert werden. Bitte prüfe den freien Speicherplatz.');
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem(`wortwelt-coloring-${storageKey ?? letter}`);
    setMessage('Die Malfläche ist wieder leer.');
  };

  return (
    <div className="coloring-pad">
      <div className="coloring-picture" aria-hidden="true">
        {illustrationImage ? <img src={illustrationImage} alt="" /> : illustration}
        {letter && <strong>{letter}</strong>}
      </div>
      <canvas
        ref={canvasRef}
        aria-label={canvasLabel ?? `Malfläche für den Buchstaben ${letter}`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setDrawing(true);
          drawPoint(event);
        }}
        onPointerMove={(event) => {
          if (drawing) drawPoint(event);
        }}
        onPointerUp={() => setDrawing(false)}
        onPointerCancel={() => setDrawing(false)}
      />
      <div className="palette" aria-label="Farbpalette">
        {palette.map((item) => <button key={item} aria-label={`Farbe ${item}`} className={item === color ? 'active' : ''} style={{ background: item }} onClick={() => setColor(item)} />)}
        <button className={color === 'transparent' ? 'eraser active' : 'eraser'} onClick={() => setColor('transparent')} aria-label="Radiergummi">⌫</button>
      </div>
      <div className="coloring-actions"><button className="secondary" onClick={clear}>Löschen</button><button className="primary" onClick={save}>Bild speichern</button></div>
      {message && <p className="coloring-message" role="status">{message}</p>}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';

export function VoicePractice({
  enabled,
  phrase,
  onRecorded
}: {
  enabled: boolean;
  phrase: string;
  onRecorded?: () => void;
}) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [message, setMessage] = useState(
    enabled
      ? `WortWelt hört zu. Sprich nach: ${phrase}. Die Aufnahme bleibt nur auf diesem Gerät.`
      : 'Eine erwachsene Person kann die lokale Sprechübung im Elternbereich einschalten.'
  );

  useEffect(() => () => {
    recorderRef.current?.state === 'recording' && recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  if (!enabled) {
    return <aside className="voice-practice locked"><span>🎙️</span><p>{message}</p></aside>;
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setMessage('Dieses Gerät unterstützt keine lokale Sprachaufnahme.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setMessage('Deine Aufnahme ist nur auf diesem Gerät bereit. Hör sie dir an und vergleiche.');
        onRecorded?.();
      };
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setMessage(`Wir nehmen auf … Sprich nach: ${phrase}`);
    } catch {
      setMessage('Das Mikrofon ist nicht verfügbar. Bitte prüfe die Geräteberechtigung.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    setRecording(false);
  };

  return (
    <aside className="voice-practice">
      <div><span>🎙️</span><p role="status">{message}</p></div>
      <small>WortWelt macht Mut, bewertet aber nicht, ob die Aussprache perfekt ist.</small>
      {recording
        ? <button className="secondary" onClick={stopRecording}>Aufnahme stoppen</button>
        : <button className="secondary" onClick={() => void startRecording()}>Meine Stimme aufnehmen</button>}
      {audioUrl && <audio aria-label="Meine Aussprache anhören" controls src={audioUrl} />}
    </aside>
  );
}

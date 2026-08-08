const root = '/audio/de';

function fileName(asset: string): string {
  return asset
    .toLocaleLowerCase('de-DE')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9/-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/\/$/g, '');
}

export function germanAudioUrl(asset: string): string {
  return `${root}/${fileName(asset)}.mp3`;
}

/** Reprodukuje samo unapred spakovanu nemačku datoteku; nema TTS rezervu. */
export async function playGermanAudio(asset: string, enabled = true): Promise<boolean> {
  if (!enabled || typeof Audio === 'undefined') return false;
  const audio = new Audio(germanAudioUrl(asset));
  try {
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

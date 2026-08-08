"""Generiše lokalne nemačke MP3 zapise za WortWelt.

Poziva se samo namerno pri izradi audio paketa. Aplikacija potom koristi
isključivo nastale datoteke, bez sistemskog TTS-a na dečjem uređaju.
"""
from __future__ import annotations

import asyncio
import json
import re
import unicodedata
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "static" / "audio" / "de"
VOICE = "de-DE-KatjaNeural"
RATE = "-12%"


def slug(value: str) -> str:
    value = value.lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    value = "".join(char for char in unicodedata.normalize("NFD", value) if unicodedata.category(char) != "Mn")
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9/-]+", "-", value)).strip("-")


async def save(asset: str, text: str) -> None:
    target = OUT / f"{slug(asset)}.mp3"
    target.parent.mkdir(parents=True, exist_ok=True)
    await edge_tts.Communicate(text=text, voice=VOICE, rate=RATE).save(str(target))
    print(target.relative_to(OUT))


async def main() -> None:
    letters = json.loads((ROOT / "src" / "data" / "germanLetters.json").read_text(encoding="utf-8"))
    for letter in letters:
        await save(f"letters/{letter['upper']}", f"Das ist der Buchstabe {letter['name']}. {letter['upper']} wie {letter['words'][0]['word']}.")
        for word in letter["words"]:
            await save(f"words/{word['word']}", word["word"])

    for value, word in enumerate(["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn"]):
        await save(f"numbers/{value}", word)
    await save("feedback/bravo", "Prima! Das hast du toll gemacht.")
    await save("feedback/try-again", "Fast. Versuche es noch einmal.")

    stories = [
        ("mila-mond", ["Mila sieht den Mond.", "Der Mond ist rund und hell.", "Mila winkt dem Mond zu."]),
        ("fuchs-weg", ["Ein kleiner Fuchs läuft im Wald.", "Er findet eine rote Beere.", "Der Fuchs freut sich sehr."]),
        ("lina-regenbogen", ["Nach dem Regen schaut Lina nach oben.", "Ein Regenbogen leuchtet am Himmel.", "Lina zählt seine Farben."]),
    ]
    for story_id, sentences in stories:
        await save(f"stories/{story_id}", " ".join(sentences))
        for index, sentence in enumerate(sentences, 1):
            await save(f"stories/{story_id}-{index}", sentence)


if __name__ == "__main__":
    asyncio.run(main())

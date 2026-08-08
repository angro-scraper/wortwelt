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
    if target.exists():
        return
    await edge_tts.Communicate(text=text, voice=VOICE, rate=RATE).save(str(target))
    print(target.relative_to(OUT))


async def main() -> None:
    letters = json.loads((ROOT / "src" / "data" / "germanLetters.json").read_text(encoding="utf-8"))
    for letter in letters:
        await save(f"letters/{letter['upper']}", f"Das ist der Buchstabe {letter['name']}. {letter['upper']} wie {letter['words'][0]['word']}.")
        for word in letter["words"]:
            await save(f"words/{word['word']}", word["word"])
    await save("words/Schloss", "Schloss")

    ones = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"]
    teens = ["zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"]
    tens = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"]
    def number_word(value: int) -> str:
        if value < 10: return ones[value]
        if value < 20: return teens[value - 10]
        if value == 100: return "hundert"
        return tens[value // 10] if value % 10 == 0 else f"{'ein' if value % 10 == 1 else ones[value % 10]}und{tens[value // 10]}"
    for value in range(101):
        word = number_word(value)
        await save(f"numbers/{value}", word)
    await save("feedback/bravo", "Prima! Das hast du toll gemacht.")
    await save("feedback/bravo-next-letter", "Bravo! Du hast einen Stern. Jetzt kommt der nächste Buchstabe.")
    await save("feedback/try-again", "Fast. Versuche es noch einmal.")

    stories = [
        ("mila-mond", ["Mila sieht den Mond.", "Der Mond ist rund und hell.", "Mila winkt dem Mond zu."]),
        ("fuchs-weg", ["Ein kleiner Fuchs läuft im Wald.", "Er findet eine rote Beere.", "Der Fuchs freut sich sehr."]),
        ("lina-regenbogen", ["Nach dem Regen schaut Lina nach oben.", "Ein Regenbogen leuchtet am Himmel.", "Lina zählt seine Farben."]),
        ("otto-ei", ["Otto findet ein warmes Ei.", "Im Ei piepst ein Küken.", "Otto baut ein weiches Nest."]),
        ("mia-maus", ["Mia Maus hat einen Pinsel.", "Sie malt einen blauen See.", "Neben dem See steht ein Baum."]),
        ("ben-brot", ["Ben mischt Mehl und Wasser.", "Der Teig wird groß und rund.", "Das Brot duftet gut."]),
        ("tina-turm", ["Tina hat viele Bauklötze.", "Sie baut einen hohen Turm.", "Ein gelber Klotz kommt ganz oben hin."]),
        ("paul-park", ["Paul fährt mit dem Roller zum Park.", "Dort trifft er seine Freundin Lea.", "Zusammen rutschen sie um die Wette."]),
        ("ada-ameise", ["Ada sieht einen schweren Krümel.", "Zwei Ameisen helfen ihr tragen.", "Gemeinsam schaffen sie den Weg nach Hause."]),
        ("noah-nacht", ["Noah hat ein kleines Nachtlicht.", "Es leuchtet wie ein Stern.", "Jetzt schläft Noah ruhig ein."]),
        ("sara-samen", ["Sara legt Samen in die Erde.", "Sie gießt sie mit einer kleinen Kanne.", "Nach einigen Tagen wachsen grüne Blätter."]),
        ("leo-laterne", ["Leo trägt eine bunte Laterne.", "Er geht langsam durch die dunkle Straße.", "Seine Laterne zeigt ihm den Weg."]),
    ]
    for story_id, sentences in stories:
        await save(f"stories/{story_id}", " ".join(sentences))
        for index, sentence in enumerate(sentences, 1):
            await save(f"stories/{story_id}-{index}", sentence)


if __name__ == "__main__":
    asyncio.run(main())

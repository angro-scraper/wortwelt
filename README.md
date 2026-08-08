# WortWelt

WortWelt je samostalna, offline-first PWA za decu koja nemački uče kroz
slova, reči, pisanje, igre, brojanje i kratke priče.

## MVP sadržaj

- nemačka abeceda: A–Z, Ä, Ö, Ü i ß, uz tri nemačke reči po lekciji;
- lokalni MP3 zapisi za 30 slova, 90 reči, brojeve 0–10, povratne poruke i
  tri priče sa segmentima;
- učenje slova, izbor slike, pisanje prstom, igra prepoznavanja reči i
  brojanje količina;
- tri originalne kratke nemačke priče sa pitanjem razumevanja;
- lokalni napredak, zvezdice i roditeljski ekran za profile i ton;
- PWA manifest, offline pre-cache i Capacitor Android/iOS omoti.

## Privatnost

Nema naloga, reklama, analitike, mikrofona niti mrežnih zahteva tokom rada
aplikacije. Napredak ostaje u `localStorage` na uređaju. Reprodukcija koristi
isključivo lokalno spakovane MP3 datoteke; aplikacija nema sistemski TTS
fallback.

## Lokalni rad

```powershell
npm ci
npm test
npm run typecheck
npm run build
npm run cap:sync
```

Za Android debug proveru, uz lokalno podešen Android SDK:

```powershell
Set-Location android
.\gradlew.bat :app:assembleDebug
```

iOS projekat se generiše na Windows-u, ali potpisivanje i Xcode build zahtevaju
macOS sa CocoaPods/Xcode okruženjem.

## Audio paket

Audio datoteke su unapred generisane nemačkim neuralnim glasom `de-DE-KatjaNeural`
i čuvaju se u `static/audio/de`. Generator se pokreće samo tokom izrade paketa:

```powershell
npm run audio:generate
```

Korisnički uređaj nikada ne pokreće taj generator niti koristi TTS.

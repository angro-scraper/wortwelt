# WortWelt

WortWelt je zasebna, offline-first aplikacija za decu koja uče nemački jezik kroz slova, pisanje, igre, brojeve, čitanje i priče.

## Granica projekta

- Slovolov se ne menja i nema zajednički storage sa WortWelt-om.
- Nemački sadržaj ne nastaje prostim prevodom srpskih reči: svaka ilustracija i audio zapis moraju odgovarati nemačkoj reči.
- Glasovi su unapred generisani i lokalno zapakovani u `static/audio/de`, bez oslanjanja na sistemski TTS telefona.
- Web/PWA je glavni proizvod; Android i iOS koriste generisani Capacitor omot istog `dist` paketa.

## Prvi sadržajni korak

Osnovni katalog sadrži 30 lekcija: A–Z, Ä, Ö, Ü i ß. Svaka lekcija ima veliko i malo slovo, ime slova i tri proverene nemačke reči sa ilustracijama.

## Plan izrade

1. Početni ekran, navigacija i lokalni roditeljski profili su na WortWelt identitetu.
2. Nemački katalog je povezan sa lekcijom, slikovnim kvizom i pisanjem.
3. Lokalni nemački MP3 zapisi postoje za slova, reči, pohvale, brojeve i priče.
4. Igre, brojanje i čitanje koriste isključivo nemački sadržaj.
5. Web/PWA build i Android debug omot su provereni; iOS omot je generisan, a njegova kompilacija čeka macOS/Xcode.

## Izdanje 1.1 i Premium

- Apple i Google koriste isti nepromenljivi proizvod `de.wortwelt.app.premium.monthly`.
- Ponuda daje 7 dana besplatno, zatim košta 3,99 € mesečno u Nemačkoj; obnova i otkazivanje vode se kroz nalog prodavnice.
- iOS koristi marketinšku verziju 1.1, build 4 i minimalno iOS 15; Android koristi verziju 1.1, versionCode 4 i API 36.
- Apple Review snimak i nemački metapodaci nalaze se u `store-listing`; skripta `scripts/capture-premium-review.cjs` ponavlja snimanje stvarnog Premium ekrana bez ručnog kadriranja.

### Dokazi od 2026-09-11

- `npm test -- --run`: PASS, 10 fajlova i 59 testova.
- `npm run typecheck`: PASS.
- `VITE_COMMERCE_ENABLED=true npm run build`: PASS, 287 PWA stavki.
- `npx cap sync android` i `npx cap sync ios`: PASS; `cordova-plugin-purchase@13.18.0` je uključen u oba omota.
- `android\\gradlew.bat bundleRelease`: PASS; potpisani AAB SHA-256 `2E012E1FC7C98EDAC72AF01B21A5202925160FD7681C7728DE87A919AB6C1738`.

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

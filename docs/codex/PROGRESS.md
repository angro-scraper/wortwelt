# WortWelt release readiness

## 2026-10-25 — priprema javnog izdanja

- App Store Connect prikazuje iOS 1.1 kao `Ready for Distribution`, pa je sledeća verzija podignuta na 1.2 (build 7). Codemagic izvorni workflow ostaje upload-only; javna prijava se obavlja kroz App Store Connect nakon uspešnog builda.
- Google Play pretplata `de.wortwelt.app.premium.monthly`: aktiviran je mesečni osnovni plan; u Nemačkoj prikazana cena iznosi 3,99 EUR. Sedmodnevna probna ponuda `trial-7d` bila je aktivna. Cene i dostupnost u drugim regionima zahtevaju zasebnu proveru.
- Nova Android produkciona verzija 1.3 (versionCode 6) otvorena je kao nacrt; AAB još nije otpremljen u trenutku ovog zapisa. Ne proglašavati izdanje objavljenim bez potvrde Play Console.
- Verifikacija posle podizanja iOS verzije: `npm test -- --reporter=dot` — 11 fajlova, 67 testova prošlo; `npm run typecheck` — prošlo; `npm run build` — prošlo; `git diff --check` — prošlo (samo LF/CRLF upozorenja).
- Codemagic build #9 je odbijen pri uploadu jer je koristio iOS 1.1 koji je već odobren. Commit `7175a6c` sa iOS 1.2/build 7 je push-ovan, a novi Codemagic build `6ade1ba14a72334e32e508ae` pokrenut.
- Play Console je odbio prvi Android AAB jer je minSdk bio 23, dok Play automatska zaštita zahteva 24. Dodat je regresioni test, potvrđeno da prvo pada, podignut `minSdkVersion` na 24 i `android/gradlew.bat bundleRelease` je prošao. Ponovo otpremljeni AAB je validiran kao 6 (1.3), Android 24+, target SDK 36.
- Android produkciono izdanje `WortWelt 1.3 – Visuelles Abenteuer` je 25. oktobra poslato Google-u na pregled; Play Console prikazuje `Промене на прегледу`. Izdanje još nije javno. Play upozorava da 1.096 ranije podržanih starijih uređaja neće podržavati ovu verziju zbog pomeranja minSdk na 24; dodatno postoji neblokirajuće upozorenje za deobfuscation fajl.
- Provera Android popravke: `npm test -- --reporter=dot` — 67/67 prošlo; `npm run typecheck` — prošlo; `git diff --check` — prošlo.
- Codemagic build `6ade1ba14a72334e32e508ae` je završen; publish log potvrđuje `Version: 1.2`, `Version code: 7`, `Min OS version: 15.0` i `UPLOAD SUCCEEDED with no errors` (delivery UUID `763de3e2-ef69-44e9-946b-e755c0277602`).
- U App Store Connect-u kreirana je verzija 1.2, dodat build 7, upisane nemačke napomene o izmenama i aktuelne review beleške. Apple je potvrdio `1 Item Submitted`; status verzije je `Waiting for Review`, prijava `acb7c695-8c48-4d8c-a8f6-eee936040e07`. Automatska objava posle odobrenja je uključena.
- Google Play pregled objavljivanja potvrđuje `Промене на прегледу` za produkciono izdanje `WortWelt 1.3 – Visuelles Abenteuer`. Ni iOS 1.2 ni Android 1.3 još nisu javno dostupni u trenutku ove provere; na konačnu odluku čekaju Apple i Google.

## 2026-10-25 — prepare iOS 1.1 (6) and Android 1.3 (6)

- Google Play Console showed production active at WortWelt 1.2, version code 5, in 3 countries/regions. The closed-testing track also had WortWelt 1.2. The new Android bundle therefore uses version code 6 and version name 1.3.
- Codemagic build `6aa6faf595f3e1856e8a0f67` successfully uploaded iOS 1.1 (5) to App Store Connect, with minimum iOS 15.0. The new iOS build number is 6; the workflow remains upload-only (`submit_to_app_store: false`).
- Google Play subscription `de.wortwelt.app.premium.monthly` has an active 7-day trial offer, but its monthly base plan is still Draft and must be activated before the subscription can be purchased. The console displayed 173 countries/regions for both plan and offer; the exclusions were not independently confirmed.
- App Store Connect currently redirects to a failed sign-in page, so the current review/submission status could not be verified in this session.
- Verification: `npm test -- --reporter=dot` — 11 files, 67 tests passed; `npm run typecheck` — passed; `npm run build` — passed; `git diff --check` — passed.
- Android packaging: `npm run cap:sync` completed; `android/gradlew.bat bundleRelease` — BUILD SUCCESSFUL; signed AAB produced at `android/app/build/outputs/bundle/release/app-release.aab` (13,068,842 bytes). Android Gradle Plugin emitted its existing compileSdk 36 compatibility warning.

# Prepreka: ponovna Apple prijava

13. septembar 2026: lokalna ispravka Apple 3.1.2(c) ima 66 prolaznih testova,
typecheck i oba produkciona builda. Nije u poslatom paketu `1.1 (4)`.

Vlasnik je u nastavku razgovora odobrio traženi Codemagic/App Store Connect
izuzetak. Prepreka više nije dozvola: u trenutnoj sesiji nisu dostupni alati
za kontrolu prijavljenog browsera niti povezan Codemagic/App Store Connect
alat. Privatni ključevi se ne čitaju radi zaobilaženja te prepreke.

Pripremljen je iOS broj `1.1 (5)` i Codemagic push okidač samo za namensku
WortWelt granu. Okidač zavisi od postojećeg webhook-a; sam GitHub push nije
dokaz pokrenutog ili uspešnog iOS builda. Pipeline priprema i uploaduje IPA,
ali ne šalje ga na App Review pre provere linkova/metapodataka.

Još treba potvrditi uspešan Codemagic build/upload, proveriti otvaranje oba
linka na iOS uređaju i ponovo prijaviti novi build u App Store Connect.

Detaljan pregled: `docs/APPLE_REVIEW_1_1_LINKS.md`.

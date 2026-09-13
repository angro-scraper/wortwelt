# Prepreka: ponovna Apple prijava

13. septembar 2026: lokalna ispravka Apple 3.1.2(c) ima 66 prolaznih testova,
typecheck i oba produkciona builda. Nije u poslatom paketu `1.1 (4)`.

Za novi Codemagic build i App Store Connect upload/prijavu potreban je
izričit vlasnički izuzetak od važećeg AGENTS pravila koje zabranjuje spoljne
write operacije van dozvoljenih GitHub/Render tokova. Zatim treba dokazati
otvaranje oba linka iz novog iOS builda na uređaju i priložiti snimak.

Detaljan pregled: `docs/APPLE_REVIEW_1_1_LINKS.md`.

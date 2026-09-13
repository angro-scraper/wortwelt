# Apple pregled 1.1: linkovi uz pretplatu

Datum: 13. septembar 2026.
Prijava: `57444d45-f4e6-49de-95e2-987b163d21d4`, verzija `1.1 (4)`.

Apple je zaustavio pregled ovog ažuriranja zbog nedostajućih funkcionalnih
linkova ka privatnosti i EULA u aplikaciji (3.1.2(c)). Ovo nije dokaz da je
ranije objavljena verzija uklonjena iz prodavnice.

## Lokalna ispravka

- Premium kartica u roditeljskom delu sada sadrži dva jasno označena HTTPS
  linka pre dugmeta za kupovinu. Linkovi nisu uslovljeni učitanom ponudom ili
  aktivnim Premium pristupom. Spoljni linkovi ostaju iza roditeljske zaštite.
- Privatnost: <https://wortwelt.onrender.com/privacy>.
- Apple standardna EULA:
  <https://www.apple.com/legal/internet-services/itunes/dev/stdeula/>.
- Native tok prikazuje cenu i besplatnu probu iz ponude prodavnice umesto
  bezuslovnog obećanja nemačke cene/probe svim korisnicima. Trajanje od jednog
  meseca i automatsko obnavljanje su vidljivi nezavisno od stanja ponude.
- U lokalnom Apple opisu oba URL-a već postoje. Beleške za sledeći pregled
  sada navode konkretne korake za otvaranje oba linka.

## Šta još nije završeno

Ova promena nije u već poslatom binarnom paketu `1.1 (4)`. Novi IPA nije
napravljen, poslat, izabran u App Store Connect niti ponovo prijavljen u ovom
koraku. Lokalni testovi ne dokazuju ponašanje Safari-ja na stvarnom iPad-u.

Pre ponovne prijave:

1. Napraviti novi iOS build sa novim brojem, uz `VITE_COMMERCE_ENABLED=true`.
2. Na iPhone/iPad uređaju otvoriti „Für Eltern”, uneti 7, pa otvoriti
   „Elternbereich öffnen”. U Premium kartici proveriti oba linka i povratak u
   aplikaciju bez pokretanja kupovine.
3. Snimiti ekran iz tog novog iOS builda tokom cele provere.
4. Proveriti stvarne App Store Connect metapodatke: Privacy Policy polje,
   EULA link u opisu/EULA polju i ažurirane beleške za pregled.
5. Izabrati novi build i ponovo poslati verziju na pregled. Odgovor Apple-u
   mora navesti stvarni novi broj builda i priložen dokaz, ne obećanje.

Vlasnik je u nastavku razgovora odobrio traženi Codemagic/App Store Connect
izuzetak. Tajne nisu čitane ni menjane. U trenutnoj sesiji nije dostupan alat
za kontrolu prijavljenog browsera niti povezan Codemagic/App Store Connect
alat. Pripremljen je broj `1.1 (5)` i namenski push okidač za WortWelt granu;
pokretanje zahteva postojeći ispravan Codemagic webhook. Automatski App Review
nije uključen pre provere novog paketa i metapodataka.

## Dokazi

- Početno stanje: 60 postojećih testova prolazi.
- Reprodukcija: svih 5 novih testova prikaza pretplate pada pre ispravke.
- Posle ispravke: 66 testova u 11 fajlova prolazi; typecheck prolazi.
- Ručna, odvojena mrežna provera (nije test): javna privacy stranica vraća
  HTTP 200 i sadrži naslov „WortWelt Datenschutz”. Apple EULA stranica je
  dostupna putem pregledanja zvaničnog Apple sajta.
- Proveren je lokalni Capacitor iOS delegat: `target="_blank"` otvara URL
  preko `UIApplication.shared.open`; nije dodavan novi browser SDK.

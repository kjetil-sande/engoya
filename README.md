# Engøya · vær, tidevann og sjø

Nettsted for Engøya utenfor Ørnes i Meløy. Statisk — ingen API-nøkler, ingen byggesteg.
Nettleseren henter ferske tall direkte fra åpne, norske datakilder. Lys apple.com-stil:
varm hvit (`#F9F7F4`), grå kort (`#F5F5F7`), svarte knapper, himmelblått (`#62B1EA`/`#3E8FD0`).

## Struktur

| Fil | Innhold |
|---|---|
| `index.html` | Forsiden: dagskort-karusell, webkamera, siste nytt fra Meløy kommune |
| `tidevann.html` | Tidevannskurve + flo/fjære-tabell for uka |
| `vaer.html` | 7-dagersvarsel med 3D-værikoner |
| `sjo.html` | Bølger, strøm, vannstand + telemetri og blåskjellvarsel |
| `sol.html` | Solbue, soltider, midnattssol og UV |
| `himmel.html` | Nordlysvarsel, månefase og skydekke |
| `kart.html` | Kartverkets landkart/sjøkart + fakta om øya |
| `app.js` | All datahenting + menyen — og innstillingene (webkamera, menyfilm) |
| `style.css` | Utseendet |
| `bilder/` | Kortbakgrunner (Unsplash) — bytt ved å erstatte filene med samme navn |
| `ikoner/` | 3D-værikoner (brukes kun i Været-blokkene) |
| `netlify.toml` | Proxy-rute for nyhetene (se under) |

Menyen (vimpel + burger, à la allincentral.com) ligger i `app.js` og settes inn på alle
sidene automatisk — legg til/endre lenker i `MENU_LINKS` øverst i fila.

## Dagskortene

- Rekkefølge: Vær, Vind, Tidevann, Sol, Pollen, Hav, Himmel
- Tittel = filnavnet på bakgrunnsbildet (`tidevann`, `vind`, `hav`, `sol`, `himmel`, `pollen`)
- Bildet zoomer forsiktig inn når pekeren hviler på kortet
- **Været**-kortet er det eneste med værikon, og bakgrunnen er en værgradient som følger
  forholdene (sol → lys blå, regn → indigo, natt → marine; stoppene i `GRADIENTS` i `app.js`)
- Svart slør over bildene: 20 % fra toppen ned til ~65 %, økende til 40 % i bunnen
- «Prognoser»-knappen går til undersiden for temaet (Pollen → pollenvarslingen.no)
- Pollen-kortet viser sesongstatus (grovt, månedsbasert) — Norge har ikke noe åpent
  pollen-API, så selve nivået sjekkes hos pollenvarslingen.no

## Film i menyen

Menypanelet har en filmrute (autoplay, lydløs, loop). Legg filmen i prosjektet
(f.eks. `film/engoya.mp4`, H.264, gjerne under ~20 MB) og pek på den øverst i `app.js`:

```js
menuVideo: { url: "film/engoya.mp4" },
```

Tomt felt viser hav-bildet med «Her kommer film fra øya».

## Nyheter fra Meløy kommune

Kommunen har verken RSS eller CORS-åpne sider, så nyhetslisten hentes via en liten
proxy-rute: `/meloy-proxy/` → `meloy.kommune.no`. Den finnes to steder:

- **Lokalt**: dev-serveren (`node .claude/serve.mjs`) har ruten innebygd
- **Produksjon**: `netlify.toml` setter opp samme rute på Netlify

Feiler henting (f.eks. på en annen vert), vises en lenke til kommunens nettsted i stedet.

## Se siden lokalt

```bash
node .claude/serve.mjs
```

… og åpne <http://localhost:4173>. (Dobbeltklikk på `index.html` funker også, men da
uten nyhetslisten — den trenger proxy-ruten.)

## Legge siden på nett

**Netlify Drop**: dra hele mappa til <https://app.netlify.com/drop>. `netlify.toml`
følger med, så nyhetene virker ut av boksen. GitHub Pages funker også, men uten
nyhets-proxyen (seksjonen viser da bare lenken).

## Webkamera (Foscam)

Foscam (HD-modellene) har innebygd CGI-API. Stillbildet ligger på:

```
http://KAMERA-ADRESSE:PORT/cgi-bin/CGIProxy.fcgi?cmd=snapPicture2&usr=BRUKER&pwd=PASSORD
```

(Eldre modeller: `/snapshot.cgi?user=…&pwd=…`.) Lim adressen inn i `CONFIG.webcam.url`
øverst i `app.js`.

### ⚠ Viktig om sikkerhet

- **Alle som åpner nettsiden kan lese adressen — med brukernavn og passord.** Samme
  konto styrer hele kameraet. Direktelenke er kun greit så lenge siden bare brukes hjemme.
- **For offentlig side:** la kameraet laste opp stillbilder via **FTP** (Innstillinger →
  Network → FTP) til webhotellet, og pek `url` på det opplastede bildet.
- Lag uansett en egen **«visitor»-bruker** i kameraet — ikke bruk admin.
- `https://`-side blokkerer `http://`-bilder (mixed content) — enda en grunn til FTP.

## Datakilder og vilkår

- Vær, hav og sol: [MET / Yr](https://api.met.no) — NLOD / CC BY 4.0 (kildehenvisning i bunnteksten)
- Tidevann: [Kartverket / Se havnivå](https://www.kartverket.no/til-sjos/se-havniva) — CC BY 4.0
- Kartfliser: © Kartverket (åpen visningstjeneste)
- Nordlys (Kp): NOAA Space Weather Prediction Center
- Nyheter: [Meløy kommune](https://www.meloy.kommune.no) (kun titler og lenker)
- Blåskjell: [Mattilsynet](https://www.mattilsynet.no/mat-og-drikke/forbrukere/blaskjellvarsel) · Pollen: [pollenvarslingen.no](https://www.pollenvarslingen.no) (lenker — ingen åpne API-er)
- Foto: Unsplash · Værikoner: egne (`weather-3d-icons.ai`)

Siden er til kos og planlegging — ikke til navigasjon.

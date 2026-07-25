# Engøya · vær, tidevann og sjø

[![Netlify Status](https://api.netlify.com/api/v1/badges/25b2290a-e5dc-40de-bd92-9d6f5939347f/deploy-status)](https://app.netlify.com/projects/engoya/deploys)

Nettsted for Engøya utenfor Ørnes i Meløy. Statisk — ingen API-nøkler, ingen byggesteg.
Nettleseren henter ferske tall direkte fra åpne, norske datakilder. Lys apple.com-stil:
varm hvit (`#F9F7F4`), grå kort (`#F5F5F7`), svarte knapper, himmelblått (`#62B1EA`/`#3E8FD0`).

## Struktur

| Fil | Innhold |
|---|---|
| `index.html` | Forsiden: dagskort-karusell, siste nytt fra Meløy kommune |
| `tidevann.html` | Tidevannskurve + flo/fjære-tabell for uka |
| `vaer.html` | 7-dagersvarsel med 3D-værikoner |
| `sjo.html` | Bølger, strøm, vannstand + telemetri og blåskjellvarsel |
| `sol.html` | Solbue, soltider, midnattssol og UV |
| `himmel.html` | Nordlysvarsel, månefase og skydekke |
| `kart.html` | Kartverkets landkart/sjøkart + fakta om øya |
| `app.js` | All datahenting + menyen — og innstillingene (menyfilm) |
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

## Film i menyen (værstyrt)

Menypanelet har en filmrute (autoplay, lydløs, loop) som **bytter etter været**: sol/klarvær
→ `engoya-sommer.mp4`, ellers → `engoya-overskyet.mp4`. Valget skjer i `menuVideoFor()` i
`app.js`, basert på værsymbolet fra Yr. Klikk på filmen for å se den i **full størrelse**
(lightbox med kontroller — hele videoen spilles, med lyd hvis man skrur på).

Hele originalvideoene brukes direkte (ingen klipping). De ferdige mp4-ene ligger i `video/`
og deployes som de er; kun store råoriginaler (`.mov` / `*-ORIG.*`) er git-ignorert.

**Ny eller oppdatert film?** Bytt ut `video/engoya-sommer.mp4` (eller `-overskyet`) med den
nye fila — samme filnavn, så virker den automatisk. Web-tips: H.264/`.mp4`, gjerne
≤ 1280 px bred og komprimert (den overskyede er ~25 MB; lavere er bedre for mobil).

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

## Butikker og åpningstider (Google Places)

`butikker.html` viser butikker gruppert etter bransje med **live «åpent nå»-status** fra
Google. Henting skjer via serverfunksjonen `netlify/functions/apningstider.mjs`
(rute `/api/apningstider`), som holder API-nøkkelen skjult og mellomlagrer svaret i
5 minutter så Google-kvoten holder seg på gratisnivå.

**Engangsoppsett:**

1. [Google Cloud Console](https://console.cloud.google.com): opprett/velg prosjekt →
   aktiver **Places API (New)** → *Credentials* → lag en **API key** (begrens den gjerne
   til kun Places API). Fakturering må være aktivert på prosjektet, men med få butikker
   og mellomlagringen ligger bruken normalt godt innenfor gratiskvoten.
2. Netlify: *Project configuration → Environment variables* → legg til
   `GOOGLE_PLACES_KEY` = nøkkelen → **Deploy** på nytt.
3. Lokalt: lag `.env.local` (git-ignorert) i prosjektmappa med
   `GOOGLE_PLACES_KEY=nøkkelen`.

**Legge til butikker:** fyll `BUTIKKER`-lista øverst i
`netlify/functions/apningstider.mjs` med `{ bransje, navn, placeId }`. Place-ID finner
du med [Googles Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
— eller send navnelisten til Claude, så slås de opp.

## Datakilder og vilkår

- Vær, hav og sol: [MET / Yr](https://api.met.no) — NLOD / CC BY 4.0 (kildehenvisning i bunnteksten)
- Tidevann: [Kartverket / Se havnivå](https://www.kartverket.no/til-sjos/se-havniva) — CC BY 4.0
- Kartfliser: © Kartverket (åpen visningstjeneste)
- Nordlys (Kp): NOAA Space Weather Prediction Center
- Nyheter: [Meløy kommune](https://www.meloy.kommune.no) (kun titler og lenker)
- Blåskjell: [Mattilsynet](https://www.mattilsynet.no/mat-og-drikke/forbrukere/blaskjellvarsel) · Pollen: [pollenvarslingen.no](https://www.pollenvarslingen.no) (lenker — ingen åpne API-er)
- Foto: Unsplash · Værikoner: egne (`weather-3d-icons.ai`)

Siden er til kos og planlegging — ikke til navigasjon.

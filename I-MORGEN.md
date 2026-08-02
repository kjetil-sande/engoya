# Neste bolk

Samlet opp gjennom natta 1.–2. august. Pushes i én bolk for å spare
Netlify-byggeminutter.

---

## 1. Snella slipper på Android — BUG, høyest prioritet

Rapportert av eierens bror på Android/Chrome: en bitteliten fingerbevegelse mens
man sveiver, og snella stopper. Han holder knappen hele tiden.

**Årsak, funnet:** [fiske.html:4466](fiske.html:4466)

```js
window.addEventListener("pointercancel", up);   // slipper SVEIV
```

`pointercancel` fyrer på Android Chrome i det nettleseren bestemmer seg for at
bevegelsen er en rulling — det skjer etter noen få piksler. Det globale
`touch-action:manipulation` ([:31](fiske.html:31)) tillater fortsatt panorering,
så nettleseren har lov til å ta gesten.

**Fiks:**
1. `touch-action:none` på `#actionBtn` (ikke globalt — resten av UI-et skal
   fortsatt kunne rulle).
2. `setPointerCapture(e.pointerId)` i `down()`, så pekeren blir bundet til
   knappen selv om fingeren glir utenfor.

**NB:** `pointercancel`-linja skal ikke bare slettes. Den redder deg når
nettleseren *faktisk* avbryter (innkommende anrop, app-bytte). Med
pointer capture skal den slutte å fyre på vanlig fingerbevegelse — det må
verifiseres på en ekte Android, ikke bare i emulator.

---

## 2. De fem som ringer

Ferdig designet og motprøvd — se [PLAN-TELEFONEN.md](PLAN-TELEFONEN.md).
Rytmen er alt bygd og pushet (havtidsklokke, innseilingsfred, døgntak, fred
rundt tap, stille etter kl. 21). Det som gjenstår er selve stemmene: Kjell,
Odd, Ingrid, Rusten og Solveig.

Kona er forkastet etter enighet med eieren.

Merk regel 6 i planen: innboksen tåler ikke fremmede avsendere. Kjell og Rusten
må ringe uten `innLegg()`.

---

## 3. Slingredemparen — 12 000 kr

Spesifisert i [PLAN-TELEFONEN.md](PLAN-TELEFONEN.md). Treffer `tRise`
([:1823](fiske.html:1823)) med faktor 0,75. Kveita går fra 9,2 til 12,3
sekunders sammenhengende hold; torsken fra 29 til 39 og spilleren merker det
ikke, for han når aldri taket. Effekten treffer altså storfisken på Dypt og
Djuphavet av seg selv, uten en eneste `if(depth…)`.

**Fella:** `P.demper` må inn i FEM lagringssteder, ellers forsvinner et kjøp på
12 000 kr stille ved neste synk mellom to telefoner. Stedene er listet i planen.

---

## 4. Djuphavet lønner seg dårligere enn Dypt

Målt med 40 000 simulerte nattsett mot den ekte koden:

| sone | 3 kroker | 10 kroker | storfisk |
|---|---|---|---|
| Dypt | 1 781 kr | 5 054 kr | 8,0 % |
| Djuphavet | 772 kr | 2 383 kr | 11,7 % |

Djuphavet er den eneste sona som krever vinsj og dyphavsrigg, og den betaler
halvparten. Årsaken er artslistene i `lineOutcome`: Djuphavet trekker fra
hågjel, svarthå, havmus og skate, som er billige eller fredet.

**Eierens avgjørelse mangler:** skal den dyreste sona også lønne seg, eller er
det riktig at Dypt er pengene og Djuphavet er jakten?

---

## 5. Fiskeren kan holde opp arten du faktisk fikk

Hånden er ledig nå som 03 er tegnet om til tommel opp. Sprite-ene finnes per
art. Koden kan tegne den ekte fisken i neven — riktig art, riktig størrelse.
Da blir håbrannen en håbrann.

Krever at man løser skaleringen: en håbrann er to meter, en sei femti
centimeter.

---

## 6. Småting

- `skrei.png` mangler fortsatt — fisken faller tilbake på torskespriten.
- `sms-telefon-v2.png` og `sms-bunnstrek-v1.png` ligger ubrukt i assets.
- `vannoverflate-rolig.png` og `-bolger.png` ligger ubrukt. Bølgebåndet ble
  bygd og forkastet 2. august — eieren så det live og likte det ikke.
- Kjent, men urørt: `MAKS_ARTER = 40` med 37 arter; troféer synkes aldri;
  `sluppet` lagres ikke på serveren; `body.fjern` sletter enhver fangstbok som
  bare har familiekoden; spillets tidevann er ikke faseforankret til Meløy.

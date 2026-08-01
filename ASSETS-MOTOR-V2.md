# Asset-spesifikasjon — lagdelt sjø (motor v2)

Grunnprinsippet: **alt kakler vannrett, alt skalerer loddrett.** Da slutter skjermbredden
å bety noe. Samme sett dekker en 320 px telefon i stående og en laptop i liggende, uten
beskjæring og uten egne varianter per format.

I dag: 15 filer, 130 megapiksel, 4,8 MB. Største enkeltbilde er 1600×10090 = 16,1 MP, og
85 % av det er en flat fargerampe. Foreslått: 4,2 MP fordelt på filer som alle er under
1 MP — **31 × mindre å dekode.**

---

## Lag 1 — Himmel

`himmel-{dag,skumring,natt}.png` — **512 × 768**, sømløs venstre↔høyre.

Kakles vannrett så mange ganger det trengs. 768 px høy dekker 1:1 på en 900 CSS-px høy
skjerm ved DPR 2 (himmelen tar ca. 40 % = 720 px).

- Må være **sømløs**: høyre kantkolonne skal møte venstre kantkolonne uten skjøt.
  Test: legg to kopier ved siden av hverandre og se etter en loddrett strek.
- Ingen skyer i dette laget — de kommer som frittstående sprites (lag 1b).
- Nederste ~64 px toner ned til en nøytral horisontdis, så laget kan møte sjøflata
  ved hvilken som helst skalering.
- Pikselrutenett, harde kanter, ordnet dithering, begrenset palett — som resten.

## Lag 1b — Skyer

`sky-01.png` … `sky-06.png` — hver **128–384 px bred × 48–128 px høy**, alfa.

Frittstående, driver vannrett i ulik fart for parallakse. Lag dem i **nøytralt lyst grått**
— koden tinter dem varme i solnedgang og kalde om natta, så du slipper tre sett.

## Lag 2 — Horisont-silhuett

`horisont.png` — **2048 × 320**, alfa. Én fil.

Fjellene og skjærene i det fjerne. Denne kakler *ikke* — den er scenens identitet.
Foten skal ligge nøyaktig på vannlinja (nederste pikselrad = vannlinje).
Tegn den i én tone; koden legger på avstandsdis og døgnfarge.

## Lag 3 — Sjøflate

`sjoflate-{dag,skumring,natt}.png` — **512 × 384**, sømløs venstre↔høyre.

Båndet båten ligger i. Inneholder selve vannlinja, bølgeteksturen rett under, og glimtene.
Dette er de viktigste 100 pikslene i spillet — behold dem som kunst.

- Vannlinja skal ligge på **en fast pikselrad du oppgir** (foreslår rad 96 av 384), så
  koden slipper å måle seg fram slik den gjør i dag.
- Over vannlinja: gjennomsiktig (himmelen ligger bak).
- Under vannlinja: bølgetekstur som toner mot gjennomsiktig nederst, så vannsøyla
  (lag 4, kode) tar over sømløst.
- **Døgn og vær håndteres i kode oppå disse tre**: varmere tint i solnedgang, lysere
  ved fullmåne, gråere i snøstorm. Du trenger ikke lage varianter for det.

## Lag 4 — Havet

**Ingen filer.** Loddrett gradient fra overflatefargen til dypfargen, per sone, tegnet i
kode. Lysstråler, bobler, ambient-fisk og maneter ligger allerede der.

Sonedybden blir et tall i stedet for 10 000 piksler. Det er her hele gevinsten ligger.

## Lag 5 — Bunn

`bunn-{grunt,mellomdyp,dypt,djuphavet}.png` — **768 × 448**, sømløs venstre↔høyre.

Selve bakken og teksturen. Kakles vannrett.

- **Ingen døgnvarianter under Grunt.** Havbunnen på 400 meter er like mørk klokka to om
  natta som klokka to om dagen — det bekreftet du selv. Grunt får døgnfarge på i kode.
- Øverste ~48 px toner mot gjennomsiktig, så bunnen smelter inn i vannsøyla.

## Lag 5b — Rekvisitter

`rekvisitt-ark.png` — **512 × 512**, alfa, rutenett på 128 × 128 (16 ruter).

Tare, tang, steinblokker, anemoner, skjell, vrakrester. Koden strør dem utover bunnen
med en frø-basert plassering per sone.

Dette er den skjulte gevinsten: **bunnen ser ulik ut hver gang**, i stedet for å være ett
fast maleri. Ett lite ark gir uendelig variasjon.

---

## Hva dette rydder opp i

Vannlinja går fra å være en målt brøk (`WLF`, `HIMMEL`, `settWLF`) til et tall du bestemmer.
Mesteparten av geometrifiklingen — båtklippingen, `BUNNFRAC`, manet- og ambientklemmene,
teinetauene, kamerahjemposisjonen — henger i dag på at bakgrunnen er *ett* bilde med
ukjente proporsjoner. Med lag blir hvert av disse en konstant.

## Rekkefølge

1. Himmel + sjøflate + horisont først. Da kan Grunt tegnes lagdelt mens de tre andre
   sonene fortsatt bruker dagens bilder — begge veier kan leve side om side.
2. Vannsøyla i kode. Nå forsvinner de store filene for Dypt og Djuphavet.
3. Bunn + rekvisitter.
4. Slett de gamle `nedstigning-*`-filene til slutt, ikke først.

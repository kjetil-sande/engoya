# Prompter — områdekartet og øya

**BYGD 4. aug:** `openMap()` er skrevet om — havet tegnes nå i KODE (dybdefelt formet rundt
feltene, spillets fargerampe, animert gyllent solglitter), og øyene er sprites som limes
oppå. Verifisert i nettleseren. De gamle `spill-omraade-kartvelger-lvl*.png` brukes ikke.

**Det som gjenstår er å lagre de fem utklipte spritene** (magenta fjernet, transparent
bakgrunn) i `spill/assets/` med NØYAKTIG disse navnene — da dukker de opp av seg selv,
med fallback-holmer frem til da:

`kart-saltvaer.png` · `kart-kvitholmen.png` · `kart-tralsund.png` · `kart-svartrenna.png` · `kart-blindbaaen.png`

Test i spillet: åpne `fiske.html#kart` (dev-snarvei; Fiskekart-knappen er egen bolk).
Tåka er også kode: låste felt tegnes som silhuett med «?» — ingen lvl-varianter trengs.

---

## 1. Navnene

Sonene heter i dag Grunt / Mellomdyp / Dypt / Djuphavet — beskrivelser, ikke steder.
Ingen sier «jeg står på Mellomdyp». De sier navnet på skjæret de ligger ved.

### Øya

**Saltvær** — anbefalt. «Vær» er den ekte nordlandsendelsen for et fiskevær (Røstvær,
Træna), og salt er både sjø og konservering. Kort nok til å stå i en knapp.

Alternativer om du vil ha noe annet i munnen: **Kvitvær** (lysere, mer værhardt) eller
**Bårdsøya** (mer gard enn vær).

Her bor fiskeren. Her ligger Rustens butikk, Kjells verksted og Målfrids kontor.
Det hvite huset i `omraade-a-midtgrunn-oya-med-det-hvite-huset.png` er samme øy sett
fra sjøen — kartet skal kjennes igjen mot den.

### De fire fiskeplassene

| i dag | nytt navn | dybde | hva navnet forteller |
|---|---|---|---|
| Grunt | **Kvitholmen** | 0–50 m | hvite skjell og tang, rett utenfor havna |
| Mellomdyp | **Trålsund** | 50–150 m | sundet mellom to holmer, straumen står |
| Dypt | **Svartrenna** | 150–300 m | renna der lyset slutter |
| Djuphavet | **Blindbåen** | 300–500 m | båe = grunne du ikke ser før du står på den |

Navnene er valgt så de **stiger i alvor** når du leser dem ovenfra og ned. Et barn som
hører «Blindbåen» skjønner at det er lenger ut enn Kvitholmen, uten at noen har forklart det.

**AVGJORT 4. aug: Uthavet.** (Havgapet vraket som for enkelt; eieren ville ha «-havet»-endelse.) Kandidatene (bytt = én linje i `KART.felt` + pin-tittelen + CSS):
Uthavet · Ytterhavet · Storhavet · Villhavet · Trollhavet · Draughavet · Ødehavet ·
Gråhavet · Svarthavet · Aldrihavet. Et «-havet»-navn løfter dessuten fjerdeplassen fra
*sted* til *strøk* — de tre første er steder du drar TIL, det fjerde er havet du drar UT I.

### Reservert — ikke bruk til noe annet

**Eggakanten** (kjøpbart femte nivå, 500–1000 m), **Bankene** (skreifeltet),
**Rekefeltet** (trål), **Vraket** (funnfelt), **Kåres mèd** (flyttende pin).
Merk: plandokumentet brukte Eggakanten som fjerde sone. Den er nå låst til premium —
derfor Blindbåen på plass fire.

---

## 2. Kartbildet

Fil: **`spill-omraade-kartvelger-lvl3.png`** — **1320 × 990** (4:3, 2× av kortets 660 px).
De to andre nivåene er samme bilde med mer tåke, se punkt 3.

### Formen

Isometrisk, 45 graders vinkel — samme blikk på alle øyene, som et brettspill sett fra
skrått ovenfra. **Saltvær ligger i midten og er desidert størst.** De fire plassene
ligger rundt, og jo lenger ut, jo mørkere blir sjøen under dem.

Dybden leses som **farge**, ikke som streker: lys grønnturkis inntil land, mørkere
utover, nesten svart ytterst. Da ser spilleren hva et sted koster i mot og drivstoff
før noen har skrevet et tall.

Ikke sjøkart på papir. Det ble prøvd først, og ga flat kartgrafikk med svarte
konturlinjer — det motsatte av koselig. Dette er et sted, ikke et dokument.

### Plasseringene — dette er det viktigste

Nålene er HTML-knapper som legges oppå bildet i prosent. Øyene **må** ligge her, ellers
treffer ikke klikkflatene:

| sted | x (%) | y (%) | bredde (%) | kanner |
|---|---|---|---|---|
| **Saltvær** (heim) | 42 | 12 | **42** | — |
| Kvitholmen | 28 | 27 | 14 | 1 |
| Trålsund | 74 | 41 | 18 | 2 |
| Svartrenna | 30 | 62 | 11 | 3 |
| **Uthavet** (før: Blindbåen) | 74 | 78 | 15 | 4 |
| Bankene — TEASER | 40 | 88 | 14 | (kartblad kommer) |
| Rekefeltet — TEASER | 22 | 93 | 14 | (reketråler kommer) |

Teaserne vises KUN med «?» — verken navn, tooltip eller hintmelding røper Bankene/Rekefeltet.
Svartrenna har avlang, skråstilt dybdebrønn (ekte renne). Sprite-kanter glorievaskes ved
lasting: alfaterskel + magentafjerning + 1 px erosjon.

**OMBYGD 4. aug til HØYT format 1320 × 1848 (5:7):** Saltvær øverst, avstanden nedover
≈ kannekostnaden. Store «?» midt på uoppdagede felt, navnet under i 48px (≥13 pt på mobil),
bensinkanner under navnet på åpne felt. Teaser-feltene kan aldri velges — klikk gir en
frist-melding; de venter på kart-bankene.png og kart-rekefeltet.png (fallback-holme til da).
**Leia:** valgt felt tegner en animert stiplet kurs fra havna, vestom Kvitholmen, i S forbi
Trålsund og nedover (`kartLeiTil` i fiske.html). Forhåndsvisning: `fiske.html#kartalle`.
Fasiten bor i `KART.felt` i fiske.html — denne tabellen er et speil.

**Saltvær skal være desidert størst** — 42 % av bildebredden, tre til fire ganger de
andre. Det er hjemmet; alt annet er noe du drar ut til.

Avstanden fra Saltvær koder dybde: Kvitholmen nærmest, så Trålsund, og Svartrenna og
Blindbåen ytterst i hver sin ende. Da leser spilleren rekkefølgen uten at noen har
skrevet et tall.

Hver plass trenger ~15 % bredde å bli klikket på, så **hold minst 18 % luft mellom
nålene**. Ingen viktig detalj i ytterste 5 % av bildet — hjørnene rundes med 10 px radius.

### Prompten — ETT bilde per motiv, ikke ett bilde totalt

**Første forsøk gikk galt, og feilen var promptens.** Én prompt ba om øya, fire
fiskeplasser, dybdebånd og gammelt papir på én gang. Fem motiver deler oppmerksomheten,
og modellen tegner da det enkleste den slipper unna med: hus på fire piksler, svarte
konturlinjer, øyer som svever. «Banded chart contours» ble til vannrette striper tvers
over hele bildet i stedet for ringer rundt øya, og «sea chart on aged paper» dro alt mot
flat kartgrafikk — det motsatte av koselig.

Prompt-fila for fiskerne virker fordi hver prompt beskriver **ett** motiv. Kartet bygges
på samme måte, og det passer dessuten [ASSETS-MOTOR-V2.md](ASSETS-MOTOR-V2.md): sjøen som
bunnlag, øyene som frittstående sprites lagt oppå i de koordinatene tabellen krever. Da
kan én øy tegnes om uten å røre resten, og plasseringen blir eksakt i stedet for tilfeldig.

Alle seks er under Firefly-grensen og fri for west/east.

### De fem faste linjene — står ordrett i alle fem øy-prompter

Disse er destillert av ni runder med ekte Firefly-forsøk. **Samme ordlyd hver gang;
ikke omformuler dem.**

1. Stil (filterkravet): `Retro video game pixel art style.`
2. Kamera (erstatter «isometric», som ga diorama-fliser):
   `High three-quarter aerial view with a strong sense of depth and elevation.`
3. Lys (varmen, uten lilla støp):
   `Warm golden northern light from the upper left, long soft shadows.`
4. Ramme — DEN VIKTIGSTE: magentaen starter VED SKUMKANTEN, ingen sjøflate utenfor:
   `Only a narrow band of water and white foam hugs the subject; immediately beyond the foam the entire background is flat solid magenta on all four sides, one single colour, completely empty, and nothing touches the image edge.`
5. Naturform: `An irregular organic natural form — no square base, no square patch of sea, no diorama tile, no flat platform.`

Havbakgrunnen er unntatt 2, 4 og 5 — den er rett ovenfra og fyller hele flaten.

**Hvorfor linje 4 er hellig:** den beste Saltvær-en kom fra en prompt der magentaen
startet ved skummet. Alle tre firkant-fiaskoene kom fra prompter som lot modellen tegne
åpen sjø rundt motivet — innrammet sjø blir en firkantet plate, hver gang. Havet ligger
uansett i sitt eget bunnlag som øyene limes oppå. Skriv ALDRI «surrounded by calm
water», «in the sea» eller «rising from open water».

### Fargene — låst til spillets egen sjø

Spillets vanngradient går fra `#5F9AA0` i overflaten til `#123A47` i dypet
([fiske.html:4639](fiske.html:4639)). Kartet bruker samme rampe, så det ser ut som samme
hav du fisker i:

| dybde | farge | hvor |
|---|---|---|
| grunt | `#7FB6B4` | rundt Saltvær og Kvitholmen |
| mellom | `#5F9AA0` | Trålsund — spillets overflatefarge |
| dypt | `#2E5F6B` | Svartrenna |
| djup | `#123A47` | Blindbåen — spillets dypfarge |
| skum | `#E6EFEC` | alle — kjølig off-white, ikke krem |
| grus | `#C9BCA6` | Kvitholmen |
| stein | `#7C7F86` | Trålsund og Svartrenna |

**`kart-saltvaer.png`** — hovedmotivet, desidert størst på kartet (1021 tegn)

> Retro video game pixel art style. Steep island rising to a green knoll at one end, a white lighthouse, red top; grass ledges tier down to a wide bay; a short boulder breakwater juts from one headland, under a third of the bay mouth, the rest open water joining the outer foam. Seven buildings, warm lamplit windows: white house, shop, boatyard, red boathouse, three timber houses. Stockfish racks, two moored boats. High three-quarter aerial view with a strong sense of depth and elevation. Warm golden northern light from the upper left, long soft shadows. Only a narrow band of water and white foam hugs the subject; immediately beyond the foam the entire background is flat solid magenta on all four sides, completely empty, nothing touching the image edge. An irregular organic natural form — no square base, no square patch of sea, no diorama tile, no flat platform. Water #7FB6B4, foam #E6EFEC. No purple or pink cast, no stones closing the bay, no enclosed pool. Heavy ordered dithering, no anti-aliasing, no text.

**`kart-kvitholmen.png`** (1022 tegn)

> Retro video game pixel art style. A small low islet of sun-warmed pale crushed shells and light gravel #C9BCA6, one irregular ledged ridge climbing from a wide shell bank to a clear highest point, sunlit and shaded sides. High three-quarter aerial view with a strong sense of depth and elevation. Dry grass tufts on the crown, two dark lichen-patched stones, brown kelp swaying in the clear shallow rim of water #7FB6B4 over faint sand, soft foam edge #E6EFEC. Warm golden northern light from the upper left, long soft shadows. Only a narrow band of water and white foam hugs the subject; immediately beyond the foam the entire background is flat solid magenta on all four sides, one single colour, completely empty, and nothing touches the image edge. An irregular organic natural form — no square base, no square patch of sea, no diorama tile, no flat platform. Heavy ordered dithering for texture and shading. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text. No purple or pink cast, no tropical colours.

**`kart-tralsund.png`** (1020 tegn)

> Retro video game pixel art style. Two small steep rocky islets split by a narrow strait of streaming water #5F9AA0, swirling eddies and rippling current lines, white foam #E6EFEC lapping both shores. Sun-warmed grey rock #7C7F86 rises steeply in cracked ledges and stepped crags, dark green moss and pale lichen on the heights, golden grass, two windblown pines and an old iron mooring ring in the cliff. High three-quarter aerial view with a strong sense of depth and elevation. Warm golden northern light from the upper left, long soft shadows. Only a narrow band of water and white foam hugs the subject; immediately beyond the foam the entire background is flat solid magenta on all four sides, one single colour, completely empty, and nothing touches the image edge. An irregular organic natural form — no square base, no square patch of sea, no diorama tile, no flat platform. No purple or pink cast. Heavy ordered dithering for texture and shading. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text.

**`kart-svartrenna.png`** (1023 tegn)

> Retro video game pixel art style. Svartrenna, a lone wet black crag, a real Norwegian outcrop, steep and crooked, rising in uneven shelves to a tilted summit, glistening warmly, cracks, orange and grey-green lichen, white bird droppings, a leaning corroded iron rod on top, one plump seabird on it. High three-quarter aerial view with a strong sense of depth and elevation. Warm golden northern light from the upper left, long soft shadows. An irregular organic natural form — no square base, no square patch of sea, no diorama tile, no flat platform. Dithered deep #2E5F6B water, thin #E6EFEC foam lapping the stone. Only a narrow band of water and white foam hugs the subject; immediately beyond the foam the entire background is flat solid magenta on all four sides, one single colour, completely empty, and nothing touches the image edge. No purple or pink cast, no violet or indigo cast, not a flat disc. Heavy ordered dithering for texture and shading. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text.

**`kart-blindbaaen.png`** (1021 tegn)

> Retro video game pixel art style. A hidden reef under the surface: a pale ridged rock mass, humped spine, ledges glowing warm #C9BCA6 and #7FB6B4 through clear water, sinking through #5F9AA0 into a narrow ragged dithered rim of deep #123A47 water. High three-quarter aerial view with a strong sense of depth and elevation. A ring of white breaking water and boiling foam #E6EFEC churns over the crest, with scattered spray and sunlit wavelets. Warm golden northern light from the upper left, long soft shadows. Only a narrow band of water and white foam hugs the subject; immediately beyond the foam the entire background is flat solid magenta on all four sides, one single colour, completely empty, and nothing touches the image edge. An irregular organic natural form — no square base, no square patch of sea, no diorama tile, no flat platform. Heavy ordered dithering for texture and shading. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text. No purple, pink, violet or indigo cast, no land above water.

**`kart-havet.png`** — UTGÅTT 4. aug: havet tegnes i kode (se toppen). Prompten beholdes
som referanse for fargene og stemningen koden sikter mot (929 tegn)

> Retro video game pixel art style. A cosy, richly detailed open ocean texture seen directly above, filling the whole frame edge to edge with nothing but water. The colour deepens gradually and organically from shallow #7FB6B4 through #5F9AA0 and #2E5F6B down to deep #123A47, in soft irregular patches shaped like natural shoals, sandbanks and deeper channels, never in straight bands. Warm golden northern light from the upper left makes the whole surface glitter with scattered warm glints and small sparkling highlights, like calm late-summer light on a northern sea, and small dithered ripples suggest gentle movement everywhere. Fresh, warm, saturated, inviting colours. No land, no islands, no boats, no objects, no magenta, no border, no frame. No horizontal stripes, no contour lines, no purple or pink cast. Heavy ordered dithering for texture and shading. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text.

**Blindbåen:** har fortsatt ingen landkant — lim den inn med myk viskelærkant i
stedet for hard nøkling om skjøten synes. Vann mot vann skjuler seg selv.

### Feilhistorikken — ni runder, ni lærdommer

Alt under har faktisk skjedd i Firefly. Neste tråd: ikke gjenta dem.

1. **Alt-i-ett-kartet** ga fire-pikslers hus og vannrette fargestriper → ett bilde per motiv.
2. **Kunstnernavn-filteret** slår på enkeltord som også er etternavn: west, east, rose,
   holm, skerry, beacon, «rust red», «bone white». Himmelretninger beskrives relasjonelt.
3. **«Limited 32-colour palette»** gjorde landskap flate → «densely detailed», fritt fargeantall.
4. **«Warm low evening sunlight»** alene ga lilla middelhavsstøp → varmen ligger nå i den
   faste lyslinjen + «no purple or pink cast».
5. **«Muted and desaturated»** støvet ned alt → strøket for godt.
6. **Steinring rundt hele øya** gjorde havna til et lukket basseng → molo fra ÉN strand.
7. **«Isometric view»** ga firkantede diorama-fliser på sokkel, to ganger → ordet er
   bannlyst; kameralinjen sier «high three-quarter aerial view».
8. **Flat som Danmark** → terrenget må STIGE i prompten (knaus, fyrtårn, avsatser) —
   vinkel alene gir ingen høyde.
9. **Viktigst: åpen sjø rundt motivet blir en firkantet plate.** Tre ganger, senest under
   et ellers perfekt fyrtårn-bilde. Løsningen som beviselig virket: magentaen starter ved
   skumkanten (den faste rammelinjen). Kutt av dithering-linjen ga samtidig flate
   fargeflater — teksturhalen skal alltid med.

### Sammensettingen

Legg `kart-havet.png` som bunn, og de fem øyene oppå i koordinatene og breddene fra
tabellen. Da treffer klikkflatene, dybden stemmer med hvor øya ligger, og du kan bytte
ut én øy uten å generere alt på nytt.

**Pikselrutenettet er fella her.** Alle fem genereres like store, men skal ligge i
vidt forskjellig størrelse på kartet. Skalerer du Kvitholmen ned til 185 px med vanlig
interpolering, blir pikslene hennes fire ganger mindre enn Saltværs — og da ser hun ut
som et fotografi ved siden av pikselkunst.

Oppskriften, per øy:

1. Skalér ned til målbredden med **nærmeste nabo** (nearest neighbour), aldri bilineær.
2. Er den fortsatt for finkornet: skalér ned til en firedel av målbredden, og så opp
   igjen ×4 med nærmeste nabo. Pikslene blir grove igjen, detaljene forsvinner — og
   det er riktig. En liten holme på kartet *skal* ha færre detaljer enn hjemøya.
3. Saltvær beholder mest oppløsning, siden den er størst. Den setter standarden de
   andre må matche.

Vil du heller ha ett ferdig bilde: be om Saltvær-prompten alene, og lim de fire andre
inn i den etterpå. Resultatet blir det samme, men da bestemmer du komposisjonen.

**Ikke skriv «north-west» eller «north-east» inn i noen av dem.** Se neste avsnitt.

### Fireflys kunstnernavn-filter — det vi vet

Firefly avviste prompten med *«inkludering av kunstnernavn … oppfyller ikke våre
brukerretningslinjer»*. Filteret slår på **ett enkelt ord** som også er et etternavn hos
en kunstner — ikke på motivet, og ikke på helheten.

Eieren halverte prompten og fant setningen: *«Around it in open water, four fishing marks:
a pale shell-covered islet to the north-west; a narrow sound between two rocky islets to
the north-east;»*

**Sannsynlig synder: «west» og «east».** Benjamin West og Alfred East er begge ekte
malere. Det passer med at *«south-facing harbour»* tidligere i samme prompt slapp gjennom
— himmelretninger i seg selv er greit, det er de to som er navn.

Derfor: **ingen himmelretninger med west/east i noen prompt til dette spillet.** Beskriv
plasseringen relasjonelt i stedet (nearest, beyond, farthest out). Det koster ingenting,
for de eksakte posisjonene settes uansett i bildebehandleren — koordinatene i tabellen
over må treffe klikkflatene på pikselen, og det klarer ingen bildegenerator.

Fjernet av samme grunn, uten at de er bekreftet skyldige: compass **rose**, **holm**,
**skerry**, **beacon**, **rust** red, **bone** white. Legg dem gjerne tilbake én om
gangen hvis du vil vite hvilke som faktisk var i veien.

I tillegg står «Retro video game pixel art style» først, fordi feilmeldingen uttrykkelig
ber om en kunststil.

**Bekreft hypotesen på ett minutt** — kjør disse to og se hvilken som avvises:

> Retro video game pixel art style. A pale shell-covered islet to the north-west, in 16-bit pixel art.

> Retro video game pixel art style. A pale shell-covered islet nearest the harbour, in 16-bit pixel art.

Avvises den første og ikke den andre, er «west» bekreftet, og vi vet det for alle
framtidige prompter i spillet.

**Nødvariant (786 tegn)** — den gamle alt-i-ett-prompten med all sjøkart-sjargong ute.
Beholdt bare som filter-referanse: den slipper gjennom, men gir det flate resultatet
som er beskrevet over. Bruk de seks lagprompten i stedet.

> Retro video game pixel art style. Top-down map of a small northern island group in the sea. Centre: one small island with a harbour, stone quay, painted timber houses, a red boathouse, two moored fishing boats, low pine and bare grey rock. Around it in open water lie four smaller spots: a pale shell-covered islet; a narrow channel between two rocky islets; a black rock with a tilted iron marker; and a submerged reef shown only by a ring of breaking white water. Water depth is drawn as banded contours stepping outward from pale turquoise through green-blue and deep blue to near-black. Cool slate, sea-green, oxide red, off-white. Strict pixel grid, hard-edged pixels, no anti-aliasing, no gradients, ordered dithering only, limited 32-colour palette. No text, no labels, no lettering.

**Finne synderen selv:** kjør første halvdel av prompten alene. Går den gjennom, ligger
ordet i andre halvdel. Halver igjen. Fire–fem forsøk, så har du det — og da vet vi det
for alle senere prompter i spillet.

Kuttet for lengdens skyld, i denne rekkefølgen om du får plass igjen: lyngen på øyryggen,
de blyanttegnede dybdetallene og «very slightly oblique». Ingen av dem bærer bildet.

### Hvorfor ingen tekst i bildet

Stedsnavnene tegnes av spillet oppå kartet. Piksel-tekst blir uleselig på 320 px, kan
ikke endres uten å tegne bildet på nytt, og låser navnene for godt. Vil du likevel ha
håndtekstede navn i papiret, be om samme prompt med *«hand-lettered place names in a
period nautical hand»* — men da må navnene være spikret først.

---

## 3. De tre nivåene

Samme kart, tre grader av tåke. Spilleren ser verden åpne seg etter hvert som stanga
blir bedre — det er halve gleden.

**Generer bildet ÉN gang.** `lvl1` og `lvl2` lages ved å legge tåke oppå `lvl3` i en
bildebehandler (eller Fireflys generative fyll på et utvalg) — aldri ved å kjøre prompten
tre ganger. Kjører du den på nytt, får du tre forskjellige skjærgårder, og øyene flytter
seg under nålene når spilleren går opp et nivå.

- **`-lvl3.png`** — hele kartet klart. Bildet over.
- **`-lvl2.png`** — Blindbåen ligger under **tett sjøtåke**: en myk grå-hvit dis som
  eter det nederste venstre hjørnet, med bare en anelse hvitt brenningsskum synlig gjennom.
- **`-lvl1.png`** — både Svartrenna og Blindbåen under samme tåke. Kvitholmen og
  Trålsund står klart.

Tåka skal være **dithered i samme palett**, ikke en glatt gradient — ellers bryter den
med resten av spillet. Legg den som eget lag i kildefila, så kan den flyttes senere.

Alternativ, hvis du heller vil ha ett bilde: la alt stå klart og gjør de låste plassene
grå i kode. Enklere, men mister følelsen av at havet er større enn du har sett.

---

## 4. Hva som må endres i koden når bildene kommer

Ingenting for at kartet skal *virke* — filnavnene stemmer allerede. Men fire småting
gjør det ferdig:

1. **Fjerde nål mangler.** [fiske.html:965](fiske.html:965) har `data-d="0/1/2"`.
   Blindbåen trenger `<button class="mappin" data-d="3" title="Blindbåen"></button>`.
2. **Koordinatene** i [fiske.html:703](fiske.html:703) må settes til tabellen over.
3. **`ZONE`** ([fiske.html:1312](fiske.html:1312)) bytter til de nye navnene. Den brukes
   i fangstboka og i teinene, så navnene dukker opp overalt av seg selv.
4. **`openMap()` har ingen som kaller på seg.** Fiskekart-knappen som erstatter
   `#depthsel` er den som slår den på — egen bolk.


---

## 4. Kartknapp-ikonet

`spill/assets/knapp-kart.png` — kvadratisk, vises 42 px i kastraden. Det kodetegnede
ikonet fra 4. aug er midlertidig; generer og overskriv med samme filnavn. Motiv: foldet
kart i sikksakk med stiplet rute og rød X (eierens referanse). Nøkle ut magentaen som
vanlig — glorievasken i spillet tar kantene. (675 tegn)

> Retro video game pixel art style. A single game icon: a folded paper chart standing slightly open, three vertical panels in a zigzag fold. Cream paper with thin dark outlines, small teal water shapes and a simple coastline drawn on the panels, a dashed dark route line winding across all three panels and ending at a bold red X. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading on the folds. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.


---

## 5. Goodie-posen

`spill/assets/pose-rusten.png` — Rustens papirpose på bestillingslappen (vises ~52 px).
Kodetegnet placeholder ligger inne; generer og overskriv med samme filnavn, nøkle ut
magentaen som vanlig. (635 tegn)

> Retro video game pixel art style. A single game icon: a small brown paper grocery bag, slightly crumpled and standing upright, top edge folded over once. A hand-torn yellow note sticks up from inside the bag. Simple handwritten-style dark scribble across the front of the bag, unreadable. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading on the folds. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.


---

## 6. Saltvær-landsbyen — zoomet utsnitt (klikkbart Saltvær)

`spill/assets/saltvaer-landsby.png` — vises når man trykker på Saltvær i kartet.
Skiltene er SYMBOLER (fisk hos Rusten, propell hos Kjell) — tekst på skilt blir
grøt i Firefly, og spillet kan legge navn oppå senere. (1004 tegn)

> Retro video game pixel art style. High three-quarter aerial view with a strong sense of depth and elevation. Warm golden northern light from the upper left, long soft shadows. A cosy Norwegian fishing village on a green rocky islet: a bait shop with a hanging sign showing a painted fish, a workshop with a sign showing a propeller, an old house with tall windows, a few weathered wooden homes, thin smoke from one chimney, a small red boathouse at the waterline, a wooden fishing boat at a stone pier, drying racks, gulls, and a small cat on the pier licking its paw. Densely detailed, warm and lived-in, no purple or pink cast. An irregular organic natural form — no square base, no diorama tile, no flat platform. Only a narrow band of water and white foam hugs the islet; immediately beyond the foam the entire background is flat solid magenta on all four sides, one single colour, completely empty, and nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text.

### Flere varianter å prøve (6. aug) — samme faste linjer, ulik komposisjon

**Variant B — med fyrtårnet (matcher kartsprite-identiteten)** (1000 tegn):

> Retro video game pixel art style. High three-quarter aerial view with a strong sense of depth and elevation. Warm golden northern light from the upper left, long soft shadows. A cosy Norwegian fishing village on a green rocky islet rising toward a small white lighthouse with a red top: below it a bait shop with a hanging sign showing a painted fish, a workshop with a propeller sign, weathered wooden homes down the slope, smoke from one chimney, a small red boathouse at the waterline, a fishing boat at a stone pier, drying racks, gulls, a cat licking its paw. Densely detailed, warm and lived-in, no purple or pink cast. An irregular organic natural form — no square base, no diorama tile, no flat platform. Only a narrow band of water and white foam hugs the islet; immediately beyond the foam the entire background is flat solid magenta on all four sides, one single colour, completely empty, and nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text.

**Variant C — havnefronten tett på (mer brygge, flere båter)** (954 tegn):

> Retro video game pixel art style. High three-quarter aerial view with a strong sense of depth and elevation. Warm golden northern light from the upper left, long soft shadows. A small Norwegian harbour front on a rocky islet: a curved stone pier sheltering two wooden fishing boats and a dinghy, a bait shop on the quay with a painted fish sign, a workshop with a propeller sign, a red boathouse with doors ajar, stacked crab pots and orange buoys, drying racks, smoke from one chimney, gulls, a cat on a mooring post. Densely detailed, warm and lived-in, no purple or pink cast. An irregular organic natural form — no square base, no diorama tile, no flat platform. Only a narrow band of water and white foam hugs the islet; immediately beyond the foam the entire background is flat solid magenta on all four sides, one single colour, completely empty, and nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text.

**Variant D — kveldslys i vinduene (samme gyldne lys, mer kos)** (1002 tegn):

> Retro video game pixel art style. High three-quarter aerial view with a strong sense of depth and elevation. Warm golden northern light from the upper left, long soft shadows. A cosy Norwegian fishing village on a green rocky islet in late golden light: wooden homes with grass roofs and warm yellow window light, a bait shop with a painted fish sign, a workshop with a propeller sign, an old house with tall windows, smoke from two chimneys, a red boathouse at the waterline, a fishing boat at a stone pier, laundry on a line, gulls settling, a cat licking its paw. Densely detailed, warm and lived-in, no purple or pink cast. An irregular organic natural form — no square base, no diorama tile, no flat platform. Only a narrow band of water and white foam hugs the islet; immediately beyond the foam the entire background is flat solid magenta on all four sides, one single colour, completely empty, and nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text.

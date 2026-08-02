# Prompter — skrei og de ti fiskerne

Filnavnene er allerede kodet inn. Legg bildene i `spill/assets/` med nøyaktig disse
navnene, så dukker de opp av seg selv. Fram til da faller spillet pent tilbake
(avataren skjules, fisken bruker torskesprite).

---

## 1. Skreien

Fil: **`skrei.png`** — ca. 1085 × 475, transparent bakgrunn (samme mål som `torsk.png`)
 16-bit pixel art side-view of a **skrei** — a spawning Atlantic cod from the Barents Sea. Distinctly different from a coastal cod: **leaner, more silvery, paler belly, brighter and cleaner** rather than mottled brown-green. Slim muscular body in spawning condition, prominent chin barbel, three dorsal fins, pale lateral line running the full length. Cool silver, pewter and pale olive palette with a faint blue sheen along the back. Facing left. Strict pixel grid, hard-edged pixels, no anti-aliasing, no gradients — ordered dithering only. Limited 24-colour palette. Fully transparent background, no shadow, no outline glow.

Skreien bruker samme oppføring som torsk i spillet — den er samme art. Sprite-en er
bare et sesongansikt, og koden bytter navn og pris automatisk i januar–april.

---

## 2. De ti fiskerne

Alle: **`fisker-<navn>.png`**, **256 × 256**, transparent bakgrunn.

Vises som en rund avatar 44 px i SMS-en, så **ansiktet må fylle rammen** — bryst og opp,
ikke helfigur. Tenk profilbilde, ikke portrett på veggen.

### Felles teknisk hale (lim på hver enkelt)
 16-bit pixel art character portrait, head and shoulders, centred, facing slightly toward the viewer. Northern Norwegian fisherman. Strict pixel grid, hard-edged pixels, no anti-aliasing, ordered dithering, limited 24-colour palette. Neutral dark background that is **fully transparent**. No text, no frame, no logo.

### De ti

**`fisker-harald.png`** — Harald Nystad, M/S Nordvær *(trygg og jamn)* Man in his fifties, weathered square face, close-cropped grey beard, calm steady eyes, faded navy wool sweater, plain dark beanie. Unremarkable and reliable.

**`fisker-jorunn.png`** — Jorunn Eide, M/S Havglimt *(forsiktig, går aldri tom)* Woman in her forties, sharp practical face, blonde hair tied back under a red beanie, slight knowing smile, clean orange flotation vest over a grey sweater.

**`fisker-birger.png`** — Birger Kvalvik, M/S Storskjær *(vågal, går lengst ut)* Broad man in his late thirties, wild dark hair, thick unkempt beard, one eyebrow raised, grinning like he knows something. Salt-stained yellow oilskin jacket, collar up.

**`fisker-solveig.png`** — Solveig Åsen, M/S Fjordperle *(holder bruket i orden)* Woman in her thirties, neat dark braid, glasses beaded with sea spray, focused expression, clean green work jacket, a coil of rope over one shoulder.

**`fisker-odd.png`** — Odd Mikkelsen, M/S Gamle Ola *(gammel, uflaks, kan sjøen)* Man in his late sixties, deeply lined face, white stubble, tired but warm eyes, worn brown cap with a frayed brim, patched grey jumper. Kind and slightly defeated.

**`fisker-marit.png`** — Marit Fagerli, M/S Havbris *(selger alt før hun går ut)* Woman in her fifties, short practical grey-brown hair, businesslike level gaze, reading glasses pushed up on her forehead, clean navy fleece with a small harbour crest.

**`fisker-trygve.png`** — Trygve Bang, M/S Nordlys *(galning, eggakanten)* Man in his forties, sunburnt face, manic wide grin, missing one front tooth, chaotic red-blond hair blown sideways, open orange survival suit over a bare chest. Reckless joy.

**`fisker-ingrid.png`** — Ingrid Sund, M/S Måken *(korte turer, kommer alltid hjem)* Young woman, mid-twenties, freckled open face, dark hair under a woollen hat with a pompom, small confident smile, oversized blue rain jacket. Youngest of the ten.

**`fisker-kaare.png`** — Kåre Lind, M/S Brottsjø *(har teft)* Man in his fifties, narrow weathered face, hooked nose, sharp attentive eyes looking slightly off to the side as if listening, thin moustache, dark green cap and jacket.

**`fisker-astrid.png`** — Astrid Holm, M/S Kvitskjær *(tar imot alt trålen gir)* Woman in her sixties, strong square face, deep laugh lines, silver hair cut short, big open smile, heavy cream cable-knit sweater. Looks like she has hauled a thousand nets.

**Viktig:** de ti skal kunne skilles fra hverandre på 44 piksler. Gjør hodeform, hårfarge
og luefarge tydelig forskjellige — detaljer i ansiktet forsvinner uansett.

---

## 3. Fjerne fiskebåter (til skreifeltet senere)

Fil: **`baat-fjern-01.png`** … **`baat-fjern-04.png`** — ca. 320 × 140, transparent
 16-bit pixel art silhouette of a distant Norwegian fishing vessel seen broadside on the horizon. Small coastal trawler / sjark with wheelhouse aft and a working deck forward. Rendered as a **flat desaturated silhouette in cool blue-grey**, as if seen through sea haze several kilometres away — very little internal detail, no windows lit, no colour beyond the haze tone. Strict pixel grid, hard edges, no anti-aliasing, transparent background.

Lag fire varianter i litt ulik størrelse og fasong. Koden kan da strø dem langs
horisonten i ulik avstand og fart, så feltet ser befolket ut.

---

## Rekkefølge, hvis du vil prioritere

1. **De ti fiskerne** — mekanikken kjører allerede, den mangler bare ansiktene.
2. **Skreien** — sesongen starter i januar, så det haster ikke.
3. **De fjerne båtene** — først når skreifeltet bygges.

---

## 4. Mobiltelefonen

For at meldingen skal føles som en ekte SMS, ikke en dialogboks.

**Anbefalingen min: ikke lag en hel telefonramme.** En ramme rundt hele kortet må
skalere fra 320 px til iPad uten å bli tynn eller grøtete, og den stjeler plass fra
teksten på små skjermer. Det som faktisk selger «telefon» er toppen og bunnen.

### 4a. Statuslinja på toppen

Fil: **`sms-topplinje.png`** — **512 × 56**, sømløs venstre↔høyre, transparent
16-bit pixel art iOS-style phone status bar strip. Left side: a small clock reading "07:14". Right side: cellular signal bars, a wifi arc, and a battery icon roughly two-thirds full. Rendered in **flat light grey-white on transparent**, no background fill — it will sit on a dark bar. Very small, very clean, extremely legible at 1:1. Strict pixel grid, hard edges, no anti-aliasing. Leave the centre third empty so a notch can sit there.

Kakles vannrett, så bredden spiller ingen rolle.

### 4b. Hjemindikatoren nederst

Fil: **`sms-bunnstrek.png`** — **160 × 12**, transparent
A single rounded horizontal bar, light grey, like the iPhone home indicator. Pixel art, hard edges, transparent background. Nothing else.

### Om du likevel vil ha hele telefonen

Fil: **`sms-telefon.png`** — **360 × 720**, transparent midt
16-bit pixel art smartphone seen straight on, dark grey aluminium body, rounded corners, thin bezel, small notch at the top centre, subtle side buttons. The screen area must be **fully transparent** so the message can render through it. Soft drop shadow outside the body only. Strict pixel grid, hard edges, no anti-aliasing.

Da må jeg vite det, for kortet må låses til 1:2-format og det koster plass i liggende.

---

## 5. Konvolutt-ikonet

Fil: **`ikon-konvolutt.png`** — **64 × 64**, transparent

Ligger til venstre i «Innboks»-knappen, vises som 17 px høy.
16-bit pixel art envelope icon, seen straight on, slightly tilted. Warm cream paper with a visible fold line forming a V across the front, and a thin darker edge. Simple and chunky — it must read clearly at 17 pixels high. No text, no stamp, no seal. Strict pixel grid, hard edges, no anti-aliasing, transparent background.

Fram til fila finnes bruker knappen 📨 som reserve, så ingenting brekker.

---

## 6. «Bytt spiller»-ikonet

Fil: **`ikon-bytt-spiller.png`** — **64 × 64**, transparent

Ligger til venstre i «Bytt spiller»-knappen, vises som 17 px høy.

**Viktig om fargen:** knappen er brun (`#b07c4a`) med hvit tekst. ⚓-emojien
som lå der tegner seg selv i mørk grå og forsvant nesten helt. Ikonet må derfor
være **lyst** — samme kremhvite som teksten ved siden av — ikke mørkt.

Fram til fila finnes brukes ⚓ med en lysningsfilter, så knappen er lesbar nå.

### Alternativ A — anker *(anbefalt: mest lesbart på 17 px)*

16-bit pixel art anchor icon, seen straight on, perfectly symmetrical. Rendered in a single **light cream-white** (#f6ecd0) with one slightly darker cream for the inner shading only — it will sit on a mid-brown button and must read as bright. Classic admiralty anchor: ring at the top, straight shank, horizontal stock, two curved flukes. Chunky and simple — it must read clearly at 17 pixels high, so no rope, no chain, no fine detail. Strict pixel grid, hard edges, no anti-aliasing, transparent background.

### Alternativ B — to fiskere som bytter plass *(treffer ordet «bytt» bedre)*

16-bit pixel art icon of two overlapping fisherman silhouettes seen from the shoulders up, one slightly behind and to the right of the other, with a small circular swap arrow curving between them. Rendered in flat **light cream-white** (#f6ecd0) only, with a single darker cream used to separate the two silhouettes — no other colours; it sits on a mid-brown button and must read as bright. Extremely simplified: a beanie-shaped head and shoulders is enough. Must read clearly at 17 pixels high. Strict pixel grid, hard edges, no anti-aliasing, transparent background.

**Min anbefaling:** A. Knappen tar deg tilbake til naustet, så ankeret er både
riktig og det som overlever nedskaleringen til 17 px. B er mer presist på ordet
«bytt», men to figurer pluss en pil blir grøt på så få piksler.

---

## 7. Fiskeren som løfter armen — uten fisk

Filer: **`fisker-lofter-arm-01.png`**, **`-02.png`**, **`-03.png`** — **623 × 422**,
transparent. Nøyaktig samme mål, samme plassering av føttene og samme skala som
`fisker-lofter-fangst-01/02/03.png`, ellers hopper han i bildet.

**Problemet:** i dag holder han opp den samme sølvblanke seien uansett hva du
har fått. Har du dratt opp en håbrann på to meter, ser det rart ut.

**Løsningen:** samme tre bildene, men hånden er tom og løftes i triumf. Da kan
koden tegne den fisken du faktisk fikk ved siden av — eller la den tomme neven
stå alene, som en fisker som nettopp har fått noe han ikke helt tror på.

### Felles teknisk hale (lim på alle tre)

16-bit pixel art of the SAME bearded fisherman already used in this game — dark red knitted beanie, full auburn beard, cream cable-knit sweater with the sleeves showing, mustard-yellow oilskin bib overalls with a chest pocket and shoulder straps, brown rubber boots. Standing on a wooden deck, seen from the front, slightly right of centre. His **right hand is EMPTY** and raised. Identical body proportions, identical palette, identical canvas size and foot position to the existing frames — this is a new pose of the same character, not a new character. Strict pixel grid, hard-edged pixels, no anti-aliasing, no gradients, ordered dithering only, limited 24-colour palette. Fully transparent background, no shadow, no ground, no frame.

### De tre bildene

**`fisker-lofter-arm-01.png`** — Arm just starting to rise: hand roughly at shoulder height, elbow bent, fingers curled into a loose fist. Mouth beginning to open, eyes widening. The moment before he realises what he has.

**`fisker-lofter-arm-02.png`** — Arm halfway up, hand level with the top of his head, fist closed. Mouth open in a shout, beard lifted by the movement, head tilted slightly back.

**`fisker-lofter-arm-03.png`** — Arm fully extended straight up, fist clenched above the beanie, elbow locked. Head back, mouth wide open in a roar, eyes squeezed shut in delight. This frame is held on screen, so it must read well standing still.

**Viktig:** ingen fisk, ingen stang, ingen tau i hånden. Bare neven.

---

## 8. «Slingredemparen» — den finnes ikke. Men to andre gjør det.

Du har rett, og feilen er min: jeg foreslo et navn uten å sjekke om tingen
finnes. **Det finnes ikke noe fiskeutstyr som monteres rett over snella for å
dempe rykk.** Det som sitter der på en ekte stang er håndtaket og
snellefestet, og ingen av dem har den funksjonen. En kjetting under stanga gir
ikke mening heller — den ville bare hengt og slengt.

Men problemet er ekte, og virkeligheten har to løsninger på det. Begge er
tydelige på 64 piksler, og begge kan forklares til en tiåring på én setning.

### Anbefalt: **Kampbelte** (gimbal / fighting belt)

Fil: **`kampbelte.png`** — **256 × 256**, transparent

Dette er tingen. Et polstret belte med en metallkopp foran; enden av stanga
står i koppen, og du tar imot med hoftene og lårene i stedet for med armene.
Når båten ruller, går bevegelsen gjennom kroppen din i stedet for ut i snøret.
Det er nøyaktig mekanikken vi bygger, og det er standardutstyr på dyphavsfiske
over hele verden.

Rusten kan si det på én setning: *«Det er ikkje fisken som ryk snøret, gut —
det er båten som rullar. Med beltet tek du imot med kroppen.»*

16-bit pixel art of a deep-sea fishing **fighting belt (gimbal belt)**, seen straight on from the front, laid flat. A wide padded waist pad in cracked dark brown leather with visible stitching along the edges, a heavy brass-coloured metal gimbal cup mounted at the centre where the rod butt sits, and two thick webbing straps in faded orange running out to each side with simple metal buckles. Worn and salt-stained, clearly used for years — not new. Chunky and readable: the cup in the middle must be the first thing you see. Strict pixel grid, hard-edged pixels, no anti-aliasing, no gradients, ordered dithering only, limited 24-colour palette. Fully transparent background, no shadow, no frame.

### Alternativ: **Stanghylse med fjær** (fjærbelastet stangholder)

Fil: **`stanghylse.png`** — **256 × 256**, transparent

Hvis du heller vil ha noe som monteres på båten enn på kroppen: en stangholder
i ripa med en fjær i bunnen. Den tar opp rykkene når båten går i sjø. Ekte
utstyr, og den passer godt til at fisken senere skal hvile på ripa.

16-bit pixel art of a **spring-loaded rod holder** for a small boat gunwale, seen from the side at a slight angle. A tube of galvanised steel angled outward, clamped to a short section of weathered wooden gunwale, with a visible coiled steel spring at its base where the tube meets the mount. A knurled brass tightening knob on the clamp. Salt-weathered metal with a few rust spots, pale grey-blue steel and warm brown wood. Chunky and readable — the coiled spring must be clearly visible as the working part. Strict pixel grid, hard-edged pixels, no anti-aliasing, no gradients, ordered dithering only, limited 24-colour palette. Fully transparent background, no shadow, no frame.

### Min anbefaling

**Kampbeltet.** Det er den ene av de to som faktisk handler om *å holde
lenger* — som er nøyaktig det oppgraderingen gjør i koden (fisken trenger
25 % lengre tid på å bygge opp nok spenn til å rive seg løs). Stanghylsa
handler mer om å la stanga stå av seg selv, og det gjør vi ikke i spillet.

Beltet er også det eneste av utstyret i butikken som sitter på *deg* og ikke
på båten, og det er en fin liten forskjell.

---

## 9. Propell-Kjell — portrett

Fil: **`portrett-kjell.png`** — **256 × 256**, transparent

Kjell ringer nå når motoren nærmer seg service, femten kast før havariet. Han
har bare en verkstedlogo i dag, og den ser rar ut som rundt profilbilde i
anropsvinduet. Fram til fila finnes brukes logoen, så ingenting brekker.

Vises som rund avatar på 132 px når han ringer, og 72 px i meldingen — så
ansiktet må fylle rammen. Bryst og opp, ikke helfigur.

16-bit pixel art character portrait, head and shoulders, centred, facing slightly to the **right**. A Norwegian boat mechanic in his sixties, **lean and wiry** — narrow face, hollow cheeks, sharp jaw, thin neck. **Bald on top with a horseshoe of short grey hair around the sides and back**, grey stubble, deep lines around the eyes. **Wearing his reading glasses on his nose**, thin wire frames, slightly smudged with oil at one corner. Faded blue work overalls hanging loose on narrow shoulders, over a grey t-shirt, both marked with old oil stains that will never wash out. A rag hanging from the chest pocket. Calm, unhurried expression — a man who has heard every engine noise there is and is not impressed by any of them. Strict pixel grid, hard-edged pixels, no anti-aliasing, ordered dithering, limited 24-colour palette. Fully transparent background, no text, no frame, no logo.

**Merk:** han skal se mot HØYRE, som de seks fiskerne vi speilvendte — alle ser
inn mot navnet sitt.

---

## 10. Bensinpumpe til «Fyll bensin»

Fil: **`bensinpumpe.png`** — ca. **400 × 400**, transparent

Ligger til venstre i «Fyll bensin»-raden hos Rusten. Vises som **44 px høy** i
butikklista, så formen må lese på det målet — detaljer under et par piksler
forsvinner.

Plassen er allerede laget i koden. Fram til fila finnes brukes ⛽ som reserve,
så ingenting brekker.

**Merk:** raden rett under er «Ekstra bensinkanne» med en rød kanne. Pumpa bør
derfor **ikke** være rød — ellers ser de to radene like ut på et lite skjermbilde.
Grønn slange og messingfarget håndtak skiller dem tydelig, og grønt er dessuten
det man forbinder med bensinpumper på norske stasjoner.

16-bit pixel art of a **fuel pump nozzle** (the handheld part only, not the whole pump), seen from the side at a slight three-quarter angle, hanging with the spout pointing down-left. Chunky brass-and-steel body with a visible trigger guard and squeeze handle, a short curved metal spout, and a thick dark-green rubber hose curling away from the back of the grip and out of frame. A few drops of fuel at the spout tip. Weathered and well used — scuffed metal, a little grime in the seams, one small dent. Warm brass, pale steel and deep green; **no red anywhere**. Chunky and readable: it must be recognisable at 44 pixels high, so no fine text, no gauge dials, no small logos. Strict pixel grid, hard-edged pixels, no anti-aliasing, no gradients, ordered dithering only, limited 24-colour palette. Fully transparent background, no shadow, no frame.

---

## 11. Riggservice hos Propell-Kjell

Fil: **`verksted-riggservice.png`** — ca. **400 × 400**, transparent

Fjerde rad i verkstedet, ved siden av Bunnsmørning, Båtservice og Båtforsikring.
Vises som **44 px høy**. Fram til fila finnes brukes 🎛️ som reserve, så
ingenting brekker — men den emojien er en grå knotteboks som ikke sier noe om
hva raden er.

**Merk:** de tre andre radene har hvert sitt tydelige motiv — en malingsbøtte med
pensel, en verktøykasse, et forsikringssegl. Riggservicen må skille seg fra
verktøykassa, som er nærmest i tema. Løsningen er å vise *det som serviceres*
i stedet for verktøyet: snella på benken, halvveis åpnet.

16-bit pixel art of a **large fishing reel lying open on a workbench**, seen from
a slight three-quarter angle above. The side plate is off and resting against the
reel, showing the brass gears inside. A small oil can with a long thin spout
stands beside it, and a folded oily rag lies under the reel. Salt crust and dried
white residue on the outer casing, bright polished brass on the exposed gears —
the contrast between worn outside and cared-for inside is the whole point of the
image. Warm brass, gunmetal grey, pale wood bench, one small red oil-can detail.
Chunky and readable: it must be recognisable at 44 pixels high, so no fine text,
no tiny screws, no logos. Strict pixel grid, hard-edged pixels, no anti-aliasing,
no gradients, ordered dithering only, limited 24-colour palette. Fully transparent
background, no shadow, no frame.

---

## 12. Sildehekle

Fil: **`sluk-sildehekle.png`** — ca. **400 × 400**, transparent

Ny sluk hos Rusten, 70 kr. Vises i sluksettet og i butikklista, samme størrelse
som de andre slukene. Teknikken er beskrevet av eierens svigerfar: man «hekler»
sild med et oppheng med små kroker og røde perler som ligner tyttebær. Båten står
i ro og man pumper hekla opp og ned gjennom stimen.

**Merk:** dette er ikke én sluk, det er en *forsats* — flere kroker på samme
tafs. Den må lese som en rekke, ikke som et enkelt blikk, ellers ser den ut som
alle de andre slukene i lista. Sammenlign med `sluk-markpilk` som er samme type
redskap; de to skal kunne skilles fra hverandre på et lite ikon, og det er de
røde perlene som gjør jobben.

16-bit pixel art of a **Norwegian herring rig (sildehekle)** hanging vertically:
a single vertical line with **five short side-branches**, evenly spaced, each
ending in a small silver hook dressed with a **bright red bead** and a wisp of
white or silver tinsel. A small lead weight at the very bottom. The red beads are
the whole point — they must read clearly as a row of red dots against the line,
because that is what tells the rig apart from the plain lure icons. Muted silver
and gunmetal for line and hooks, **strong red** for the beads, a hint of pale
tinsel. Chunky and readable: it must work at 44 pixels tall, so no fine knots, no
text, no more than five branches. Strict pixel grid, hard-edged pixels, no
anti-aliasing, no gradients, ordered dithering only, limited 24-colour palette.
Fully transparent background, no shadow, no frame.

---

## 13. Sild

Fil: **`sild.png`** — ca. **512 × 256**, transparent

Ny art. Fram til fila finnes brukes makrellen som stand-in (`LIKNER`), så
ingenting brekker — men da ser silda ut som en makrell, og de to er lette å
skille i virkeligheten.

**Merk:** silda skal peke mot VENSTRE, som alle de andre fiskene i spillet.
Koden måler selv hvor munnen sitter i bildet, så du trenger ikke tenke på
plassering i ramma — men fisken må fylle bredden.

16-bit pixel art of an **Atlantic herring** in side profile, facing **left**.
Slender, laterally compressed body with a deeply forked tail and a single small
dorsal fin set midway along the back. **Bright silver flanks with a distinct
blue-green sheen along the back**, white belly, large dark eye, no spots and no
stripes — the clean silver is what separates her from the mackerel, which has
dark wavy bars. Large, visible, slightly loose scales catching the light. Strict
pixel grid, hard-edged pixels, no anti-aliasing, no gradients, ordered dithering
only, limited 24-colour palette. Fully transparent background, no shadow, no frame.

---

## 14. «NY ART!»-stempelet

Fil: **`ny-art.png`** — ca. **512 × 220**, transparent

Dette er merket som spretter opp øverst til høyre på fangstplansjen første gang
du får en art du aldri har hatt før. Akkurat nå står det et rødt tekstmerke der
i stedet — koden bytter til bildet av seg selv i det fila lander i mappa.

**Teknisk, viktig:**

- Vises **72 piksler høyt**. Alt som er finere enn det forsvinner — ingen tynne
  streker, ingen skygge under teksten, ingen detaljer i bakgrunnen.
- Bredden er fri, men hold deg under 3 ganger høyden, ellers stikker det ut av
  plansjen på en 320 px-skjerm.
- Teksten **NY ART!** må stå i selve bildet. Den kommer ikke på oppå.
- Det skaleres med `image-rendering: pixelated`, så det må være ekte pixel art
  i den samme stilen som spill-logoen — ikke et glatt bilde som blir skalert ned.

Spillet legger selv på en liten sprett-animasjon (skalerer fra 0 til 115 % og
tilbake), så bildet skal stå **helt rolig og rett** — ikke tegn inn bevegelse,
fartsstriper eller skrå vinkel.

16-bit pixel art **stamp badge** reading **"NY ART!"** in bold condensed
Norwegian-style block capitals. Designed to look like a **weathered wooden sign
or an inked rubber stamp** in the same handmade harbour style as the game's
wooden title sign: warm timber tones, thick dark outline, chunky letterforms
with a soft cream fill and a darker bevel underneath. A small decorative accent
is welcome — a tiny fish silhouette, a hook, or a starburst behind the text —
but keep it to one. Slight wear and chipping at the edges, as if it has been
nailed to a boathouse wall for years. Strict pixel grid, hard-edged pixels, no
anti-aliasing, no gradients, ordered dithering only, limited 24-colour palette.
Fully transparent background, no drop shadow, no frame, no border box.

**Alternativ, hvis du heller vil ha stempel enn skilt:** bytt «weathered wooden
sign» mot *circular red ink stamp, rough uneven ink coverage, slightly rotated
letterpress look* — men da må teksten fortsatt være vannrett og lesbar ved 72 px.

---

## 15. Arkivet — logoen

Fil: **`arkivet-logo.png`** — ca. **880 × 460**, transparent

Skiltet henger foran Målfrid, akkurat som Propell-Kjell-skiltet henger foran Kjell.
Derfor må boka ligge **på tvers** — bred og lav. En bok som står på høykant blir en
smal søyle, og da har hun ingen plass å stå bak.

**Dette er feilen som går igjen:** hver gang det står «sett ovenfra» eller
«liggende», tegner generatoren boka i **isometri** — vridd på skrå, med toppen
som en rombe. Da blir skiltet en diamant, og Målfrid får ingen rett kant å stå
bak. Løsningen er å be om det motsatte: **rett forfra, helt flatt, uten dybde.**

Tenk deg boka **hengt opp på en vegg** som et skilt — ikke liggende på et bord.
Du ser permen rett forfra. Øverste kant er en **vannrett strek** tvers over.
Ingen vridning, ingen perspektiv, ingen hjørne som stikker mot deg.

**Målene som betyr noe:**

- **Toppkanten skal være helt vannrett.** Dette er det viktigste.
- **Klart bredere enn høy** — sikt mot dobbelt så bred.
- Vises maks 130 px høy. Ingen tynne streker, ingen liten skrift.
- **ARKIVET må kunne leses ved 130 px** — store, tykke bokstaver som fyller
  bredden, ikke et lite stempel i hjørnet.
- Ingenting rundt boka: intet bord, ingen skygge, ingen ramme. Alt som ligger
  under blir liggende oppå Målfrid.

16-bit pixel art of a **closed ledger book seen straight on, flat front view,
completely orthographic — no perspective, no isometric angle, no rotation, no
tilt**. The top edge is a **perfectly horizontal straight line** all the way
across, as if the book were mounted flat on a wall. **Wide landscape shape, twice
as wide as it is tall.** The cover fills the frame: worn deep sea-green leather
with **brass corner protectors** at all four corners and a brass clasp on the
right edge. **ARKIVET** stamped across it in **large, thick, worn gold serif
capitals**, spread over the full width, level and upright, slightly uneven as if
pressed by hand. A thin band of yellowed page edges along the bottom. Strict
pixel grid, hard-edged pixels, no anti-aliasing, no gradients, ordered dithering
only, limited 24-colour palette. Fully transparent background, no shadow, no
table, no floor, nothing behind or beneath the book.

**Hvis den fortsatt kommer på skrå,** legg til dette til slutt og fjern alt annet
som antyder rom: *«front view only, like a flat sticker or a wall sign, zero
perspective»*. Ordene «lying», «resting», «on a table» og «from above» er det
som utløser isometrien — de må ikke stå der.

**Liten utgave til knappen på dekket:** `arkivet-ikon.png`, ca. **256 × 256**.
Her har du ikke plass til ordet — dette vises på **26 piksler**. Tegn bare boka:
samme grønne perm, messingklaff, gullkant, sett rett forfra og litt ovenfra, tett
beskåret så den fyller ramma. Ingen tekst. Lag den som eget bilde heller enn å
skalere ned den store — 26 px må tegnes for 26 px.

---

## 16. Arkiv-Målfrid

Hun som holder Arkivet. Navnet følger samme mønster som Propell-Kjell, så det
sitter med én gang: **Arkiv-Målfrid**. Målfrid er nordnorsk, litt gammeldags og
ikke i bruk andre steder i spillet.

**Hvem hun er** (til dialogen senere): rundt seksti, var bibliotekar på Ørnes til
skolen ble lagt ned, og fører nå arkivet over hva folk får. Hun snakker **bokmål**
— Rusten har nynorsken, og de to skal ikke låte likt. Tørr, presis, og litt stolt
på arkivets vegne. Hun husker hva du fikk i fjor. Hun sier ifra når du mangler noe:
*«Du står fortsatt uten blålange. Den er ikke ført her hos noen andre heller, så
det er ingen skam i det.»* Under det tørre er hun varm — hun heier, hun bare
gjør det uten å heve stemmen.

### 16a. Portrett til telefonen

Fil: **`portrett-maalfrid.png`** — **400 × 400**, transparent
(samme mål og ramme som `portrett-kjell.png`)

Vises som rund avatar 44 px i SMS-en, så **ansiktet må fylle rammen** — bryst og
opp. Hun ser mot **høyre**, inn mot navnet (motsatt av Kjell, som speiles).

16-bit pixel art character portrait, head and shoulders, facing slightly right.
A **Norwegian woman of about sixty** who has spent her life indoors with books but
grew up on this coast. Sharp, attentive eyes behind **reading glasses worn low on
the nose**, with a thin chain looping down past her cheeks. Grey hair, still
partly dark, gathered back without fuss — practical, not styled. Fine lines around
the eyes from reading, not from weather. She wears a **plain wool cardigan in
muted heather** over a collared blouse, one pen tucked in the breast pocket. Her
expression is **level and unimpressed but not unkind** — the face of someone about
to tell you something true. Cool, quiet palette: heather, oatmeal, slate,
brass-rimmed glasses. Strict pixel grid, hard-edged pixels, no anti-aliasing,
ordered dithering, limited 24-colour palette. Fully transparent background. No
text, no frame, no logo.

### 16b. Målfrid i full figur, til Arkivet-modalen

Fil: **`maalfrid-staaende.png`** — ca. **380 × 500**, transparent
(samme mål og bruk som `rusten-mot-venstre.gif`)

Står bak logoen i modalen, 150 px høy. Hun **ser mot venstre**, ned mot boka.

Same character as above, now **full upper body down to the hips**, standing and
facing **left**. She holds a **closed ledger against her chest with one arm**, the
other hand resting flat on the cover. Slight forward lean, chin a little down —
she is looking at whoever just walked in, over the top of her glasses. Same
cardigan and chain. Calm, rooted stance, feet not visible. Strict pixel grid,
hard-edged pixels, no anti-aliasing, ordered dithering, limited 24-colour palette.
Fully transparent background, no shadow, no floor.

---

## 17. Kjell i full figur (valgfritt — kan vente)

Kjell-portrettet du allerede har (`portrett-kjell.png`) settes nå inn over logoen
i verkstedet, så dette haster ikke. Vil du senere ha samme løsning som Rusten, med
en **stående** figur bak logoen, er dette prompten:

Fil: **`kjell-staaende.png`** — ca. **380 × 500**, transparent

Same character as `portrett-kjell.png` — bald on top with grey hair at the sides,
wire-rimmed glasses, deep lines, blue work overalls over a stained work shirt —
now shown from the **hips up**, standing and facing **left**. A **propeller held in
one hand** at his side, the other wiping itself on a rag. Slight stoop from years
over an engine. Strict pixel grid, hard-edged pixels, no anti-aliasing, ordered
dithering, limited 24-colour palette. Fully transparent background, no shadow.

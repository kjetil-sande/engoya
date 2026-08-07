# Prompter — UI, effekter og utstyr

> Reglene gjelder ALLE prompter i denne mappa: maks **1024 tegn**, magenta bakgrunn
> som nøkles ut i spillet, ingen kunstnernavn, og ingen av forbudsordene (west, east,
> rose, holm, skerry, beacon, isometric, «rust red», «bone white»). Full begrunnelse
> og feilhistorikk står i [kartet.md](kartet.md).

## 1. Tom pose — sammenkrøllet til en ball

`spill/assets/pose-rusten-tom.png` — vises i lappen etter at posen er åpnet og tømt.

> Retro video game pixel art style. A single game icon: a small brown paper grocery bag crumpled into a loose round ball, deep creases and sharp folds catching the light, one torn corner sticking out, a hint of the opening squashed shut. The paper looks used and soft. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading in the creases. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

---

## 2. Ekstra linekrok

`spill/assets/linekrok.png` — butikkraden «Ekstra linekrok» (koden har allerede
onerror-fallback til 🪝, så bildet kan legges inn når som helst).

> Retro video game pixel art style. A single game icon: one large fishing longline hook with a short length of tarred line attached, the line ending in a small neat loop. The hook is forged steel with a needle-sharp point and a flattened eye, slightly worn but strong. Chunky and readable at small size: few large details, thick clean pixel outlines, slight cool metallic shading on the bend. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

---

## 3. Lyn — fire varianter til ruskevær-overlay

Transparent PNG (magenta nøkles ut). Kode-siden blinker 2–3 av dem kort og lar den
siste stå i ~1 sekund før rask uttoning; tordenlyden følger med. Høydeformat er best
— lynet skal stå over hele scenen.

`spill/assets/lyn-1.png` — enkelt, tynt:

> Retro video game pixel art style. A single lightning bolt for a storm overlay, tall portrait format: one thin jagged bolt striking from the top edge down through the frame, sharp zigzag angles, brilliant white core with a pale blue edge glow one pixel wide. No clouds, no ground, only the bolt itself. Clean and readable: hard angular segments, thick clean pixel outlines. The bolt is centred and spans nearly the full height. The entire background is flat solid magenta, one single colour, completely empty; only the top of the bolt touches the top edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/lyn-2.png` — med to grener:

> Retro video game pixel art style. A single lightning bolt for a storm overlay, tall portrait format: one jagged bolt striking from the top edge down through the frame, with two thinner branches forking off partway down and fading before the bottom, sharp zigzag angles, brilliant white core with a pale blue edge glow one pixel wide. No clouds, no ground, only the bolt. Clean and readable: hard angular segments, thick clean pixel outlines. Centred, spanning nearly the full height. The entire background is flat solid magenta, one single colour, completely empty; only the top of the bolt touches the top edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/lyn-3.png` — bredt, dobbelt nedslag:

> Retro video game pixel art style. Two lightning bolts for a storm overlay, tall portrait format: a thick main bolt and a thinner second bolt striking side by side from the top edge, both with sharp zigzag angles, crossing close together near the middle, brilliant white cores with a pale blue edge glow one pixel wide. No clouds, no ground, only the bolts. Clean and readable: hard angular segments, thick clean pixel outlines. Centred, spanning nearly the full height. The entire background is flat solid magenta, one single colour, completely empty; only the tops of the bolts touch the top edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/lyn-4.png` — det store som får stå i ett sekund:

> Retro video game pixel art style. A single massive lightning bolt for a storm overlay, tall portrait format: one wide powerful bolt striking from the top edge all the way down, sharp zigzag angles, several small branches flickering off both sides, brilliant white core three pixels wide with layered pale blue and deep blue edge glows. No clouds, no ground, only the bolt. Clean and readable: hard angular segments, thick clean pixel outlines. Centred, spanning the full height. The entire background is flat solid magenta, one single colour, completely empty; only the top and bottom of the bolt touch the edges. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

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


---

## Telefonens app-ikoner (5. aug)

Vises 62 px i appnettet, hjørnene rundes av CSS-en — ikonet skal derfor fylle hele
flaten (flisen i motivet går kant i kant, magentaen utenfor er kun keying-ramme).
Koden har emoji-fallback, så hvert ikon plugger seg selv inn når fila lander.

`spill/assets/appikon-meldinger.png` — Meldinger 📨:

> Retro video game pixel art style. A single square app icon: a cream paper envelope seen slightly from above, flap open, a small folded letter peeking out, a wax-red seal dot on the flap. Warm paper tones on a deep teal rounded-square tile background, the tile filling the frame edge-to-edge behind the envelope. Chunky and readable at small size: few large details, thick clean pixel outlines. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/appikon-traaleren.png` — Tråleren 🚢:

> Retro video game pixel art style. A single square app icon: a sturdy little Norwegian fishing trawler seen from the side, dark green hull, white wheelhouse, a thin mast with rigging, a puff of exhaust, riding a small blue wave. On a deep blue rounded-square tile background, the tile filling the frame edge-to-edge behind the boat. Chunky and readable at small size: few large details, thick clean pixel outlines. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/appikon-vaeret.png` — Været 🌦️:

> Retro video game pixel art style. A single square app icon: a bright yellow sun half hidden behind a plump grey rain cloud, three slanted rain streaks falling, one tiny lightning spark at the cloud edge. On a pale sky-blue rounded-square tile background, the tile filling the frame edge-to-edge behind the weather. Chunky and readable at small size: few large details, thick clean pixel outlines. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/appikon-vekta.png` — Vekta ⚖️:

> Retro video game pixel art style. A single square app icon: an old harbour spring scale with a round brass dial and a big hook below, a small blue fish hanging from the hook, the needle pointing far right. On a warm sand-coloured rounded-square tile background, the tile filling the frame edge-to-edge behind the scale. Chunky and readable at small size: few large details, thick clean pixel outlines. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/appikon-kystradioen.png` — Kystradioen (til senere) 📻:

> Retro video game pixel art style. A single square app icon: a chunky old VHF marine radio with a coiled microphone cable and round speaker grille, a small green power lamp lit, one thin antenna rising from the corner. On a dark charcoal rounded-square tile background, the tile filling the frame edge-to-edge behind the radio. Chunky and readable at small size: few large details, thick clean pixel outlines. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

---

## Telefonikonet i fiskerkortet (6. aug)

`spill/assets/ikon-telefon.png` — vises ~26 px på den store Telefonen-knappen i
fiskerkortet (koden har 📱-fallback, ikonet plugger seg selv inn). (653 tegn)

> Retro video game pixel art style. A single game icon: a small dark smartphone standing upright, slightly tilted, rounded corners, thin lighter frame, the screen glowing warmly with a tiny envelope symbol and a little red notification dot in the corner, a slim home indicator line at the bottom of the screen. Chunky and readable at small size: few large details, thick clean pixel outlines, one soft screen-glow highlight. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

---

## App-ikon til Albumet og Kystradioen (6. aug)

`spill/assets/appikon-albumet.png` — Albumet 📷 (667 tegn):

> Retro video game pixel art style. A single square app icon: a very simple stylised landscape — two overlapping dark mountain triangles, a small round sun above them, and a straight horizon line, like a classic photo-app symbol. On a soft cream rounded-square tile background, the tile filling the frame edge-to-edge behind the landscape. Chunky and readable at small size: very few details, thick clean pixel outlines, flat shapes only. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/appikon-kystradioen.png` — Kystradioen 📻 (om du vil ha eit eige) (633 tegn):

> Retro video game pixel art style. A single square app icon: a simple stylised radio tower — a narrow dark mast with two crossbars and three curved signal arcs radiating from the top to one side. On a deep charcoal rounded-square tile background, the tile filling the frame edge-to-edge behind the tower. Chunky and readable at small size: very few details, thick clean pixel outlines, flat shapes only. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

---

## Nye 6. aug (kveld)

`spill/assets/appikon-albumet.png` — Albumet — ny, endå enklare (717 tegn):

> Retro video game pixel art style. A single square app icon in the style of a classic photos-app symbol: one large solid triangle mountain and one smaller triangle mountain overlapping it, a plain circle sun in the empty sky above them, nothing else at all. Three flat colours only — dark mountains, a warm yellow sun, and a pale blue sky filling the whole square behind them. Chunky and readable at small size: very few details, thick clean pixel outlines, flat shapes only, no texture. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/kart-saltvaer-verkstad.png` — Kjells verkstad nede ved hamna (988 tegn):

> Retro video game pixel art style. High three-quarter aerial view with a strong sense of depth and elevation. Warm golden northern light from the upper left, long soft shadows. A small boat repair workshop right at the water's edge: a weathered dark red wooden shed with wide open doors facing the sea, a sturdy timber slipway running from the doors straight down into the water, and a half-size winch with a steel drum and cable mounted at the top of the slipway, a small open boat halfway up on the rails. Oil drums, a stack of timber and a workbench outside the doors. Densely detailed, warm and lived-in, no purple or pink cast. An irregular organic natural form — no square base, no diorama tile. Only a narrow band of water and white foam hugs the shore; immediately beyond the foam the entire background is flat solid magenta on all four sides, one single colour, completely empty, and nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text.

---

## Båtar og trålutstyr (6. aug)

**Litt om faget, sidan du spurde.** Ein reketrål er ein pose som blir slept etter båten. Dei fire oppgraderingane i spelet er ekte utstyr:

1. **Sorteringsrist** — ei skrå rist av stålstenger inne i trålen. Rekene glir mellom stengene og vidare inn i posen; fisk som er for stor treff ristene og blir leidd ut gjennom ei luke. Påbode i norsk rekefiske. Gjer at fangsten blir rein, i staden for full av øydelagd småfisk.
2. **Trålpose** (òg kalla sekken) — den bakarste, lukka delen av trålen der fangsten samlar seg. Større pose = meir rom = færre hal = lengre tid ute før ein må inn.
3. **Ekkolodd** — finn stimen og botnforholda i staden for at ein leitar på slump.
4. **Kraftblokk og vinsj** — den hydrauliske blokka som hiv trålen inn. Halverer tida på kvart hal, så det blir fleire hal per tur.

`spill/assets/rusten-baat.png` — Rustens eigen sjark (822 tegn):

> Retro video game pixel art style. A single game sprite seen from the side: a small old Norwegian wooden fishing sjark, dark green hull with a white waterline stripe and plenty of scuffs, a squat white wheelhouse set far back, a short mast with a single working lamp, worn car tyres hanging along the side as fenders, a coil of rope and two crab pots stacked on the open foredeck, a stubby exhaust pipe with a wisp of smoke. She has clearly been afloat for forty years and is not done yet. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/traaler-reke.png` — Reketrålaren (782 tegn):

> Retro video game pixel art style. A single game sprite seen from the side: a working Norwegian shrimp trawler, blue steel hull with a high bow and a white superstructure aft, two tall outrigger booms angled down and out from a central mast with cables running from them, a large steel drum of trawl wire on the aft deck, a gantry frame over the stern ramp, radar and antennas on the wheelhouse roof, and a heap of green trawl netting piled on deck. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/traal-rist.png` — Sorteringsrist (oppgradering 1) (639 tegn):

> Retro video game pixel art style. A single game icon: a sorting grid for a shrimp trawl — a rectangular frame of steel bars set close together, mounted at a slant, with an escape opening at the top edge and a piece of green net attached around the frame. A few tiny shrimp shapes passing between the bars. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/traal-pose.png` — Større trålpose (oppgradering 2) (586 tegn):

> Retro video game pixel art style. A single game icon: the cod end of a trawl — a big bulging bag of green mesh netting tied shut at the narrow end with a thick rope, packed full of pink shrimp so the mesh is stretched tight, a few floats along the top. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/traal-ekkolodd.png` — Nytt ekkolodd (oppgradering 3) (603 tegn):

> Retro video game pixel art style. A single game icon: a modern marine echo sounder unit — a chunky grey housing with a bright screen showing a thick glowing arch of fish marks over a green seabed line, a few control knobs below the screen and a short cable at the back. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/traal-kraftblokk.png` — Kraftblokk og vinsj (oppgradering 4) (619 tegn):

> Retro video game pixel art style. A single game icon: a hydraulic power block for hauling nets — a heavy yellow-painted steel pulley wheel with a deep V groove, mounted in a sturdy bracket, thick wire cable running over it, hydraulic hoses coiled at the base and grease around the hub. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

**Oppdatering 7. aug:** `traaler-reke-hal.png` blei aldri laga. Eigaren teikna i staden om
`traaler-reke.png` slik at ho duger både i ro og i arbeid — baug mot høgre, raudt bunnstoff
nedst, og eit gantry i akterenden der wirane går ut. Halet teiknar sjølv wirane, nota som
forsvinn ned i djupet, og kor djupt ho ligg i sjøen etter kor full sekken er. Ingen reker
er synlege nokon stad. Prompten under er difor historikk, ikkje ei bestilling.

`spill/assets/traaler-reke-hal.png` — Reketrålaren PÅ HAL, sett frå sida (1006 tegn):

Den som alt ligger der (`traaler-reke.png`) er båten i ro — dette er same båt i arbeid.

**Viktig:** ingen reker og INGEN not i bildet. Du ser aldri fangsten i spillet — bare wirene som
går akterut, og så tegner spillet selv nota som forsvinner ned i sjøen bak båten. Baugen må peke
mot HØYRE, for sjøen ruller mot venstre og båten skal se ut som den går forover. Ingen sjø i
bildet heller; spillet setter henne på vasslinja selv.

> Retro video game pixel art style. A single game sprite seen from the side, bow pointing to the RIGHT: a working Norwegian shrimp trawler under way. Blue steel hull with a high bow pushing a small white wash, white superstructure aft, a wisp of exhaust from the funnel. Two outrigger booms angled down and out, a steel drum of trawl wire on the aft deck, and a gantry frame over the stern from which two taut wires lead away to the left and end at the edge of the frame. A fisherman in orange oilskins stands outside on the open aft deck at a small control pedestal, both hands on the levers, looking astern. No net and no catch anywhere, and no water. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge except the two wires. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/traal-not.png` — Sjølve trålen, sett frå sida (1006 tegn):

Skissa spelet teiknar i dag er berre nokre linjer, og det ser for enkelt ut. Denne skal erstatte
henne. Munnen må vende mot HØGRE (mot båten), og posen ligge mot venstre, sidan nota blir slept
akterut. Ingen sjø i biletet — spelet toner henne sjølv ut mot djupet.

> Retro video game pixel art style. A single game sprite seen from the side: a Norwegian shrimp trawl net under water, mouth wide open to the RIGHT and tapering away to the LEFT. A row of round floats along the curved upper edge and a line of heavy steel bobbins along the lower edge. Behind the mouth, a slanted ladder of steel bars across the throat — the sorting grid — with a small escape opening above it. The body narrows through green and grey mesh into a long closed bag at the far left, tied off with thick rope. The netting is open weave, so the mesh reads as lines rather than a solid shape. Completely empty: no shrimp, no fish, no catch, no water and no seabed. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/traaler-reke-rontgen.png` — Tråleren i røntgen (1003 tegn):

Eierens idé: når lynet slår ned ser man innmaten i båten, som når en tegneseriefigur får
støt og skjelettet lyser gjennom. Det er ikke teit — det er en klassiker, og på en båt er
det ekstra fint, for båtens skjelett er spantene.

**Men det står og faller på varigheten.** Vises den i mer enn to-tre frames blir den en
plakat i stedet for et glimt. Planen er å bytte den inn kun på det tredje lynglimtet, det
som varer 0,35 s, og bare når nedslaget faktisk treffer masta — altså den ene gangen av
tjue, langt ute. Da blir det et sjeldent syn folk snakker om, ikke en effekt som slites ut.

Sprita må ha NØYAKTIG samme silhuett og positur som `traaler-reke.png`, ellers hopper båten
i det glimtet kommer.

> Retro video game pixel art style. An X-RAY view of a Norwegian shrimp trawler seen from the side, bow to the right — the same boat as traaler-reke.png, in the same pose and proportions, but rendered as if lit from within by a lightning strike. The hull and wheelhouse are a **flat dark silhouette**, and inside it the **structure glows in pale electric blue-white**: the curved ribs of the frames along the hull, the keel line running the length of her, the engine block low and amidships, and the mast running up through the wheelhouse. A **small figure of a fisherman stands on the aft deck with his skeleton showing**, arms flung out, hair on end — the old cartoon gag, brief and funny, not gruesome. Everything else is black. Chunky and readable at small size: thick clean pixel outlines, few large details. Centred, filling most of the frame, matching the original sprite's silhouette exactly. Plain white background. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

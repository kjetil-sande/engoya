# Prompter — fiskerne og folkene

> Reglene gjelder ALLE prompter i denne mappa: maks **1024 tegn**, magenta bakgrunn
> som nøkles ut i spillet, ingen kunstnernavn, og ingen av forbudsordene (west, east,
> rose, holm, skerry, beacon, isometric, «rust red», «bone white»). Full begrunnelse
> og feilhistorikk står i [kartet.md](kartet.md).

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

---

## Tråløy Sparebank (7. august)

**Trude Skutnes** sitter med lånet til reketråleren. Hun er ikke en skurk — hun er den som
sier ja, og som minner deg på at halvparten av hvert hal går til henne til det er
gjort opp.

Fil: **`portrett-bank.png`** — **400 × 400**, transparent
(samme mål og ramme som `portrett-maalfrid.png`)

Vises som rund avatar 44 px i SMS-en, så **ansiktet må fylle rammen** — bryst og opp.
Hun ser mot **venstre** og speiles inn mot navnet, som Rusten og Kjell.

**Rettet 7. aug:** første forsøk ble 1113 tegn — over taket — og hun kom ut med slett hår
og altfor ung. Krøllene er nå flyttet helt fremst og sagt tre ganger, siden det er det
generatoren glatter bort først. Alderen er satt til 45.

**Andre retting:** håret ble fortsatt for langt. Nå er det sagt tre ganger at det skal
være kort — «cropped close», «compact rounded cap», «well above the jaw».

16-bit pixel art character portrait, head and shoulders, facing slightly left. A Norwegian woman of about forty-five with **short, tight spiral curls** — dense reddish-auburn corkscrew curls cropped close, a compact rounded cap of hair ending **well above the jaw**, never near the shoulders. **The curls are the first thing you notice: springy, coiled, clearly separated, never straight, never smooth, never brushed flat.** Soft full face, fair skin, a few freckles, calm and businesslike — friendly, but she has said no to loans before. Fuller build. She wears a knitted wool vest in muted mustard over a crisp white shirt buttoned to the very top collar button, the stiff collar points against her throat. A thin gold chain hangs in a small arc just below the collar points. No earrings, no pattern. Warm sober palette: mustard, cream, auburn, office grey. Strict pixel grid, hard-edged pixels, no anti-aliasing, ordered dithering, limited 24-colour palette. Fully transparent background. No text, no frame, no logo.

Fil: **`logo-traaloy-sparebank.png`** — kvadratisk, magenta bakgrunn som skal nøkles bort

Retro video game pixel art style. A small, sober logo mark for a Norwegian coastal savings bank, in the style of a sign on a brick wall in a fishing village. A simple shield or rounded square in deep navy and brass, containing a stylised **sjømerke** — a coastal navigation beacon — standing on a shallow rock with two short wave lines beneath it. Clean, symmetrical, very few details, the kind of mark that would still read at 40 pixels. Slightly worn, as if painted on metal twenty years ago and left in the salt air. Chunky and readable at small size: thick clean pixel outlines, flat colours, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no lettering, no drop shadow.

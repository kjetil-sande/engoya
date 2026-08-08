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

**Hvem hun er** (til dialogen senere): rundt seksti, var bibliotekar i Tråløy til
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

## 17. Tråløy Sparebank

### 17a. Trude Skutnes — portrett til telefonen

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

### 17b. Logoen

Fil: **`logo-traaloy-sparebank.png`** — kvadratisk, magenta bakgrunn som skal nøkles bort

**Alternativ A — bare bokstaver (anbefalt).** Tre forsøk på et motiv ga fyrtårn som falloss
og deretter stearinlys. Et lite motiv i en liten logo er der generatoren feiler mest — og en
sparebank trenger det ikke. Initialer og stiftelsesår på et treskilt er nøyaktig slik ekte
norske sparebanker ser ut.

> Retro video game pixel art style. A logo mark for a small Norwegian coastal savings bank, made of lacquered wood. A rounded shield with a **deep forest green border** framing a panel of warm honey-toned varnished wood with a soft visible grain. Centred on the wood, filling most of the panel, are the **two large letters TS** — bold, blocky, chunky pixel letterforms in cream with a dark green outline, straight and perfectly legible, no serifs and no script. Beneath them, small and level, the numerals **19** to the left and **77** to the right, about a third the height of the TS. **Nothing else at all inside the shield — no picture, no symbol, no emblem, no object of any kind.** Just wood, the border, and the lettering. Warm and calm: green, honey, cream, no red and no gold. Thick clean pixel outlines, flat colours. Centred, filling the frame. Plain white background. Strict pixel grid, hard-edged pixels, no anti-aliasing, no drop shadow.

**Alternativ B — baug i PROFIL.** Vil du ha et motiv likevel, må det være fra siden. En baug
sett rett forfra er bare en kile uten kjennetegn, og det var derfor den ble til et lys tre ganger.
I profil er den umiskjennelig: bratt stevn, skroget som sveiper bakover, skum av baugen.

> Retro video game pixel art style. A logo mark for a Norwegian coastal savings bank, made of lacquered wood. A rounded shield in deep forest green and honey-toned varnished wood. Inside it, in strict **side profile facing right**, is the **bow of a fishing boat cutting through water** — a steeply raked stem line, the sheer of the hull sweeping back and out of frame to the left, a white bow wave peeling off the stem, and two short wave lines below. Seen from the side, never head-on. **Only the bow and the water: no wheelhouse, no mast, no superstructure, nothing above the hull, and no vertical object of any kind.** The letters **TS are LARGE**, centred above. The numerals **19 and 77 are SMALL**, low on either side. Clean blocky pixel lettering, no serifs. Green, honey, cream — no red, no gold. Thick pixel outlines, flat colours. Plain white background. Strict pixel grid, hard-edged pixels, no anti-aliasing, no drop shadow.

**Historikk.** Fyrtårnet ble byttet mot baugen på en skute som kommer rett mot deg, sett nedenfra
ved vannflata. Sterkere bilde for en kystbank uansett — og ingen loddrett søyle å misforstå.
Kun baugen: alt over skroget er skåret vekk.

**Bakgrunn:** fyrtårnet kom ut som en glatt, blek søyle med rund topp og bred fot — og
det så ut som noe helt annet. Et fyrtårn kjennes igjen på TRE ting, og ingen av dem var med:
vannrette bånd over tårnet, en dør nede, og — viktigst — et lanternehus på toppen som er
BREDERE enn tårnet, med rekkverk rundt. Uten den utkragingen blir silhuetten bare en søyle.
Tårnet skal dessuten være lavt og bredt, ikke slankt.

**Rettet før det:** første utkast var marineblått og messing, og det leste seg som julepynt.
Nå er det lakkert tre i grønt og honning — ingen rødt, ingen gull. TS er den STØRSTE
tingen i merket, 19 og 77 er små og lave.

**Om bokstavene:** dette er den ene tingen bildegeneratorer er dårligst på. Regn med noen
forsøk før TS, 19 og 77 står riktig — og sjekk hvert tegn, ikke bare helheten. Blir det
aldri bra nok, kan jeg heller sette bokstavene i kode oppå en ren logo uten tekst; da blir
de alltid riktige, og de kan skaleres med resten av grensesnittet.

**Om hvit bakgrunn:** merk at logoen da ikke kan nøkles gjennomsiktig. Den vil stå som et
hvitt skilt. Det er helt greit for en bank — men si fra hvis du heller vil ha den fri.

---

## 18. Oppkjøperne

Fangsten er kilo i karet, ikke kroner på konto. Disse fire er dem du må bli kvitt henne til,
og de vil ha ulike ting: den ene tar alt med en gang til lav pris, den andre betaler dobbelt
men bare for det som er ferskt. Det er der veddemålet ligger.

De tre portrettene: **400 × 400**, transparent, samme ramme som `portrett-maalfrid.png`. De
ser mot **venstre** og speiles inn mot navnet, som Rusten, Kjell og Trude.

**Merk:** i koden heter de foreløpig etter firmaet («Nordvik Sjømat»). Når portrettene er på
plass bør de hete etter personen, slik resten av folkene gjør.

### 18a. Roar Nordvik — Nordvik Sjømat, Storhamn

Storhandleren. Tar hele lasset på flekken til lav pris. Den trygge utveien når du ikke orker
å vente — og den du irriterer deg over etterpå.

Fil: **`portrett-roar.png`** (887 tegn)

> 16-bit pixel art character portrait, head and shoulders, facing slightly left. A **Norwegian man of about fifty-five** who buys fish for a living and is always on his way somewhere. Heavy-set and well fed, ruddy face, thinning grey hair combed flat, small reading glasses pushed up on his forehead. He wears a **navy quilted company jacket zipped to the chin** over a checked shirt collar. A phone is clamped between his shoulder and his ear, and he is **halfway through saying something** — mouth open, one eyebrow raised, an impatient half-smile. Not a villain, just a man with three more stops today and a price he will not go above. Cool palette against a warm face: navy, steel grey, ruddy skin, a little brass on the zip. Strict pixel grid, hard-edged pixels, no anti-aliasing, ordered dithering, limited 24-colour palette. Fully transparent background. No text, no frame, no logo.

### 18b. Line Kvandal — Saltvær Fiskemottak

På kaia, rett ved. Grei pris, tar det de har plass til. Hverdagen.

Fil: **`portrett-line.png`** (849 tegn)

> 16-bit pixel art character portrait, head and shoulders, facing slightly left. A **Norwegian woman in her mid-thirties** who runs the receiving station on the quay. Dark blonde hair pulled back hard into a short practical ponytail, a few strands escaped and stuck to her cheek. Fair, wind-reddened skin, no makeup, a direct and level gaze. She wears a **worn navy fleece under a heavy orange rubber apron**, the bib coming up to her chest, straps over both shoulders, sleeves shoved to the elbow. Her expression is **friendly but already counting** — she has weighed a thousand boxes and can guess yours before you say it. Working palette: orange rubber, navy fleece, steel, cold daylight. Strict pixel grid, hard-edged pixels, no anti-aliasing, ordered dithering, limited 24-colour palette. Fully transparent background. No text, no frame, no logo.

### 18c. Berit Hauan — kokk i Tråløy

Betaler best av alle, men bare for det som er ferskt. Er reka gammel, går hun uten å prute.
Hun er belønningen for å ha kjøpt kjøl.

Fil: **`portrett-berit.png`** (873 tegn)

> 16-bit pixel art character portrait, head and shoulders, facing slightly left. A **Norwegian woman of about forty-five**, a chef who runs a small restaurant. Black hair cut in a sharp short bob, one side tucked behind an ear. Strong dark eyebrows and a keen appraising look — she is **studying something just out of frame and has not decided yet**. She wears a **crisp white chef's jacket buttoned high**, a thin dark neckerchief tucked in at the collar, and a folded blue towel over one shoulder. A small burn scar on the back of one hand. Nothing decorative anywhere. Warm but exacting: the face of someone who will pay double for the best and walk away from the rest. Clean palette: white, charcoal, deep blue. Strict pixel grid, hard-edged pixels, no anti-aliasing, ordered dithering, limited 24-colour palette. Fully transparent background. No text, no frame, no logo.

### 18d. Torghandel — ikke en person

Du står på kaia og selger selv. Tar tid, men folk betaler for fersk reke. Her trengs et ikon,
ikke et portrett — magenta bakgrunn som skal nøkles bort.

Fil: **`ikon-torghandel.png`** (794 tegn)

> Retro video game pixel art style. A single game icon: a **market table on a Norwegian quay**, seen from the side. A simple folding trestle table under a **blue-and-white striped awning**, a **brass hanging scale** on a hook at one end, and two open polystyrene boxes of cooked pink shrimp on crushed ice. A stack of paper bags and a small blank price sign leaning against the table leg. A single herring gull perched on the awning frame, waiting. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no lettering, no drop shadow.

### 18e. Sigrun Bertheussen — Bertheussen Transport

Kjører kysten opp og ned og stopper der det er noe å hente. Tar alt, midt på treet i pris —
men hun er ikke innom hver dag. Er hun der, er hun et godt alternativ til Roar.

Fil: **`portrett-sigrun.png`** (753 tegn)

> 16-bit pixel art character portrait, head and shoulders, facing slightly left. A **Norwegian woman of about fifty** who drives the fish lorry up and down the coast. Short practical grey-brown hair, weathered face, deep smile lines, a small silver hoop in one ear. She wears a **high-visibility yellow work jacket open over a hoodie**, collar turned up, and a pair of sunglasses pushed up on her head. **Mid-laugh, head tilted back slightly** — she has been driving since four in the morning and is in a very good mood about it. Palette: hi-vis yellow, grey hoodie, warm weathered skin, chrome. Strict pixel grid, hard-edged pixels, no anti-aliasing, ordered dithering, limited 24-colour palette. Fully transparent background. No text, no frame, no logo.

### 18f. Odd-Hugo Strand — eksportagent

Kjøper etter vekt og bryr seg ikke om friskhet. Lavest pris av alle, men han tar absolutt
alt, alltid. Den siste utveien når reka er i ferd med å bli for gammel.

Fil: **`portrett-oddhugo.png`** (762 tegn)

> 16-bit pixel art character portrait, head and shoulders, facing slightly left. A **Norwegian man of about forty**, an export agent who buys by the tonne. Neat dark hair, clean-shaven, narrow rimless glasses. He wears a **soft grey technical jacket over a shirt with no tie**, everything new and unmarked by work. He holds a **tablet flat against his chest** and looks over the top of it, **polite and completely unhurried** — the face of a man who already knows what he will pay and is waiting for you to arrive at the same number. Cool clean palette: pale grey, white, a little navy, no wear anywhere. Strict pixel grid, hard-edged pixels, no anti-aliasing, ordered dithering, limited 24-colour palette. Fully transparent background. No text, no frame, no logo.

### 18g. Gunvor på Nedre kai — kjøper for hele gata

Vil ha tjue kilo og betaler i overkant av det andre gjør, fordi hun deler på naboene og
ingen av dem har vondt av det. Lite volum, høy pris, og hun spør alltid hvordan det går
hjemme.

Fil: **`portrett-gunvor.png`** (762 tegn)

> 16-bit pixel art character portrait, head and shoulders, facing slightly left. A **Norwegian woman of about seventy-five** who buys shrimp for the whole street. Short permed white hair, glasses on a beaded chain, a small gold brooch at her throat. She wears a **hand-knitted cardigan in soft heather over a floral blouse**, buttoned all the way up. Deep laughter lines and a **warm, slightly conspiratorial smile** — she is about to tell you what the neighbours paid last week. She holds a **worn oilcloth shopping bag** against her front. Warm domestic palette: heather wool, cream, faded rose, brass. Strict pixel grid, hard-edged pixels, no anti-aliasing, ordered dithering, limited 24-colour palette. Fully transparent background. No text, no frame, no logo.

---

## 19. Utstyr til tråleren

To oppgraderinger som henger sammen med salget: den ene gir deg tid, den andre pris.

### 19a. Kjølerom

Reka er god i fjorten timer uten. Med kjøl holder hun i femti, og da rekker du å vente på
Berit i stedet for å ta det første budet.

Fil: **`traal-kjol.png`** (845 tegn)

> Retro video game pixel art style. A single game icon: a **refrigerated hold unit for a small fishing boat** — a squat stainless steel cabinet with a heavy insulated door, a chunky lever handle, and a round temperature dial with the needle sitting low in the blue. **Cold vapour spills from the seam** at the bottom of the door and pools around the base. A thin rime of frost along the upper edge, and two coiled black hoses running out of the back. Cold palette: steel, pale ice blue, white frost, black rubber. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

### 19b. Pakkemaskin

Reke i eske er en annen vare enn reke i kar. Gir 18 prosent bedre pris per kilo hos alle.

Fil: **`traal-pakkemaskin.png`** (840 tegn)

> Retro video game pixel art style. A single game icon: a **small packing machine for a fishing boat** — a compact stainless steel bench unit with a hinged press lid raised, a roll of clear film on a spindle above it, and a short conveyor of rollers leading out to the right. On the conveyor sits **one finished white polystyrene box, sealed and ready to stack**, with a plain blank label patch on the end. Practical, oily, well used. Palette: brushed steel, white polystyrene, black rollers, a little brass. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

### 19c. Dysepropell

En Kort-dyse er en ring rundt propellen som samler strålen: mer skyvekraft ved lav fart og
under slep, som er akkurat det en tråler driver med. Standard på trålere og slepebåter i
virkeligheten. Kutter dieselen per hal fra 2 til 1,5.

Den hører hjemme hos **Propell-Kjell** — mannen heter det, og han har aldri solgt deg en.

Fil: **`traal-dysepropell.png`** (907 tegn)

> Retro video game pixel art style. A single game icon: a **Kort nozzle propeller for a trawler** — a heavy steel ring, seen at a slight three-quarter angle so the ring reads as an open tube, with a **four-bladed bronze propeller mounted inside it**. The ring is thick and welded, painted dark with worn red antifouling on the lower half, and a short stub of shaft enters from the back. A few streaks of green weed and barnacle scars on the outside. Heavy, industrial and clearly built for pulling, not for speed. Palette: dark steel, bronze, red antifouling, a little green. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

### 19d. Større dieseltank

Fra 10 til 16 mål. Ingen effektivisering, bare rekkevidde. Med dysa i tillegg går du fra
fem hal per tank til nesten elleve.

Fil: **`traal-dieseltank.png`** (823 tegn)

> Retro video game pixel art style. A single game icon: a **large marine diesel tank** — a horizontal welded steel cylinder lying on two low cradles, with a **round inspection hatch and ring of bolts** on the end facing us, a **filler cap on top** with a short hose stub, and a small vertical **sight glass showing the level near full**. Painted a dull working grey with a few drips and stains down one side. Solid and unglamorous. Palette: grey steel, dark bolts, a little brass on the cap. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

---

## 20. Garn

Et tredje passivt redskap ved siden av teiner og bunnline. Garnet står som en vegg i sjøen
og fisker mens du er borte.

**Slik det bør virke i spillet:** settes på mellomdypt eller dypt vann, tar helt andre arter
enn stanga — sei, torsk, steinbit, breiflabb — og gir flere fisk per trekk enn teina, men
kan ikke settes like ofte. Det naturlige med garn er at det også koster noe: mister du det,
blir det stående og fiske videre helt av seg selv.

Spillet har allerede `funn-spokelsesgarn.png` med teksten «Fisker videre i årevis om det får
ligge. Nå gjør det ikke det.» Den lukker seg fint: taper du et garn, kan det dukke opp igjen
som spøkelsesgarn i en annens teine senere.

Fil: **`garn.png`** (977 tegn)

> Retro video game pixel art style. A single game icon: a **Norwegian gill net piled in a heap, ready to be set**. The bulk is a **loose mound of pale-green netting** — folded, slack and bunched, the mesh reading as soft diagonal lines across the pile, not a flat sheet. Along one edge of the heap runs a **line of small oval floats** half-buried in the folds. Resting on top: **two round orange marker buoys**, one with a short flagpole, a **coil of rope** and a **small lead weight**. One compact heap, wider than tall — the way a net lies on deck before it goes over the side. Palette: pale green net, orange buoys, weathered rope, dark lead. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

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

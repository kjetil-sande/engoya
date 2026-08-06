# Prompter — fiskeartene

**Status 6. aug: 56 arter i spillet.** 18 nye lagt inn med soner,
sesonger, redskap, teine- og linefangst. Laksesild og lysprikkfisk lyser i mørket.

> Reglene gjelder ALLE prompter i denne mappa: maks **1024 tegn**, magenta bakgrunn
> som nøkles ut i spillet, ingen kunstnernavn, og ingen av forbudsordene (west, east,
> rose, holm, skerry, beacon, isometric, «rust red», «bone white»). Full begrunnelse
> og feilhistorikk står i [kartet.md](kartet.md).

## 1. Skreien

Fil: **`skrei.png`** — ca. 1085 × 475, transparent bakgrunn (samme mål som `torsk.png`)
 16-bit pixel art side-view of a **skrei** — a spawning Atlantic cod from the Barents Sea. Distinctly different from a coastal cod: **leaner, more silvery, paler belly, brighter and cleaner** rather than mottled brown-green. Slim muscular body in spawning condition, prominent chin barbel, three dorsal fins, pale lateral line running the full length. Cool silver, pewter and pale olive palette with a faint blue sheen along the back. Facing left. Strict pixel grid, hard-edged pixels, no anti-aliasing, no gradients — ordered dithering only. Limited 24-colour palette. Fully transparent background, no shadow, no outline glow.

Skreien bruker samme oppføring som torsk i spillet — den er samme art. Sprite-en er
bare et sesongansikt, og koden bytter navn og pris automatisk i januar–april.

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


---

## Sjekkliste — alle arter

De 38 vi har (PNG i assets) er krysset av; nye kandidater står åpne:

- [x] Sei (`sei.png`, vanlig)
- [x] Lyr (`lyr.png`, vanlig)
- [x] Makrell (`makrell.png`, vanlig)
- [x] Berggylte (`berggylte.png`, sjelden)
- [x] Sandflyndre (`sandflyndre.png`, vanlig)
- [x] Skrubbe (`skrubbe.png`, sjelden)
- [x] Knurr (`knurr.png`, sjelden)
- [x] Hvitting (`hvitting.png`, sjelden)
- [x] Lomre (`lomre.png`, sjelden)
- [x] Torsk (`torsk.png`, vanlig)
- [x] Hyse (`hyse.png`, vanlig)
- [x] Sild (`sild.png`, vanlig)
- [x] Blåstål (`blastal.png`, sjelden)
- [x] Lysing (`lysing.png`, sjelden)
- [x] Uer (`uer.png`, vanlig)
- [x] Rødspette (`rodspette.png`, sjelden)
- [x] Brungylt (`brungylt.png`, sjelden)
- [x] Brosme (`brosme.png`, vanlig)
- [x] Lange (`lange.png`, vanlig)
- [x] Blålange (`blaalange.png`, sjelden)
- [x] Storskate (`skate.png`, sjelden)
- [x] Hågjel (`haagjel.png`, vanlig)
- [x] Havmus (`havmus.png`, sjelden)
- [x] Svarthå (`svarthaa.png`, sjelden)
- [x] Blåkveite (`blaakveite.png`, vanlig)
- [x] Steinbit (`steinbit.png`, sjelden)
- [x] Pigghå (`piggha.png`, legendarisk)
- [x] Makrellstørje (`makrellstorje.png`, legendarisk)
- [x] Breiflabb (`breiflabb.png`, legendarisk)
- [x] Månefisk (`maanefisk.png`, legendarisk)
- [x] Håkjerring (`haakjerring.png`, legendarisk)
- [x] Rognkjeks (`rognkjeks.png`, sjelden)
- [x] Rognkall (`rognkall.png`, sjelden)
- [x] Ålekvabbe (`aalekvabbe.png`, sjelden)
- [x] Akkar (`akkar.png`, sjelden)
- [x] Skolest (`skolest.png`, sjelden)
- [x] Håbrann (`haabrann.png`, legendarisk)
- [x] Kveite (`kveite.png`, legendarisk)

- [x] Sjøørret (`sjoorret.png`) — i spillet 6. aug
- [x] Brisling (`brisling.png`) — i spillet 6. aug
- [x] Horngjel (`horngjel.png`) — i spillet 6. aug
- [x] Taggmakrell (`taggmakrell.png`) — i spillet 6. aug
- [x] Mulle (`mulle.png`) — i spillet 6. aug
- [x] Havål (`havaal.png`) — i spillet 6. aug
- [x] Gapeflyndre (`gapeflyndre.png`) — i spillet 6. aug
- [x] Glassvar (`glassvar.png`) — i spillet 6. aug
- [x] Piggvar (`piggvar.png`) — i spillet 6. aug
- [x] Slettvar (`slettvar.png`) — i spillet 6. aug
- [x] Sypike (`sypike.png`) — i spillet 6. aug
- [x] Øyepål (`oyepaal.png`) — i spillet 6. aug
- [x] Kolmule (`kolmule.png`) — i spillet 6. aug
- [x] Vassild (`vassild.png`) — i spillet 6. aug
- [x] Laksesild (`laksesild.png`) — i spillet 6. aug
- [x] Tangsprell (`tangsprell.png`) — i spillet 6. aug
- [x] Ulke (`ulke.png`) — i spillet 6. aug
- [ ] Dvergulke (`dvergulke.png`) — Firefly klarte den ikke (6. aug)
- [ ] Paddetorsk (`paddetorsk.png`) — Firefly klarte den ikke (6. aug)
- [x] Lysprikkfisk (`lysprikkfisk.png`) — i spillet 6. aug

---

## Nye arter (Bergen–Trondheim) — mal + innmat

Alle bruker SAMME mal. Bytt ut `<INNMAT>` med artens linje under, lagre som
`spill/assets/<k>.png` (ca. 512 × 256, transparent). Artsdata i FISH-tabellen
legger jeg inn når bildet finnes — si fra per art eller i bunt.

**Malen:**

> 16-bit pixel art of <INNMAT>, in side profile, facing left, body filling the width of the frame. Strict pixel grid, hard-edged pixels, no anti-aliasing, no gradients — ordered dithering only. Limited 24-colour palette. Fully transparent background, no shadow, no outline glow.

**Innmaten per art:**

- **Sjøørret** (`sjoorret.png`): a sea trout — sleek silver salmonid with scattered black x-shaped spots, small adipose fin, square tail
- **Brisling** (`brisling.png`): a European sprat — tiny slender silver baitfish with a blue-green back and razor keel of belly scutes
- **Horngjel** (`horngjel.png`): a garfish — extremely long needle-thin body, beak-like pointed jaws, emerald-green back, silver flanks
- **Taggmakrell** (`taggmakrell.png`): a horse mackerel — silver body with a distinct row of spiky lateral scutes and a dark gill spot
- **Mulle** (`mulle.png`): a red mullet — rosy-red body with yellow stripes and two long chin barbels
- **Havål** (`havaal.png`): a conger eel — thick muscular grey-brown eel body, large head, dorsal fin running the whole length
- **Gapeflyndre** (`gapeflyndre.png`): an American plaice — rough brown-grey flatfish with a big curved mouth and straight lateral line
- **Glassvar** (`glassvar.png`): a megrim — pale translucent sandy flatfish, slim oval body, large eyes and big mouth
- **Piggvar** (`piggvar.png`): a turbot — nearly round dark flatfish studded with bony tubercles, mottled sand-and-stone camouflage
- **Slettvar** (`slettvar.png`): a brill — oval smooth flatfish, sandy brown with pale freckles, frilled fin edges
- **Sypike** (`sypike.png`): a poor cod — small copper-tinted cod relative with big eyes and a short chin barbel
- **Øyepål** (`oyepaal.png`): a Norway pout — slim silvery cod relative with very large eyes and a slender tail stalk
- **Kolmule** (`kolmule.png`): a blue whiting — slender blue-grey open-water cod relative with a long tapering body
- **Vassild** (`vassild.png`): a greater argentine — silver smelt-like deepwater fish with huge eyes and a small mouth
- **Laksesild** (`laksesild.png`): a pearlside — tiny deepwater fish with rows of glowing blue photophores along the silver belly
- **Tangsprell** (`tangsprell.png`): a rock gunnel — small eel-like tidepool fish, olive body with a row of dark eyespots along the dorsal fin
- **Ulke** (`ulke.png`): a shorthorn sculpin — big-headed spiny brown fish with fanned pectoral fins and mottled camouflage
- **Dvergulke** (`dvergulke.png`): a tiny sculpin — miniature spiny big-mouthed bottom fish in grey-brown camouflage
- **Paddetorsk** (`paddetorsk.png`): a tadpole fish — odd soft brown fish with a huge blunt head tapering to a slim tail
- **Lysprikkfisk** (`lysprikkfisk.png`): a lanternfish — small deepwater fish with a blunt head, large eyes and rows of blue-green photophores

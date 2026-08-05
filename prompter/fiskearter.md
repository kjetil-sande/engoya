# Prompter — fiskeartene

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

Nye arter (Bergen–Trondheim-bolken) legges til her når de kommer.

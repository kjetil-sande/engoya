# Prompter — pose, linekrok, lyn og troféskapet

Samme regler som i PROMPTER-KARTET.md: maks 1024 tegn, magenta bakgrunn som nøkles
ut i spillet, ingen kunstnernavn, ingen av forbudsordene (west, east, rose, holm,
skerry, beacon, isometric, «rust red», «bone white»). Lagre med filnavnet som står
over hver prompt — koden peker allerede dit (eller får peker når bildet finnes).

---

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

## 4. Troféskapet — ti nye rariteter

Filnavnene følger funn-konvensjonen. Jeg legger tingene inn i FUNN-tabellen (med
nynorsk-tekster og vekter) når bildene ligger i assets — si fra når de er klare.

**Merk om varemerker:** Firefly stopper «Superman» og «Luke Skywalker». Promptene
under beskriver figurene generisk — nær nok til at alle skjønner spøken, langt nok
unna til å slippe gjennom filteret.

`spill/assets/funn-superhelt-truse.png` — gammel truse med supermann-logo:

> Retro video game pixel art style. A single game icon: an old pair of blue briefs underwear, stretched and faded from years of washing, with a worn yellow diamond-shaped hero emblem printed on the front, its red border cracked and peeling. The waistband is loose and slightly rolled. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading on the fabric folds. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/funn-svommefotter.png` — svømmeføtter:

> Retro video game pixel art style. A single game icon: a pair of old rubber swim fins standing upright side by side, faded turquoise with sun-bleached patches, one fin slightly bent at the tip, adjustable heel straps hanging loose. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading along the blades. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/funn-romhelt-figur.png` — Luke Skywalker-aktig figur:

> Retro video game pixel art style. A single game icon: a small vintage plastic action figure of a young space hero in a simple white tunic and tan trousers, holding a tiny glowing blue energy sword, standing stiffly with the straight arms and simple face of a 1980s toy, paint worn off one boot. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/funn-lekepistol.png` — lekepistol med PANG-flagg:

> Retro video game pixel art style. A single game icon: a vintage tin toy pistol in cheerful red and silver, and from its barrel a small unrolled white flag on a thin stick, the flag showing the word PANG in bold red capital letters. The toy looks old and well loved, paint chipped at the grip. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text anywhere except the word PANG on the flag, no drop shadow.

`spill/assets/funn-frimerker.png` — frimerkesamling:

> Retro video game pixel art style. A single game icon: an open stamp collection album, water-stained dark green cover, one page showing rows of small colourful postage stamps in neat mounts, a few stamps loose and sliding out, one corner of the album swollen from damp. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading on the pages. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/funn-lavalampe.png` — gammel lavalampe:

> Retro video game pixel art style. A single game icon: a vintage lava lamp with a tapered glass body on a brushed metal cone base, glowing warm orange liquid with two big soft blobs rising, a smaller blob splitting off, the metal cap slightly dented. Chunky and readable at small size: few large details, thick clean pixel outlines, warm inner glow shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/funn-tresko.png` — en tresko:

> Retro video game pixel art style. A single game icon: one single old wooden clog, carved from pale worn wood with a rounded toe and a low heel, deep scratches and a small crack across the top, a faded painted flower pattern barely visible on the side. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading in the wood grain. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/funn-skratobakk.png` — gammel metallboks skråtobakk:

> Retro video game pixel art style. A single game icon: an old round flat metal tin of chewing tobacco, dull brass-coloured lid with an embossed anchor motif and ornate border, edges worn to bare metal, small dents and a spot of verdigris, lid slightly ajar showing dark tobacco inside. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm metallic shading. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/funn-leppestift.png` — knallrød leppestift:

> Retro video game pixel art style. A single game icon: a bright red lipstick fully wound up from its elegant gold metal tube, the cap standing beside it, the red tip angled and slightly used, a tiny smudge of red at the tube rim. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading and one small highlight on the gold. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

`spill/assets/funn-olflaske.png` — gammel ølflaske fra Nordlandsbryggeriet:

> Retro video game pixel art style. A single game icon: an old brown glass beer bottle with a rusty crown cap still on, a faded cream paper label with a simple mountain-and-wave emblem, the label torn at one corner and stained by seawater, a strand of seaweed clinging to the neck. Chunky and readable at small size: few large details, thick clean pixel outlines, slight warm shading on the glass. Centred, filling most of the frame. The entire background is flat solid magenta, one single colour, completely empty; nothing touches the image edge. Strict pixel grid, hard-edged pixels, no anti-aliasing, no text, no drop shadow.

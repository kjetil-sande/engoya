#!/bin/sh
# Hele sjekkjeden i én kommando. Ingenting skal pushes uten at denne er grønn.
#
#   sh verktoy-alt.sh
#
# Avslutter med kode 0 bare hvis ALT gikk igjennom — så den kan kjedes trygt
# med && foran en push. Faller ett ledd, stopper resten.

set -e
cd "$(dirname "$0")"

echo "── Syntaks ──────────────────────────────────────────"
python3 -c "
import io, re
s = io.open('fiske.html', encoding='utf-8').read()
b = [m.group(1) for m in re.finditer(r'<script>(.*?)</script>', s, re.S)]
io.open('/tmp/spill.js', 'w', encoding='utf-8').write('\n'.join(b))
"
node --check /tmp/spill.js                  && echo "  OK  fiske.html"
node --check netlify/functions/familierekorder.mjs && echo "  OK  familierekorder"
node --check netlify/functions/statistikk.mjs      && echo "  OK  statistikk"
python3 -c "
import io, re
s = io.open('kontrollpanel.html', encoding='utf-8').read()
io.open('/tmp/panel.js', 'w', encoding='utf-8').write(
    re.search(r'<script>(.*)</script>', s, re.S).group(1))
"
node --check /tmp/panel.js                  && echo "  OK  kontrollpanel"

echo ""
echo "── Bildene som spillet ber om, finnes de i git? ─────"
python3 - <<'PY'
import io, re, subprocess, sys

# Et bilde som ligger på disk men ikke er sjekket inn ser helt riktig ut lokalt
# og er borte på nett. Det har skjedd, og det fanges bare her — «git push»
# sender commits, ikke arbeidsmappa.
s = io.open('fiske.html', encoding='utf-8').read()

vil = set(re.findall(r'spill/assets/([\w.@-]+\.\w{2,4})', s))   # direkte stier
navn = set(re.findall(r'\bimg\s*:\s*"([^"]+)"', s))             # tabellfelt
for n in navn:
    vil.add(n if '.' in n else n + '.png')   # bildeFil(): .png når punktum mangler

# Filer som med vilje ikke finnes. Uten denne lista roper sjekken ulv hver
# eneste kjøring, og da slutter man å lese den.
VENTA = {
    "ny-art.png":      "plassholder — plugges inn når eieren har tegnet den",
    "funn-rolex.gif":  "død reservesti; funn-rolex-rusten.png finnes og brukes",
}

har = set(p.split('/')[-1] for p in subprocess.run(
    ['git', 'ls-files', 'spill/assets'], capture_output=True, text=True).stdout.split())

# En sjekk som finner null filer består alltid. Den fella har vi gått i før.
if len(vil) < 150:
    print("  FEIL  utdraget fant bare %d filer — sjekken er ødelagt, ikke koden" % len(vil))
    sys.exit(1)

mangler = sorted(f for f in vil if f not in har and f not in VENTA)
if mangler:
    print("  FEIL  ikke sjekket inn: " + ", ".join(mangler))
    sys.exit(1)
print("  OK  alle %d filer er i git (%d ventet på med vilje)" % (len(vil), len(VENTA)))
PY

echo ""
echo "── Data og synk ─────────────────────────────────────"
python3 verktoy-synkvakt.py     | tail -1
python3 verktoy-datatapstest.py | tail -1
python3 verktoy-kopitest.py     | tail -1

echo ""
echo "── Server og panel ──────────────────────────────────"
node verktoy-servertest.mjs | tail -1
node verktoy-paneltest.mjs  | tail -1
node verktoy-uketest.mjs    | tail -1

echo ""
echo "═══ ALT GRØNT ═══"

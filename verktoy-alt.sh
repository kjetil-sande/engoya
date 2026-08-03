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

# Ikke alle filnavn står skrevet ut. agnImg() bygger «agn-<nøkkel>» i kjøretid,
# og KROKAGN peker på egne kroken-varianter. Uten disse to linjene kunne agn-
# bildene forsvinne fra git uten at sjekken merket det — som er nøyaktig det
# den finnes for å hindre.
navn |= set(re.findall(r'\bKROKAGN\s*=\s*\{([^}]*)\}', s)[0].count and
            re.findall(r':\s*"([^"]+)"', re.findall(r'\bKROKAGN\s*=\s*\{([^}]*)\}', s)[0]) or [])
agnmap = dict(re.findall(r'(\w+)\s*:\s*"([\w-]+)"',
              re.search(r'function agnImg\(a\)\{[^}]*\{([^}]*)\}', s).group(1)))
for k in re.findall(r'\bAGN\s*=\s*\[(.*?)\n\];', s, re.S)[0].split('{k:"')[1:]:
    nok = k.split('"')[0]
    navn.add('agn-' + agnmap.get(nok, nok))

for n in navn:
    vil.add(n if '.' in n else n + '.png')   # bildeFil(): .png når punktum mangler

# Filer som med vilje ikke finnes. Uten denne lista roper sjekken ulv hver
# eneste kjøring, og da slutter man å lese den.
VENTA = {
    "funn-rolex.gif":       "død reservesti; funn-rolex-rusten.png finnes og brukes",
    # Arkivet — eieren tegner disse. Spillet faller pent tilbake i mellomtiden:
    # ikonet bruker den gamle boka, og overskriften «📖 Arkivet» står til logoen
    # lander. Fjern linjene her når filene kommer, så vokter sjekken dem videre.
    "arkivet-ikon.png":     "under arbeid — faller tilbake til fangstbok.png",
    # Tettere beskårne portretter til de tre dekksknappene. Faller tilbake på
    # portrett-*.png til de kommer, så knappene ser riktige ut i mellomtiden.
    "knapp-rusten.png":     "under arbeid — faller tilbake til portrett-rusten.png",
    "knapp-kjell.png":      "under arbeid — faller tilbake til portrett-kjell.png",
    "knapp-maalfrid.png":   "under arbeid — faller tilbake til portrett-maalfrid.png",
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
echo "── Spillmekanikk ────────────────────────────────────"
node verktoy-spillrevisjon.mjs | tail -1
node verktoy-softlocktest.mjs  | tail -1
# Kontrollen: softlocktesten skal FALLE uten propellvakta. Består den begge veier,
# beviser den ingenting — den fella gikk vi i med datatapstesten i første forsøk.
node verktoy-softlocktest.mjs --uten-propellvakt >/dev/null 2>&1 \
  && echo "  OK  kontroll: softlocktesten fanger fella uten vakta" \
  || { echo "  FEIL  softlocktesten består UTEN vakta — den beviser ingenting"; exit 1; }

python3 - <<'PY'
# Kamp-UI-en ligger over dekksknappene. Slippes den ikke når du er tilbake på dekk,
# blir strømpila og dybdesøyla liggende oppå Rusten- og Verksted-knappene. Regelen:
# HVER gang phase settes til "idle", skal #reelui slås av i samme åndedrag.
import io, re, sys
s = io.open('fiske.html', encoding='utf-8').read()
L = s.split('\n')
mangler = []
for i, l in enumerate(L):
    if not re.search(r'phase\s*=\s*"idle"', l): continue
    if re.match(r'\s*var\s+depth\s*=', l): continue          # deklarasjonen; av frå start
    if 'reelui").classList.remove("on")' not in '\n'.join(L[max(0,i-2):i+4]):
        mangler.append(i+1)
print("  OK  #reelui slås av alle %d stedene phase blir «idle»" % sum(
        1 for l in L if re.search(r'phase\s*=\s*"idle"', l))
      if not mangler else "  FEIL  #reelui blir liggende — linje " + ", ".join(map(str, mangler)))
sys.exit(1 if mangler else 0)
PY

python3 - <<'PY'
# verktoy-rapportdata.js har en HÅNDKOPIERT utgave av FISH, SLUK og AGN, og
# PDF-rapporten til svogeren bygger på den. Driver kopien fra spillet, begynner
# rapporten å lyve uten at noe annet merker det.
import io, re, sys
def tab(s, namn):
    i = s.index('var ' + namn + '=['); d = 0
    for j in range(s.index('[', i), len(s)):
        if s[j] == '[': d += 1
        elif s[j] == ']':
            d -= 1
            if not d: return s[i:j+1]
sp = io.open('fiske.html', encoding='utf-8').read()
rp = io.open('verktoy-rapportdata.js', encoding='utf-8').read()
def bmap(t):
    return {m.group(1): m.group(2).replace(' ', '')
            for m in re.finditer(r'\{k:"([^"]+)".*?b:\{([^}]*)\}', t)}
avvik = []
for n in ('SLUK', 'AGN'):
    a, b = bmap(tab(sp, n)), bmap(tab(rp, n))
    for k in sorted(set(a) | set(b)):
        if a.get(k) != b.get(k): avvik.append('%s/%s' % (n, k))
print("  OK  rapporttabellen er lik spillets" if not avvik
      else "  FEIL  rapportdata har drevet fra spillet: " + ", ".join(avvik))
sys.exit(1 if avvik else 0)
PY

python3 - <<'PY'
# Bensinprisen står to steder: i knappene (håndskrevet HTML) og i needF (JS).
# Driver de fra hverandre, lyver dybdevelgeren om hva turen koster.
import io, re, sys
s = io.open('fiske.html', encoding='utf-8').read()
knapp = re.findall(r'class="bens">.*?x (\d)</small>', s)
m = re.search(r'var needF = \[([\d,]+)\]', s)
kode = m.group(1).split(',') if m else []
if knapp == kode and len(knapp) == 4:
    print("  OK  dybdevelgeren viser samme bensinpris som koden tar (%s)" % "/".join(knapp))
else:
    print("  FEIL  knappene sier %s, koden tar %s" % (knapp, kode)); sys.exit(1)
PY

python3 - <<'PY'
# NAPPET MENS DU HOLDT. Krokinga skjer i pointerdown, så står fingeren alt nede
# fordi du lokka, kommer det ingen ny pointerdown og fisken slipper unna uten at
# du gjorde noe galt. Tre ting må stå, og de henger sammen:
import io, sys
s = io.open('fiske.html', encoding='utf-8').read()
krav = [
  ("rå fingertilstand finnes",        'var fingerNede=false;'),
  ("pointerdown setter den",          'function down(e){ fingerNede=true;'),
  ("pointerup nullstiller den",       'function up(){ fingerNede=false;'),
  ("bit mens fingeren er nede kroker","if(fingerNede){ tryHook(); return; }"),
  ("krokinga beholder grepet",        'holding=fingerNede;'),
]
mangler = [n for n, t in krav if t not in s]
# Og det gamle som MÅ være borte: tryHook satte holding=false uansett.
if 'phase="reel"; tension=0; prog=0; holding=false;' in s:
    mangler.append("tryHook slipper grepet igjen (holding=false)")
print("  OK  nappet-mens-du-holdt: alle %d leddene står" % len(krav) if not mangler
      else "  FEIL  " + "; ".join(mangler))
sys.exit(1 if mangler else 0)
PY

python3 - <<'PY'
# SILKESNØRET ER DET EINASTE UTSTYRET SOM KAN FORSVINNE.
# Alt annet utstyr er monotont: satt én gang, sant for alltid — både i gearLoft
# på klienten og i carry-forward på serveren. Havner «silke» i de listene,
# kommer et snøre som nettopp røk tilbake neste gang noen i familien synker,
# og forbruksvaren er gratis. Det ville ingen test fanget uten denne.
import io, re, sys
sp = io.open('fiske.html', encoding='utf-8').read()
sv = io.open('netlify/functions/familierekorder.mjs', encoding='utf-8').read()
feil = []
if '"silke"' not in sv.split('GEAR_JANEI')[1].split(']')[0]:
    feil.append("silke mangler i serverens GEAR_JANEI — feltet blir vasket bort")
carry = re.search(r'for \(const k of \[([^\]]*)\]\) if \(gml\[k\]\)', sv)
if carry and 'silke' in carry.group(1):
    feil.append("silke ligger i carry-forward — et røket snøre ville gjenoppstå")
if re.search(r'if\(np\.silke\)lp\.silke=true', sp):
    feil.append("gearLoft gjør silke monotont — samme feil på klienten")
if 'if(np.silke!=null)lp.silke=np.silke;' not in sp:
    feil.append("gearLoft flytter ikke silke i det hele tatt")
print("  OK  silkesnøret kan faktisk ryke — utenfor begge de monotone listene" if not feil
      else "  FEIL  " + "; ".join(feil))
sys.exit(1 if feil else 0)
PY

node verktoy-trofetest.mjs | tail -1
node verktoy-trofevern.mjs | tail -1
python3 - <<'PY'
# Telleren «N av M» og regelen for hva som KAN bli trofé må bruke samme unntak.
# Driver de fra hverandre, teller skapet mot et tall som ikke finnes.
import io, re, sys
s = io.open('fiske.html', encoding='utf-8').read()
regel = re.search(r'if\(!l\.valg && ([^)]*)\)\{ l\.valg=v;', s)
teller = re.search(r'FUNN\.forEach\(function\(f\)\{ if\(([^)]*)\)n\+\+;', s)
if not regel or not teller:
    print("  FEIL  fant ikke begge reglene"); sys.exit(1)
def felt(t): return sorted(re.findall(r'!\w+\.(\w+)', t))
a, b = felt(regel.group(1)), felt(teller.group(1))
print("  OK  telleren og skapet bruker samme unntak (%s)" % ", ".join(a) if a == b
      else "  FEIL  skapet unntar %s, telleren unntar %s" % (a, b))
sys.exit(0 if a == b else 1)
PY

echo ""
echo "── Server og panel ──────────────────────────────────"
node verktoy-servertest.mjs      | tail -1
node verktoy-paneltest.mjs       | tail -1
node verktoy-uketest.mjs         | tail -1
node verktoy-innloggingstest.mjs | tail -1

echo ""
echo "═══ ALT GRØNT ═══"

#!/usr/bin/env python3
# Dørvakt: er innlogginga til panelet ordrett den samme i begge funksjonane?
#
# statistikk.mjs og anmeldelser.mjs har hver sin kopi av googleDoer(). Det er et
# bevisst valg — Netlify-funksjoner er separate filer, og å legge om en dør som
# virker rett før lansering er verre enn å kopiere den. Men to håndskrevne kopier
# driver alltid fra hverandre, og det som ryker er som regel aud-sjekken: uten den
# slipper et gyldig token fra en HVILKEN SOM HELST annen Google-app rett inn.
#
# Derfor denne: kopiene skal være like byte for byte. Endrer du den ene, må du
# endre den andre.
#
#   python3 verktoy-doervakt.py

import io, re, sys, difflib

FILER = ["netlify/functions/statistikk.mjs", "netlify/functions/anmeldelser.mjs",
         "netlify/functions/feilmelding.mjs"]
MONSTER = r'const GOOGLE_TOKENINFO = .*?\nasync function googleDoer\(req\) \{.*?\n\}\n'

dorer = {}
for f in FILER:
    m = re.search(MONSTER, io.open(f, encoding='utf-8').read(), re.S)
    if not m:
        print("✗ fant ingen googleDoer i " + f); sys.exit(1)
    dorer[f] = m.group(0)

a = dorer[FILER[0]]
print("døra er %d tegn, funnet i alle %d filene." % (len(a), len(FILER)))

# Fanger den også en ENDRING, ikke bare fravær? En vakt som alltid sier ja er
# ingen vakt. Vi prøver den mot en dør der aud-sjekken er fjernet.
if a.replace("if (k.aud !== klientId)", "if (false)") == a:
    print("✗ motprøven bommet — aud-sjekken finnes ikke å fjerne"); sys.exit(1)

for f in FILER[1:]:
    if a != dorer[f]:
        print("✗ DØRENE HAR DREVET FRA HVERANDRE:")
        for l in difflib.unified_diff(a.split("\n"), dorer[f].split("\n"),
                                      FILER[0], f, lineterm="", n=1):
            print("   " + l)
        sys.exit(1)

# aud, iss, email_verified og allowlist må alle stå der. Slettes én, er døra åpen
# for en hel klasse tokens, og en ren likhetstest ville ikke merket det så lenge
# begge filene ble endret likt.
for krav, hvorfor in [("k.aud !== klientId", "token fra en annen app slipper inn"),
                      ("k.iss !==", "hvem som helst kan utstede tokenet"),
                      ("email_verified", "en ubekreftet adresse teller"),
                      ("lovlege.includes", "alle med Google-konto slipper inn")]:
    if krav not in a:
        print("✗ MANGLER «%s» — da %s" % (krav, hvorfor)); sys.exit(1)

print("✓ alle %d identiske, og alle fire sjekkene (aud, iss, verifisert, allowlist) står" % len(FILER))

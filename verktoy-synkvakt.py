#!/usr/bin/env python3
# Synkvakt: sjekker at hvert felt gearUt() sender også er nevnt i serverens kode.
#
# Bakgrunnen: klienten og serveren har hver sin håndholdte hviteliste. Har de
# drevet fra hverandre, kaster serveren feltet STILLE — og spilleren mister det
# ved bytte av enhet. Det har skjedd tre ganger: troféskapet, kampbeltet, og
# invest med penger i.
#
# Kjør fra prosjektroten:  python3 verktoy-synkvakt.py
# Den fanger IKKE om feltet flettes riktig — bare at serveren i det hele tatt
# kjenner navnet. Det er en røykvarsler, ikke en brannmur.

import io,re,sys
kl=io.open('fiske.html',encoding='utf-8').read()
sv=io.open('netlify/functions/familierekorder.mjs',encoding='utf-8').read()
m=re.search(r'function gearUt\(\)\{[\s\S]*?\n\}', kl)
felt=set(re.findall(r'(\w+):P\.\w+', m.group(0)))
mangl=[f for f in sorted(felt) if f not in sv]
print("gearUt sender %d felt."%len(felt))
if mangl:
    print("✗ IKKJE NEMNT PÅ SERVEREN:", ", ".join(mangl)); sys.exit(1)
print("✓ alle felt finst i serverkoden")

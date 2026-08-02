# Når noe er kritisk galt og du ikke har laptopen

Kortversjonen: **rull tilbake selv først, be om fiks etterpå.** Tilbakerullingen
tar ti sekunder fra telefonen og kan ikke gjøre ting verre. En fiks skrevet i
hui og hast kan.

---

## 1. Rull tilbake — Netlify, fra telefonen

1. `app.netlify.com` → siden → **Deploys**
2. Finn den siste som virket (den over den nyeste)
3. **Publish deploy**

Det er ferdig. Ingen bygging, ingen git, ingen meg. Spillet står på forrige
versjon i løpet av sekunder, og ingen brukerdata røres — alt ligger i Netlify
Blobs og i nettleserne, ikke i utgivelsen.

**Gjør dette først, alltid.** Selv om du vet hva feilen er. Det koster
ingenting å rulle tilbake, og det kjøper deg all den tiden du trenger.

---

## 2. Si fra til meg

Åpne **claude.ai/code** i nettleseren på telefonen, velg `engoya`-repoet, og
skriv eller les inn hva som skjer. Det virker uten laptop.

Det jeg trenger for å komme i gang uten å gjette:

- **Hva så du?** «Ingenting skjer når jeg trykker Kast» slår «spillet er ødelagt»
- **Hvor?** Telefon eller PC, hvilken nettleser
- **Når begynte det?** Etter siste push, eller plutselig av seg selv
- **Har du rullet tilbake?** Så jeg vet om det haster eller ikke

Skjermbilde hjelper mer enn en beskrivelse. Legg det ved.

---

## 3. Hva jeg gjør

1. Finner feilen — som regel ved å lese den siste commiten som gikk ut
2. Retter den
3. Kjører **hele sjekkjeden**:

```bash
sh verktoy-alt.sh
```

Den dekker syntaks i alle fire filene, at alle 198 bildene er sjekket inn,
synkvakta, datatapstesten, kopitesten, servertesten, paneltesten og uketesten.
Faller ett ledd, stopper den, og da pusher jeg ingenting.

4. Sier fra hva jeg fant og hva jeg gjorde

---

## 4. Push — det du må si eksplisitt

Standardregelen står: **jeg pusher ikke uten at du sier ja.** Den gjelder også
midt på natta med et ødelagt spill.

Vil du at jeg skal pushe uten å spørre i akkurat dette tilfellet, skriv det i
meldingen:

> «Nødfiks — push når `verktoy-alt.sh` er grønn.»

Da gjør jeg det, og bare det. Godkjenningen gjelder den ene feilen, ikke resten
av økta.

---

## 5. Det jeg **ikke** kan fra en telefonøkt

Verdt å vite, så du ikke stoler på mer enn du får:

- **Jeg kan ikke se spillet.** Den visuelle sjekken jeg vanligvis gjør —
  åpne spillet, kaste ut, måle piksler — finnes ikke der. Jeg kan lese kode og
  kjøre tester, men ikke se at det ser riktig ut.
- **Derfor er tester som kjører uten nettleser alt jeg har.** Det er derfor de
  finnes, og derfor de skal holdes i live.
- **En feil som bare viser seg visuelt** — noe som ligger feil, en knapp
  utenfor skjermen — kan jeg rette blindt, men ikke bekrefte. I de tilfellene
  er tilbakerulling det riktige til du er hjemme.

---

## 6. Hvis serveren er nede, ikke spillet

Symptom: spillet virker, men rekorder synker ikke og fiskerkortet svarer ikke.

- Netlify → **Functions** → se om `familierekorder` feiler
- Spillet er bygget for å tåle dette: alt ligger lokalt i nettleseren og synker
  når serveren kommer tilbake. Ingen mister noe.
- Det haster altså mindre enn det ser ut som. Ikke push en hastefiks på en
  serverfeil du ikke har lest loggen på.

---

## 7. Kontrollpanelet

`engoya.no/kontrollpanel.html` — krever `STATS_NOKKEL`, som settes i
Netlify → Site configuration → Environment variables. Uten den svarer panelet
503 og viser ingenting. Det faller aldri åpent.

Panelet er også en diagnose: faller «aktive i dag» til null en dag det pleier å
være folk der, er noe galt selv om spillet ser fint ut hos deg.

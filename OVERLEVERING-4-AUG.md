# Overlevering: Fiskespillet — ny tråd

Skrevet 4. august 2026, ved slutten av flytteøkten. Dette dokumentet er selvbærende:
alt en ny tråd trenger å vite står her, uavhengig av gammel samtalehistorikk.
Minnefilene er i tillegg kopiert til denne mappens minneplassering.

---

## 1. Kartet over alt

| Hva | Verdi |
|---|---|
| Spillet | **fiskespillet.no** → `fiske.html` (rota 301-er dit). Repo `kjetil-sande/fiskespillet` (privat), Netlify-site `fiskespillet`, site-ID `762c8684-91ff-4f96-b766-622f641343e0` — **samme ID som alltid; blobs fulgte med, ingen data flyttet** |
| Hytta | **engoya.no** — eget repo `kjetil-sande/engoya-hytta`, Netlify-site `engoya-nettside`. Ikke lenger vår hverdag, men `engoya.no/fiske.html` er overleveringsside med localStorage-redning og skal stå i minst tolv måneder |
| Lokale mapper | `~/Documents/Claude/Fiskespillet` (spillet) og `~/Documents/Claude/Engøya` (hytta) — omdøpt 4. aug, alle stier i begge repoer er rettet |
| Serverdata | Netlify Blobs: `familierekorder` (koder, fiskerkort, alt spillerinnhold), `storkveita-anmeldelser`, `storkveita-takst` (rate-teller, verdiløs) |
| Sikkerhetskopi | `~/Documents/Claude/Engøya-sikkerhetskopier/serverkopi-2026-08-03-16-10-16.json` — 16 koder, 26 profiler, 48 troféer, 447 artsrekorder, lest tilbake og verifisert. Ny kopi: `node verktoy-blobkopi.mjs` med ferskt Netlify-token (det gamle er drept) |
| Nøkler | `STATS_NOKKEL` satt i Netlify (panel + anmeldelser; serveren trimmer nå). `GOOGLE_PLACES_KEY` på hytte-siten. Google-innlogging for panelet er bygget men ikke aktivert (`PANEL_EPOST` + `GOOGLE_CLIENT_ID` mangler i Netlify — oppskrift i NØDPROSEDYRE.md §7) |
| ~~Domene på vent~~ | **fiskespill.no GJORT 4. aug** — videresender, verifisert 301 → fiskespillet.no → /fiske.html 200 (http og https) |
| noindex | Står PÅ for fiskespillet.no med vilje. **Avgjort 4. aug: blir stående til spillet er finpusset mer.** Ikke foreslå å fjerne den uoppfordret |

## 2. Reglene som alltid gjelder

1. **Aldri `git push` uten eierens grønne lys** — og aldri kjede push etter en sjekk som kan feile; bruk `&&` hele veien.
2. **Samle commits, push i bolker** — hver push koster Netlify-byggeminutter, og eieren har gått tom for credits to ganger. Commits som bare rører `verktoy-*`, `.md` eller `.claude/` merkes `[skip netlify]`.
3. **Ingen brukerdata kan gå tapt, noensinne.** Synk fletter monotont, erstatter aldri. Alt nytt utstyr/felt må inn i BÅDE `gearUt()` (klient) og `vaskGear`/carry-forward (server) — denne fellen har smelt tre ganger; `verktoy-synkvakt.py` vokter den.
4. **Bokmål i alt eieren ser** — også workflow-navn, agent-etiketter, echo-linjer og kodekommentarer. Eneste unntak: Rustens replikker i spillet er nynorsk (karaktervalg).
5. **Ingen emoji foran tekst i spillet** (etterstilt emoji er greit). Kontrollpanelet er unntatt.
6. **Ingen softlock; alt skal virke fra 320 px bredde.**
7. **Metoden:** patch med eksakt-anker (alt-eller-ingenting), verifiser ved å kjøre ekte kode ekstrahert fra `fiske.html`, motprøv hver ny vakt ved å fjerne den og se testen slå ut. `sh verktoy-alt.sh` er porten før hver push — alt grønt eller ingen push.
8. Nye ønsker midt i arbeid går i kø, ikke rett i fingrene.

## 3. Sluttstatus 4. august

Flyttingen er **fullført og verifisert**: begge domener, www-varianter, sertifikater,
funksjoner, blobs. Redningssiden på engoya.no/fiske.html videresender besøk uten
fangstbok rett til fiskespillet.no; besøk MED strandet fangstbok får redningen
(26 tester, begge ender på ekte kode — første ekte bruker: Myge, 4. aug).

I spillet i dag: anmeldelser (fem fisker-«stjerner» vendt mot femmeren + 500 tegn,
samles ugodkjent bak panelet), SPENN/DYBDE samlet til venstre (+10 %), tommel opp
uten fisk under hånden, størrelsesskalert fiskefart, Rusten prissortert billigst
først, haptikk ved napp (Android; iPhone støtter ikke API-et).

## 4. Køen, i anbefalt rekkefølge

**Status 5. aug (stor justeringsbolk gjennomført):** Dagens Bestilling er FERDIG med
sjekkliste-UI, pose (tekst venstre/pose høyre/innhold i boksen etter åpning) og dagens
fisk-linja over hyllefanene. GJORT samme bolk: stressbaren står ALLTID ved dybdemåleren;
bensinbrikka viser pumpe → bar → kanne + «24+8»; Butikk/Verksted/Arkiv-tekstene 50 %
større; Stang II står før Krabbeteine; bakgrunnsfisken er sone- og sesongfiltrert
(pickAmbient bruker iSona); regnet er lavpasset (4,5 kHz), volum 0,55→0,40 og loopsømmen
trimmet; ctx.onstatechange + Snd.vekk() + pageshow-lytter gjenoppliver lyden etter
Safari-avbrudd (temaet pauses aldri og gjenopptas stumt); lynmotor (lyn-1..4.png,
PIL-plassholdere inne — eieren genererer ekte, prompter i PROMPTER-DIVERSE.md) med
2 blink + hovedlyn som står 1 s, torden på tidslinja, dev-hash #uvar; innboksmotoren
revidert (gravsteiner i flettene begge veier, deterministisk oppgjørs-id=turseed,
uleste øverst, vakter FØR innboksen lukkes, re-vakter i investJa, ringPe i stedet for
m.pe) med tilbakepil i telefontoppen → innboksen og «‹ Fiskerkortet» i innboksen;
«Meld inn»-pille i fiskerkortet → feilmelding.mjs (byte-lik paneldør, doervakta vokter
nå TRE filer) → egen seksjon i kontrollpanelet; statistikk.mjs kraftig utvidet (økonomi,
bestillinger, tips-utbredelse, per-art-fangst, tråler per fisker, vedlikehold);
Bankene-«?» flyttet midt på banken (qx/qy-merkepunkt). VENTER PÅ EIEREN: generere
bilder fra PROMPTER-DIVERSE.md (tom pose, linekrok, lyn ×4, tropeskap ×10 — FUNN-
oppføringene legges inn når bildene kommer), og iPhone-verifisering av lydfiksene.

1. **Kontrollpanelet — «legg til så mye verdi vi kan»** (eierens ord).
   Utstyrslisten mangler kjøleribbe, silkesnøre, motor-nivåer og teiner. Ønskelisten:
   sluker/agn og hvilke som har gitt best fangst og flest kveiter (`redskap`-feltet på
   bestefangstene har dataene), de lokale fiskerne og hvem som har investert i kvoter/
   utstyr (`P.invest` synkes), best/dårligst avkastning per fisker, pluss egne forslag
   (fangst per dybde, gullfisk, streaks). Alt beregnes samlet på serveren — ingen navn ut.
2. ~~Fiskekart-knappen~~ — **GJORT 4. aug, i annen form enn planlagt** (eierens valg):
   kvadratisk `#kartBtn` med pikselkart-ikon (knapp-kart.png, kodetegnet) til venstre for
   Sluksett i kastraden; actionBtn heter nå «Fisk!»; hele `#depthsel`-raden er FJERNET fra
   HTML (updateDepthLocks er null-sikret). Kartet: kotehav i kode, KART.felt-tabell (femte+
   sted = én linje), lei med animert stiplet kurs, glorievask av sprites, teasere for
   Bankene/Rekefeltet med kun «?». Dev-snarveier: `#kart` og `#kartalle`.
   MERK funnet under testing: «Dra på lopphavet» bruker `prompt()` (L~1837) — krasjer i
   nettlesere uten prompt-støtte (innebygde webviews à la Instagram/Facebook). Bør byttes
   til egen dialog en dag — i kø.
3. **Bunnliv.** Krabber/eremittkreps på Grunt-bunnen når eieren har generert
   `bunnkrabbe.png` og `eremittkreps.png` (prompter i PROMPTER-FISKERE-OG-SKREI.md §23).
   Blinkende øyepar i mørket på de tre dype nivåene tegnes i kode (gulgrønn på
   Mellomdyp, isblå i Djuphavet) — kan bygges uten å vente på bilder.
4. **Kontosletting.** «Slett meg» i fiskerkortet (fjerner spilleren fra familieblob +
   kortblob + lokalt, dobbel bekreftelse, tilby sikkerhetskopi først) + tidsstyrt
   funksjon som rydder blober urørt i X dager (eieren velger X). GDPR art. 17.
   NB: dette blir det eneste stedet i systemet som med vilje sletter — vaktene som
   håndhever «aldri tap» må lære unntaket eksplisitt.
3b. **Kartet, småfikser** (eierens ønsker 4. aug kveld, i kø ETTER Dagens Bestilling):
   (a) Saltvær klikkbart → zoomet landsby-utsnitt: Rustens butikk MED SKILT, Kjells verksted
   med skilt, Målfrids hus, røyk fra pipa, måke- og sjølyd, en katt som slikker poten.
   Det røde naustet er spillerens. Eieren vurderer å bytte båten mot en koseligere liten
   fiskebåt. Trenger egen Firefly-prompt (samme faste linjer som PROMPTER-KARTET.md).
   (b) iOS Safari tap-markering (hvit firkant ved trykk) skal bort:
   `-webkit-tap-highlight-color:transparent` på kartknappene/generelt — én CSS-linje.
4a. **Nye fiskearter: Bergen–Trondheim** (eierens ønske 4. aug, i kø). «Vi trenger å få inn
   en del til. Smått og stort» — arter som hører hjemme langs kysten fra Vestlandet til
   Trøndelag. 38 av 80 plasser brukt (MAKS_ARTER=80), så det er god plass. Egen bolk:
   artsdata i FISK-tabellen + sprite- og silhuett-prompter per art (mønster i
   PROMPTER-FISKERE-OG-SKREI.md). Kandidater å vurdere: sjøørret, lysprikkfisk, brisling,
   horngjel, taggmakrell, mulle, havål, gapeflyndre, glassvar, piggvar, slettvar, sypike,
   øyepål, kolmule, vassild, laksesild, tangsprell, ulke, dvergulke, paddetorsk.
4b. **Telefonen: apper og investeringsoversikt** (eierens ønske 4. aug, i kø). Kvote-/investeringsmodulen
   er for diffus i dag: du svarer ja til en kvote, får «på vei inn»-telefon, svarer «Takk» — og så
   ingenting før neste investeringsforespørsel. Ønsket: telefonen får APPER — «Meldinger» (dagens innboks),
   en investeringsapp med fremdrift per kvote (hvem, prosentsats, utstyr som større not, avkastning),
   og «Notater» der fisketips samles. Planen: Rusten gir fra seg tips etter hvert, og fiskerne gir tips
   etter hvert som du investerer hos dem. Se PLAN-TELEFONEN.md for eksisterende telefonarbeid.
4c. **Rustens daglige bestillinger** (eierens ønske 4. aug, i kø — EGET STORT PROSJEKT, «må bli så bra
   som mulig», bruk god tid). Eksempel: «Berit skal feire 70-årsdag og trenger: tre torsk, fire krabber,
   to sild og en lyr.» Fullført bestilling gir goodie bag med småting og av og til gode fisketips
   (lagres i Notater-appen, henger sammen med 4b). Det trengs en HAUG av bestillinger i ulik
   vanskelighetsgrad, og goodie bagen må stå i stil til vanskelighetsgraden.
5. **Penger (Stripe).** Fase 1: én Stripe-betalingslenke uten kodeendringer, for å måle
   betalingsvilje. Fase 2: Checkout + webhook-funksjon som krediterer til fiskerkortet
   (kortet ER kontoen; kjøp overlever enhetsbytte), 18+-port, vilkår, personvern-unntak
   for kvitteringer. Krever fra eieren: Stripe-konto, org (ENK holder), MVA-vurdering
   over 50 000 kr omsetning.

## 5. Beslutninger som ligger hos eieren

- **Pengemodell:** innholdssalg oppå helt gratis grunnspill (anbefalt), eierens
  99 kr-lås (nivå 1 gratis + 1 teine, resten betalt — legalt enklest, men gjør
  gratisspillet til en demo og stopper spredning barn→barn), eller kombinasjon.
- **Spissetanker:** eieren har varslet flere tanker om spissing av spillet.
- **X** for automatisk kontosletting.
- ~~noindex~~ — avgjort 4. aug: står til spillet er finpusset mer.
- ~~fiskespill.no~~ — gjort 4. aug.
- **Kannekost til Bankene** (se §7) og **navnene på kartet** (se PROMPTER-KARTET.md).

## 6. Premiumretningen (utredet 4. aug, dommerbedømt mot koden)

Selg **innhold og identitet**, aldri nødvendighet — hele dagens spill forblir gratis.
Toppkandidater: **navnebrett + skipsmaling hos Kjell** (alle NPC-båter har navn,
spillerens er navnløs — dom 9/10), **Eggakanten** som femte kjøpbart nivå 500–1000 m,
alltid natt (Trygves SMS og Rustens «ryktene om noe større» har forberedt den — ~79 kr
per familiekode), **kartblad Bankene** (skreifelt jan–april, kjøpes for spillkroner),
**Målfrids rekordplakat**, **Postsekken fra 1953** (17 brev, 17 uker), **Kåres mèd**
(daglig flyttende pin). Full utredning i minnefilen `premium-retning.md`.

**Advarselslisten — selges ALDRI:** superagn som ruller størrelse i øvre del av
spennet (betalt rekordmaskin — rekordene skal forbli ærlige), flere teiner enn fire,
fredningsunntak, motorhavari-immunitet.

## 7. Kjente skjær for neste bolk

- ~~`MAKS_ARTER` er 40~~ — **RETTET 4. aug mot koden: taket er 80**
  ([familierekorder.mjs:17](netlify/functions/familierekorder.mjs:17)), hevet i commit
  `c3241cf`. Spillet har 38 arter, alle med sprite og bok-silhuett i `spill/assets/` —
  ingen fisk ligger og venter. 42 ledige plasser; taket er ikke et hinder for Eggakanten.
- Bensintrappen `[1,2,3,4]` og `dailyFish`-filteret (`f.z!==3`) må utvides ved femte nivå.
- **Presisert 4. aug:** tallet 7 i [PLAN-KART-OG-TRAALER.md:40](PLAN-KART-OG-TRAALER.md:40)
  står i kolonnen **avstand** (Skjæret 0 … Rekefeltet 9), ikke bensinkanner — de to ble
  blandet. Det åpne spørsmålet er hva turen til Bankene skal koste i kanner:
  plandokumentets lange variant som gjør turen til en beslutning, eller utredningens milde 3.
- `spill/assets/anm-fisk-grey.png` ligger usporet igjen etter fiskeikon-runden —
  eieren har ikke sagt om den skal slettes.
- Kontrollpanelet er nøkkel-låst i dag; Google-innlogging ligger klar, venter bare på
  to Netlify-variabler.
- Verktøysuiten: `sh verktoy-alt.sh` i spillrepoet (alt), `verktoy-sjekk.mjs` +
  `verktoy-bergingstest.mjs` + `verktoy-nettsjekk.mjs` i hytterepoet.
  Dev-servere: `spillet` (port 8901) og `hytta` (8902) i `.claude/launch.json`.

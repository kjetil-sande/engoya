# Plan: kart, lengre ut, og reketråler

Bygget på det som allerede finnes i koden. Ingenting her krever ny motor.

---

## A. To bunnliner — én kveld

`fiske.html:2725` kapsler lina til én: `(P.pots.lineOwned||0)>=1` gjør butikkraden
disabled, og `function(){P.pots.lineOwned=1;}` setter alltid 1, aldri +1.

Endring: la den andre lina koste mer (1600 mot 800) og sett `lineOwned = (lineOwned||0)+1`
med tak på 2. Serveren tar allerede vare på feltet monotont — det fikset vi 1. august.

Da kan du sette én på Dypt og én på Djuphavet, som er nøyaktig det du ba om. Og det
gjør de tre neste punktene meningsfulle: uten kapasitet er mer innhold i djupet dødt.

---

## B. Kartet — hvorfor det trengs, og hvilken form det bør ha

Dagens velger er **én akse: dyp.** Grunt → Mellomdyp → Dypt → Djuphavet.
«Lengre ut» er en **andre akse: avstand fra havna.** To akser er et kart.

Men det er ikke et vilkårlig rutenett. I virkeligheten henger de to sammen — det er
kontinentalsokkelen. Nær land er det grunt, lenger ut blir det dypere, og på
eggakanten stuper det. **Kartet er altså en sokkelprofil**, og det er den formen
som gir riktig følelse.

### Formen

Erstatt de fire knappene med en håndfull **fiskefelt**, hvert med tre egenskaper:

| felt | dybde | avstand | bunn |
|---|---|---|---|
| Skjæret | 0–50 m | 0 | tang og stein |
| Sundet | 50–150 m | 1 | sand |
| Rennene | 150–300 m | 2 | leire |
| Eggakanten | 300–500 m | 4 | rev og bratt |
| Bankene | 100–250 m | 7 | grus — **skrei om vinteren** |
| Rekefeltet | 200–400 m | 9 | bløt leire — **kun trål** |

De fire første er dagens soner, bare navngitt. Ingenting brekker: `depth`-indeksen
består, feltene får en `dyp`-verdi som peker på samme artsutvalg som i dag.

### Hva avstanden gjør

Avstand koster drivstoff og **tid ut og hjem**. Det er der hele gevinsten ligger:

- **Været blir farlig igjen.** I dag virker vær, sol og måne nesten bare på Grunt
  (`DOGNDYP=[1,0.5,0.15,0]` — på Djuphavet er døgnrytmen ganget med null). Med
  avstand blir storm en reell grunn til å snu, og hele MET-systemet får mening
  utenfor Grunt for første gang.
- **Turen blir en beslutning.** 24 enheter drivstoff til 17 kr er en full tank på
  ~400 kr. Å dra til Rekefeltet skal koste nok til at du tenker deg om.
- **Rusten berger deg alltid.** Samme mønster som `P.pots.rescue` (`:2391`) — går
  du tom langt ute, tauer han deg hjem. Første gang gratis, så mot betaling, og
  gratis igjen hvis du er blakk. Aldri softlock.

---

## C. Reketråleren — et ANNET fartøy, ikke en oppgradering

Dette er det viktigste designvalget i hele planen.

**Hvis tråleren erstatter småbåten, dør spillet.** Stanga, snella, kampen mot fisken,
Rustens replikker, hunden på dekk — alt det er småbåten. En tråler som er «neste nivå»
gjør resten til fortid.

Løsningen: **to fartøy du bytter mellom i havna.**

| | Småbåten | Reketråleren |
|---|---|---|
| drivstoff | bensin, 17 kr/enhet | diesel, ~45 kr/enhet |
| tur ut | billig | dyr — du betaler før du vet |
| fiske | stang, teiner, line | trål |
| fangst | én fisk om gangen, spennende | bulk, i kilo |
| risiko | lav | du kan tape penger på en tur |

Tråleren låser ikke opp noe. Den er en **annen måte å spille på**, for den som vil
satse. Og småbåten er alltid der.

### Trålhalet er «teina» i ny form

Dette treffer nøyaktig det du ba om i forrige runde. Du setter trålen, den slepes i
**ekte tid** (2–6 timer), og du kommer tilbake til et fullt eller tomt nett.
Samme mønster som teina, samme kode-struktur (`setAt`, `seed`, `soak`), men med
mye høyere innsats og utbytte.

Og bifangst i reketrål er et ekte fenomen — det er derfor sorteringsrist er påbudt.
Der har du en hel liten historie å fortelle, i Rustens stemme.

---

## D. Skrei — den ligger allerede i dataene

`torsk.ss = [1.2, 1.6, 1.6, 1.4, 1.0, 0.9, 0.8, 0.8, 0.9, 1.0, 1.1, 1.1]` (`:897`).

Toppen er **januar, februar og mars**. Skreisesongen er der. Ingenting forteller det
til spilleren.

Det billigste innholdet i hele planen er å **navngi det som allerede skjer**: et
banner i februar, Rusten som snakker om skreien, og at Bankene er stedet. Null ny
mekanikk, null nye arter — bare at spillet sier hva som foregår.

Det gir deg også noe å bygge en sesong rundt uten å finne på noe.

---

## Rekkefølge

1. **To liner.** Én kveld. Gjør djupet spillbart.
2. **Skrei-vinduet navngis.** En halv kveld. Rent innhold, null risiko.
3. **Kartet** — som en omdøping og omorganisering av det som finnes, pluss to nye
   felt (Bankene, Rekefeltet). Avstand og drivstoff inn. 3–5 kvelder.
4. **Tråleren.** Sist, fordi den er størst og fordi den er den eneste som kan
   ødelegge spillets mildhet. 5–8 kvelder.

Punkt 1 og 2 er verdifulle alene. Stopper det der, har du fortsatt fått noe.

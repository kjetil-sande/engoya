# Utstyr som slites — prosjektnotat

Eierens ønske, 2. august 2026:

> «Når jeg har kjøpt ekkolodd, turbosnelle og annet utstyr bør det fortsatt stå i
> butikken … utstyr kan gå tapt eller blir ødelagt på sikt. Lag gjerne et prosjekt
> på det.»

Første halvdel er bygd: alt står i butikken hele tiden, låst med krav i stedet for
skjult. Andre halvdel — at utstyr faktisk kan ryke — er ikke bygd. Dette notatet
er grunnlaget for å ta avgjørelsen, ikke en bestilling.

---

## Hvorfor dette er farligere enn det ser ut

Spillet har ingen straff som tar fra spilleren noe han har betalt for. Det
nærmeste er at snøret ryker og du mister sluken — men en sluk koster 10–200 kr og
ligger i butikken hele tiden.

Et ekkolodd koster 4 000 kr. Et kampbelte 12 000. En vinsj 15 000. Å ta det bort
igjen er en helt annen type hendelse, og den er ikke reversibel for en spiller som
nettopp har spart i tjue turer.

Tre ting må være avklart før en linje kode skrives:

**1. Familien spiller sammen, og de synkroniserer.** `gearLoft()` behandler i dag
utstyrsfeltene som monotone — én gang sann, alltid sann. Det er ikke en tilfeldig
detalj, det er sikringen mot at en gammel telefon skal kunne ta fra deg noe du har
kjøpt. Skal utstyr kunne ryke, må den sikringen ned, og da må noe annet ta over:
en teller som bare går oppover (`belteKjopt: 3`, `belteRykt: 2`) i stedet for et
ja/nei-flagg. Uten det vil en telefon som har vært offline i to dager kunne
gjenopplive et ekkolodd — eller verre, drepe et.

**2. Softlock.** Vinsjen låser opp Djuphavet. Ryker vinsjen mens spilleren står på
Djuphavet med tom tank, er han fast. Enhver slitasjeregel må ha en «du kan alltid
komme deg hjem»-klausul, og den må testes, ikke antas.

**3. Det må ikke bli en skatt på å spille mye.** Om slitasje følger antall turer,
straffer den nøyaktig den spilleren vi vil beholde. Om den følger tid, straffer den
den som er borte. Begge deler er feil vei.

---

## Forslaget jeg ville bygget

**Utstyr ryker aldri av seg selv. Det ryker som følge av noe spilleren så skje.**

Konkret: slitasje henger på hendelser spilleren allerede opplever som dramatiske,
og som han allerede har en følelse av at gikk galt.

| Utstyr | Ryker når | Sannsynlighet |
|---|---|---|
| Turbosnelle | snøret ryker (`snap()`) på Dypt/Djuphavet | 2 % per snap |
| Kampbelte | snøret ryker mot en legendarisk fisk | 3 % per snap |
| Ekkolodd | motorhavari (finnes alt: Propell-Kjell) | 15 % per havari |
| Vinsj | aldri | — |

Vinsjen står med vilje utenfor. Den er ikke utstyr, den er en dør. Ryker den, ryker
en hel sone — og punkt 2 over blir et reelt problem i stedet for et hypotetisk.

Da blir slitasje en konsekvens av dårlig fiske, ikke av flaks. Spilleren som holder
spennet nede får aldri se den. Og han får alltid en historie: «beltet røk da den
store tok.»

**Reparasjon, ikke gjenkjøp.** Rusten tar halv pris for å sette det i stand. Da er
tapet 2 000 kr på et ekkolodd, ikke 4 000, og butikkraden får en tredje tilstand
ved siden av «kjøpt» og «låst»: **ØDELAGT — 2 000 kr å fikse**.

**Varsel før første gang.** Første gang noe ryker skal Rusten ringe. Ikke en
notice — en telefon, med den rytmen som alt er bygd. Ellers leser spilleren det som
en bug.

---

## Hva som må på plass først

Ingenting av dette bør bygges før **kontoene**. Grunnen er enkel: i dag kan en
spiller miste alt ved å tømme cachen. Å legge inn en mekanikk som med vilje tar
utstyr fra folk, mens de fortsatt kan miste alt ved et uhell, er å legge to typer
tap oppå hverandre. Da vet ingen hvilken av dem som slo til, og tilliten ryker før
utstyret gjør det.

Rekkefølgen er: kontoer → analyse (så vi ser om folk faktisk slutter av dette) →
slitasje.

---

## Åpent spørsmål til eieren

Skal det i det hele tatt gjøre vondt? Det finnes en variant der utstyr aldri ryker,
men **trenger service** — ekkoloddet blir upresist etter 50 turer og koster 400 kr
å kalibrere. Samme butikkrad, samme grunn til å komme innom Rusten, men ingen som
mister noe de har betalt for.

Det er den trygge varianten. Den andre er den som gir historier.

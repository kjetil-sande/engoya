# Utstyr som slites — prosjektnotat

> ## AVGJORT 2. august 2026: havari blir IKKE bygd
>
> Riggservicen hos Propell-Kjell ble bygd mens dette notatet lå åpent, og den
> gjør allerede jobben notatet var skrevet for. Utstyret slites, Kjell setter det
> i stand, prisen er pro-rata fra 0 til 1 500 kr, og han ringer når det begynner
> å bli tregt. Det er en vedlikeholdssløyfe med en fortelling rundt.
>
> Bygger vi havari i tillegg, får de samme fire tingene **to overlappende
> pengesluk som ligner hverandre**. En åtteåring vil spørre hvorfor det er to, og
> svaret blir tynt.
>
> Havari legger dessuten mest til risiko: en ny måte å ta noe fra spilleren på, i
> et spill der eieren har vært helt tydelig på at ingenting skal gå tapt.
>
> **Beslutningen er å la det ligge**, se hvordan familien opplever riggservicen
> først, og ta det opp igjen hvis vedlikeholdet viser seg for tannløst.
>
> Blir det aktuelt igjen: velg **fullt gjenkjøp**, ikke reparasjon til halv pris.
> Ikke fordi det er snillere — det er det ikke — men fordi riggservicen allerede
> har «halv pris, pro-rata, rutine». Skal to systemer leve side om side, må de
> føles ulike: service er rutine, billig og forutsigbar; havari er sjeldent, dyrt
> og en historie. Gjør du begge halve, blir ingen av dem noe.
>
> Resten av notatet står som det er — analysen under er fortsatt gyldig, og det
> er den man skal lese hvis avgjørelsen tas opp igjen.

---

Eierens ønske, 2. august 2026:

> «Når jeg har kjøpt ekkolodd, turbosnelle og annet utstyr bør det fortsatt stå i
> butikken … utstyr kan gå tapt eller blir ødelagt på sikt. Lag gjerne et prosjekt
> på det.»

Første halvdel er bygd, i to omganger. Først ble de låste radene synlige med
«🔒 Krever Stang III» i stedet for å være skjult. Så — etter at eieren ikke fant
kampbeltet sitt — ble også de **kjøpte** radene stående, merket «Montert». Det
siste var det egentlige ønsket, og det var glemt i første omgang.

Eieren bekreftet 2. august, etter at det var på plass:

> «Ah, jeg ba deg vel egentlig om å IKKE fjerne det du allerede har kjøpt. Det er
> kjekt at man kan se hva man eier. Og om ting går i stykker må man få mulighet
> for å kjøpe det igjen.»

Andre halvdel — at utstyr faktisk kan ryke — er ikke bygd. Dette notatet er
grunnlaget for å ta avgjørelsen, ikke en bestilling.

**To ting er nå avklart av eieren og skal ikke diskuteres på nytt:**

1. Raden skal alltid være synlig, uansett tilstand. Det er verdifullt i seg selv
   å kunne se hva man eier — ikke bare et middel for å vise «ødelagt».
2. Går noe i stykker, **skal det kunne skaffes igjen**. Ingen tap er permanent.
   Det utelukker enhver variant der utstyr ryker for godt.

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

**Du skal alltid kunne få det igjen.** Eieren var tydelig: går noe i stykker, må
man kunne skaffe det på nytt. Butikkraden får derfor en tredje tilstand ved siden
av «Montert» og «🔒 Krever …»: **ØDELAGT — 2 000 kr å fikse**.

**Dette avsnittet er overstyrt — se avgjørelsen øverst.** Da det ble skrevet
fantes ikke riggservicen, og argumentet under var at halv pris forteller «det må
på verksted» i stedet for «du mistet ekkoloddet ditt». Det argumentet holder
fortsatt isolert sett — men riggservicen okkuperer nå nøyaktig den rollen, og to
systemer som begge sier «halv pris, rutine» blir umulige å skille. Blir havari
aktuelt igjen, skal det være **fullt gjenkjøp**, så de to har hver sin tydelige
plass.

*Opprinnelig argument, bevart:* 4 000 kr på nytt leser som «du mistet ekkoloddet
ditt». 2 000 kr leser som «det må på verksted» — samme rad, samme Rusten, og
spilleren mister aldri følelsen av at det er hans ekkolodd.

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

## Det åpne spørsmålet — og hva det ble

Spørsmålet var: skal det i det hele tatt gjøre vondt? Det fantes en variant der
utstyr aldri ryker, men **trenger service** — samme butikkrad, samme grunn til å
komme innom, men ingen som mister noe de har betalt for.

**Eieren svarte med å foreslå nettopp det**, uavhengig av dette notatet:

> «Hva med at man må ha service på alt utstyr hos Propell-Kjell? At man har de
> samme barene som indikerer gjenværende levetid (0-100%) som på Bunnsmørning,
> Båtservice og Båtforsikring.»

Det var et bedre svar enn begge alternativene her, av en grunn som ligger i koden:
**de tre eksisterende barene tar aldri noe fra spilleren.** Bunnsmørning på 0 %
koster +1 bensin. Service over 250 turer gir havarifare. Utløpt forsikring betyr
full pris. Ingen av dem fjerner en evne — de gjør ting *dårligere*, aldri borte.

Riggservicen følger samme regel, og den ble bygd 2. august. Dermed falt valget
mellom «trygg» og «gir historier» bort: barene gir begge deler.

# PLAN-BESTILLINGER.md
Endelig plan for «Rustens bestilling» — dagens bestillinger, goodie bags og fisketips.
Gjelder /Users/kjetilsande/Documents/Claude/Fiskespillet/fiske.html og /Users/kjetilsande/Documents/Claude/Fiskespillet/netlify/functions/familierekorder.mjs (ankere per commit f864395).

---

## 1. Kjernen i tre setninger

Hver spiller får én bestilling per fiskerdøgn fra en håndskrevet lapp hos Rusten: historien hentes fra en fast katalog (49 fortellinger om bygdefolket), og trekkeren serverer bare bestillinger spilleren faktisk kan innfri med sitt utstyr, sin sone og dagens sesong. Levering skjer automatisk i salgsøyeblikkene — det finnes ikke noe fiskelager — og fullført bestilling gir en goodie bag der fisketips er kronjuvelen: opptjente, varige, per-spiller multiplikatorer som kun rører napp-sannsynligheten i rigB()-kjeden og aldri størrelsen på fisken. Alt Rusten sier står på nynorsk, alt utenfor lappen på bokmål, og hele systemet er et rent tillegg oppå gratisspillet.

---

## 2. Mekanikken — endelige valg

### 2.1 Arkitektur: katalog + gating (forening av Designer 1 og 2)
Designer 2s katalog er tekst- og historiebanken; Designer 1s gating er fasit. Trekkeren velger en HEL katalogoppføring (krav-tallene er fredet — de står i Rustens fortelling), men serverer aldri en oppføring spilleren ikke kan innfri. Begrunnelse: skalering av antall ville brutt hist-tekstene («tre torskar, fire krabbar»); gating i stedet for skalering holder fortelling og krav i synk.

### 2.2 Døgnskille: fiskerdøgnet kl. 04, lokal tid
Valg: kl. 04 (Designer 1 og begge kritikerne som tok stilling), fordi kveldsfiske etter midnatt skal telle på dagens lapp — samme fella streaken allerede løste, og midnattsskillet ville latt én kveldsøkt hente to poser. MEN: dagNr() regner UTC (grensen er 05/06 norsk tid), så bestillingen får egen funksjon:

```js
/* Bestillingsdøgnet skifter kl. 04 LOKAL tid (dagNr er UTC — bevisst egen funksjon).
   Dagens-fisk (+50 %) roterer separat ved midnatt; de to systemene er uavhengige
   og stables naturlig ved overlapp. Ikke koble dem. */
function bestillingsDag(){ var t=new Date(Date.now()-4*3600e3);
  return t.getFullYear()*372+t.getMonth()*31+t.getDate(); }
```
Samme kommentar speiles ved dailyFish() (fiske.html:2196).

### 2.3 Trekkeren (kjøres ved behov, aldri re-trekk samme dag)
1. `d = bestillingsDag()`. Hvis `P.bestilling && P.bestilling.dag===d` → bruk lagret. Lagret krav er SANNHETEN — aldri re-deriver fra seed (maksSone kan endre seg midt på dagen).
2. `rng = mulberry32(navnehash(P.name) ^ d)` (mulberry32 finnes, fiske.html:3072; navnehash = enkel strenghash).
3. Nivå trekkes etter progresjon: niv0 (maksSone()===0): [70,30,0,0]; niv1: [30,50,20,0]; niv2 (>=2): [10,35,40,15]. `arterFanget()<5` → alltid nivå 1. Merk: maksSone() tar IKKE argument.
4. Kandidatliste = BESTILLINGER filtrert på:
   - `niv === valgt nivå`
   - hver krav-art: `f.z <= maksSone()` (primærsonen, aldri zb), `!f.freda && !fredetNaa(f)`, `f.ss[mnd] >= 0.5` (skjerpet fra >0 — en 0.1-måned er en umulig dag)
   - `mnd`-feltet respekteres
   - `treng:"teine"` → `P.pots.owned>=1`; krabbekrav > 4 → minst 2 teiner (owned+cap); `hummer` → `P.pots.ownedH>=1 && hummerSeason()` OG hummerteine allerede UTE med natt i soaket ved trekk
   - `treng:"vinsj"` → `P.vinsj`
   - `blaastaal`-bestillingen → kun spillere som eier tipset `blaastal-borstemark`
5. Felles-først: dagens felleskandidat = LCG-indeks på `d` alene over hele katalogen (dailyFish-formelen). Er den i spillerens kandidatliste → velg den. Slik deler familien historie når de kan («Berit fyller 70» rundt bordet), og sjuåringen med Stang I får «Grillfest i fjøra» i stedet — ikke en umulig lapp. Ellers rng-trekk fra kandidatlisten; spillere med lav aktivitet siste dager (P.dager) vektes mot bestillingen med færrest enheter — bestemor med fem minutter skal også se en pose.
6. Tom liste → fall ett nivå ned; nivå 1 er rene z0-arter med høy ss og kan aldri bli tom (samme garanti som dailyFish).
7. Lagre `P.bestilling = {dag:d, id:"berit70", krav:{...kopi...}, lev:{}, ferdig:false, hentet:false}`. Krav KOPIERES inn så katalogendringer aldri rører en pågående dag.

Dagssjekk kjøres ikke bare i chosen(): tellekrokene og openShop() sjekker `P.bestilling.dag !== bestillingsDag()` og regenererer FØR telling/visning — økter krysser døgnskillet.

### 2.4 Levering: automatisk telling ved salg
Ingen leveringsknapp, ingen lager (resolveCatch selger umiddelbart, P.caught er monoton og kan aldri trekkes fra). Fiksjonen: «Rusten set fisken til side når du sel han på kaia.» Tre tellepunkter:
1. **Stang**: resolveCatch(sell===true) (fiske.html:2733) → `lev[f.k]++`.
2. **Pilkeoppgjøret** (2353–2366) → lev per art. SPESIALREGEL SILD: hekla-sild går i agnboksen med kr=0 (fiske.html:2360) — den teller LIKEVEL som levert («Rusten tek sursilda av heklefangsten»). Uten denne regelen er sild-krav selvmotsigende (kritiker 1s viktigste funn); stangsolgt sild teller også.
3. **pullPot** (3363–3374): teller KUN linjer med `l.kr>0` (sjekket etter +50 %-justeringen, som aldri gjør 0 til >0) — dette utelukker utsatt/fredet linefisk, rognhummer og undermåls/overmåls hummer, som alle har fk/img men kr=0. Fisk med fk → `lev[fk]++`; taskekrabbe-linjer (også på dype soner) → `lev.krabbe++`; lovlig hummer → `lev.hummer++`. Trollkrabbe teller IKKE som krabbe (dokumenteres i koden).

Teller aldri: sluppet fisk, fisk skåret til agn, fredet/undermåls. Krabber tatt som agn ETTER pullPot teller (de ble talt ved trekket — «Rusten talde det som kom over kaikanten»).

Kjent og AKSEPTERT svakhet (skrives som kodekommentar så ingen «fikser» den til siste-skriv): to enheter som leverer samme art samme dag flettes med per-art Math.max og kan undertelle én fisk. Familiespill, sjeldent scenario; per-enhet-lev ble vurdert og avvist som kompleksitet uten tilsvarende gevinst.

### 2.5 Fullføring, frist, dagsskifte
- Alle krav dekket → `ferdig=true` (og hentet forblir false). Pose-tilstanden ligger i det SYNKEDE P.bestilling — posen finnes på alle enheter, hentes én gang (hentet OR-flettes; se 6). Dette avviser Designer 1s enhetslokale bagGave: bestillingen er synket tilstand, da må belønningen være det (kritiker 3).
- Frist: fiskerdøgnet ut. Uferdig bestilling forsvinner stille ved dagsskifte — ingen straff, ingen carry-over. Ferdig-men-uhentet pose overlever dagsskiftet: hent-sjekken er `ferdig && !hentet`, og feltet ryddes først når neste dags bestilling genereres ETTER henting (er posen uhentet når ny dag trekkes, vises den fortsatt frem til henting — «aldri tapt», som streakGave).
- Samspill med dagens fisk (+50 %): ingen kobling; overlapp stables naturlig.

---

## 3. Tips-systemet

### 3.1 Datamodell
```js
P.tips = [{k:"uer-brunost", ts:1754300000000}, ...]   // KUN id + tidsstempel synkes
var TIPS_DEF = { "uer-brunost": {art:"uer", rig:"brunost", rigType:"agn", m:1.5, tekst:"…"}, ... };
```
- All effekt ligger i den statiske klienttabellen TIPS_DEF — serveren kjenner ikke balansen, og det finnes ingen tallfelter en manipulert klient kan blåse opp. `ts` gir Notater-appen (kø-bolk 4b) kronologien gratis.
- `rigType` skiller agn fra sluk (AGN-nøkkelen "sei" kolliderer med artsnøkkelen).
- Tips er varig kunnskap: aldri utløp, aldri forbruk, union-flettet, kan aldri mistes.
- Cap **120** (ikke 40 — katalogen er alt 35 og skal vokse; ≈3,6 kB mot MAKS_KROPP 60 kB). Union UTEN sortert kutt; må det kuttes, beholdes LAVEST ts først (først opptjent = mest verdt å bevare). Assert i verktoy-spillrevisjon.mjs: cap ≥ 2 × antall nøkler i TIPS_DEF.

### 3.2 Eneste skrivepunkt (premium-vernet, strukturelt)
```js
/* ENESTE stedet P.tips vokser. Tips OPPTJENES (poser/milepæler) og selges ALDRI —
   verken for spillkroner eller ekte penger. Napp-fordel er rekordforsøk-fordel:
   selges napp, selges i praksis rekordforsøk. Jf. advarselslisten. */
function tipsGi(id){ ... union-innsetting med ts=Date.now() ... }
```
I tillegg: (a) TIPS_DEF er endelig og ALT i den skal være opptjenbart gjennom poser/milepæler — det finnes aldri eksklusivt tips-inventar å selge; (b) én linje inn i premium-notatet: fremtidig betalt innhold (Eggakanten osv.) kan ha egne arter med egne OPPTJENTE tips, men aldri tips som følger med kjøpet.

### 3.3 Innsettingspunkt — nøyaktig én linje i motoren
Inne i `startWait()` (fiske.html:2375–2428), i den indre `rigB(f)` (2388), etter agn- og sluk-b:
```js
b *= tipsFaktor(f, agEff, suEff);   // eneste koblingspunkt

function tipsFaktor(f, agEff, suEff){
  if(!P.tips||!P.tips.length) return 1;
  var m=1;
  for(var i=0;i<P.tips.length;i++){
    var d=TIPS_DEF[P.tips[i].k];
    if(!d||d.art!==f.k) continue;
    if((agEff&&d.rigType==="agn"&&d.rig===agEff.k)||(suEff&&d.rigType==="sluk"&&d.rig===suEff.k))
      m=Math.max(m,d.m);
  }
  return m;
}
```
- Gjenbruk av agEff/suEff arver sonereglene gratis: agn-tips virker overalt, sluk-tips kun i anbefalt sone.
- Fordi `beste(pl)` bruker samme rigB, løfter et sjelden-tips automatisk også pL/pR (pulje-sjansen) — eierens «tips-magi».
- Math.max, aldri produkt: tips kan aldri stables. 85 %-vakta i poolVekter (2411) står som siste skanse.

### 3.4 Styrke og prinsipper
- m = 1.5 standard (rar 0), 1.8 for rar 1 og «ny»-kombinasjoner, 1.3–1.6 der basen alt er høy eller lav. Kveitetips (hvis eieren godkjenner dem, se 9) m = 1.4.
- Designprinsipp: tips forsterker helst par som ALLEREDE har en sann, moderat b (fiskevaeret-motoren kan da aldri motsi dem) og gjør UNDERBRUKTE rigger levende. De tre dominante parene fra Designer 2s verd 3-liste (makrellhode-blåkveite 7.5, storpirk-blåkveite 7.4, agnrigg-hågjel 4.2) er BYTTET UT — der ville multiplikatoren kjennes minst (kritiker 2 har rett: 85 %-vakta spiser løftet).
- Alle multiplikatorer gjennom verktoy-spillrevisjon.mjs før de fredes, målt med verste lovlige stabling aktiv (ekkolodd + Spesialagn).

### 3.5 De fredede grensene
- Tips rører KUN rigB (artstrekning/puljevalg). Aldri sizeLen/hookedLen/land, aldri biteChance. Størrelsen rulles uniformt og uavhengig — rekordene forblir ærlige STRUKTURELT: koblingspunktet kan ikke nå størrelsesrullingen.
- Tips opptjenes, kjøpes aldri — verken for spillkroner eller ekte penger.
- Superagn-presedensen (eneste størrelsespåvirkning) utvides aldri, og ingen pose inneholder Superagn.
- Per-spiller-garantien: effekten leses kun fra P.tips til spilleren P — nøyaktig eierens ordre. Fiksjonen vernes redaksjonelt: hver lapp er personlig («Lappen gjeld deg — eg skriv ikkje ut kopiar»), og ingen tips-tekst lover at rådet gjelder alle.
- Kjente hull (bevisste, dokumenteres i koden): tips virker ikke i pilk-minispillet, teine/line eller på biteChance. Ingen tips-tekst nevner bruk, line eller pilking.

---

## 4. Belønningstabellene

Kalibreringsankere: streak-dagsgaver 100–400, ukebonus 500–1500, 30-dagers 5000; tank Grunt netto 300–600, mellomdyp 1500–3000. Eierens ord styrer vektingen: «Fisketips er vel så mye verdt som ting» — posens identitet er lappen i bunnen, ikke seddelen (tips-sjansene er derfor løftet og kronene senket mot Designer 1s utkast, per kritiker 2). Måltall i revisjonsverktøyet: samlet pose-kr per uke < streak-kr per uke for samme spillerprofil.

Alle trekk via **bagTrekk(dag)** = `mulberry32(navnehash(P.name) ^ dag ^ 0x9e37)` — IKKE gaveTrekk, som seeder med P.streakDag og ville gitt ulikt innhold før/etter dagens første fangst og på tvers av enheter. Utstyrssmåting filtreres alltid på «mangler og kan bruke» (kand-filteret, fiske.html:4189). Aldri i noen pose: Superagn, rene utstyrstrinn, ekte-penger-koblinger. Fallback når alle relevante tips er eid: vare/Spesialagn — aldri rå kroner.

| Nivå | Kroner | Vare (én av) | Tips-sjanse | Ekstra |
|---|---|---|---|---|
| 1 Småplukk | 50–150 | billig agn-4-pakk (50 kr) / 4 bensin / billig sluk spilleren mangler (≤30 kr) | **30 %** (verd 1) | — |
| 2 Dagsjobb | 100–300 | agn ≤100 kr / 8 bensin / 3 teineagn / sluk ≤80 kr | **50 %** (verd 1–2) | 10 %: 1 Spesialagn |
| 3 Storordre | 300–600 | alltid: agn ≤160 kr / sluk ≤150 kr / 2 Spesialagn | **60 %** (verd 2 prioritert) | 10 %: «Rusten rundar opp» +300 |
| 4 Æresbestilling | 500–1000 | alltid: dyr sluk (≤300 kr) / 3 Spesialagn / full tank | **garantert** (verd 2–3) | — |

Nivå 4 er bevisst senket fra Designer 1s 800–1500: det garanterte tipset og varen bærer prestisjen — tips er inflasjonsfrie og devaluerer verken streaken eller utstyrstrappen.

---

## 5. Katalog og tipsbibliotek

### 5.1 Endringslogg mot Designer 2s katalog (alle kritikerfunn innarbeidet)
- **Nivåflytting**: roykhelg 1→2 (6 fisk), berit70 2→3 (torsk+teine, «klokkeren nivå 3»), bryllaup 2→3 (10 enheter + teine).
- **Trimmet**: krabbeaften 8→5 krabber; hummar-jul 2→1 hummer (og serveres kun med hummerteine ute, se 2.3); fiskebilen 13→10 (torsk 4, hyse 3, sei 3); amerikabesok 14→10 (torsk 3, hyse 2, krabbe 4, lange 1).
- **Nynorsk rettet** (kritiker 3s sju punkter): «kviting» for fisken i Rustens munn (id-en hvitting beholdes), «mel hysa» (ikke «malar»), «høgg» (ikke «hoggar»), «Gjev henne», «ein hjell / hjellen», «prøver/prøvene», «Stortorsken»; havmus-teksten omformulert.
- **Rammene (fasit)**: N1: 1–2 arter, 2–5 fisk (sild-unntak maks 5). N2: 2–4 arter, 4–7 fisk. N3: 3–4 arter, 6–10 fisk, krabbe 3–6, hummer 1. N4: djuphav/sjelden (få fisk, vinsj) ELLER volum 8–12.
- **Sild-regler**: sild-krav maks 5, aldri eneste art på nivå 2+, revisjonssjekk på at ingen nivå 2-bestilling kan fullføres utelukkende via minispill.
- **Språkregelen**: alt som står PÅ lappen er Rustens håndskrift = nynorsk (titler, NIVA-ordene «Lett/Middels/Krevjande/Ekspert»); alt utenfor lappen (chips-etiketter, knapper, hint) = bokmål.

### 5.2 Bestillingskatalogen (49)
```js
var NIVA=["","Lett","Middels","Krevjande","Ekspert"]; // vises kun PÅ lappen (nynorsk-sonen)
var BESTILLINGER=[
/* ---------- NIVÅ 1: LETT (kun Grunt) ---------- */
{id:"skulefjora",niv:1,tit:"Grillfest i fjøra",krav:{makrell:3},
 hist:"Småskulen skal ha avslutning i fjøra, og lærarinna Ingrid vil grille makrell på bålet. Tre feite makrellar, så blir det fest.",
 kvitt:"Ingrid seier ungane åt som måsar. Du gjorde dagen deira, det skal du vite."},
{id:"seibiff",niv:1,tit:"Seibiff-onsdag",krav:{sei:4},
 hist:"Klara på kafeen har seibiff på tavla kvar onsdag, men i dag står tavla tom. Fire seiar før tolv, elles blir det vaflar att.",
 kvitt:"Klara helsar og seier du berga onsdagen. Ho har lagt av ein ekstra kaffi til deg bak disken."},
{id:"sursild-emma",niv:1,tit:"Mormor si sursild",krav:{sild:5},
 hist:"Vesle-Emma fann oppskriftsboka etter mormora si. Fyrste sida: sursild. Ho treng fem sild, og eg har lova å hjelpe henne — heklar du dei, tek eg dei av fangsten.",
 kvitt:"Emma står på kaia og glisar med heile andletet. Mormora hadde vore stolt, trur eg."},
{id:"flyndre-doktor",niv:1,tit:"Doktoren og flyndra",krav:{sandflyndre:3},
 hist:"Doktor Wold er ny i bygda og har høyrt gjetord om sandflyndre steikt i smør. Tre flyndrer, så lærer eg han å steikje dei sjølv.",
 kvitt:"Doktoren brende den fyrste og lukkast med dei to neste. No er han ein av oss."},
{id:"aalekvabbe-sverre",niv:1,tit:"Smaken av barndomen",krav:{aalekvabbe:2},
 hist:"Gamle-Sverre påstår at ålekvabben smakar barndom. Ingen andre i bygda vil ete han, men Sverre er nittiein og får det han peikar på.",
 kvitt:"«Akkurat slik», sa Sverre, og så sa han ikkje meir på ein time. Det tyder at det var godt."},
{id:"suppe-bedehus",niv:1,tit:"Suppe på bedehuset",krav:{hvitting:4},
 hist:"Borghild kokar fiskesuppe til basaren på bedehuset. Ho sver til kviting — fin og kvit i suppa, seier ho, og Borghild tek ikkje feil om suppe.",
 kvitt:"Basaren drog inn åtte hundre kroner, og Borghild strålte. Suppa di gjorde susen."},
{id:"lyr-braun",niv:1,tit:"Tyskaren og lyren",krav:{lyr:2},
 hist:"Herr Braun på campingen har fiska etter lyr i tjue somrar utan å få ein einaste. No har kona bestilt to hjå meg, så han slepp reise heim tomhendt.",
 kvitt:"Braun tok bilete med fisken din og smilte breitt. Vi seier ikkje meir om saka."},
{id:"knurr-pierre",niv:1,tit:"Kokken vil ha knurr",krav:{knurr:2},
 hist:"Pierre, kokken på hotellet, seier knurren er ein delikatesse der han kjem frå. Folk her ler av det. Pierre ler sist, tippar eg.",
 kvitt:"Pierre kyssa fingertuppane sine og sa noko på fransk. Eg trur det var skryt."},
{id:"berggylte-giuseppe",niv:1,tit:"Berggylte til Giuseppe",krav:{berggylte:2},
 hist:"Giuseppe påstår dei et berggylte i Italia, grilla heil med sitron. Eg trudde han tulla, men han viste bilete.",
 kvitt:"Giuseppe åt begge sjølv og song etterpå. Italienarar, veit du."},
{id:"lomre-albertsen",niv:1,tit:"Fru Albertsen sitt selskap",krav:{lomre:2},
 hist:"Fru Albertsen i det kvite huset skal ha damene på besøk. Det skal vere lomre, seier ho, og det skal vere to. Ho har aldri sagt kvifor akkurat to.",
 kvitt:"Fru Albertsen sende bod: «Utmerkt.» Det er det lengste skrytet nokon har fått av henne."},
{id:"skrubbe-halvor",niv:1,tit:"Skrubbe til fyret",krav:{skrubbe:3},
 hist:"Fyrvaktar Halvor kjem inn ein gong i månaden og kjøper skrubbeflyndre. Ingen veit kva han gjer med dei der ute, og ingen spør.",
 kvitt:"Halvor nikka og rodde ut att. Frå han er det ein heil tale."},

/* ---------- NIVÅ 2: MIDDELS (Grunt + Mellomdyp, krabbe frå teina) ---------- */
{id:"roykhelg",niv:2,tit:"Røykhelg på kaia",krav:{makrell:4,sei:2},
 hist:"Eg fyrer opp røykomnen laurdag. Fire makrellar og to seiar, så heng eg dei i røyken for deg og halve bygda.",
 kvitt:"Røyken låg over kaia heile kvelden, og halve bygda stod i kø. Du får fyrste stykket."},
{id:"fiskebollar-magda",niv:2,tit:"Magda sine fiskebollar",krav:{hyse:4},
 hist:"Magda på Bakken mel hysa sjølv til fiskebollane sine. Fire fine hyser, så lagar ho ein ekstra boks til deg — det er verdt turen åleine.",
 kvitt:"Magda sende med ein boks til deg, som lova. Ikkje et alle på ein gong."},
{id:"odd-frir",niv:2,tit:"Odd samlar mot",krav:{torsk:2,lomre:1},
 hist:"Odd skal endeleg be Magda på middag. Torsk med lever til hovudrett og lomre til den som ikkje vil ha torsk. Guten er nervøs nok som det er.",
 kvitt:"Ho sa ja til middagen. Resten får vi vente på, men Odd smiler som ei sol."},
{id:"krabbeaften",niv:2,tit:"Krabbeaften på grendehuset",treng:"teine",krav:{krabbe:5},
 hist:"Fredag er det krabbeaften på grendehuset. Fem krabbar, loff og majones — det er sommaren i eit nøtteskal, det.",
 kvitt:"Grendehuset lyste til langt på natt. Nokon song. Eg seier ikkje kven."},
{id:"bispebesok",niv:2,tit:"Prestens søndagsmiddag",krav:{torsk:2,hyse:2},
 hist:"Presten Mikkelsen har bispebesøk søndag. Han vil ha torsk og hyse — «trygg mat», seier han. Bispar er visst kresne.",
 kvitt:"Mikkelsen helsar: bispen tok to porsjonar og heldt kortare preike enn vanleg. Alle vann."},
{id:"sjukeheim-fredag",niv:2,tit:"Skikkeleg fredagsfisk",krav:{torsk:3,sandflyndre:2},
 hist:"Nils på sjukeheimen nektar å servere pinnefisk frå pose. «Dei som bygde bygda skal ha skikkeleg fisk», seier han. Eg er samd.",
 kvitt:"Nils fortel at gamle fru Hansen bad om påfyll for fyrste gong sidan jul. Det er ditt verk."},
{id:"calamari",niv:2,tit:"Blekksprut til Giuseppe",krav:{akkar:3},
 hist:"Giuseppe skal lage calamari til heile campingen. Tre akkarar, seier han, og ikkje sjå så skeptisk ut.",
 kvitt:"Eg smakte. Eg seier det ikkje høgt, men italienaren kan noko vi ikkje kan."},
{id:"lysing-hotell",niv:2,tit:"Lysing på menyen",krav:{lysing:2,torsk:1},
 hist:"Pierre set lysing på menyen i helga — «merluza», seier han og himlar med auga av fryd. To lysingar, pluss ein torsk til personalmiddagen.",
 kvitt:"Hotellet var fullt, og Pierre tok imot applaus frå kjøkkendøra. Han peika hit — æra er di."},
{id:"barnehage-grateng",niv:2,tit:"Grateng til barnehagen",krav:{sei:3,hyse:2},
 hist:"Turid i barnehagen skal lage fiskegrateng frå botnen av. «Ungane skal vite at fisk ikkje veks i firkanta boksar», seier ho.",
 kvitt:"Turid melder at sjefen for nei-klubben, Iver på fire år, tok tre stykke. Sigeren er total."},
{id:"kiosk-kampen",niv:2,tit:"Fiskeburgarar til kampen",krav:{sei:4,hyse:2},
 hist:"Roger, fotballtrenaren, skal steike fiskeburgarar i kiosken søndag. Inntekta går til ny drakt til keeperen — han har vakse tjue centimeter i år.",
 kvitt:"Dei selde ut før pause, og laget vann attpåtil. Keeperen får drakt til jul."},
{id:"post-kaare-takkar",niv:2,tit:"Post-Kåre takkar av",krav:{torsk:2,sild:3},
 hist:"Post-Kåre pensjonerer seg etter trettiåtte år på ruta. Bygda held fest, og han har ynskt seg torsk og sursild — «postbodkost», kallar han det.",
 kvitt:"Kåre heldt tale og takka «alle som skreiv brev». Så vart det stilt kring bordet. Fin kveld."},
{id:"emma-plansje",niv:2,tit:"Emma samlar artar",krav:{sei:1,makrell:1,sandflyndre:1,hvitting:1},
 hist:"Vesle-Emma skal bli marinbiolog og lagar plansje over fiskane i fjorden. Ho treng éin av kvar — og du er den einaste ho stolar på.",
 kvitt:"Plansjen heng i skulegangen no, med namnet ditt nedst i hjørnet. Ekte forsking, seier Emma."},
{id:"braun-koffert",niv:2,tit:"Braun reiser heim",krav:{makrell:3,lyr:2},
 hist:"Herr Braun reiser heim tysdag og vil ha med røykt makrell og lyr i kofferten. Tollarane får bli med på moroa.",
 kvitt:"Braun sende kort frå Hamburg: «Kofferten lukta himmelsk.» Kona hans er kanskje usamd."},
{id:"rognkjeks-magda",niv:2,tit:"Kaviar som mor laga",krav:{rognkjeks:2},
 hist:"Magda skal lage kaviar av rognkjeksrogn, slik mor hennar gjorde kvar vår. To rognkjeks, så står det små glas på rekkje i vindauget hennar.",
 kvitt:"Magda sette eit glas av til deg. Raud som solnedgang, seier ho. Eg seier: et det på flatbrød."},
{id:"molje",niv:2,tit:"Møljekalas",mnd:[0,1,2],krav:{torsk:4},
 hist:"Skreien er komen, og då skal det vere mølje: torsk, lever og rogn til heile nabolaget. Fire fine skreiar, så dekkjer vi langbord hjå meg.",
 kvitt:"Det vart stilt kring bordet, slik det blir når mølja er rett. Takk for i år."},

/* ---------- NIVÅ 3: KREVJANDE (Dypt, hummar i sesong, større mengder) ---------- */
{id:"berit70",niv:3,tit:"Berit fyller 70",treng:"teine",krav:{torsk:3,krabbe:4,sild:2,lyr:1},
 hist:"Berit på Neset fyller sytti år laurdag, og heile syforeininga kjem. Ho treng tre torskar, fire krabbar, to sild og ein lyr — og ho stolar på deg.",
 kvitt:"Berit helsar og seier det vart fest av det. Syforeininga snakkar enno om krabbane — og Berit dansa, sytti år til trass."},
{id:"bryllaup",niv:3,tit:"Bryllaup på grendehuset",treng:"teine",krav:{torsk:4,krabbe:4,sild:2},
 hist:"Sigrid og Johan giftar seg laurdag. Torsk til hovudrett, krabbe til forrett og sursild attåt spekematen. Heile bygda er beden, så det må monne.",
 kvitt:"Brura kasta buketten, og Klara tok imot. No går praten på kafeen, kan du tru."},
{id:"bacalao-laget",niv:3,tit:"Bacalao-laget",krav:{brosme:2,lange:1,torsk:2},
 hist:"Bacalao-laget møtest fyrste torsdagen i månaden. Dei saltar fisken sjølv og kranglar hjarteleg om tomatmengda. Brosme, lange og torsk — så held freden seg.",
 kvitt:"Laget vart samde om tomaten i år òg — etter to timar. Gryta di fekk skulda for det gode humøret."},
{id:"torrfisk-oslo",niv:3,tit:"Tørrfisk til søringane",krav:{torsk:3,lange:2},
 hist:"Even, nevøen min i Oslo, klagar over at «ekte tørrfisk» ikkje finst sørpå. No heng eg opp ein hjell for han. Tre torskar og to langer, så får guten heimplassen i posten.",
 kvitt:"Fisken heng på hjellen. Til vinteren får ein heimlengtande søring pakke, og det er di forteneste."},
{id:"lutefisk",niv:3,tit:"Lutefisk til jul",mnd:[9,10],krav:{lange:3},
 hist:"Klara skal ha lutefiskaftan på kafeen i desember, og då må langa i luten no. Tre store — lutefisk av lange er det einaste rette, spør du meg.",
 kvitt:"Langa ligg i luten. Kom att i desember, så får du fyrste serveringa — med bacon og alt."},
{id:"steinbitkaker",niv:3,tit:"Steinbitkaker til basaren",krav:{steinbit:2},
 hist:"Borghild har lova steinbitkaker til haustbasaren, og då duger berre den faste, kvite fisken frå djupet. To steinbitar, om du torer — dei bit att, veit du.",
 kvitt:"Kakene gjekk unna før loddtrekninga. Borghild gøymde to til deg bak disken."},
{id:"uer-jubileum",niv:3,tit:"Raud fisk til jubileet",mnd:[5,6,7],krav:{uer:2,torsk:2},
 hist:"Grendehuset fyller femti år, og komiteen vil ha noko raudt og gjævt på fatet: uer. No i sommarmånadene er han lovleg, så grip sjansen.",
 kvitt:"Ueren lyste raudt på langbordet, og ordføraren kom attpåtil. Femti år til, seier vi."},
{id:"hummar-jul",niv:3,tit:"Hummar til jul",mnd:[9,10,11],treng:"teine",krav:{hummer:1},
 hist:"Fru Albertsen vil ha hummar på julaftan, slik ho fekk som barn. Éin lovleg hummar — og hugs måla, elles får vi begge svi.",
 kvitt:"Fru Albertsen opna døra sjølv då eg leverte. Eg har aldri sett henne smile før. No har eg det."},
{id:"raudspette-mette",niv:3,tit:"Dansken og raudspetta",krav:{rodspette:2},
 hist:"Mette i feriehuset seier norsk raudspette slår alt dei har i Skagen. To fine, så steikjer ho til heile vegen sin — danskar deler alltid.",
 kvitt:"Mette heldt «rødspettegilde» og bad inn halve kaia. Du var hovudpersonen utan å vere der."},
{id:"skulekjokken",niv:3,tit:"Skulekjøkkenet flår fisk",krav:{torsk:2,sei:2,sandflyndre:2},
 hist:"Ingrid vil at sjuandeklassen skal lære å sløye og flå ordentleg fisk. Torsk, sei og flyndre — tre artar, tre knivgrep. Slikt gløymer dei aldri.",
 kvitt:"Berre éin elev vart grøn i andletet, og det er ny rekord. Ingrid seier du er velkomen som gjestelærar."},
{id:"ottar-monter",niv:3,tit:"Ottar sitt glasskap",krav:{steinbit:1,brungylt:1},
 hist:"Ottar utstopparen manglar to fiskar i glasmontera si: steinbit og brungylt. Han lovar dei skal få «eit verdig andletsuttrykk».",
 kvitt:"Steinbiten står i montera no og glefsar mot alle som kjem inn. Ottar er storleg nøgd."},
{id:"kafe-krise",niv:3,tit:"Kafeen slapp opp",krav:{hyse:4,sei:3},
 hist:"Krise på Havblikk: fiskekakene er slutt, og bussen med pensjonistar kjem klokka eitt. Klara treng hyse og sei, og ho treng det no.",
 kvitt:"Bussen kom, kakene var klare. Klara har hengt opp eit bilete av deg bak disken — ver stolt."},
{id:"halvor-vinter",niv:3,tit:"Vinterforråd til fyret",krav:{brosme:3,torsk:1},
 hist:"Fyrvaktar Halvor saltar ned vinterforrådet sitt no. Brosme toler saltet best, seier han, og han har salta fisk i førti år.",
 kvitt:"Halvor rodde ut med tønna full. Han sa «bra». To gonger, faktisk."},
{id:"konfirmasjon",niv:3,tit:"Konfirmasjon i prestegarden",treng:"teine",krav:{torsk:3,krabbe:6},
 hist:"Prestegarden skal ha konfirmasjonsselskap for tre konfirmantar på ein gong. Torsk til middagen og krabbe til kveldsmaten — Mikkelsen ringde sjølv og bad pent.",
 kvitt:"Tre konfirmantar, fjorten tanter og ikkje ein smule att. Mikkelsen kallar det eit under."},
{id:"sankthans",niv:3,tit:"Sankthans i fjøra",mnd:[5],treng:"teine",krav:{makrell:4,sei:2,krabbe:4},
 hist:"Sankthanskvelden blir det bål i fjøra, og då skal det grillast. Makrell, sei og nykokt krabbe medan sola nektar å gå ned.",
 kvitt:"Bålet brann, ungane dansa, og sola gjekk aldri ned. Slike kveldar lever bygda på heile vinteren."},

/* ---------- NIVÅ 4: EKSPERT (Djuphavet med vinsj, sjeldan fisk, store lass) ---------- */
{id:"blaakveite-royk",niv:4,tit:"Blåkveite til røykeriet",treng:"vinsj",krav:{blaakveite:2},
 hist:"Eg har fått røykomnen til å gå jamt, og no vil eg prøve meg på røykt blåkveite — feit og fin frå djuphavet. To stykke, om du har vinsj og vågemot.",
 kvitt:"Ho vart gyllen og blank i røyken. Eg sende eit stykke til ordføraren og eitt til deg. Resten sel eg dyrt."},
{id:"museum-havmus",niv:4,tit:"Museet vil ha havmus",treng:"vinsj",krav:{havmus:1},
 hist:"Museet i byen set opp utstilling om djuphavet og manglar sjølvaste havmusa. Dei betalar bra, og namnet ditt kjem på ein plakett — «innsamlar», står det.",
 kvitt:"Havmusa ligg på sprit i byen no, med namnet ditt på veggen attmed. Bygda er komen i museumshistoria."},
{id:"forskarane",niv:4,tit:"Forskarane frå universitetet",treng:"vinsj",krav:{skolest:2,havmus:1},
 hist:"To forskarar frå universitetet leiger rom hjå Berit og treng prøver frå djupet: skolest og havmus. Dei snakkar latin om fisk. Eg lèt som eg forstår.",
 kvitt:"Forskarane reiste heim med prøvene og lova å nemne bygda i artikkelen. Vi blir siterte, du."},
{id:"haitran",niv:4,tit:"Tran på gamlemåten",treng:"vinsj",krav:{svarthaa:2,haagjel:1},
 hist:"Gamle-Sverre sver til tran av hålever, slik far hans koka. Svarthå og hågjel frå djupet — så kokar vi tran på gamlemåten, og heile kaia får lukte det.",
 kvitt:"Trana står på flasker i vindauget mitt. Sverre tok ein skei og sa han kjende seg tjue år yngre."},
{id:"amerikabesok",niv:4,tit:"Storhelg på Havblikk",treng:"teine",krav:{torsk:3,hyse:2,krabbe:4,lange:1},
 hist:"Klara har fått heile slekta frå Amerika på besøk og vil vise kva kjøkkenet duger til. Torsk, hyse, krabbe og ei lange — heile menyen frå fjord til bord.",
 kvitt:"Amerikanarane fotograferte kvar tallerken og gret litt då dei reiste. Klara seier det var maten. Eg trur det var alt saman."},
{id:"blaastaal",niv:4,tit:"Målaren og den blå fisken",krav:{blastal:1},
 hist:"Ein målar har slege seg ned i naustet til Ottar og vil måle ein blåstål frå livet — «den blåaste fisken i havet», seier han. Sjeldan fisk, det, men du veit jo kvar han rotar.",
 kvitt:"Måleriet heng til tørk i naustet. Fisken lyser blått frå lerretet — det fekk han fram, målaren."},
{id:"fiskebilen",niv:4,tit:"Fiskebilen til byen",krav:{torsk:4,hyse:3,sei:3},
 hist:"Eg fyller fiskebilen og køyrer til torget i byen laurdag. Torsk, hyse og sei i mengder — byen betalar godt for fjordfisk, og vi deler.",
 kvitt:"Utselt før klokka elleve. Byfolk står i kø for fisken din — hugs det neste gong nokon spør kvar du er frå."},
{id:"havets-tallerken",niv:4,tit:"Smak av djupet",treng:"vinsj",mnd:[5,6,7],krav:{blaakveite:1,brosme:2,uer:1},
 hist:"Pierre vil setje «havets tallerken» på menyen: blåkveite, brosme og raud uer. Han kallar det «degustasjon». Eg kallar det god fisk på fint fat.",
 kvitt:"Retten fekk namn etter fjorden, og gjestene betalar tre hundre for tallerkenen. Pierre bukka mot kaia di."}
];
```
Trekkregler utover niv/treng/mnd (kodes i trekkeren, ikke i katalogen): sone-låsen f.z <= maksSone() per krav-art, ss >= 0.5, fredning, krabbe > 4 krever 2 teiner, hummer krever hummerteine ute med natt, blaastaal krever eid blaastal-borstemark-tips.

BYGDEFOLK-galleriet (23) beholdes som Designer 2 leverte det, med én rettelse: magda «Mel hysa sjølv til fiskebollane» (ikke «Malar»). Redaksjonelle regler 1–3 (Rusten forteller alltid; gjenbruk folkene; aldri kleint, aldri mørkt) fredes som kommentar over katalogen.

### 5.3 Tipsbiblioteket (35)
```js
/* Rustens fisketips. Effekten (m) ligger KUN her i klienten; synken ser bare {k, ts}.
   Tips rører kun rigB (napp/pulje) — aldri størrelse, aldri biteChance, aldri bruk/line/pilk.
   Opptjenes i poser (verd 1–3) — kveitetipsene deles KUN ut som milepæler (se plan pkt. 9).
   Redaksjonell regel: tekstene lover bare det rigB + dg/sesong/vær faktisk holder,
   nevner aldri bruk/line/pilking, og lover aldri at rådet gjeld alle. */
var TIPS_DEF={
/* verd 1 — Grunt */
"makrell-blink":{art:"makrell",rig:"blink",rigType:"sluk",m:1.5,verd:1,
 tekst:"Makrellen høgg på alt som glimtar, men gamal, sliten krom blenkjer på rette måten. Blinken min er femti år og fiskar enno best."},
"lyr-spinner":{art:"lyr",rig:"spinner",rigType:"sluk",m:1.4,verd:1,
 tekst:"Lyren er ein jeger med godt auge. Ein spinner som blenkjer i solstreket — han klarer ikkje la vere."},
"lyr-wobbler":{art:"lyr",rig:"wobbler",rigType:"sluk",m:1.5,verd:1,
 tekst:"Wobbleren vinglar som ein skadd småsei, og lyren er ikkje den som lèt ein skadd småsei symje i fred."},
"sei-sildeforsats":{art:"sei",rig:"sildeforsats",rigType:"sluk",m:1.4,verd:1,
 tekst:"Seien går i stim etter sildeyngel heile livet. Dreg du forsatsen jamt og roleg, trur han det er matfat."},
"sei-fiskeboller":{art:"sei",rig:"fiskeboller",rigType:"agn",m:1.5,verd:1,
 tekst:"Fiskeboller til seien — han et slekta si utan blygsel. Billeg agn, god fangst; slik likar vi det her."},
"sandflyndre-borstemark":{art:"sandflyndre",rig:"borstemark",rigType:"agn",m:1.4,verd:1,
 tekst:"Flyndra ligg med nasen i sanden og ventar på børstemark heile livet. Gjev henne det ho ventar på."},
"berggylte-dupp":{art:"berggylte",rig:"dupp",rigType:"sluk",m:1.5,verd:1,
 tekst:"Berggylta står i taren og plukkar. Eit agn under dupp, heilt stilt attmed tarekanten — der plukkar ho det òg."},
"knurr-gummimakk":{art:"knurr",rig:"gummimakk",rigType:"sluk",m:1.5,verd:1,
 tekst:"Knurren går på botnen og kjenner seg fram med fingrane sine — ja, han har fingrar, sjå etter sjølv. Ein gummimakk som dirrar i sanden, då er han der."},
"hvitting-fiskeboller":{art:"hvitting",rig:"fiskeboller",rigType:"agn",m:1.6,verd:1,
 tekst:"Kvitingen er glad i alt som er kvitt og mjukt. Fiskeboller på kroken er nesten kannibalisme, men han bryr seg ikkje."},
"lomre-gummimakk":{art:"lomre",rig:"gummimakk",rigType:"sluk",m:1.6,verd:1,
 tekst:"Lomra er kresnare enn resten av flyndreslekta. Ein liten gummimakk, dregen sakte over botnen — då trur ho det lever."},
"aalekvabbe-borstemark":{art:"aalekvabbe",rig:"borstemark",rigType:"agn",m:1.5,verd:1,
 tekst:"Ålekvabben snusar i mudderet etter børstemark natta lang. Gjev han marken, så er han din."},

/* verd 2 — Mellomdyp og Dypt */
"torsk-torskepilk":{art:"torsk",rig:"torskepilk",rigType:"sluk",m:1.5,verd:2,
 tekst:"Torskepilken har fått fasongen sin gjennom hundre år med prøving. Torsken har ikkje endra smak på like lenge."},
"torsk-bacon":{art:"torsk",rig:"bacon",rigType:"agn",m:1.5,verd:2,
 tekst:"Salt flesk har fiska torsk sidan oldefars tid. Torsken kjenner feittlukta lange vegar."},
"torsk-polsebiter":{art:"torsk",rig:"polsebiter",rigType:"agn",m:1.5,verd:2,
 tekst:"Ler du av pølse på krok? Torsken ler ikkje. Torsken et fyrst og tenkjer aldri."},
"torsk-kveitepilk":{art:"torsk",rig:"kveitepilk",rigType:"sluk",m:1.4,verd:2,
 tekst:"Kveitepilken er for stor for torsken, tenkjer du? Stortorsken tenkjer motsett. Stor pilk, stor torsk."},
"hyse-juksa":{art:"hyse",rig:"juksa",rigType:"sluk",m:1.5,verd:2,
 tekst:"Hysa vil ha det rolege, gamle jukset — små rykk heilt nede ved botnen. Ho er gamaldags, hysa, som meg."},
"hyse-blaaskjell":{art:"hyse",rig:"blaaskjell",rigType:"agn",m:1.5,verd:2,
 tekst:"Hysemunnen er liten og fin. Eit blåskjel er akkurat passe munnfull — ho svelgjer utan å tenkje seg om."},
"lysing-wobbler":{art:"lysing",rig:"wobbler",rigType:"sluk",m:1.5,verd:2,
 tekst:"Lysinga jagar i skumringa, når småfisken trekkjer opp. Wobbler i grålysinga — nett då, ikkje midt på dagen."},
"akkar-lysende":{art:"akkar",rig:"lysende",rigType:"sluk",m:1.5,verd:2,
 tekst:"Akkaren kjem opp or djupet etter lys. Ein lysande pilk i mørkret — så heng han på med alle armane."},
"uer-brunost":{art:"uer",rig:"brunost",rigType:"agn",m:1.5,verd:2,
 tekst:"Bestefar min hadde alltid med ein brunostbit på uerfiske. «Raud fisk vil ha brun ost», sa han. Han fekk alltid uer."},
"uer-krabbe":{art:"uer",rig:"krabbe",rigType:"agn",m:1.5,verd:2,
 tekst:"Ueren og krabben bur i same ura. Set krabbeagn frå teina på kroken, så trur ueren det er nabolaget som helsar på."},
"brosme-lysende":{art:"brosme",rig:"lysende",rigType:"sluk",m:1.5,verd:2,
 tekst:"Der nede er det stummande mørkt. Ein lysande pilk er som ei gatelykt for brosma — ho kjem for å sjå."},
"brosme-brunost":{art:"brosme",rig:"brunost",rigType:"agn",m:1.8,verd:2,
 tekst:"Far min sverga til brunost for brosma. Folk lo av han på kaia — heilt til dei såg kista hans full av brosme."},
"lange-gummijigg":{art:"lange",rig:"gummijigg",rigType:"sluk",m:1.4,verd:2,
 tekst:"Langa står i bakkane og ventar. Ein stor, mjuk jigg som vaggar forbi nasen — då stormar ho ut or holet sitt."},
"lange-seibiter":{art:"lange",rig:"sei",rigType:"agn",m:1.5,verd:2,
 tekst:"Ei lange vil ha noko å tyggje på: ein blank seibit rett framfor gapet. Storfisk vil ha storagn."},
"steinbit-blaaskjell":{art:"steinbit",rig:"blaaskjell",rigType:"agn",m:1.5,verd:2,
 tekst:"Steinbiten knuser skjel med kjeften heile dagen. Gjev han eit blåskjel, så takkar han med å bite."},
"steinbit-krabbe":{art:"steinbit",rig:"krabbe",rigType:"agn",m:1.5,verd:2,
 tekst:"Steinbit og krabbe er gamle uvener. Set ein krabbe på kroken, så kjem steinbiten for å gjere opp."},

/* verd 3 — Djuphavet og sjeldan fisk (kronjuvelane). De tre dominante parene fra
   utkastet (agnrigg-hågjel, storpirk/makrellhode-blåkveite) er byttet mot underbrukte
   rigger der multiplikatoren faktisk kjennes. */
"haagjel-lysende":{art:"haagjel",rig:"lysende",rigType:"sluk",m:1.5,verd:3,
 tekst:"Hågjelen finn agnriggen sjølv — det veit du alt. Men set du den lysande pilken djupt, kjem han til DEG i staden. Og då sit han fast."},
"havmus-lysende":{art:"havmus",rig:"lysende",rigType:"sluk",m:1.5,verd:3,
 tekst:"Havmusa har auge som lykter og kjem mot lyset. Den lysande pilken er einaste helsinga ho svarar på."},
"skolest-akkar":{art:"skolest",rig:"akkar",rigType:"agn",m:1.5,verd:3,
 tekst:"Skolesten der nede vil ha akkar — seig bit som sit på kroken. Nett slik skal det vere på fem hundre meter."},
"svarthaa-akkar":{art:"svarthaa",rig:"akkar",rigType:"agn",m:1.5,verd:3,
 tekst:"Svarthåen har nase for akkar. Ein bit på riggen i djupmørkret, så finn han fram — hai er hai, om han er aldri så liten."},
"blaakveite-lysende":{art:"blaakveite",rig:"lysende",rigType:"sluk",m:1.6,verd:3,
 tekst:"Alle dreg storpirk etter blåkveita. Men der nede i mørkret er det lyset ho fyrst får auge på. Den lysande pilken er løyndomen min — no er han din."},
"blaastal-borstemark":{art:"blastal",rig:"borstemark",rigType:"agn",m:1.8,verd:3,
 tekst:"Blåstålen rotar i taren etter børstemark. Får du marken framom nasen på han, gløymer han seg reint bort. Men teier du om det — han er sjeldan nok som han er."},
/* Milepælstips (deles aldri ut i vanlige poser — se pkt. 9, eierens valg): */
"kveite-kveitepilk":{art:"kveite",rig:"kveitepilk",rigType:"sluk",m:1.4,verd:3,milepael:true,
 tekst:"Kveitepilken er laga for éin ting. Legg han i botnen og løft roleg — kveita ligg og ser oppover, og ho gløymer aldri ein pilk som dansar rett."},
"kveite-makrellhode":{art:"kveite",rig:"makrellhode",rigType:"agn",m:1.4,verd:3,milepael:true,
 tekst:"Skal du ha storkveita i tale, så snakk språket hennar: eit heilt makrellhovud, ferskt og blankt. Alt anna er småprat."}
};
```
Utdeling: pose-trekket filtrerer bort eide tips, foretrekker arter innenfor maksSone(), og hopper alltid over `milepael:true`. Ved tip-levering vises alltid sluttlinjen «Lappen gjeld deg — eg skriv ikkje ut kopiar.» (fiksjonsvernet for per-spiller-effekten).

---

## 6. UX-flyten

### 6.1 Lappen i butikken (primærhjem)
Dagens-fisk-banneret i openShop() (fiske.html:3786) bygges om til bestillingslappen — samme DOM-plass, før fanene, uten dataset.kost (overlever prissorteringen 3878–3886, re-rendres gratis via shopRefresh). Innhold:
- Historielinjen (hist, Rustens nynorsk) og tittel/nivåord (NIVA — nynorsk, det står på lappen).
- Kravlisten som chips MED FISKETEGNING (FIMG/col/shape finnes per art) + store tall «1/3», artsnavn i liten skrift under; `flex-wrap` så nivå 3–4 wrapper på 320 px (testes mot amerikabesok).
- Belønningshint uten fasit: en tegnet pose i tre størrelser etter nivå — aldri innholdsliste.
- Rustens ro: «Det hastar ikkje — dagen er lang.» (bestemor-vernet).
- Fotnote: dagens +50 %-art beholdes som liten linje nederst — én lapp, ikke to bannere.

### 6.2 Fremdrift ellers — fire lesepunkter, null permanent skjermplass
- Badge på #openShop etter #kjellVarsel-oppskriften, TRE rene tilstander uten tall (kritiker 3: to ulike tallbadges forvirrer): grønn prikk = ny/usett, grønn ring = i gang, gull med glød = pose klar. Dekksraden skjules automatisk under kamp.
- Fangstmodalen: linjen «Til bestillingen: torsk 2/3» plasseres SYNLIG FØR selg/slipp/agn-knappene, og selg-knappen får diskret markering når fisken er en krav-art — barnet skal aldri slippe bestillingsfisken av snillhet uten å se det.
- Teinetrekkets oppgjørsliste: tilsvarende linje per tellende fangst.
- Utror: utvid eksisterende setHint-kall (2059): «Rusten mangler 2 torsk og 4 krabber til Berit.» (fortellerstemme = bokmål).
Kvitteringer går via notice()/noticeMedKnapp() — ALDRI rustenSier (bremsene kan svelge kritisk info, og 🎣-prefikset der bryter emoji-regelen; nye varsler arver det ikke).

### 6.3 Fullføring og goodie bag
- Komplett-øyeblikk (gjerne på sjøen): Snd.gladDog() + vibrate([60,40,120]) + noticeMedKnapp «Alt Berit trenger er levert! Det står en pose til deg hos Rusten.» — knappen «Greit!» lukker bare; posen presses aldri på spilleren. Badgen går til gull.
- Hos Rusten: der lappen hang står en tegnet papirpose med spillerens navn i tusj; resten av #shopList dimmes lett. Trykk → papirlyd (Snd.blaSide som stand-in til spill/lyd/pose-rasling.aac er spilt inn) + vibrate([40,30,80]). Innholdet avsløres linje for linje (~450 ms, trykk hopper til slutt; Snd.coin for kroner, Snd.buy for varer; kronene bokføres idet linjen vises så HUD-mynta snurrer selv).
- Tips-avsløringen: posen står et halvt sekund tom, så «Det ligg ein lapp att i botnen.» → brettet gul lapp → Snd.blaSide → håndskrevet kort (lett rotert, kursiv, ren CSS) med Rustens tekst, og til slutt «Lappen er lagt i lomma di.» → tipsGi(id).
- Hentingen: `hentet=true` settes og saveAll() kjøres FØR gi()-callbacken, og flagget re-sjekkes etter synk — dobbelthenting på to enheter er strukturelt umulig, og posen finnes på alle enheter (deterministisk bagTrekk).

### 6.4 Første gangs intro
Engangsflagg P.bestillingIntroSett (jaflagg-mønsteret: gearUt, gearLoft, GEAR_JANEI, «kan aldri tas tilbake»). Første openShop: brettet lapp på disken, skrivUt-tempo:
«Høyr her. Folk ringjer meg støtt og vil ha fersk fisk — bursdagar, konfirmasjonar, fredagskos. Eg rekk ikkje ro etter alt sjølv, og du er no ute på sjøen likevel. Så frå no av heng eg bestillinga her kvar morgon. Leverer du det som står på lappen, står det ein pose til deg på disken — litt smått og godt oppi. Og av og til legg eg ved noko som er meir verdt enn pengar: det eg veit om fisken her ute, skriv eg ikkje i avisa, for å seie det slik.»
Første pose: «Der ja. Berit vert glad no. Posen er din — og kik i botnen før du kastar han.»

### 6.5 Tips-visning i dag (før Notater-appen)
- Rad på fiskerkortet: «Rustens lapper (3)» → liste av samme gul-lapp-kort, nyeste øverst, med dato. Samme lappkort-CSS gjenbrukes i pose, fiskerkort og senere Notater — flyttingen til appen (bolk 4b) blir ren omplassering; P.tips {k, ts} + TIPS_DEF.tekst er alt appen trenger.
- Valgfritt: etterstilt penn-markering i sluksettet («Wobbler ✎») — etterstilt tegn, aldri foran.

### 6.6 Fase 2 (ikke MVP)
Morgens-SMS fra Rusten med historien (ny meldingstype "bestilling", stille innLegg, aldri ringOpp — anrop er strupet og spares til investorer). Krever pratPerson-utvidelsen på tre steder: pratRing (5533), visInnboks (5766), apneMelding (5788) — ellers forsvinner meldinger fra avsendere utenfor fiskerVed. Eventuelt også familie-fremdrift på lappen (se pkt. 9).

---

## 7. Synk-planen (den hellige regelen — felt for felt)

Nye felter: `P.bestilling = {dag, id, krav:{maks 6 nøkler}, lev:{}, ferdig, hentet}` (~250 byte), `P.tips = [{k, ts}]` (cap 120 ≈ 3,6 kB), pluss samtidig-fiksen **P.solgt** (skrives 2366/2733/3374, vises i profilen, men står i dag UTENFOR synk — går tapt ved enhetsbytte).

KLIENT (fiske.html):
1. `chosen()` (1861-blokken): `if(!P.tips)P.tips=[];` `if(!P.solgt)P.solgt=0;` bestilling valideres — lagret bestilling med `dag > bestillingsDag()+1` forkastes og regenereres (klokkevern).
2. `gearUt()` (1718–1722): + `tips`, `bestilling`, `solgt`, `bestillingIntroSett`. (Advarselskommentaren 1708–1717 gjelder.)
3. `gearLoft()` (1726) — IKKE gearInn (famTaImot ruter aktiv spiller til gearLoft alene; gearInn når aldri en aktiv spiller — kritiker 1):
   - `flettTips`: union på k, behold LAVEST ts per k, cap 120 (kutt eldst-først-bevarende).
   - `flettBestilling`: innkommende.dag > lokal.dag → ta innkommende helt; samme dag → per-art `lev = Math.max`, `ferdig = ferdig||…`, `hentet = hentet||…`; samme dag men ulik id (to enheter trakk før første synk) → behold lavest niv (snillest), flett lev per art.
   - `solgt`: Math.max.
   Dermed dekkes famTaImot, gearInn-stien, lesKopi (1644) og fremtidige kallsteder i én operasjon.
4. Storage-lytteren (1459–1472): flettTips og flettBestilling kjøres FØR vakta `if(!P||nm!==P.name)` på 1474, ved siden av famFlett/flettTrofe — det er eneste måte to faner med SAMME spiller ikke mister leveranser og tips (kritiker 1; å legge feltene i lista bak vakta gjør ingenting for hovedscenarioet).

SERVER (familierekorder.mjs):
1. `GEAR_TALL` (mjs:60): + `solgt`. `GEAR_JANEI` (mjs:64): + `bestillingIntroSett`.
2. `vaskGear` (225–247):
   - `vaskTips(t)`: array, cap 120; hvert element {k: PEN_NOKKEL, ts: tall clampet ≤ Date.now()+60s (rts-mønsteret mjs:276)}. Serveren validerer IKKE mot TIPS_DEF — ukjente id-er er harmløse; regex + cap hindrer oppblåsing.
   - `vaskBestilling(b)`: {dag: tall clampet ≤ serverens egen dagsberegning + 1 (klokkevernet — samme feilklasse serveren alt clamper for smorTs/tur.ferdig/rts; uten dette låser én feilstilt barne-iPad spilleren ute i årevis), id: PEN_NOKKEL, krav/lev: vaskTelleObjekt-mønsteret maks 6 nøkler, ferdig/hentet: !!}.
3. `flettSpiller` (286–310): flettTips (union, aldri fjernes, cap 120) + flettBestilling (samme logikk som klienten) + solgt Math.max — alle tre med carry-forward `if (g[k]==null && gml[k]!=null)` (mønsteret mjs:290–291) så en gammel klient uten feltene aldri visker ut fremdrift eller tips.

Størrelsesbudsjett: godt innenfor MAKS_KROPP 60 kB og 45-sekunders synk. Dokumentert restsvakhet: per-art max på lev kan undertelle ved samtidig spill på to enheter (se 2.4) — skrives som kodekommentar i begge flettBestilling-implementasjonene.

---

## 8. Implementeringsrekkefølge (bolker med verifiseringspunkter)

**Bolk 1 — Synk-grunnmuren** (ingen synlig endring): P.tips/P.bestilling/P.solgt/P.bestillingIntroSett gjennom hele kjeden (7 over) + bestillingsDag() + tipsGi() + navnehash/bagTrekk.
Verifisering: node-test mot ekte familierekorder.mjs-funksjoner som simulerer to enheter (union av tips, dagsbytte, hentet-OR, carry-forward fra gammel klient, klokke-clamp med dag=99999); NY VAKT i verktoy-alt.sh: hvert felt i gearUt() skal finnes i vaskGear-hvitlisten (fanger fella som har smelt tre ganger — hadde også fanget P.solgt).

**Bolk 2 — Katalog, trekker og telling**: BESTILLINGER-tabellen, trekkeren (2.3), tellekrokene i resolveCatch/pilkeoppgjør/pullPot (kr>0-regelen, sild-unntaket, krabbe/hummer), dagssjekk i krokene og openShop.
Verifisering: katalogrevisjon i verktoy-spillrevisjon.mjs — for hvert progresjonsnivå og hver måned i året: minst 3 innfribare bestillinger per nivå; ingen krav-art fredet/utenfor sesong (ss>=0.5); ingen nivå 2-bestilling fullførbar utelukkende via minispill; rammene (arter/antall) holdes.

**Bolk 3 — TIPS_DEF og rigB-koblingen**: tipsFaktor-linjen (2388), tipsGi som eneste skrivepunkt, fredningskommentaren.
Verifisering: verktoy-spillrevisjon.mjs måler at hvert tips faktisk løfter arten sin (relativ vekting — «løftetall» må aldri senke), målt med verste stabling (ekkolodd + Spesialagn); assert cap ≥ 2×|TIPS_DEF|; grep-vakt: «sizeLen», «hookedLen» og «biteChance» skal ikke referere tips.

**Bolk 4 — Butikk-UI og goodie bag**: lappen (3786), chips med fisketegninger, badge (tre tilstander), fangstmodal-linjen før knappene, setHint-utvidelsen, pose-sekvensen + bagTrekk, intro-flagget.
Verifisering: manuell test på 320 px (amerikabesok-chips wrapper; lapp + faner + sortering uendret); dobbelthentingstest med to faner (hentet-OR).

**Bolk 5 — Tips-visning**: lappliste på fiskerkortet, penn-markering i sluksettet, posepapir-lyd når innspilt.

**Bolk 6 — Fase 2 (egen beslutning)**: pratPerson-fiksen tre steder + morgens-SMS; ev. familie-fremdrift på lappen.

Husets metode gjelder hver bolk: patch med eksakt anker (linjenumrene over), test med ekte kode før push, pusher samles opp per bolk.

---

## 9. Åpne valg som kun eieren kan ta

1. **Kveitetipsene (kveite-kveitepilk, kveite-makrellhode)**: Designer 1 sa «aldri tips for rar 2», Designer 2 gjorde dem til kronjuveler, kritikerne spriker. ANBEFALING: behold dem, men som deterministiske MILEPÆLER (garantert ved første fullførte Æresbestilling, aldri i tilfeldige poser) — da har alle i familien samme sti til samme kunnskap, kappløpet om storkveita handler om innsats og ikke terninger, størrelsen røres uansett aldri, og advarselslisten presiseres: «aldri tips som ruller størrelse eller selges — milepælstips for trofeet er OK; napp-fordel kan ALDRI selges for ekte penger». Alternativet er å stryke dem helt (kritiker 2s linje) — tryggest, men da mister posene sin gjeveste gulrot.
2. **Familie-fremdrift på lappen** («Marte: ferdig · Pappa: 2/4»): gjør ulikheten i krav til en historie om at Rusten kjenner folkene sine i stedet for en urettferdighet, og dataene finnes alt i familierekorder. ANBEFALING: ja, men i fase 2 (bolk 6) — det er polish, ikke fundament.
3. **Tips-fiksjonen ved kjøkkenbordet**: når storebror roper «lyren tek wobbleren!» og lillesøster ikke får napp, holder «hysj»-lappene («Lappen gjeld deg — eg skriv ikkje ut kopiar»)? Eller skal tipsene omskrives til TING («ei lita luktflaske til DIN wobbler») så per-spiller-effekten blir selvforklarende? ANBEFALING: start med hysj-lappene (null omskriving, mekanikken er identisk) og bytt til ting-fiksjonen bare hvis barna faktisk snubler i det.

---

## Vedlegg: Kritikkregnskap (alle funn — innarbeidet eller avvist)

Kritiker 1: sild/sildehekla-selvmotsigelsen INNARBEIDET (2.4, spesialregel); pullPot-fredningslekkasjen INNARBEIDET (kr>0-regelen); storage-lytter-vakta INNARBEIDET (fletting FØR 1474); gearInn-blindveien INNARBEIDET (alt i gearLoft); hentet-flagget INNARBEIDET (synket, OR); klokkeclamp INNARBEIDET (server + klient); lev-undertelling AKSEPTERT MED KODEKOMMENTAR (per-enhet-lev avvist: kompleksitet uten tilsvarende gevinst i et familiespill); dagsskifte midt i økta + UTC-avviket INNARBEIDET (bestillingsDag() lokal kl. 04, dagssjekk i krokene); tips-cap INNARBEIDET (120, eldst bevares); D2s manglende sone-gating INNARBEIDET (trekkeren, 2.3); gaveTrekk/streakDag INNARBEIDET (egen bagTrekk); katalog-normalisering INNARBEIDET (5.1).

Kritiker 2: kveitetips-konflikten DELVIS — avgjøres av eieren med anbefalt milepæl-løsning, invarianten skrives inn i advarselslisten uansett; uinnfribare bestillinger INNARBEIDET (hummer 1 + gating, krabbe 5, ss>=0.5, blåstål-gating, fiskebilen/amerikabesok trimmet); dominante verd 3-par INNARBEIDET (tre byttet); nivå 3–4-inflasjonen INNARBEIDET (N4 500–1000, ukemåltall pose < streak); tips undervektet INNARBEIDET (30/50 %, fallback vare); premium-vernet INNARBEIDET (tipsGi, endelig TIPS_DEF, premium-notat-linje); døgnskille INNARBEIDET (kl. 04); sild-tak INNARBEIDET (maks 5, aldri eneste art nivå 2+, revisjonssjekk).

Kritiker 3: arkitekturforening INNARBEIDET (katalog + gating, 2.1); pose på tvers av enheter INNARBEIDET (hentet i synk + deterministisk bagTrekk); de sju nynorskfeilene INNARBEIDET (5.2/5.3) med NIVA-regelen «alt på lappen er Rustens håndskrift»; fiskebilder + slipp-fella INNARBEIDET (6.2); bestemor-vernet INNARBEIDET (aktivitetsdemper, lav-antall-vekting, «Det hastar ikkje»-linjen); kveitetips-milepæl INNARBEIDET som anbefalingen i eiervalg 1; kjøkkenbord-fiksjonen DELVIS (hysj-linjen obligatorisk + regel om at ingen tekst lover allmenn gyldighet; full ting-omskriving = eiervalg 3); døgnskille INNARBEIDET; felles/personlig-hybriden INNARBEIDET (felles-først-trekket) med familie-fremdrift som eiervalg 2; 320px-chips og badge uten tall INNARBEIDET; mekanisk sanne tips-tekster INNARBEIDET (redaksjonell regel + fiskevaeret-motoren som fasitsjekk før frysing).

---

## 10. EIERENS VEDTAK 4. aug (kveld) — overstyrer punktene over der de kolliderer

1. **Tipsene forankres i Sluk-og-agn-rapport.pdf** (spillets egne målte faktorer, repo-rota).
   Et tips AVSLØRER en ekte, eksisterende sammenheng — sted + redskap («Mellom oss to: makrellen
   står ved Kvitholmen, og han bit best på blink») — og gir i tillegg tipseieren sin personlige
   faktor oppå (tipsFaktor i rigB, som planlagt i pkt. 3). Stedsnavn = kartnavnene
   (Grunt=Kvitholmen, Mellomdyp=Trålsund, Dypt=Svartrenna, Djuphavet=Uthavet).
   TIPS_DEF bygges om i bolk 3 fra rapportens beste par (Storpirk→Blåkveite ×4,90,
   Seiforsats→Sild ×6,55, Spinner→Lyr ×3,34, Dupp og mark→Sandflyndre ×3,76, Wobbler→Lyr,
   Pirk→Uer, Gummijigg→Lange, Djuphavs-agnrigg→Hågjel, Selvlysende→Brosme, Kveitepilk→Kveite …).
   Alt fra Rustens munn på nynorsk.
2. **Rasjonering i stedet for pose-prosent:** belønningstabellens tips-sjanser (pkt. 4) UTGÅR.
   Tips deles ut som MILEPÆLER på antall fullførte bestillinger (ny synket teller
   P.bestFerdige): første tips etter 10–20 fullførte dager, deretter tynt utover
   (deterministisk per spiller via bagTrekk — anbefalt trapp: 12, deretter +8–14 per gang).
   «Dette må vi smøre så tynt som mulig utover.» Posene beholder kroner/varer;
   lappen-i-botnen-øyeblikket (6.3) brukes på milepælsdagene. Kveitetipsene ligger sist i trappa.
3. **Tipsene BOR i Arkiv → Min bok** (ikke fiskerkortet — 6.5 utgår): artskortet får én kort
   nynorsk linje når tipset er eid, f.eks. MAKRELL: «Bit best på blink ved Kvitholmen.»
   Kort skal det være. Pose-avsløringen (den gule lappen) beholdes som leveringsøyeblikk.
4. **Familie-fremdrift på lappen: JA, i fase 2** (bolk 6). **Hysj-lappene: JA**
   («Lappen gjeld deg — eg skriv ikkje ut kopiar.»).
5. **Igangsetting godkjent:** bolk 1 startes umiddelbart. P.bestFerdige legges til i
   bolk 1-feltene (GEAR_TALL, Math.max-flett, carry-forward).

6. **SYKLUSDESIGNET (eierens vedtak 4. aug, sen kveld) — erstatter milepælstrappa i pkt. 2:**
   Bestillingene går i 14-dagers sykluser: dag 1–5 lette, 6–10 middels, 11–13 krevende,
   og dag 14 er SYKLUSFISKENS dag. Ingen krav om fullførte dager på rad. Dag 14-lappen
   KOMMER MED tipset (Rustens råd: sted + redskap) i det den trekkes — hjelp, ikke premie —
   og boklinja legger seg straks på artskortet i Mi bok. Syklusfisken roterer felles på
   syklusnummeret (kjøkkenbordprat), men glir deterministisk til neste i rekka for spillere
   som ikke når arten. Kveitetipset står for tur når alle andre er eid. ~2 tips i måneden.
   Implementert i bolk 3 med verktoy-tipstest.mjs (130 sjekker + motprøve).

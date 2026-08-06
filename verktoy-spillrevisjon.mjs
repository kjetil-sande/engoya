// Mekanisk revisjon av fiskemekanikken.
//
// Henter FISH, SLUK, AGN og selve utvelgelseslogikken UT AV fiske.html og kjører
// den — det er koden som faktisk sendes til spillerne som måles, ikke en kopi.
// En håndkopiert tabell hadde begynt å lyve første gang noen endret spillet.
//
//   node verktoy-spillrevisjon.mjs
//
// Svarer på: kan alle 38 artene faktisk fås? Har hver sluk og hvert agn en
// signatur som virker? Finnes det utstyr som ikke gjør noe?

import { readFileSync } from "node:fs";

const K = readFileSync("fiske.html", "utf8");
let feil = 0, ok = 0, aatvaring = 0;
const sjekk = (n, sant, x = "") => {
  if (sant) { ok++; console.log("  OK   " + n + (x ? "   " + x : "")); }
  else { feil++; console.log("  FEIL " + n + (x ? "   " + x : "")); }
};
const merk = (n, x = "") => { aatvaring++; console.log("  ~    " + n + (x ? "   " + x : "")); };

// ── Hent ut kildekode ────────────────────────────────────────────────────────
const tabell = (navn) => {
  const i = K.indexOf("var " + navn + "=[");
  if (i < 0) throw new Error("fant ikke " + navn);
  let d = 0;
  for (let j = K.indexOf("[", i); j < K.length; j++) {
    if (K[j] === "[") d++;
    else if (K[j] === "]") { d--; if (!d) return K.slice(i, j + 1) + ";"; }
  }
};
const funksjon = (navn) => {
  const i = K.indexOf("function " + navn + "(");
  if (i < 0) throw new Error("fant ikke " + navn);
  let d = 0;
  for (let j = K.indexOf("{", i); j < K.length; j++) {
    if (K[j] === "{") d++;
    else if (K[j] === "}") { d--; if (!d) return K.slice(i, j + 1); }
  }
};

// startWait() inneholder rigB, beste og poolVekter. Vi tar hele funksjonen og
// klipper ut den delen som velger art, slik at vi kjører nøyaktig den koden.
const sw = funksjon("startWait");
const velgKilde = sw.slice(sw.indexOf("function rigB"), sw.indexOf("var dir=Math.random()"));

const kode = `
${tabell("FISH")}
${tabell("SLUK")}
${tabell("AGN")}
var slukDef={}; SLUK.forEach(function(u){slukDef[u.k]=u});
var agnDef={};  AGN.forEach(function(a){agnDef[a.k]=a});
var depth=0, P={ekko:false,tips:[]}, agEff=null, suEff=null, MND=6;
var byKey={}; FISH.forEach(function(f){byKey[f.k]=f});
var TIPS_DEF={};                       // revisjonen måler REN riggeffekt — ingen tips eid
function aktivAgn(){ return agEff; } function aktivSluk(){ return suEff; }
function tipsFaktor(){ return 1; }     // rigB kaller denne; uten den krasjer hele revisjonen
function riggK(){ return 1; }
function havmusOppe(){ return false; }
function slukAnbefalt(){ var u=P.rig&&slukDef[P.rig]; return !u||u.rec.indexOf(depth)>=0; }
${funksjon("iSona")}
function sesongFaktor(f){ return f.ss ? f.ss[MND] : 1; }
function dognFaktor(){ return 1; }     // nøytralisert: vi måler slukens virkning, ikke klokka
function vaerFaktor(){ return 1; }
function stromFaktor(){ return 1; }

function velgArt(){
  var zf=FISH.filter(function(f){return iSona(f) && f.k!=="makrellstorje"});
  var t2=zf.filter(function(f){return f.rar===2}), t1=zf.filter(function(f){return f.rar===1}), t0=zf.filter(function(f){return !f.rar});
  var base=t0.length?t0:(t1.length?t1:zf);
  ${velgKilde}
  var vekter=poolVekter(pool), tot=0; vekter.forEach(function(w){tot+=w});
  var r=Math.random()*tot, acc=0, cf=pool[0];
  for(var i=0;i<pool.length;i++){acc+=vekter[i]; if(r<=acc){cf=pool[i];break;}}
  return cf.k;
}
// Samme kode én gang til, men vi REGNER UT andelen på hvert trinn i stedet for å
// trekke. 60 000 trekninger per kombinasjon ville tatt timer på alle riggene ×
// sonene × sesongene, og en trekning på 2,4 mot 2,56 prosent drukner uansett i
// støyen. pL og pR ER trinnhøydene, så her er tallet eksakt.
function trinn(){
  var zf=FISH.filter(function(f){return iSona(f) && f.k!=="makrellstorje"});
  var t2=zf.filter(function(f){return f.rar===2}), t1=zf.filter(function(f){return f.rar===1}), t0=zf.filter(function(f){return !f.rar});
  var base=t0.length?t0:(t1.length?t1:zf);
  ${velgKilde}
  var L=t2.length?Math.min(1,pL):0;
  var S=(t1.length&&t1!==base)?Math.min(1,pR):0;
  return {L:L, S:S, V:Math.max(0,1-L-S)};   // legendarisk, sjelden, vanlig
}
export { FISH, SLUK, AGN, slukDef, agnDef, velgArt, trinn };
export function sett(d, rig, agn, ekko){
  depth=d; P={rig:rig, ekko:!!ekko};
  suEff = rig ? slukDef[rig] : null;
  agEff = agn ? agnDef[agn] : null;
}
export function settMnd(m){ MND=m; }
`;
const M = await import("data:text/javascript;base64," + Buffer.from(kode).toString("base64"));
const { FISH, SLUK, AGN, velgArt, trinn, sett, settMnd } = M;

const SONER = ["Grunt", "Mellomdyp", "Dypt", "Djuphavet"];
const N = 60000;
const fordeling = (d, rig, agn, ekko) => {
  sett(d, rig, agn, ekko);
  const t = {};
  for (let i = 0; i < N; i++) { const k = velgArt(); t[k] = (t[k] || 0) + 1; }
  return t;
};

console.log("\n═══ MEKANISK REVISJON ═══");
console.log(FISH.length + " arter · " + SLUK.length + " sluker · " + AGN.length + " agn\n");

// ── 1. Er alle artene nåbare? ────────────────────────────────────────────────
console.log("1. KAN ALLE ARTENE FÅS?");
const settArt = new Set();
for (let d = 0; d < 4; d++) {
  for (const u of SLUK) {
    for (let m = 0; m < 12; m += 3) {          // fire årstider
      settMnd(m);
      Object.keys(fordeling(d, u.k, null, true)).forEach((k) => settArt.add(k));
    }
  }
}
settMnd(6);
// Superagnet henter legender fra hele havet — egen vei inn.
for (const a of AGN) Object.keys(fordeling(0, "blink", a.k, true)).forEach((k) => settArt.add(k));

const uteN = FISH.filter((f) => !settArt.has(f.k));
// Størja tas aldri på bunnsluk (kommentaren i koden sier det rett ut) og
// trofédyr hentes ikke fra denne veien.
const VENTA_UTE = { makrellstorje: "tas aldri fra bunnsluk — egen vei inn" };
const ekteUte = uteN.filter((f) => !VENTA_UTE[f.k]);
sjekk("alle arter kan nås", ekteUte.length === 0,
  ekteUte.length ? "aldri sett: " + ekteUte.map((f) => f.n).join(", ")
                 : settArt.size + " av " + FISH.length + " (" + Object.keys(VENTA_UTE).length + " med vilje utenfor)");

// ── 2 og 3. Gjør sluker og agn det tabellen lover? ────────────────────────────
// Systemet er RELATIVT: andelen er w*b delt på summen av alle w*b. Løfter du
// en art kraftig, synker alle andre — også de med b litt over 1. Det er ikke en
// feil, det er meningen (kommentaren i SLUK sier det rett ut). Testen må derfor
// skille tre ting:
//
//   SIGNATUR  — høyeste b i tabellen. Denne MÅ stige merkbart, ellers er
//               sluken uten funksjon.
//   SEKUNDÆR — b over 1, men ikke høyest. Faar drive litt, men skal ikke
//               FALLE — da lover tabellen noe den ikke holder.
//   DEMPING   — b under 1. Skal falle.
console.log("\n2 og 3. GJØR SLUKER OG AGN DET TABELLEN LOVER?");
settMnd(6);

// Mål i den anbefalte sonen der arten faktisk bor — ikke bare den forste.
function mål(erSluk, def, art){
  var soner = erSluk ? (def.rec || [0,1,2,3]) : [0,1,2,3];
  var best = null;
  for (const d of soner){
    const utan = fordeling(d, null, null, false);
    if ((utan[art] || 0) < 400) continue;            // for få til å si noe
    const med = fordeling(d, erSluk ? def.k : null, erSluk ? null : def.k, false);
    const r = (med[art] || 0) / utan[art];
    if (!best || utan[art] > best.n) best = { d, n: utan[art], r };
  }
  return best;
}

const falskeLoefter = [];
for (const [merke, liste, erSluk] of [["Sluk", SLUK, true], ["Agn", AGN, false]]){
  for (const def of liste){
    const b = def.b || {};
    const opp = Object.entries(b).filter(([, v]) => v > 1);
    const ned = Object.entries(b).filter(([, v]) => v < 1);
    if (!opp.length){
      merk(merke + " " + def.n + ": ingen artssignatur",
        def.dud ? "(spøkesluk — med vilje)" : def.pilk ? "(minispill — egen fangstvei)"
        : def.superLegend ? "(superagn)" : def.rar ? "(gir sjeldne i stedet)" : "");
      continue;
    }
    // Signaturen er den med høyest b.
    const sig = opp.reduce((a, x) => x[1] > a[1] ? x : a);
    const m = mål(erSluk, def, sig[0]);
    if (!m){ merk(merke + " " + def.n + ": " + sig[0] + " for sjelden til å måles"); continue; }
    sjekk(merke + " " + def.n + " → " + sig[0],
      m.r > 1.15, "×" + m.r.toFixed(2) + " (lovet " + sig[1] + ", " + SONER[m.d] + ")");

    // Sekundære løfter: de skal ikke FALLE.
    for (const [art, v] of opp){
      if (art === sig[0]) continue;
      const s2 = mål(erSluk, def, art);
      if (!s2) continue;
      if (s2.r < 0.95) falskeLoefter.push({
        hva: merke + " " + def.n, art, lovet: v, målt: s2.r, sone: SONER[s2.d] });
    }
    // Dempingen skal virke.
    for (const [art, v] of ned){
      const s3 = mål(erSluk, def, art);
      if (s3 && s3.r > 1.05) falskeLoefter.push({
        hva: merke + " " + def.n, art, lovet: v, målt: s3.r, sone: SONER[s3.d], demping: true });
    }
  }
}

console.log("\n3b. LOVER NOEN TABELL NOE DEN IKKE HOLDER?");
if (!falskeLoefter.length) sjekk("ingen b over 1 som gjør arten sjeldnere", true);
else for (const f of falskeLoefter){
  const tekst = f.hva + ": " + f.art + " b:" + f.lovet + " → målt ×" + f.målt.toFixed(2)
    + " i " + f.sone;
  if (f.demping) merk("demping virket ikke — " + tekst);
  else if (f.målt < 0.85) sjekk(tekst, false);      // materielt fall = falskt løfte
  else merk("liten drift (ventet i et relativt system) — " + tekst);
}

// ── 4. Peker noe på en art som ikke finnes? ─────────────────────────────────
console.log("\n4. PEKER TABELLENE PÅ EKTE ARTER?");
const artNokkel = new Set(FISH.map((f) => f.k));
const spok = [];
for (const u of SLUK) for (const k of Object.keys(u.b || {}))
  if (!artNokkel.has(k)) spok.push("sluk " + u.n + " → " + k);
for (const a of AGN) for (const k of Object.keys(a.b || {}))
  if (!artNokkel.has(k)) spok.push("agn " + a.n + " → " + k);
sjekk("ingen tabell peker på en art som ikke finnes", spok.length === 0, spok.join("; "));

// ── 5. Er noen sone tom, eller eid av én art? ───────────────────────────────
console.log("\n5. ER SONENE LEVELIGE?");
for (let d = 0; d < 4; d++) {
  const f = fordeling(d, null, null, false);
  const par = Object.entries(f).sort((a, b) => b[1] - a[1]);
  const sum = par.reduce((s, [, v]) => s + v, 0);
  const topp = par[0], andel = Math.round(100 * topp[1] / sum);
  sjekk(SONER[d] + ": " + par.length + " arter, størst " + topp[0] + " " + andel + " %",
    par.length >= 3 && andel <= 85);
}

// ── 6. Står raritetstrappa? ────────────────────────────────────────────────
// Eierens regel: vanlig oftest, så sjelden, og legendarisk sjeldnest. Trappa er
// bygget inn i lukene (1/150 mot 1/75), men beste() ganger begge med det riggen
// lokker, og de to faktorene er uavhengige av hverandre. Lokker en rigg legenden
// hardere enn den lokker noe sjeldent, velter trappa — kveitepilken gjorde det i
// oktober før gulvet i startWait() kom på plass. Vi går gjennom hver rigg i hver
// sone i hver årstid, for det er der en framtidig b-verdi kommer til å bryte den.
console.log("\n6. STÅR RARITETSTRAPPA (VANLIG > SJELDEN > LEGENDARISK)?");
const trappebrudd = [];
let trappeTilfelle = 0, tynnest = null;
for (let d = 0; d < 4; d++)
  for (const u of [null, ...SLUK.filter((s) => !s.pilk).map((s) => s.k)])
    for (const a of [null, ...AGN.filter((x) => !x.superLegend).map((x) => x.k)])
      for (let m = 0; m < 12; m++) {
        settMnd(m); sett(d, u, a, true);          // ekkolodd på: den verste luka
        const t = trinn(); trappeTilfelle++;
        const navn = SONER[d] + " · " + (u || "ingen sluk") + " + " + (a || "ingen agn") + " · mnd " + (m + 1);
        if (!(t.V > t.S && t.S > t.L)) trappebrudd.push({ navn, t });
        // Marginen mellom sjelden og legendarisk er den som ryker først.
        const mrg = t.L > 0 ? t.S / t.L : Infinity;
        if (tynnest === null || mrg < tynnest.mrg) tynnest = { navn, mrg, t };
      }
sjekk("vanlig > sjelden > legendarisk i alle " + trappeTilfelle + " rigg × sone × sesong",
  trappebrudd.length === 0,
  trappebrudd.length
    ? trappebrudd.slice(0, 3).map((b) => b.navn + " (V " + (b.t.V * 100).toFixed(1) +
        " % · S " + (b.t.S * 100).toFixed(2) + " % · L " + (b.t.L * 100).toFixed(2) + " %)").join("; ")
    : "tynneste margin: " + tynnest.navn + " — sjelden ×" + tynnest.mrg.toFixed(2) + " av legendarisk");
settMnd(6);

console.log("\n" + (feil
  ? "✗ " + feil + " FEIL, " + aatvaring + " merknader, " + ok + " grønne"
  : "✓ " + ok + " grønne, " + aatvaring + " merknader, ingen feil"));
process.exit(feil ? 1 : 0);

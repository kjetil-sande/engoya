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
// Skalarer (var NAVN=…;) — trappa er ikke en tabell, men den må hentes ut like ekte.
const konstant = (navn) => {
  const m = K.match(new RegExp("var " + navn + "=([^;]+);"));
  if (!m) throw new Error("fant ikke " + navn);
  return "var " + navn + "=" + m[1] + ";";
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
${tabell("RARMAAL")}
${tabell("RARBITT")}
${konstant("TRAPPETRINN")}
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

function velgArt(ut){
  var zf=FISH.filter(function(f){return iSona(f) && f.k!=="makrellstorje"});
  var t2=zf.filter(function(f){return f.rar===2}), t1=zf.filter(function(f){return f.rar===1}), t0=zf.filter(function(f){return !f.rar});
  var base=t0.length?t0:(t1.length?t1:zf);
  ${velgKilde}
  // Med «ut» rapporterer vi trinnlukene og vektene i stedet for å trekke. Da kan
  // trappa måles EKSAKT på spillets egne tall, uten å terne 60 000 ganger for et
  // svar som uansett skjelver i tredje desimal.
  if(ut){ ut.pL=pL; ut.pR=pR;
    ut.trinn=[{pl:base, p:1-pL-pR}, {pl:(t1.length&&t1!==base)?t1:[], p:pR}, {pl:t2, p:pL}]
      .map(function(t){ if(!t.pl.length)return {arter:[]};
        var v=poolVekter(t.pl), s=0; v.forEach(function(x){s+=x});
        return {arter:t.pl.map(function(f,i){ return {k:f.k, n:f.n, rar:f.rar, p:t.p*v[i]/s}; })}; });
    return null; }
  var vekter=poolVekter(pool), tot=0; vekter.forEach(function(w){tot+=w});
  var r=Math.random()*tot, acc=0, cf=pool[0];
  for(var i=0;i<pool.length;i++){acc+=vekter[i]; if(r<=acc){cf=pool[i];break;}}
  return cf.k;
}
export { FISH, SLUK, AGN, slukDef, agnDef, velgArt, RARBITT };
export function sett(d, rig, agn, ekko){
  depth=d; P={rig:rig, ekko:!!ekko};
  suEff = rig ? slukDef[rig] : null;
  agEff = agn ? agnDef[agn] : null;
}
export function settMnd(m){ MND=m; }
`;
const M = await import("data:text/javascript;base64," + Buffer.from(kode).toString("base64"));
const { FISH, SLUK, AGN, velgArt, sett, settMnd } = M;

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

// ── 6. Står sjeldenhetstrappa riktig vei? ───────────────────────────────────
// Regelen eieren ba om 6. aug: de VANLIGE artene skal man få mest av, så de
// sjeldne, og til slutt de legendariske. Ikke bare trinn mot trinn — art mot art.
// Det var nettopp der det brast: håkjerringa arvet hele legende-luka alene i
// Djuphavet og ble vanligere enn hver eneste sjeldne art i sona.
//
// Måles med nøytral rigg og midtsesong. Sluker, agn, ekkolodd og tips har LOV til
// å bøye trappa — det er det utstyret er til for — men den skal stå av seg selv.
console.log("\n6. STÅR SJELDENHETSTRAPPA RIKTIG VEI?");
settMnd(6);
const TRINN = ["vanlig", "sjelden", "legendarisk"];
// Napp-sjansen er én ting, fangstboka en annen: de sjeldne biter halvparten så
// ofte som hverdagsfisken, de legendariske en fjerdedel. Hentes fra spillkoden,
// så testen ikke lever videre på gamle tall hvis noen justerer dem.
const BC = M.RARBITT;
// Trappa regner nå med havets egen rytme (miljoB), så den skal stå HELE året —
// også i makrellsesongen og i akkarvinteren. Derfor: alle tolv månedene, hver sone.
const trappa = (d, mnd) => {
  settMnd(mnd); sett(d, null, null, false);
  const ut = {}; velgArt(ut);
  const arter = [];
  ut.trinn.forEach((t, r) => t.arter.forEach((a) => arter.push({ ...a, p: a.p * BC[r] })));
  const sum = arter.reduce((s, a) => s + a.p, 0) || 1;
  arter.forEach((a) => (a.pct = 100 * a.p / sum));
  return arter.filter((a) => a.pct > 0);   // arter som er helt ute av sesong (ss:0) teller ikke
};
for (let d = 0; d < 4; d++) {
  const brudd = []; let verst = null, juli = null;
  for (let mnd = 0; mnd < 12; mnd++) {
    const arter = trappa(d, mnd);
    const lav = (r) => Math.min(...arter.filter((a) => a.rar === r).map((a) => a.pct), Infinity);
    const hoy = (r) => Math.max(...arter.filter((a) => a.rar === r).map((a) => a.pct), -Infinity);
    for (const r of [0, 1]) {
      if (!isFinite(lav(r)) || !isFinite(hoy(r + 1))) continue;
      const klaring = lav(r) / hoy(r + 1);
      if (!verst || klaring < verst.k) verst = { k: klaring, mnd, r };
      if (lav(r) <= hoy(r + 1)) {
        const under = arter.filter((a) => a.rar === r).sort((x, y) => x.pct - y.pct)[0];
        const over = arter.filter((a) => a.rar === r + 1).sort((x, y) => y.pct - x.pct)[0];
        brudd.push("mnd " + (mnd + 1) + ": " + over.n + " (" + TRINN[r + 1] + ", " + over.pct.toFixed(3)
          + " %) bites oftere enn " + under.n + " (" + TRINN[r] + ", " + under.pct.toFixed(3) + " %)");
      }
    }
    if (mnd === 6) juli = [0, 1, 2].map((r) =>
      arter.filter((a) => a.rar === r).reduce((s, a) => s + a.pct, 0));
  }
  sjekk(SONER[d] + ": " + juli[0].toFixed(1) + " % vanlig · " + juli[1].toFixed(1) + " % sjelden · "
    + juli[2].toFixed(2) + " % legendarisk", brudd.length === 0,
    brudd.length ? brudd.slice(0, 3).join("; ") + (brudd.length > 3 ? " (+" + (brudd.length - 3) + ")" : "")
      : "trangeste klaring ×" + verst.k.toFixed(1) + " (" + TRINN[verst.r] + "/" + TRINN[verst.r + 1]
        + ", mnd " + (verst.mnd + 1) + ")");
}
settMnd(6);

console.log("\n" + (feil
  ? "✗ " + feil + " FEIL, " + aatvaring + " merknader, " + ok + " grønne"
  : "✓ " + ok + " grønne, " + aatvaring + " merknader, ingen feil"));
process.exit(feil ? 1 : 0);

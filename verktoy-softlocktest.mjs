// Kan spilleren bli stående permanent fast?
//
// Henter den EKTE cast() ut av fiske.html og kjører den mot fiendtlige tilstander.
// Regelen som testes: fra enhver tilstand må cast() enten sette i gang fiske, eller
// gi spilleren en vei videre (gratis bensin, reparasjon på krita, en blink fra
// skuffen). En cast() som bare sier «nei» og lar alt stå uendret, i det uendelige,
// er en softlock.
//
//   node verktoy-softlocktest.mjs
//   node verktoy-softlocktest.mjs --uten-propellvakt    ← kontroll: skal FEILE

import { readFileSync } from "node:fs";

const utenVakt = process.argv.includes("--uten-propellvakt");
let K = readFileSync("fiske.html", "utf8");

if (utenVakt) {
  // Fjern nåden for propellen — slik koden så ut før. Testen MÅ falle da,
  // ellers beviser den ingenting.
  const i = K.indexOf('if(!kanTjene){ P.propOk=true;');
  const j = K.indexOf('return; }', i) + "return; }".length;
  if (i < 0) { console.log("fant ikke propellnåden — er den fjernet?"); process.exit(1); }
  K = K.slice(0, i) + K.slice(j);
}

const funksjon = (navn, kilde = K) => {
  const i = kilde.indexOf("function " + navn + "(");
  if (i < 0) throw new Error("fant ikke " + navn);
  let d = 0;
  for (let j = kilde.indexOf("{", i); j < kilde.length; j++) {
    if (kilde[j] === "{") d++;
    else if (kilde[j] === "}") { d--; if (!d) return kilde.slice(i, j + 1); }
  }
};
const tabell = (navn) => {
  const i = K.indexOf("var " + navn + "=[");
  let d = 0;
  for (let j = K.indexOf("[", i); j < K.length; j++) {
    if (K[j] === "[") d++;
    else if (K[j] === "]") { d--; if (!d) return K.slice(i, j + 1) + ";"; }
  }
};

// cast() slutter der fiskingen faktisk starter. Alt etter det er animasjon og
// DOM vi ikke trenger — vi bryter av og melder «kom i gang».
let castKilde = funksjon("cast");
const kutt = castKilde.indexOf("flee=null; // evt. rømmende fisk ryddes ved nytt kast");
castKilde = castKilde.slice(0, kutt) + '\n  __start(); return;\n}';

const kode = `
${tabell("SLUK")}
${tabell("AGN")}
var slukDef={}; SLUK.forEach(function(u){slukDef[u.k]=u});
var agnDef={};  AGN.forEach(function(a){agnDef[a.k]=a});
var ZONE=["Grunt","Mellomdyp","Dypt","Djuphavet"];
var P=null, depth=0, phase="idle", flee=null, smellT=-1;
var __hendt=[];                       // alt som endret spillerens situasjon
function __start(){ __hendt.push("fiske"); }
function notice(t){ __hendt.push("nei:"+String(t).slice(0,42)); }
function noticeMedKnapp(t, k, fn){ __hendt.push("tilbud:"+String(t).slice(0,28)); __tilbud=fn; }
var __tilbud=null;
function hud(){} function saveAll(){} function updateRigChip(){} function syncFam(){}
function dogShow(){} function updateDepthLocks(){} function updatePotBtn(){}
var Snd=new Proxy({},{get:function(){return function(){}}});
var navigator={};
function $(){ return { classList:{add:function(){},remove:function(){},toggle:function(){}} }; }
function document_querySelector(){ return null; }
var document={ querySelector:function(){ return null; } };
function smorPct(){ return 100; }
function hummerSeason(){ return false; }
function fredetNaa(){ return false; }
${castKilde}
export { P, cast };
export function sett(pl, d){ P=pl; depth=d; phase="idle"; __hendt=[]; __tilbud=null; }
export function hendt(){ return __hendt; }
export function tilbud(){ return __tilbud; }
export function spelar(){ return P; }
`;

const M = await import("data:text/javascript;base64," + Buffer.from(kode).toString("base64"));
const { cast: kast, sett, hendt, tilbud, spelar } = M;

let feil = 0, ok = 0;
const sjekk = (n, sant, x = "") => {
  if (sant) { ok++; console.log("  OK   " + n + (x ? "   " + x : "")); }
  else { feil++; console.log("  FEIL " + n + (x ? "   " + x : "")); }
};

const nyPl = (o = {}) => Object.assign({
  kr: 500, fuel: 20, fuelMax: 20, motorOk: true, propOk: true, svc: 0,
  rod: 0, rig: "blink", lures: { blink: 3 }, agn: {},
  pots: { owned: 0, ownedH: 0, lineOwned: 0, out: [], bait: 0, lineAgn: 0 },
  rolex: null, forsTil: 0, vinsj: false,
}, o);

// Kjør cast() til noe skjer. «Noe» = fiske startet, eller spillerens tilstand endret
// seg (penger, bensin, motor, propell, sluker) — altså en vei videre.
function fast(pl, d = 0) {
  sett(pl, d);
  const foer = JSON.stringify(pl);
  for (let i = 0; i < 40; i++) {
    kast();
    if (hendt().includes("fiske")) return null;              // kom i gang
    if (JSON.stringify(spelar()) !== foer) return null;      // fikk hjelp
    const t = tilbud();
    if (t) { try { t(); } catch (e) {} if (JSON.stringify(spelar()) !== foer) return null; }
  }
  return hendt()[hendt().length - 1] || "(taus)";
}

console.log("\n" + (utenVakt ? "KONTROLL — UTEN PROPELLVAKTA" : "SOFTLOCK-TEST") + "\n");

console.log("1. PROPELLEN");
sjekk("blakk med røket propell og ingen teiner",
  !fast(nyPl({ propOk: false, kr: 100 })), String(fast(nyPl({ propOk: false, kr: 100 }))));
sjekk("røket propell, litt penger, men ikke nok til ny",
  !fast(nyPl({ propOk: false, kr: 1200 })), String(fast(nyPl({ propOk: false, kr: 1200 }))));
sjekk("røket propell + tom for bensin + blakk",
  !fast(nyPl({ propOk: false, kr: 5, fuel: 0 })), String(fast(nyPl({ propOk: false, kr: 5, fuel: 0 }))));
// Motprøve: med teine ute FINNES det inntekt, og da skal nåden IKKE slå inn —
// ellers ville enhver spiller med en teine i sjøen fått gratis propell. Her er
// «cast() nekter» det riktige svaret, fordi utveien ligger utenfor cast(): trekk teina.
sjekk("røket propell MEN teine ute → nåden skal IKKE utløses",
  /Propellen er ødelagt/.test(String(fast(nyPl({ propOk: false, kr: 100,
    pots: { owned: 1, ownedH: 0, lineOwned: 0, bait: 0, lineAgn: 0,
            out: [{ zone: 0, setAt: 0, t: "k" }] } })))));

console.log("\n2. MOTOREN");
sjekk("blakk med havarert motor", !fast(nyPl({ motorOk: false, kr: 100 })));
sjekk("havarert motor + tom tank", !fast(nyPl({ motorOk: false, kr: 10, fuel: 0 })));
sjekk("havarert motor med 5000 kr (ikke nok til 8000)", !fast(nyPl({ motorOk: false, kr: 5000 })));

console.log("\n3. BEGGE SAMTIDIG");
sjekk("motor OG propell røket, blakk", !fast(nyPl({ motorOk: false, propOk: false, kr: 0, fuel: 0 })));
sjekk("motor OG propell røket, 3000 kr", !fast(nyPl({ motorOk: false, propOk: false, kr: 3000 })));

console.log("\n4. ANDRE BLINDVEIER");
sjekk("tom for sluker og blakk", !fast(nyPl({ lures: {}, kr: 0 })));
sjekk("tom tank og blakk", !fast(nyPl({ fuel: 0, kr: 3 })));
sjekk("tomt agn montert, ingen sluker", !fast(nyPl({ rig: "reker", agn: {}, lures: {}, kr: 0 })));
sjekk("på Djuphavet uten bensin og penger", !fast(nyPl({ fuel: 0, kr: 5, rod: 2, vinsj: true }), 3));

console.log("");
if (utenVakt) {
  if (feil) console.log("✓ KONTROLLEN VIRKER — testen fanger " + feil + " felle" + (feil > 1 ? "r" : "") + " uten vakta.");
  else console.log("✗ KONTROLLEN ER TOM — testen består selv UTEN vakta, og beviser da ingenting.");
  process.exit(feil ? 0 : 1);
}
console.log(feil ? "✗ " + feil + " SOFTLOCK av " + (ok + feil)
                 : "✓ BESTÅTT — " + ok + " fiendtlige tilstander, ingen av dem er en blindvei.");
process.exit(feil ? 1 : 0);

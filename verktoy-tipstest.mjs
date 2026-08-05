// Er hvert eneste av Rustens tips SANT — og virker den personlige faktoren?
//
// Henter TIPS_DEF, tipsFaktor og trappa ut av fiske.html og prøver dem mot spillets
// egne tabeller. Reglene (PLAN-BESTILLINGER.md §3 + §10):
//   · hvert tips-par er RAPPORT-EKTE: koden har allerede b > 1 for (rigg, art) —
//     tipset avslører en sann sammenheng, det dikter ikke opp en ny
//   · tipsFaktor gir m KUN når arten stemmer OG riktig rigg er aktiv — ellers 1
//   · trappa (5. aug): ALLE vanlige tips før sjeldne; legendariske låses opp først
//     når alle sjeldne FISKER er fanget; verd stiger innenfor hvert trinn
//   · tips rører aldri størrelse: sizeLen/hookedLen-koden refererer ikke tips
//
//   node verktoy-tipstest.mjs
//   node verktoy-tipstest.mjs --uten-kobling   ← motprøve: tipsFaktor fjernet fra rigB, skal FEILE

import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let K = readFileSync("fiske.html", "utf8");
if (process.argv.includes("--uten-kobling"))
  K = K.replace("return b*tipsFaktor(f); }", "return b; }");

const funksjon = (navn) => {
  const i = K.indexOf("function " + navn + "(");
  if (i < 0) throw new Error("fant ikke " + navn);
  let d = 0;
  for (let j = K.indexOf("{", i); j < K.length; j++) {
    if (K[j] === "{") d++;
    else if (K[j] === "}") { d--; if (!d) return K.slice(i, j + 1); }
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
const objekt = (navn) => { // var TIPS_DEF={...};
  const i = K.indexOf("var " + navn + "={");
  let d = 0;
  for (let j = K.indexOf("{", i); j < K.length; j++) {
    if (K[j] === "{") d++;
    else if (K[j] === "}") { d--; if (!d) return K.slice(i, j + 1) + ";"; }
  }
};

const kilde = `
${tabell("FISH")}
var byKey={}; FISH.forEach(function(f){byKey[f.k]=f;});
${tabell("SLUK")}
var slukDef={}; SLUK.forEach(function(u){slukDef[u.k]=u});
${tabell("AGN")}
var agnDef={}; AGN.forEach(function(a){agnDef[a.k]=a});
${objekt("TIPS_DEF")}
var P={name:"Testfisker", tips:[], caught:{}};
var __ag=null, __su=null;
function aktivAgn(){ return __ag; }
function aktivSluk(){ return __su; }
${funksjon("mulberry32")}
${funksjon("navnehash")}
${funksjon("tipsFaktor")}
var __sone=3; function maksSone(){ return __sone; }
var __fredFri=true; function fredetNaa(f){ return false; } // sesongnøytral prøvebenk
${funksjon("syklusPos")}
${funksjon("tipsRang")}
${funksjon("alleSjeldneFanget")}
${funksjon("tipsPoolNaa")}
${funksjon("tipsNeste")}
${funksjon("syklusTips")}
export function settRigg(agK, suK){ __ag=agK?agnDef[agK]:null; __su=suK?slukDef[suK]:null; }
export function settTips(liste){ P.tips=liste.map(function(k){return {k:k, ts:1}}); }
export function settSone(z){ __sone=z; }
export function settFanget(liste){ P.caught={}; liste.forEach(function(k){P.caught[k]={count:1}}); }
export { TIPS_DEF, byKey, slukDef, agnDef, tipsFaktor, tipsNeste, syklusPos, syklusTips, tipsRang };
`;
const fil = join(mkdtempSync(join(tmpdir(), "tips-")), "t.mjs");
writeFileSync(fil, kilde);
const S = await import("file://" + fil);

let rod = 0, gronn = 0;
const feil = (m) => { rod++; console.log("  FEIL  " + m); };
const ok = () => gronn++;

/* 1. Hvert par er rapport-ekte */
for (const [id, td] of Object.entries(S.TIPS_DEF)) {
  const f = S.byKey[td.art];
  if (!f) { feil(id + ": ukjent art " + td.art); continue; } ok();
  const rigg = td.rigType === "agn" ? S.agnDef[td.rig] : S.slukDef[td.rig];
  if (!rigg) { feil(id + ": ukjent " + td.rigType + " " + td.rig); continue; } ok();
  const b = rigg.b && rigg.b[td.art];
  if (!(b > 1)) feil(id + ": koden har ingen bonus for paret (b=" + b + ") — tipset lyver"); else ok();
  if (!(td.m > 1 && td.m <= 2)) feil(id + ": m utenfor 1–2: " + td.m); else ok();
  if (!/Kvitholmen|Trålsund|Svartrenna|Uthavet/.test(td.tekst)) feil(id + ": teksten nevner ikke stedet"); else ok();
}

/* 2. tipsFaktor: riktig rigg gir m, feil rigg gir 1, uten tips gir 1 */
S.settTips([]); S.settRigg(null, "blink");
if (S.tipsFaktor(S.byKey.makrell) !== 1) feil("faktor uten tips skulle vært 1"); else ok();
S.settTips(["makrell-blink"]);
if (S.tipsFaktor(S.byKey.makrell) !== S.TIPS_DEF["makrell-blink"].m) feil("eid tips + riktig sluk ga ikke m"); else ok();
S.settRigg(null, "spinner");
if (S.tipsFaktor(S.byKey.makrell) !== 1) feil("feil sluk skulle gitt 1"); else ok();
S.settTips(["uer-brunost"]); S.settRigg("brunost", null);
if (S.tipsFaktor(S.byKey.uer) !== S.TIPS_DEF["uer-brunost"].m) feil("agn-tips + riktig agn ga ikke m"); else ok();
if (S.tipsFaktor(S.byKey.torsk) !== 1) feil("annen art skulle gitt 1"); else ok();

/* 3. Syklusen (7 fullførte lapper): lapp nr 7 velger tips deterministisk, aldri utenfor rekkevidde */
if (S.syklusPos(6) !== 6 || S.syklusPos(7) !== 0 || S.syklusPos(13) !== 6) feil("syklusPos regner feil"); else ok();
S.settTips([]); S.settFanget([]); S.settSone(3);
if (S.syklusTips(6) !== S.syklusTips(6)) feil("syklustipset er ikke deterministisk"); else ok();
if (S.syklusTips(6) === S.syklusTips(13)) feil("syklustipset roterer ikke mellom sykluser"); else ok();
S.settSone(0); const lavId = S.syklusTips(6); const lavF = S.byKey[S.TIPS_DEF[lavId].art];
if (lavF.z > 0) feil("nybegynner fikk syklustips utenfor sonen sin: " + lavId); else ok();
if (!/tipsGi\(sid\)/.test(K)) feil("lapp nr 7 deler ikke ut tipset"); else ok();
/* trinn-portene: bare vanlige først; legendariske låst til alle sjeldne er FANGET */
S.settTips([]); S.settFanget([]);
if (S.tipsRang(S.tipsNeste()) !== 0) feil("trappa starter ikke på vanlige"); else ok();
const alleR0 = Object.keys(S.TIPS_DEF).filter((k) => S.tipsRang(k) === 0);
S.settTips(alleR0);
if (S.tipsRang(S.tipsNeste()) !== 1) feil("sjeldne låses ikke opp når alle vanlige er eid"); else ok();
const alleR01 = Object.keys(S.TIPS_DEF).filter((k) => S.tipsRang(k) <= 1);
S.settTips(alleR01); S.settFanget([]);
if (S.tipsNeste() !== null) feil("legendariske delt ut FØR alle sjeldne fisker er fanget"); else ok();
const sjeldne = []; for (const f of S.byKey ? Object.values(S.byKey) : []) if ((f.rar || 0) === 1) sjeldne.push(f.k);
S.settFanget(sjeldne);
if (S.tipsRang(S.tipsNeste()) !== 2) feil("legendariske låses ikke opp av fangst av alle sjeldne"); else ok();
/* full vandring: alt deles ut, rang aldri synkende, kveita sist */
S.settTips([]); S.settSone(3); S.settFanget(sjeldne);
const rekke = []; const eid = [];
for (let i = 0; i < Object.keys(S.TIPS_DEF).length; i++) { S.settTips(eid); const n = S.tipsNeste(); if (!n) break; rekke.push(n); eid.push(n); }
if (rekke.length !== Object.keys(S.TIPS_DEF).length) feil("trappa deler ikke ut alle tipsene"); else ok();
const rangRekke = rekke.map((k) => S.tipsRang(k));
if (!rangRekke.every((v, i) => i === 0 || v >= rangRekke[i - 1])) feil("rekkefølgen faller i rang (vanlig→sjelden→legendarisk)"); else ok();
if (!S.TIPS_DEF[rekke[rekke.length - 1]].milepael) feil("kveitetipset ligger ikke sist"); else ok();

/* 4. rigB har koblingen, og størrelses-koden er tips-fri */
if (!/return b\*tipsFaktor\(f\); \}/.test(K)) feil("rigB mangler tipsFaktor-koblingen"); else ok();
const stor = K.split("\n").filter((l) => /hookedLen\s*=|sizeLen\s*[:=]/.test(l));
if (stor.some((l) => /tips/i.test(l))) feil("størrelses-koden refererer tips!"); else ok();

console.log(rod === 0
  ? "✓ BESTÅTT — " + gronn + " sjekker: alle " + Object.keys(S.TIPS_DEF).length + " tips er sanne, faktoren treffer bare eieren, og trappa smører tynt."
  : "✗ " + rod + " RØDE av " + (gronn + rod));
process.exit(rod === 0 ? 0 : 1);

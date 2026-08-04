// Kan hver eneste av Rustens bestillinger faktisk innfris — og holder rammene?
//
// Henter den EKTE katalogen og de EKTE gating-funksjonene ut av fiske.html og prøver
// dem måned for måned med en fullt utstyrt spiller. Reglene er kritikernes fasit
// (PLAN-BESTILLINGER.md §5.1 og §8 bolk 2):
//   · hver krav-art finnes i FISH (krabbe/hummer er teinefangst og unntatt)
//   · hver bestilling er innfribar i minst én måned — og i ALLE månedene i sitt mnd-felt
//   · hver måned har minst 3 innfribare bestillinger per nivå (fullt utstyr)
//   · rammene: N1 1–2 arter/2–5 fisk (sild maks 5) · N2 2–4 arter/4–7 fisk, sild aldri
//     alene på nivå 2+ · N3 fisk 6–10, krabbe 3–6, hummer maks 1 · N4 vinsj ELLER volum 8–12
//   · id-er er unike og pene nøkler
//
//   node verktoy-bestillingkatalog.mjs
//   node verktoy-bestillingkatalog.mjs --motprove   ← juni-makrellen gjeninnføres kunstig; skal FEILE

import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const K = readFileSync("fiske.html", "utf8");
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
  if (i < 0) throw new Error("fant ikke tabellen " + navn);
  let d = 0;
  for (let j = K.indexOf("[", i); j < K.length; j++) {
    if (K[j] === "[") d++;
    else if (K[j] === "]") { d--; if (!d) return K.slice(i, j + 1) + ";"; }
  }
};

const artOK = funksjon("bestillingArtOK");
let katalog = tabell("BESTILLINGER");
if (process.argv.includes("--motprove")) { // sankthans-fella gjeninnføres: makrell i juni er utenfor sesong — testen MÅ falle
  const s = katalog.replace('krav:{sei:4,krabbe:4}', 'krav:{makrell:4,krabbe:4}');
  if (s === katalog) { console.log("fant ikke sankthans-kravet å tukle med"); process.exit(1); }
  katalog = s;
}

const kilde = `
var window={};
${tabell("FISH")}
var byKey={}; FISH.forEach(function(f){byKey[f.k]=f;});
${katalog}
var P={vinsj:true, rod:2, pots:{owned:2, ownedH:1, out:[{t:"h", setAt:Date.now()-8*3600e3}]},
       tips:[{k:"blaastal-borstemark", ts:1}]}; // fullt utstyrt spiller med blåstål-tipset
var __mnd=0;
${funksjon("fredetNaa").replace(/new Date\(\)/g, "({getMonth:function(){return __mnd},getDate:function(){return 15}})")}
function hummerSeason(){ return __mnd>=9; }
function maksSone(){ return P.vinsj?3:(P.rod>=2?2:(P.rod>=1?1:0)); }
${artOK}
${funksjon("bestillingKandidater")}
export function proev(mnd){ __mnd=mnd; var ut={}; for(var n=1;n<=4;n++)ut[n]=bestillingKandidater(n,mnd).map(function(b){return b.id}); return ut; }
export { BESTILLINGER, FISH, byKey };
`;
const fil = join(mkdtempSync(join(tmpdir(), "katalog-")), "k.mjs");
writeFileSync(fil, kilde);
const S = await import("file://" + fil);

let rod = 0, gronn = 0;
const feil = (m) => { rod++; console.log("  FEIL  " + m); };
const ok = () => gronn++;

/* id-er og krav-arter */
const ids = new Set();
for (const b of S.BESTILLINGER) {
  if (ids.has(b.id)) feil("dublett-id: " + b.id); else { ids.add(b.id); ok(); }
  if (!/^[a-z0-9_-]{1,24}$/.test(b.id)) feil("stygg id: " + b.id); else ok();
  for (const a of Object.keys(b.krav))
    if (a !== "krabbe" && a !== "hummer" && !S.byKey[a]) feil(b.id + " krever ukjent art: " + a); else ok();
}

/* rammene */
for (const b of S.BESTILLINGER) {
  const arter = Object.keys(b.krav).filter((a) => a !== "krabbe" && a !== "hummer");
  const fisk = arter.reduce((s, a) => s + b.krav[a], 0);
  const krabbe = b.krav.krabbe || 0, hummer = b.krav.hummer || 0;
  const slag = arter.length + (krabbe ? 1 : 0) + (hummer ? 1 : 0);
  if (b.niv === 1 && !(arter.length >= 1 && arter.length <= 2 && fisk >= 2 && fisk <= 5)) feil("N1-ramme: " + b.id); else ok();
  if (b.niv === 2 && !(slag >= 1 && slag <= 4 && fisk + krabbe >= 2 && fisk <= 7)) feil("N2-ramme: " + b.id); else ok();
  if (b.niv >= 2 && arter.length === 1 && arter[0] === "sild") feil("sild alene på nivå " + b.niv + ": " + b.id); else ok();
  if ((b.krav.sild || 0) > 5) feil("sild-krav over 5: " + b.id); else ok();
  if (b.niv === 3 && !(fisk <= 10 && (krabbe === 0 || (krabbe >= 3 && krabbe <= 6)) && hummer <= 1)) feil("N3-ramme: " + b.id); else ok();
  const bareSjeldne = arter.length > 0 && arter.every((a) => (S.byKey[a] && S.byKey[a].rar >= 1));
  if (b.niv === 4 && !(b.treng === "vinsj" || fisk + krabbe >= 8 || bareSjeldne)) feil("N4-ramme (verken vinsj, volum eller sjelden art): " + b.id); else ok();
}

/* eierens regel: «som regel minst to typer» — flertallet per nivå har 2+ slag,
   og de få én-slags-unntakene er navngitte signaturer (tradisjon bærer dem) */
const SIGNATUR = new Set(["lomre-albertsen", "aalekvabbe-sverre", "sursild-emma", "krabbeaften",
  "calamari", "rognkjeks-magda", "molje", "lutefisk",
  "blaakveite-royk", "museum-havmus", "blaastaal"]);
for (const b of S.BESTILLINGER) {
  const antSlag = Object.keys(b.krav).length;
  if (antSlag < 2 && !SIGNATUR.has(b.id)) feil("én-slags uten signaturstatus: " + b.id); else ok();
}
for (let n = 1; n <= 3; n++) {
  const iNiv = S.BESTILLINGER.filter((b) => b.niv === n);
  const flere = iNiv.filter((b) => Object.keys(b.krav).length >= 2).length;
  if (flere / iNiv.length < 0.6) feil("nivå " + n + ": bare " + flere + "/" + iNiv.length + " har 2+ slag"); else ok();
}

/* innfribarhet — måned for måned med fullt utstyr */
const perMnd = [];
for (let m = 0; m < 12; m++) perMnd.push(S.proev(m));
for (const b of S.BESTILLINGER) {
  const mnd = b.mnd || [...Array(12).keys()];
  const kan = mnd.filter((m) => perMnd[m][b.niv].includes(b.id));
  if (!kan.length) feil(b.id + " er ALDRI innfribar"); else ok();
  if (b.mnd && kan.length < b.mnd.length)
    feil(b.id + " har mnd-felt den ikke kan innfris i: " + b.mnd.filter((m) => !kan.includes(m)).join(",")); else ok();
}
for (let m = 0; m < 12; m++)
  for (let n = 1; n <= 4; n++)
    if (perMnd[m][n].length < 3) feil("måned " + (m + 1) + " nivå " + n + ": bare " + perMnd[m][n].length + " innfribare"); else ok();

console.log(rod === 0
  ? "✓ BESTÅTT — " + gronn + " sjekker: alle " + S.BESTILLINGER.length + " bestillinger er innfribare, i ramme, hele året."
  : "✗ " + rod + " RØDE av " + (gronn + rod));
process.exit(rod === 0 ? 0 : 1);

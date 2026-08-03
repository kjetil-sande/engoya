// Kan ALT du finner i teina settes i troféskapet?
//
// Henter FUNN-tabellen og den EKTE funnLinje-koden ut av fiske.html og spør,
// for hvert eneste funn: får spilleren valget, eller blir det solgt over hodet
// på ham? En halvrusten kniv forsvant for ti kroner, og det var ikke meningen.
//
//   node verktoy-trofetest.mjs

import { readFileSync } from "node:fs";

const K = readFileSync("fiske.html", "utf8");
let feil = 0, ok = 0;
const sjekk = (n, sant, x = "") => {
  if (sant) { ok++; console.log("  OK   " + n + (x ? "   " + x : "")); }
  else { feil++; console.log("  FEIL " + n + (x ? "   " + x : "")); }
};

const tabell = (navn) => {
  const i = K.indexOf("var " + navn + "=[");
  if (i < 0) throw new Error("fant ikke " + navn);
  let d = 0;
  for (let j = K.indexOf("[", i); j < K.length; j++) {
    if (K[j] === "[") d++;
    else if (K[j] === "]") { d--; if (!d) return K.slice(i, j + 1) + ";"; }
  }
};

// Funnlinja bygges i en funksjon uten navn vi kan slå opp — vi tar kroppen fra
// «var l={e:v.e,…}» til «return l; }» og kjører nøyaktig den.
const start = K.indexOf("var l={e:v.e,n:v.n,kr:v.kr,");
const slutt = K.indexOf("if(v.rolexFunn)l.rolexFunn=true; return l; }", start);
if (start < 0 || slutt < 0) { console.log("fant ikke funnlinja i fiske.html"); process.exit(1); }
const kropp = K.slice(start, slutt) + "if(v.rolexFunn)l.rolexFunn=true; return l;";

const M = await import("data:text/javascript;base64," + Buffer.from(`
${tabell("FUNN")}
var P={kr:5000, funnSett:{}};
function rng(){ return 0.5; }
function erSkatt(){ return false; }
function hummerSeason(){ return true; }
function verdiSkala(){ return 1; }        // spiller med normal formue — prisen står som i tabellen
export { FUNN };
export function linje(v){ ${kropp} }
`).toString("base64"));
const { FUNN, linje } = M;

// De som med vilje IKKE skal kunne settes i skapet, og hvorfor.
const UNNTAK = {
  tokrabber:      "lever — selges eller settes ut",
  kongesnegl:     "lever",
  sjopolse:       "lever",
  blekksprutunge: "lever",
  sjostjerne:     "lever",
  strandkrabbe:   "lever",
  hummerstrikk:   "lever — og er freda utenom sesong",
  berggylte:      "er fisk, går i fangstboka",
  rolex:          "egen vei via Rusten",
  gullmynter:     "må meldes til museet",
};

console.log("\n═══ KAN ALT SETTES I TROFÉSKAPET? ═══\n");
console.log(FUNN.length + " funn i teina\n");

const uten = [];
for (const v of FUNN) {
  const l = linje(v);
  const kanTrofe = !!l.valg;
  if (UNNTAK[v.k]) {
    sjekk("unntak: " + v.n.slice(0, 40), !kanTrofe || v.k === "gullmynter",
      UNNTAK[v.k]);
    continue;
  }
  if (!kanTrofe) uten.push(v.k + " (" + v.n.slice(0, 46) + ")");
}
sjekk("alle andre funn kan settes i skapet", uten.length === 0,
  uten.length ? "\n     " + uten.join("\n     ") : (FUNN.length - Object.keys(UNNTAK).length) + " funn");

console.log("\nKNIVEN — den som forsvant:");
const kniv = FUNN.find((v) => v.k === "kniv");
const lk = linje(kniv);
sjekk("halvrusten kniv får valget", !!lk.valg);
sjekk("den blir ikke solgt automatisk", lk.kr === 0, "kr på linja: " + lk.kr);
sjekk("salgsprisen er tatt vare på", lk.trofeKr === kniv.kr, "trofeKr: " + lk.trofeKr);

console.log("\nDE SOM SETTER SIN EGEN VERDI UNDERVEIS:");
for (const k of ["flaskepost", "lommebok"]) {
  const v = FUNN.find((x) => x.k === k);
  const l = linje(v);
  sjekk(v.n.slice(0, 34) + " får valget", !!l.valg);
  // trofeKr må være den ENDELIGE verdien, ikke tabellens 0 — ellers ville
  // spilleren fått valget mellom skapet og null kroner. Lommeboka gir 7 kr med
  // vår faste terning; flaskeposten gir kjærlighetsbrevet, som er verdiløst.
  sjekk("  … og prisen er tatt vare på", l.trofeKr != null, "trofeKr: " + l.trofeKr);
}

console.log("\n" + (feil
  ? "✗ " + feil + " FEIL av " + (ok + feil)
  : "✓ BESTÅTT — " + ok + " sjekker: ingenting du finner blir solgt over hodet på deg."));
process.exit(feil ? 1 : 0);

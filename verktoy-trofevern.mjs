// Kan troféskapet bli tomt?
//
// Kjører de EKTE funksjonene som rører P.trofe — flettTrofe, gearLoft, gearInn —
// mot et skap med innhold, og spør etter hver eneste vei: står troféene der
// fortsatt? Skapet skal være monotont. Det er den eneste regelen som gjelder.
//
//   node verktoy-trofevern.mjs

import { readFileSync } from "node:fs";

const K = readFileSync("fiske.html", "utf8");
let feil = 0, ok = 0;
const sjekk = (n, sant, x = "") => {
  if (sant) { ok++; console.log("  OK   " + n + (x ? "   " + x : "")); }
  else { feil++; console.log("  FEIL " + n + (x ? "   " + x : "")); }
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

const M = await import("data:text/javascript;base64," + Buffer.from(`
${funksjon("flettTrofe")}
${funksjon("gearLoft")}
${funksjon("gearInn")}
function flettDager(a,b){ return Object.assign({}, a||{}, b||{}); }
function flettInvest(){ } function flettInnboks(){ return []; }
var P=null;
export { flettTrofe, gearLoft, gearInn };
`).toString("base64"));
const { flettTrofe, gearLoft, gearInn } = M;

const SKAP = () => ([
  { k: "kniv",       ts: 1000 },
  { k: "skrujern",   ts: 2000 },
  { k: "gulltann",   ts: 3000 },
  { k: "flaskepost", ts: 4000, borte: "solgt" },
]);
const tell = (p) => (p.trofe || []).length;

console.log("\n═══ KAN TROFÉSKAPET BLI TOMT? ═══\n");

console.log("1. FLETTING — den som kjører ved hver synk");
let lp = { trofe: SKAP() };
flettTrofe(lp, []);
sjekk("tom innkommende liste rører ingenting", tell(lp) === 4, tell(lp) + " igjen");

lp = { trofe: SKAP() };
flettTrofe(lp, undefined);
sjekk("undefined rører ingenting", tell(lp) === 4, tell(lp) + " igjen");

lp = { trofe: SKAP() };
flettTrofe(lp, [{ k: "anker", ts: 5000 }]);
sjekk("nytt trofé legges til, gamle står", tell(lp) === 5, tell(lp) + " i skapet");

lp = { trofe: [] };
flettTrofe(lp, SKAP());
sjekk("tomt lokalt skap fylles fra serveren", tell(lp) === 4,
  tell(lp) + " hentet inn — DETTE er redningen ved tap");

lp = { trofe: SKAP() };
flettTrofe(lp, SKAP());
sjekk("samme liste to ganger gir ikke duplikater", tell(lp) === 4, tell(lp));

console.log("\n2. GEARLOFT — utstyret som kommer fra serveren");
lp = { trofe: SKAP() };
gearLoft(lp, {});
sjekk("gear uten trofe-felt rører ikke skapet", tell(lp) === 4, tell(lp) + " igjen");

lp = { trofe: SKAP() };
gearLoft(lp, { trofe: [] });
sjekk("gear med TOMT trofe-felt rører ikke skapet", tell(lp) === 4,
  tell(lp) + " igjen ← en tømt enhet kan ikke smitte");

lp = { trofe: SKAP() };
gearLoft(lp, { trofe: null });
sjekk("gear med trofe:null rører ikke skapet", tell(lp) === 4, tell(lp) + " igjen");

console.log("\n3. GEARINN — hele profilen fra serveren");
lp = { trofe: SKAP(), kr: 5000 };
gearInn(lp, { kr: 99, fuel: 3, lures: {}, trofe: [] });
sjekk("full profil med tomt skap rører ikke skapet", tell(lp) === 4,
  tell(lp) + " igjen");

lp = { trofe: SKAP() };
gearInn(lp, {});
sjekk("tomt gear-objekt rører ikke skapet", tell(lp) === 4, tell(lp) + " igjen");

console.log("\n4. SOLGT ER SOLGT — men raden blir stående");
lp = { trofe: SKAP() };
flettTrofe(lp, [{ k: "kniv", ts: 1000, borte: "solgt" }]);
const kniv = lp.trofe.find((t) => t.k === "kniv" && t.ts === 1000);
sjekk("solgt trofé forsvinner ikke fra lista", !!kniv, tell(lp) + " rader");
sjekk("men det er merket solgt", kniv && kniv.borte === "solgt", kniv && kniv.borte);

console.log("\n5. KONTROLL — ville testen sett et tap?");
lp = { trofe: SKAP() };
lp.trofe = [];                                  // som om noe hadde tømt det
sjekk("testen fanger et tomt skap", tell(lp) === 0 ? true : false,
  "ja — 0 rader blir lagt merke til");

console.log("\n" + (feil
  ? "✗ " + feil + " FEIL av " + (ok + feil) + " — SKAPET KAN TØMMES"
  : "✓ BESTÅTT — " + ok + " veier inn i skapet, ingen av dem kan tømme det."));
process.exit(feil ? 1 : 0);

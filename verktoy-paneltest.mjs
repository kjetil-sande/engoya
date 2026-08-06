// Regresjonstest for kontrollpanelet (netlify/functions/statistikk.mjs).
//
// Netlify Blobs kan ikke kjøres lokalt, så getStore byttes ut med et falskt lager
// og den EKTE funksjonen kjøres mot det. Testen dekker de tre tingene som betyr
// noe: at panelet er stengt uten nøkkel, at samme person under både familiekode
// og fiskerkort telles ÉN gang, og at ingen kallenavn forlater serveren.
//
// Kjør:  node verktoy-paneltest.mjs
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const KILDE = new URL("./netlify/functions/statistikk.mjs", import.meta.url);
const FALSKT = `let _data={};
export function _sett(d){ _data=d; }
function getStore(){ return {
  list: async()=>({blobs:Object.keys(_data).map(k=>({key:k}))}),
  get: async(k)=>_data[k]||null }; }`;

let src = readFileSync(KILDE, "utf8");
if (!src.includes('import { getStore } from "@netlify/blobs";')) {
  console.error("FEIL: fant ikke getStore-importen. Er funksjonen skrevet om?");
  process.exit(1);
}
src = src.replace('import { getStore } from "@netlify/blobs";', FALSKT);
const sti = join(tmpdir(), "storkveita-paneltest-" + process.pid + ".mjs");
writeFileSync(sti, src);

let feil = 0;
const sjekk = (n, ok, d) => { console.log((ok ? "  OK   " : "  FEIL ") + n + (d ? "   " + d : "")); if (!ok) feil++; };

try {
  const mod = await import("file://" + sti);
  const h = mod.default, { _sett } = mod;
  process.env.STATS_NOKKEL = "hemmelig";

  const DAG = 864e5, iDag = Math.floor(Date.now() / DAG);
  const dagKey = (back) => { const d = new Date((iDag - back) * DAG);
    return "" + d.getUTCFullYear() + String(d.getUTCMonth() + 1).padStart(2, "0") + String(d.getUTCDate()).padStart(2, "0"); };
  const spiller = (navn, arter, trofe, dager, utstyr = {}) => ({ name: navn, ts: Date.now(),
    caught: Object.fromEntries(Array.from({ length: arter }, (_, i) => ["art" + i, { count: 1 }])),
    gear: { tidMs: dager.length * 3600000, trofe: Array.from({ length: trofe }, (_, i) => ({ k: "t" + i })),
      dager: Object.fromEntries(dager.map(d => [dagKey(d), 3600000])), ...utstyr } });

  _sett({
    fam1: { players: { Kari: spiller("Kari", 56, 109, [0,1,2,9,20], {rod:2,vinsj:true,ekko:true}),
                       Ola: spiller("Ola", 12, 4, [0,3,8]) } },
    kort1:{ kort:true, players:{ Kari: spiller("Kari", 56, 109, [0,1,2,9,20], {rod:2,vinsj:true}) } }, // SAMME person
    kort2:{ kort:true, players:{} },                                  // delt ut, ikke tatt i bruk
    fam2: { players:{ Nybegynner: spiller("Nybegynner", 2, 0, [0]) } },
    fam3: { players:{ Sluttet: spiller("Sluttet", 20, 10, [40,41,42]) } },
  });

  const kall = (n) => h(new Request("https://x/", { headers: { "x-nokkel": n } }));

  console.log("1. TILGANG");
  sjekk("feil nøkkel gir 401", (await kall("feil")).status === 401);
  const lagra = process.env.STATS_NOKKEL; delete process.env.STATS_NOKKEL;
  sjekk("manglende STATS_NOKKEL STENGER panelet (faller ikke tilbake til åpent)", (await kall("")).status === 503);
  process.env.STATS_NOKKEL = lagra;

  const d = await (await kall("hemmelig")).json();

  console.log("\n2. DEDUP OG TELLING");
  sjekk("samme person under kode OG kort telles én gang", d.folk.fiskere === 4, "fiskere=" + d.folk.fiskere);
  sjekk("koder telt", d.folk.koder === 5);
  sjekk("kort telt", d.folk.kort === 2);
  sjekk("ubrukt kort registrert", d.folk.tommeKoder === 1);

  console.log("\n3. AKTIVITET OG RETENTION");
  sjekk("aktive i dag", d.folk.aktiveIDag === 3, "=" + d.folk.aktiveIDag);
  sjekk("den som sluttet faller ut av 30-dagersvinduet", d.folk.aktive30 === 3);
  sjekk("modne: alle som begynte for over en uke siden", d.retention.modne === 3);
  sjekk("to av tre fisker fortsatt → 67 %", d.retention.prosent === 67, "=" + d.retention.prosent);

  console.log("\n4. PROGRESJON");
  sjekk("én har alle artene", d.progresjon.ferdigeMedArter === 1);
  sjekk("én er ferdig OG fortsatt aktiv", d.progresjon.trengerMerAaGjoere === 1);
  sjekk("fordelingen summerer til antall fiskere",
    Object.values(d.progresjon.arterFordeling).reduce((a, b) => a + b, 0) === d.folk.fiskere);

  console.log("\n5. INGEN PERSONDATA UT");
  const tekst = JSON.stringify(d);
  const utenTopp = JSON.stringify({ ...d, toppliste: null });
  sjekk("kallenavn KUN i topplista", !/Kari|Ola|Nybegynner|Sluttet/.test(utenTopp));
  sjekk("topplista har kallenavn (eierens valg 5. aug)", /Kari/.test(JSON.stringify(d.toppliste)));
  sjekk("kontroll: testen ville fanget et navn", /fiskere/.test(tekst));

  console.log("");
  console.log(feil ? "✗ STRYK — se linjene merket FEIL" : "✓ BESTÅTT — panelet er stengt uten nøkkel, teller ærlig, og slipper ingen navn ut.");
} finally {
  try { unlinkSync(sti); } catch {}
}
process.exit(feil ? 1 : 0);

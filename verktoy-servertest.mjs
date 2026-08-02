// Regresjonstest for familierekorder.mjs — hastighetsgrense og fiskerkort.
//
// Netlify Blobs kan ikke kjøres lokalt, så testen bytter ut getStore med et
// falskt lager og kjører den EKTE handleren mot det. Da testes den koden som
// faktisk går i produksjon, ikke en kopi av den.
//
// Kjør:  node verktoy-servertest.mjs
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const KILDE = new URL("./netlify/functions/familierekorder.mjs", import.meta.url);
const FALSKT = `const _lager={};
export function _nullstill(){ for(const k in _lager) delete _lager[k]; }
export function _dump(){ return JSON.stringify(_lager); }
function getStore({name}){ _lager[name]=_lager[name]||{}; const b=_lager[name];
  return { get:async(k)=>b[k]===undefined?null:JSON.parse(b[k]),
           setJSON:async(k,v)=>{ b[k]=JSON.stringify(v); } }; }`;

let src = readFileSync(KILDE, "utf8");
if (!src.includes('import { getStore } from "@netlify/blobs";')) {
  console.error("FEIL: fant ikke getStore-importen. Er serveren skrevet om?");
  process.exit(1);
}
src = src.replace('import { getStore } from "@netlify/blobs";', FALSKT);
const sti = join(tmpdir(), "storkveita-servertest-" + process.pid + ".mjs");
writeFileSync(sti, src);

let feil = 0;
const sjekk = (n, ok, d) => { console.log((ok ? "  OK   " : "  FEIL ") + n + (d ? "   " + d : "")); if (!ok) feil++; };

try {
  const mod = await import("file://" + sti);
  const h = mod.default, { _nullstill, _dump } = mod;
  const kall = (b, ip = "1.1.1.1") => h(new Request("https://x/", { method: "POST",
    headers: { "content-type": "application/json", "x-nf-client-connection-ip": ip },
    body: JSON.stringify(b) }));

  console.log("1. FISKERKORT — unikt, og aldri i klartekst");
  _nullstill();
  const kort = [];
  for (let i = 0; i < 40; i++) kort.push((await (await kall({ nyttKort: true }, "10.0." + i + ".1")).json()).kort);
  sjekk("40 kort delt ut", kort.every(k => typeof k === "string"), kort[0]);
  sjekk("alle unike", new Set(kort).size === 40);
  sjekk("fire forskjellige ord + fire siffer",
    kort.every(k => /^[a-zæøå]+(-[a-zæøå]+){3}-\d{4}$/.test(k) && new Set(k.split("-").slice(0, 4)).size === 4));
  const dump = _dump();
  sjekk("INGEN kort i klartekst i lageret", kort.filter(k => dump.includes(k)).length === 0);
  sjekk("kontroll: testen ville fanget en lekkasje", dump.includes("players"));

  console.log("\n2. KORTET VIRKER SOM NØKKEL");
  await kall({ code: kort[0], player: { name: "Kari", kr: 5000, caught: { torsk: { count: 3, bestLen: 70, bestWt: 3 } }, ts: Date.now() } }, "10.1.1.1");
  const hent = await (await kall({ code: kort[0] }, "10.1.1.2")).json();
  sjekk("profilen kom tilbake", !!(hent.players && hent.players.Kari));
  sjekk("kroner fulgte med", hent.players.Kari.kr === 5000);
  const ukjent = await (await kall({ code: "kveite-storm-anker-naust-1111" }, "10.1.1.3")).json();
  sjekk("ukjent kort gir tomt svar", Object.keys(ukjent.players || {}).length === 0);

  console.log("\n3. HASTIGHETSGRENSE");
  _nullstill();
  let ok = 0, sperra = 0;
  for (let i = 0; i < 75; i++) { const r = await kall({ code: "familie1" }, "9.9.9.9"); r.status === 429 ? sperra++ : ok++; }
  sjekk("de 60 første slapp gjennom", ok === 60, "ok=" + ok);
  sjekk("resten fikk 429", sperra === 15, "sperret=" + sperra);
  sjekk("429 har Retry-After", (await kall({ code: "familie1" }, "9.9.9.9")).headers.get("Retry-After") === "60");
  sjekk("en ANNEN IP er upåvirket", (await kall({ code: "familie1" }, "8.8.8.8")).status === 200);
  let sp2 = 0;
  for (let i = 0; i < 70; i++) if ((await kall({ nyttKort: true }, "7.7.7.7")).status === 429) sp2++;
  sjekk("kortdøra ligger bak samme grense", sp2 > 0, "sperret=" + sp2);

  console.log("");
  console.log(feil ? "✗ STRYK — se linjene merket FEIL" : "✓ BESTÅTT — kortene er unike, usynlige i lageret, og gjetting er stengt.");
} finally {
  try { unlinkSync(sti); } catch {}
}
process.exit(feil ? 1 : 0);

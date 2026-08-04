// Overlever bestillinger og tips en familie med flere enheter — og en gammel klient?
//
// Henter den EKTE serverkoden (vaskTips, vaskBestilling, vaskGear, flettSpiller) ut av
// familierekorder.mjs og kjører den mot fiendtlige og hverdagslige tilstander:
// to enheter samme dag, gammel klient uten feltene, feilstilt klokke, oppblåste data.
// Motprøvene fjerner vernet og krever at testen da SLÅR UT — ellers beviser den ingenting.
//
//   node verktoy-bestillingtest.mjs
//
// Regler som testes (PLAN-BESTILLINGER.md §7):
//   1. Tips er union — kan aldri mistes, uansett hvem som synker sist.
//   2. Bestilling: nyere dag vinner; samme dag flettes monotont (lev max, ferdig/hentet OR).
//   3. En gammel klient UTEN feltene kan aldri viske ut tips/fremdrift (carry-forward).
//   4. Klokkevern: dag clampes til serverens kalender + 1.
//   5. Vaskerne: pene nøkler, cap 120, ts aldri i fremtiden, maks 6 krav-arter.

import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let K = readFileSync("netlify/functions/familierekorder.mjs", "utf8");
K = K.replace(/^import .*$/gm, "");                       // getStore/createHash brukes ikke av det vi tester
K = K.replace("export default async (req)", "const _handler = async (req)");
K += "\nexport { vaskTips, vaskBestilling, vaskGear, flettSpiller, GEAR_TALL, GEAR_JANEI, serverBestillingsDag };\n";

const motprove = process.argv.includes("--uten-vern");
if (motprove) {
  // Fjern tips-unionen i flettSpiller — testen MÅ falle da, ellers er den blind.
  const i = K.indexOf("{ // tips: union");
  const j = K.indexOf("}", K.indexOf("if (tk.size)", i)) + 1;
  if (i < 0) { console.log("fant ikke tips-unionen — er den fjernet?"); process.exit(1); }
  K = K.slice(0, i) + K.slice(j);
}

const dir = mkdtempSync(join(tmpdir(), "bestilling-"));
const fil = join(dir, "server.mjs");
writeFileSync(fil, K);
const S = await import("file://" + fil);

let gronn = 0, rod = 0;
function sjekk(navn, ok) { if (ok) { gronn++; } else { rod++; console.log("  FEIL  " + navn); } }

const DAG = S.serverBestillingsDag();

/* 1. Vaskerne */
const vt = S.vaskTips([{ k: "makrell-blink", ts: 123 }, { k: "makrell-blink", ts: 99 }, { k: "ULOVLIG NØKKEL!", ts: 1 }, { k: "hyse-juksa", ts: Date.now() + 9e9 }]);
sjekk("vaskTips: dedup + pen nøkkel", vt.length === 2 && vt[0].k === "makrell-blink");
sjekk("vaskTips: fremtids-ts clampes", vt[1].ts <= Date.now() + 60_000);
sjekk("vaskTips: cap 120", (S.vaskTips(Array.from({ length: 300 }, (_, i) => ({ k: "t" + i, ts: 1 }))) || []).length === 120);

const vb = S.vaskBestilling({ dag: 99999999, id: "berit70", krav: { torsk: 3, krabbe: 4, a: 1, b: 1, c: 1, d: 1, e: 1, f: 1 }, lev: { torsk: 1 }, ferdig: 0, hentet: "ja" });
sjekk("vaskBestilling: klokkevern (dag clampes)", vb.dag === DAG + 1);
sjekk("vaskBestilling: maks 6 krav-arter", Object.keys(vb.krav).length <= 6);
sjekk("vaskBestilling: flagg blir boolske", vb.ferdig === false && vb.hentet === true);

/* 2. To enheter — tips kan aldri mistes */
const fam = { players: {} };
const gearA = { rod: 1, tips: [{ k: "makrell-blink", ts: 1000 }], bestilling: { dag: DAG, id: "seibiff", krav: { sei: 4 }, lev: { sei: 2 }, ferdig: false, hentet: false }, solgt: 10, bestFerdige: 3 };
S.flettSpiller(fam, { name: "Testfisker", kr: 100, ts: 1, caught: {}, gear: gearA });
const gearB = { rod: 1, bestilling: { dag: DAG, id: "seibiff", krav: { sei: 4 }, lev: { sei: 4 }, ferdig: true, hentet: false }, solgt: 4, bestFerdige: 2 }; // enhet B: INGEN tips-felt (gammel klient)
S.flettSpiller(fam, { name: "Testfisker", kr: 120, ts: 2, caught: {}, gear: gearB });
const p = fam.players["Testfisker"].gear;
sjekk("tips overlever gammel klient uten feltet (carry-forward)", Array.isArray(p.tips) && p.tips.length === 1 && p.tips[0].k === "makrell-blink");
sjekk("bestilling samme dag: lev flettes med max", p.bestilling.lev.sei === 4);
sjekk("bestilling samme dag: ferdig er OR", p.bestilling.ferdig === true);
sjekk("solgt er monoton (10 slår 4)", p.solgt === 10);
sjekk("bestFerdige er monoton (3 slår 2)", p.bestFerdige === 3);

/* 3. hentet-flagget: pose hentet på enhet A kan ikke av-hentes av B */
S.flettSpiller(fam, { name: "Testfisker", kr: 120, ts: 3, caught: {}, gear: { rod: 1, bestilling: { dag: DAG, id: "seibiff", krav: { sei: 4 }, lev: { sei: 4 }, ferdig: true, hentet: true } } });
S.flettSpiller(fam, { name: "Testfisker", kr: 120, ts: 4, caught: {}, gear: { rod: 1, bestilling: { dag: DAG, id: "seibiff", krav: { sei: 4 }, lev: { sei: 4 }, ferdig: true, hentet: false } } });
sjekk("hentet er OR — dobbelthenting umulig", fam.players["Testfisker"].gear.bestilling.hentet === true);

/* 4. Nyere dag vinner helt */
S.flettSpiller(fam, { name: "Testfisker", kr: 120, ts: 5, caught: {}, gear: { rod: 1, bestilling: { dag: DAG + 1, id: "molje", krav: { torsk: 4 }, lev: {}, ferdig: false, hentet: false } } });
sjekk("nyere dag erstatter gårsdagens", fam.players["Testfisker"].gear.bestilling.id === "molje");

/* 5. Tips-union over flere synkinger vokser og dedupliserer */
S.flettSpiller(fam, { name: "Testfisker", kr: 120, ts: 6, caught: {}, gear: { rod: 1, tips: [{ k: "makrell-blink", ts: 500 }, { k: "hyse-juksa", ts: 2000 }] } });
const t2 = fam.players["Testfisker"].gear.tips;
sjekk("tips-union vokser (2 unike)", t2.length === 2);
sjekk("først opptjent bevares (lavest ts vinner)", t2.find(x => x.k === "makrell-blink").ts === 500);

console.log(motprove
  ? (rod > 0 ? "MOTPRØVEN SLÅR UT — vakta virker (feilene over er meningen)" : "MOTPRØVEN FEILET — vernet er fjernet og ingenting merket det!")
  : (rod === 0 ? "✓ BESTÅTT — " + gronn + " sjekker: tips og bestillinger overlever enheter, gamle klienter og gale klokker." : "✗ " + rod + " RØDE av " + (gronn + rod)));
process.exit(motprove ? (rod > 0 ? 0 : 1) : (rod === 0 ? 0 : 1));

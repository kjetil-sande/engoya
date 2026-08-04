// Fjerner den tomme tvillingen «Synne :)» (med mellomrom) fra familien ramsløkene.
// Engangskirurgi 4. aug 2026 — se samtalen: «Synne:)» (uten mellomrom) er den ekte
// profilen med 21 arter og 23 463 kr og RØRES IKKE.
//
// Kjøres LOKALT med et ferskt Netlify-token:
//   NETLIFY_AUTH_TOKEN=<token> node verktoy-slettdublett.mjs           ← tørrkjøring (viser hva som ville skjedd)
//   NETLIFY_AUTH_TOKEN=<token> node verktoy-slettdublett.mjs --skarpt  ← utfører
//
// Rekkefølgen er husets lov: full sikkerhetskopi av bloben FØRST, så kirurgi, så verifisering.

import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";

const SITE = "762c8684-91ff-4f96-b766-622f641343e0"; // fiskespillet — samme site-ID som alltid
const TOKEN = process.env.NETLIFY_AUTH_TOKEN;
if (!TOKEN) { console.log("Sett NETLIFY_AUTH_TOKEN — lag et ferskt på app.netlify.com → User settings → Applications."); process.exit(1); }

const skarpt = process.argv.includes("--skarpt");
const DOBBEL = "Synne :)";   // tvillingen som fjernes (med mellomrom)
const EKTE = "Synne:)";      // den ekte — røres ikke, verifiseres uendret

const nokkel = createHash("sha256").update("storkveita:ramsløkene").digest("hex");
const lager = getStore({ name: "familierekorder", consistency: "strong", siteID: SITE, token: TOKEN });

const fam = await lager.get(nokkel, { type: "json" });
if (!fam || !fam.players) { console.log("Fant ikke familien på nøkkel " + nokkel.slice(0, 12) + "… — avbryter."); process.exit(1); }

const kopiFil = "/Users/kjetilsande/Documents/Claude/Engøya-sikkerhetskopier/ramslokene-foer-dublettfjerning-" +
  new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19) + ".json";
writeFileSync(kopiFil, JSON.stringify(fam, null, 1));
console.log("Sikkerhetskopi skrevet: " + kopiFil);

const d = fam.players[DOBBEL], e = fam.players[EKTE];
if (!e) { console.log("FANT IKKE den ekte «" + EKTE + "» — avbryter, ingenting rørt."); process.exit(1); }
if (!d) { console.log("Tvillingen «" + DOBBEL + "» finnes ikke (allerede fjernet?). Ingenting å gjøre."); process.exit(0); }

const dArter = Object.keys(d.caught || {}).length;
console.log("Tvillingen  «" + DOBBEL + "»: " + dArter + " arter, " + (d.kr || 0) + " kr");
console.log("Den ekte    «" + EKTE + "»: " + Object.keys(e.caught || {}).length + " arter, " + (e.kr || 0) + " kr");
if (dArter > 0 || (d.kr || 0) > 100) { console.log("STOPP: tvillingen er ikke tom lenger — dette må vurderes på nytt for hånd."); process.exit(1); }

if (!skarpt) { console.log("Tørrkjøring: ville fjernet «" + DOBBEL + "». Kjør med --skarpt for å utføre."); process.exit(0); }

delete fam.players[DOBBEL];
await lager.setJSON(nokkel, fam);
const etter = await lager.get(nokkel, { type: "json" });
const ok = etter && !etter.players[DOBBEL] && etter.players[EKTE] &&
  Object.keys(etter.players[EKTE].caught || {}).length === Object.keys(e.caught || {}).length;
console.log(ok
  ? "✓ FERDIG — «" + DOBBEL + "» er fjernet, «" + EKTE + "» står urørt med alle arter. Familien har nå " + Object.keys(etter.players).length + " spillere."
  : "✗ VERIFISERINGEN FEILET — se sikkerhetskopien " + kopiFil);
process.exit(ok ? 0 : 1);

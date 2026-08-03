// Sikkerhetskopi av ALT som ligger på serveren.
//
// Familierekorder, fiskerkort og anmeldelser ligger i Netlify Blobs. De hører til
// Netlify-NETTSTEDET, ikke til domenet — så lenge spillet blir stående på samme
// nettsted, følger de med av seg selv. Denne kopien er nettet under: tas den før
// du rører noe, kan ingenting gå tapt uansett hva som skjer videre.
//
// Kjør den slik at tokenet aldri havner i historikken:
//
//   NETLIFY_TOKEN=… node verktoy-blobkopi.mjs
//
// Tokenet lages på app.netlify.com → User settings → Applications →
// Personal access tokens → New access token.
//
// Kopien legges UTENFOR repoet, i ../Engøya-sikkerhetskopier/. Den inneholder
// hele familiens data og skal aldri sjekkes inn noe sted.

import { getStore } from "@netlify/blobs";
import { writeFileSync, readFileSync, mkdirSync, existsSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LAGER = ["familierekorder", "storkveita-anmeldelser"];
// storkveita-takst er en teller mot gjetting av koder. Den nullstilles av seg
// selv og er verdiløs å ta vare på — vi lar den ligge.

async function main() {
  const token = (process.env.NETLIFY_TOKEN || "").trim();
  if (!token) {
    console.log(`
  Mangler token.

  Lag et på app.netlify.com → User settings → Applications →
  Personal access tokens → New access token. Kjør så:

      NETLIFY_TOKEN=ditt-token node verktoy-blobkopi.mjs

  Skriv det slik, med tokenet foran kommandoen — da havner det ikke i
  skallets historikk.
`);
    return 1;
  }

  const api = async (sti) => {
    const r = await fetch("https://api.netlify.com/api/v1" + sti,
      { headers: { Authorization: "Bearer " + token } });
    if (!r.ok) throw new Error("Netlify svarte " + r.status + " på " + sti +
      (r.status === 401 ? " — tokenet ble ikke godtatt. Sjekk at du kopierte hele." : ""));
    return r.json();
  };

  // ── Finn nettstedet ────────────────────────────────────────────────────────
  // Du skal bare trenge ÉN hemmelighet. Nettsted-ID-en finner vi selv, ved å lete
  // etter det som svarer på engoya.no.
  let siteID = (process.env.NETLIFY_SITE_ID || "").trim();
  let siteNavn = siteID;
  if (!siteID) {
    console.log("Leter etter nettstedet …");
    const sider = await api("/sites?per_page=100");
    const treff = sider.filter((s) =>
      s.custom_domain === "engoya.no" ||
      (s.domain_aliases || []).includes("engoya.no") ||
      s.name === "engoya");
    if (treff.length !== 1) {
      console.log(treff.length ? "\nFant flere. Velg én og kjør på nytt med:\n"
                               : "\nFant ingen med engoya.no. Dine nettsteder:\n");
      for (const s of (treff.length ? treff : sider))
        console.log("   NETLIFY_SITE_ID=" + s.id + "   # " + s.name +
          (s.custom_domain ? "  (" + s.custom_domain + ")" : ""));
      return 1;
    }
    siteID = treff[0].id; siteNavn = treff[0].name;
  }
  console.log("Nettsted: " + siteNavn + "  (" + siteID + ")\n");

  // ── Les alt ────────────────────────────────────────────────────────────────
  const alt = { tatt: new Date().toISOString(), siteID, siteNavn, lager: {} };
  let n = 0;
  for (const navn of LAGER) {
    const lager = getStore({ name: navn, siteID, token, consistency: "strong" });
    const { blobs } = await lager.list();
    const ut = {};
    for (const b of blobs) {
      // Hver nøkkel leses for seg. Ryker én, skal vi vite HVILKEN — ikke stå
      // igjen med en kopi som er stille ufullstendig.
      try {
        ut[b.key] = await lager.get(b.key, { type: "json" });
      } catch (e) {
        throw new Error("klarte ikke lese " + navn + "/" + b.key + ": " + e.message);
      }
      n++;
    }
    alt.lager[navn] = ut;
    console.log("  " + navn + ": " + blobs.length + " nøkler");
  }

  // ── Hva er det egentlig vi har reddet? ─────────────────────────────────────
  // Et tall du kan kjenne igjen er mer verdt enn «ferdig». Ser antallet feil ut,
  // skal du oppdage det NÅ, ikke den dagen du trenger kopien.
  const fam = alt.lager["familierekorder"] || {};
  let spelarar = 0, trofe = 0, arter = 0;
  for (const rad of Object.values(fam)) {
    for (const p of Object.values((rad && rad.players) || {})) {
      spelarar++;
      trofe += ((p.gear && p.gear.trofe) || p.trofe || []).length;
      arter += Object.keys(p.caught || {}).length;
    }
  }
  console.log("\n  " + Object.keys(fam).length + " koder/kort · " + spelarar +
    " spillerprofiler · " + trofe + " troféer · " + arter + " artsrekorder");

  if (!n) {
    console.log("\n✗ Lagrene er TOMME. Det er nesten sikkert feil nettsted —" +
      "\n  ikke gå videre på denne kopien.");
    return 1;
  }

  // ── Skriv, og les tilbake ──────────────────────────────────────────────────
  const rot = dirname(fileURLToPath(import.meta.url));
  const mappe = join(rot, "..", "Engøya-sikkerhetskopier");
  if (!existsSync(mappe)) mkdirSync(mappe, { recursive: true });
  const stempel = alt.tatt.slice(0, 19).replace(/[:T]/g, "-");
  const fil = join(mappe, "serverkopi-" + stempel + ".json");
  if (existsSync(fil)) { console.log("\n✗ " + fil + " finnes fra før."); return 1; }

  const tekst = JSON.stringify(alt, null, 1);
  writeFileSync(fil + ".tmp", tekst);
  renameSync(fil + ".tmp", fil);   // først hel fil, så riktig navn

  // En kopi du ikke har lest tilbake, er ikke en sikkerhetskopi. Vi leser fila fra
  // disk igjen og sammenligner den mot det vi nettopp hentet — nøkkel for nøkkel.
  const attende = JSON.parse(readFileSync(fil, "utf8"));
  let feil = 0;
  for (const navn of LAGER) {
    const a = alt.lager[navn], b = attende.lager[navn] || {};
    for (const k of Object.keys(a))
      if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) { feil++; console.log("  ✗ avvik: " + navn + "/" + k); }
    if (Object.keys(b).length !== Object.keys(a).length) { feil++; console.log("  ✗ ulikt antall i " + navn); }
  }
  if (feil) { console.log("\n✗ KOPIEN STEMMER IKKE. Ikke rør Netlify."); return 1; }

  console.log("\n✓ " + n + " nøkler skrevet og lest tilbake — hver eneste én stemmer.");
  console.log("  " + fil);
  console.log("  (" + (tekst.length / 1024).toFixed(0) + " kB. Utenfor repoet. Legg den et sted du finner den igjen.)");
  return 0;
}

// Alt som går galt skal leses som én setning, ikke som en stack trace. Du kjører
// denne én gang, under tidspress, rett før du rører noe viktig.
main().then((k) => process.exit(k)).catch((e) => {
  console.log("\n✗ " + ((e && e.message) || e));
  process.exit(1);
});

// Døra til kontrollpanelet. Tester den EKTE statistikk.mjs med en falsk
// Google-tjener, så alle avvisningsgrunnene kjøres mot koden som faktisk står der.
//
//   node verktoy-innloggingstest.mjs
//
// Den viktigste testen er «gyldig token fra en ANNEN app»: uten aud-sjekken slipper
// hvem som helst med en Google-konto og en egen app rett inn i tallene.

import { readFileSync } from "node:fs";

let feil = 0, ok = 0;
const sjekk = (n, sant, x = "") => {
  if (sant) { ok++; console.log("  OK   " + n + (x ? "   " + x : "")); }
  else { feil++; console.log("  FEIL " + n + (x ? "   " + x : "")); }
};

const lager = new Map();
globalThis.__fakeStore = () => ({
  list: async () => ({ blobs: [...lager.keys()].map((key) => ({ key })) }),
  get: async (k) => lager.get(k) || null,
  setJSON: async (k, v) => { lager.set(k, v); },
});
lager.set("fam1", { players: { a: { name: "Test", caught: {}, gear: { dager: {} } } } });

// Falsk Google: tokenet ER svaret, som JSON. Slik kan vi lage et hvilket som helst
// gyldig-signert token uten å ha en nøkkel.
const EKTE_FETCH = globalThis.fetch;
globalThis.fetch = async (url) => {
  const s = String(url);
  if (!s.startsWith("https://oauth2.googleapis.com/tokeninfo")) return EKTE_FETCH(url);
  const t = decodeURIComponent(s.split("id_token=")[1] || "");
  if (t === "UGYLDIG") return { ok: false, status: 400, json: async () => ({}) };
  if (t === "NEDE") throw new Error("nettverk");
  return { ok: true, status: 200, json: async () => JSON.parse(t) };
};

const kilde = readFileSync("netlify/functions/statistikk.mjs", "utf8")
  .replace(/import \{ getStore \} from "@netlify\/blobs";/, "const getStore = globalThis.__fakeStore;");
const mod = await import("data:text/javascript;base64," + Buffer.from(kilde).toString("base64"));

const VAAR_APP = "1234-vaar.apps.googleusercontent.com";
const token = (o) => JSON.stringify(Object.assign({
  aud: VAAR_APP, iss: "https://accounts.google.com",
  email: "ks@tada.no", email_verified: "true",
}, o));

const kall = async (h = {}) => {
  const r = await mod.default(new Request("https://x/", { headers: h }));
  return { status: r.status, d: await r.json() };
};
const oppsett = (o) => {
  delete process.env.PANEL_EPOST; delete process.env.GOOGLE_CLIENT_ID; delete process.env.STATS_NOKKEL;
  Object.assign(process.env, o);
};

console.log("\n1. INGENTING SATT OPP → STENGT");
oppsett({});
let r = await kall();
sjekk("503, ikke åpent", r.status === 503, r.status + " " + (r.d.feil || "").slice(0, 40));
sjekk("ingen tall lekker ut", !r.d.folk);

console.log("\n2. GOOGLE-MODUS");
oppsett({ PANEL_EPOST: "ks@tada.no", GOOGLE_CLIENT_ID: VAAR_APP });

r = await kall();
sjekk("uten token → be om innlogging", r.status === 401 && r.d.google === true);
sjekk("klient-ID sendes med", r.d.klientId === VAAR_APP);

r = await kall({ "x-nokkel": "hva-som-helst" });
sjekk("den gamle nøkkelen virker IKKE lenger", r.status === 401 && !r.d.folk);

r = await kall({ Authorization: "Bearer UGYLDIG" });
sjekk("token Google avviser", r.status === 401 && !r.d.folk);

// Kjernen: et EKTE, gyldig signert Google-token — men utstedt til noen andres app.
r = await kall({ Authorization: "Bearer " + token({ aud: "9999-annen.apps.googleusercontent.com" }) });
sjekk("gyldig token fra en ANNEN app avvises (aud)", r.status === 401 && !r.d.folk,
  "← uten denne slipper hvem som helst inn");

r = await kall({ Authorization: "Bearer " + token({ iss: "https://ondsinnet.example" }) });
sjekk("feil utsteder avvises (iss)", r.status === 401 && !r.d.folk);

r = await kall({ Authorization: "Bearer " + token({ email: "noen.andre@gmail.com" }) });
sjekk("gyldig token, feil person → 403", r.status === 403 && !r.d.folk);

r = await kall({ Authorization: "Bearer " + token({ email_verified: "false" }) });
sjekk("ubekreftet e-post avvises", r.status === 401 && !r.d.folk);

r = await kall({ Authorization: "Bearer " + token({ email: "KS@Tada.NO" }) });
sjekk("store bokstaver i e-posten slipper inn", r.status === 200 && !!r.d.folk);

r = await kall({ Authorization: "Bearer " + token() });
sjekk("riktig person slipper inn", r.status === 200 && !!r.d.folk, r.d.folk ? r.d.folk.fiskere + " fisker" : "");

r = await kall({ Authorization: "Bearer NEDE" });
sjekk("Google nede → 503, ikke åpen dør", r.status === 503 && !r.d.folk);

console.log("\n3. FLERE TILLATTE ADRESSER");
oppsett({ PANEL_EPOST: " ks@tada.no , annen@example.com ", GOOGLE_CLIENT_ID: VAAR_APP });
r = await kall({ Authorization: "Bearer " + token({ email: "annen@example.com" }) });
sjekk("andre adresse i lista slipper inn", r.status === 200 && !!r.d.folk);
r = await kall({ Authorization: "Bearer " + token({ email: "tredje@example.com" }) });
sjekk("en som ikke står der slipper ikke inn", r.status === 403);

console.log("\n4. HALVVEIS SATT OPP");
oppsett({ PANEL_EPOST: "ks@tada.no" });          // klient-ID mangler
r = await kall({ Authorization: "Bearer " + token() });
sjekk("uten GOOGLE_CLIENT_ID → 503, ikke åpent", r.status === 503 && !r.d.folk);

console.log("\n5. NØKKELMODUS STÅR TIL PANEL_EPOST SETTES");
oppsett({ STATS_NOKKEL: "hemmeleg" });
r = await kall({ "x-nokkel": "hemmeleg" });
sjekk("riktig nøkkel virker fortsatt", r.status === 200 && !!r.d.folk);
r = await kall({ "x-nokkel": "feil" });
sjekk("feil nøkkel avvises", r.status === 401);
r = await kall({ Authorization: "Bearer " + token() });
sjekk("Google-token gir IKKE tilgang i nøkkelmodus", r.status === 401 && !r.d.folk);

console.log("\n" + (feil
  ? "✗ " + feil + " FEIL av " + (ok + feil)
  : "✓ BESTÅTT — " + ok + " sjekker: døra er stengt uten oppsett, tar bare tokens utstedt til oss, og bare de rette adressene."));
process.exit(feil ? 1 : 0);

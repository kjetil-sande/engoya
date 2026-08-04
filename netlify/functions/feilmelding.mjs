// Feilmeldinger fra spillerne — «Meld inn»-knappen i spillet.
//
// Samme oppsett som anmeldelser.mjs: alle kan sende inn, bare eieren kan lese
// og slette. Rapporten tar med kallenavnet spilleren alt har valgt, hvor i
// spillet de sto, nettleseren, og siste JS-feil spillet selv har fanget —
// ingenting mer. personvern.html sitt løfte gjelder også her.
//
//   POST  {tekst, kallenavn, hvor, ua, sisteFeil}  → lagrer
//   GET   x-nokkel / Bearer                        → lister alt til kontrollpanelet
//   POST  {slett:<id>} med nøkkel                  → sletter en behandlet rapport
//
// Rate-limiting er MED VILJE utelatt, samme avveining som i anmeldelser.mjs —
// taket MAKS_LISTE stopper en vond dag før den fyller lageret.

import { getStore } from "@netlify/blobs";

// ── Døra til eierens side ─────────────────────────────────────────────────────
// ORDRETT den samme døra som kontrollpanelet bruker (statistikk.mjs). To
// håndskrevne kopier ville drevet fra hverandre, og en dør som halter er verre
// enn ingen dør — derfor holder verktoy-doervakt.py dem byte for byte like.
const GOOGLE_TOKENINFO = "https://oauth2.googleapis.com/tokeninfo?id_token=";

async function googleDoer(req) {
  const lovlege = (process.env.PANEL_EPOST || "").split(",")
    .map((e) => e.trim().toLowerCase()).filter(Boolean);
  const klientId = (process.env.GOOGLE_CLIENT_ID || "").trim();
  if (!klientId) return { feil: "GOOGLE_CLIENT_ID mangler i Netlify.", status: 503 };

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  // Klient-ID-en sendes med tilbake så panelet slipper å ha den hardkodet. Den er
  // offentlig av design — den står i klartekst på hver eneste Google-innloggingsside.
  if (!token) return { feil: "Logg inn med Google.", status: 401, klientId };

  let k;
  try {
    const r = await fetch(GOOGLE_TOKENINFO + encodeURIComponent(token));
    if (!r.ok) return { feil: "Innloggingen ble ikke godtatt.", status: 401 };
    k = await r.json();
  } catch { return { feil: "Fikk ikke kontakt med Google.", status: 503 }; }

  // Google har alt sjekket signatur og utløp. Vi sjekker at tokenet er utstedt til
  // OSS — uten aud-sjekken ville et gyldig token fra en hvilken som helst annen
  // Google-app sluppet inn — og at det er en av de tillatte adressene.
  if (k.aud !== klientId) return { feil: "Nei.", status: 401 };
  if (k.iss !== "accounts.google.com" && k.iss !== "https://accounts.google.com")
    return { feil: "Nei.", status: 401 };
  if (String(k.email_verified) !== "true") return { feil: "Nei.", status: 401 };
  if (!lovlege.includes(String(k.email || "").toLowerCase()))
    return { feil: "Denne kontoen har ikke tilgang.", status: 403 };
  return null;    // slipp inn
}

// Samme gate som statistikk.mjs: Google når PANEL_EPOST er satt, ellers den delte
// nøkkelen. Faller aldri åpent — er ingen av delene satt, kommer ingen inn.
async function panelDor(req) {
  if ((process.env.PANEL_EPOST || "").trim()) return await googleDoer(req);
  // .trim() av samme grunn som i statistikk.mjs: limt-inn linjeskift i Netlify
  // skal ikke stenge eieren ute.
  const fasit = (process.env.STATS_NOKKEL || "").trim();
  if (!fasit) return { feil: "Ikke satt opp.", status: 503 };
  const gitt = req.headers.get("x-nokkel") || "";
  let lik = gitt.length === fasit.length;
  for (let i = 0; i < Math.max(gitt.length, fasit.length); i++)
    if (gitt.charCodeAt(i) !== fasit.charCodeAt(i)) lik = false;
  return lik ? null : { feil: "Nei.", status: 401 };
}

const MAKS_TEKST = 1000;
const MAKS_KALLENAVN = 14;     // samme som spillet tillater
const MAKS_LISTE = 400;        // et tak, så en vond dag ikke fyller lageret

const reint = (v, maks) => String(v == null ? "" : v)
  .replace(/[\u0000-\u001f\u007f]/g, " ")   // kontrolltegn ut
  .trim()
  .slice(0, maks);

export default async (req) => {
  const lager = getStore({ name: "storkveita-feilmeldinger", consistency: "strong" });

  const nei = await panelDor(req);
  const eier = !nei;

  if (req.method === "GET") {
    if (!eier) return Response.json({ feil: nei.feil, google: !!(process.env.PANEL_EPOST || "").trim(), klientId: nei.klientId }, { status: nei.status });
    const { blobs } = await lager.list();
    const alle = [];
    for (const b of blobs) {
      const r = await lager.get(b.key, { type: "json" });
      if (r) alle.push({ ...r, id: b.key });
    }
    alle.sort((x, y) => (y.naar || 0) - (x.naar || 0));
    return Response.json({ rapporter: alle }, { headers: { "Cache-Control": "no-store" } });
  }

  if (req.method !== "POST")
    return Response.json({ feil: "Bare GET og POST." }, { status: 405 });

  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ feil: "Ugyldig innhold." }, { status: 400 });

  // Sletting — eieren rydder unna behandlede rapporter.
  if (body.slett) {
    if (!eier) return Response.json({ feil: nei.feil, google: !!(process.env.PANEL_EPOST || "").trim(), klientId: nei.klientId }, { status: nei.status });
    await lager.delete(String(body.slett));
    return Response.json({ ok: true });
  }

  // ── Innsending ─────────────────────────────────────────────────────────────
  const tekst = reint(body.tekst, MAKS_TEKST);
  if (!tekst) return Response.json({ feil: "Skriv noen ord om hva som skjedde." }, { status: 400 });

  const { blobs } = await lager.list();
  if (blobs.length >= MAKS_LISTE)
    return Response.json({ feil: "Takk — vi har nok for nå." }, { status: 429 });

  const id = "f-" + Date.now().toString(36) + "-"
    + [...crypto.getRandomValues(new Uint8Array(6))]
        .map((n) => n.toString(36)).join("").slice(0, 8);

  await lager.setJSON(id, {
    tekst,
    kallenavn: reint(body.kallenavn, MAKS_KALLENAVN) || null,
    hvor: reint(body.hvor, 120) || null,           // skjerm/fase spilleren sto i
    ua: reint(body.ua, 200) || null,               // nettleser og enhet
    sisteFeil: reint(body.sisteFeil, 300) || null, // det window.onerror sist fanget
    naar: Date.now(),
  });

  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
};

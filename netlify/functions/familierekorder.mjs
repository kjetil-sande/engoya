// Familierekorder for «Jakten på storkveita» — deling på tvers av enheter.
// Familien velger en felles FAMILIEKODE i spillet; alle enheter med samme kode
// deler rekordene (fangstbok-bestenoteringer per spiller). Lagres i Netlify Blobs.
//
// Fletteregelen er bevisst enkel og konfliktfri: artsrekorder er MONOTONE
// (count/bestLen/bestWt/gold: største verdi vinner), så samtidig spilling på
// flere enheter kan aldri ødelegge hverandres fremgang. Kroner er ikke monotone
// og følger siste innsending (per spiller).
//
// POST { code, player?: { name, kr, caught, ts } } → { players: {...} }
// (player utelates for ren henting.)

import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

const MAKS_SPILLERE = 30;      // en familie, ikke en liga
const MAKS_ARTER = 40;         // 16 arter i dag — god margin
const MAKS_KROPP = 60_000;     // byte; mot tilfeldig søppel
const FARLIGE = new Set(["__proto__", "constructor", "prototype"]);

const tall = (v, maks) => Math.max(0, Math.min(maks, Number(v) || 0));

const egen = (o, k) => Object.prototype.hasOwnProperty.call(o, k); // aldri arvede egenskaper (toString & co.)

function flettSpiller(fam, p) {
  const navn = String(p.name || "").trim().slice(0, 14);
  // Klienten tillater alt (også emoji) — blokker kun kontrolltegn, ellers stopper synk for eksisterende navn
  if (!navn || FARLIGE.has(navn) || /\p{Cc}/u.test(navn)) return;
  const har = egen(fam.players, navn);
  if (!har && Object.keys(fam.players).length >= MAKS_SPILLERE) return;

  const cur = har ? fam.players[navn] : { name: navn, kr: 0, caught: {}, ts: 0 };
  if (!cur.caught || typeof cur.caught !== "object") cur.caught = {};
  const inn = p.caught && typeof p.caught === "object" ? p.caught : {};

  for (const art of Object.keys(inn).slice(0, MAKS_ARTER)) {
    if (FARLIGE.has(art) || !/^[a-z0-9_-]{1,24}$/.test(art)) continue;
    if (typeof inn[art] !== "object" || !inn[art]) continue;
    const harArt = egen(cur.caught, art);
    if (!harArt && Object.keys(cur.caught).length >= MAKS_ARTER) continue; // tak på TOTALT antall arter over tid
    const a = harArt ? cur.caught[art] : { count: 0, bestLen: 0, bestWt: 0 };
    const b = inn[art];
    const flettet = {
      count: Math.max(a.count || 0, tall(b.count, 1e6)),
      bestLen: Math.max(a.bestLen || 0, tall(b.bestLen, 500)),
      bestWt: Math.max(a.bestWt || 0, tall(b.bestWt, 700)),
    };
    const gold = Math.max(a.gold || 0, tall(b.gold, 1e6));
    if (gold) flettet.gold = gold;
    cur.caught[art] = flettet;
  }

  const ts = Math.min(tall(p.ts, 4102444800000), Date.now() + 60_000); // gal klientklokke kan aldri fryse fremtidige oppdateringer
  if (ts >= (cur.ts || 0)) { cur.kr = tall(p.kr, 1e9); cur.ts = ts; }
  fam.players[navn] = cur;
}

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ feil: "Bruk POST" }, { status: 405 });
  }

  let body;
  try {
    const tekst = await req.text();
    if (tekst.length > MAKS_KROPP) return Response.json({ feil: "For stor forespørsel" }, { status: 413 });
    body = JSON.parse(tekst);
  } catch {
    return Response.json({ feil: "Ugyldig JSON" }, { status: 400 });
  }

  const kode = String(body.code || "").trim().toLowerCase();
  if (kode.length < 4 || kode.length > 40) {
    return Response.json({ feil: "Familiekoden må være 4–40 tegn" }, { status: 400 });
  }

  // Koden hashes → blob-nøkkel. Selve koden lagres aldri.
  const nokkel = createHash("sha256").update("storkveita:" + kode).digest("hex");
  // strong: les-etter-skriv MÅ se siste versjon (ellers «glemmer» familien seg selv mellom instanser)
  const lager = getStore({ name: "familierekorder", consistency: "strong" });

  const fam = (await lager.get(nokkel, { type: "json" })) || { players: {} };
  if (!fam.players || typeof fam.players !== "object") fam.players = {};

  if (body.player) {
    flettSpiller(fam, body.player);
    fam.updatedAt = Date.now();
    await lager.setJSON(nokkel, fam); // kun innsendinger skriver — rene hentinger lar bloben ligge
  }

  return Response.json(
    { players: fam.players },
    { headers: { "Cache-Control": "no-store" } }
  );
};

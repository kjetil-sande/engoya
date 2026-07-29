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

// Utstyr følger spilleren over nett (samme «siste innsending vinner»-regel som kroner),
// slik at familien kan logge inn på en ny enhet og få igjen stang, vinsj, turbosnelle osv.
const GEAR_TALL = ["rod", "fuel", "fuelMax", "svc", "forsTil", "havnNeste", "tidMs", "smorTs"];
const GEAR_JANEI = ["propOk", "vinsj", "ekko", "turbo", "motorOk"];
const GEAR_TEKST = { motor: 10, rig: 24 };
// Objektfeltene vaskes TYPET (aldri rå gjennomstrømming): nøkler må være pene id-er og
// verdier tall/boolske — da finnes det ingen vei for skript eller rare typer inn i andres lagring.
const PEN_NOKKEL = /^[a-z0-9_-]{1,24}$/;
function vaskTelleObjekt(o, maksN) { // {slukId: antall} — lures/agn
  if (!o || typeof o !== "object" || Array.isArray(o)) return undefined;
  const ut = {};
  for (const k of Object.keys(o).slice(0, maksN)) {
    if (!PEN_NOKKEL.test(k) || FARLIGE.has(k)) continue;
    const v = tall(o[k], 1e6); if (v) ut[k] = v;
  }
  return Object.keys(ut).length ? ut : undefined;
}
function vaskPots(p) {
  if (!p || typeof p !== "object" || Array.isArray(p)) return undefined;
  const ut = { owned: tall(p.owned, 99), ownedH: tall(p.ownedH, 99), bait: tall(p.bait, 999),
    cap: tall(p.cap, 99), rescue: !!p.rescue, out: [] };
  if (Array.isArray(p.out)) for (const o of p.out.slice(0, 12)) {
    if (!o || typeof o !== "object") continue;
    const t = typeof o.t === "string" && PEN_NOKKEL.test(o.t) ? o.t : "k";
    ut.out.push({ zone: tall(o.zone, 3), setAt: tall(o.setAt, 9e15), seed: tall(o.seed, 1e9), t });
  }
  return ut;
}
function vaskRolex(r) {
  if (!r || typeof r !== "object") return undefined;
  if (r.ferdig != null) return { ferdig: tall(r.ferdig, 9e15) };
  if (r.bud != null) return { bud: tall(r.bud, 1e6) };
  return undefined;
}
function vaskGear(g) {
  if (!g || typeof g !== "object") return undefined;
  const ut = {};
  for (const k of GEAR_TALL) if (g[k] != null) ut[k] = tall(g[k], 9e15);
  if (ut.smorTs != null) ut.smorTs = Math.min(ut.smorTs, Date.now() + 60_000); // smøring skjer alltid «nå» — gal klokke smitter ikke
  for (const k of GEAR_JANEI) if (g[k] != null) ut[k] = !!g[k];
  for (const k of Object.keys(GEAR_TEKST))
    if (typeof g[k] === "string" && PEN_NOKKEL.test(g[k])) ut[k] = g[k].slice(0, GEAR_TEKST[k]);
  const lures = vaskTelleObjekt(g.lures, 40); if (lures) ut.lures = lures;
  const agn = vaskTelleObjekt(g.agn, 40); if (agn) ut.agn = agn;
  const pots = vaskPots(g.pots); if (pots) ut.pots = pots;
  const rolex = vaskRolex(g.rolex); if (rolex) ut.rolex = rolex;
  return Object.keys(ut).length ? ut : undefined;
}

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
      bestWt: Math.max(a.bestWt || 0, tall(b.bestWt, 1500)), // håkjerringa kan veie over tonnet
    };
    if (tall(b.bestLen, 500) > (a.bestLen || 0)) { // rekorden bringer med seg redskapet og tidspunktet
      const rk = String(b.redskap || "").replace(/\p{Cc}/gu, "").slice(0, 30);
      if (rk) flettet.redskap = rk;
      const rts = tall(b.rts, 4102444800000);
      if (rts) flettet.rts = Math.min(rts, Date.now() + 60_000);
    } else { if (a.redskap) flettet.redskap = a.redskap; if (a.rts) flettet.rts = a.rts; }
    const gold = Math.max(a.gold || 0, tall(b.gold, 1e6));
    if (gold) flettet.gold = gold;
    cur.caught[art] = flettet;
  }

  const ts = Math.min(tall(p.ts, 4102444800000), Date.now() + 60_000); // gal klientklokke kan aldri fryse fremtidige oppdateringer
  if (ts >= (cur.ts || 0)) {
    cur.kr = tall(p.kr, 1e9); cur.ts = ts;
    const g = vaskGear(p.gear);
    if (g) { // gamle klienter uten gear lar forrige utstyr stå
      const gml = cur.gear && typeof cur.gear === "object" ? cur.gear : {};
      if (g.smorTs == null && gml.smorTs != null) g.smorTs = gml.smorTs; // gamle klienter uten feltet kan ikke viske ut betalt bunnsmørning
      g.rod = Math.max(tall(gml.rod, 99), tall(g.rod, 99));         // kjøpt/opptjent kan aldri
      g.tidMs = Math.max(tall(gml.tidMs, 9e15), tall(g.tidMs, 9e15)); // krympe, uansett klokkerot
      for (const k of ["vinsj", "ekko", "turbo"]) if (gml[k]) g[k] = true;
      cur.gear = g;
    }
  }
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

  let skriv = false;
  if (typeof body.fjern === "string") { // familien rydder: fjern en spiller fra gruppa (koden er familiens nøkkel)
    const navnF = body.fjern.trim().slice(0, 14);
    if (navnF && !FARLIGE.has(navnF) && egen(fam.players, navnF)) { delete fam.players[navnF]; skriv = true; }
  }
  if (body.player) { flettSpiller(fam, body.player); skriv = true; }
  if (skriv) {
    fam.updatedAt = Date.now();
    await lager.setJSON(nokkel, fam); // kun endringer skriver — rene hentinger lar bloben ligge
  }

  return Response.json(
    { players: fam.players },
    { headers: { "Cache-Control": "no-store" } }
  );
};

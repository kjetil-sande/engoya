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
const MAKS_ARTER = 80;         // 37 arter i dag. Taket er en STILLE grense: er den nådd,
                               // slutter nye arter å synkes uten at noen får beskjed. 40 ga bare
                               // tre plassers margin, og en eneste rusk-nøkkel kunne låst en
                               // spiller ute for godt. 80 er dobbelt opp av alt som finnes.
const MAKS_KROPP = 60_000;     // byte; mot tilfeldig søppel
const FARLIGE = new Set(["__proto__", "constructor", "prototype"]);

const tall = (v, maks) => Math.max(0, Math.min(maks, Number(v) || 0));

const egen = (o, k) => Object.prototype.hasOwnProperty.call(o, k); // aldri arvede egenskaper (toString & co.)

// Utstyr følger spilleren over nett (samme «siste innsending vinner»-regel som kroner),
// slik at familien kan logge inn på en ny enhet og få igjen stang, vinsj, turbosnelle osv.
const GEAR_TALL = ["rod", "fuel", "fuelMax", "svc", "forsTil", "havnNeste", "tidMs", "smorTs", "streak", "streakDag", "streakBest"];
const GEAR_JANEI = ["propOk", "vinsj", "ekko", "turbo", "motorOk", "sattDekk"];
const GEAR_TEKST = { motor: 10, rig: 24, naadeMnd: 7 };
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
// Spilletid per døgn: {"20260731": ms}. Monotont per dag, akkurat som artsrekordene,
// så to enheter samtidig kan aldri viske ut hverandres timer.
const DAG_NOKKEL = /^\d{8}$/;
function vaskDager(o, gml) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return gml;
  const ut = gml && typeof gml === "object" ? { ...gml } : {};
  for (const k of Object.keys(o)) {
    if (!DAG_NOKKEL.test(k) || FARLIGE.has(k)) continue;
    const v = tall(o[k], 86_400_000);
    if (v > (ut[k] || 0)) ut[k] = v;
  }
  const n = Object.keys(ut).sort();          // ett år og litt til er nok historikk
  if (n.length > 400) for (const k of n.slice(0, n.length - 400)) delete ut[k];
  return Object.keys(ut).length ? ut : undefined;
}
function vaskPots(p) {
  if (!p || typeof p !== "object" || Array.isArray(p)) return undefined;
  const ut = { owned: tall(p.owned, 99), ownedH: tall(p.ownedH, 99), bait: tall(p.bait, 999),
    cap: tall(p.cap, 99), rescue: !!p.rescue, out: [] };
  // Bunnlina MÅ med: familielageret er einaste backupen, og utan desse tre felta
  // mistar ei fersk eining line, krokar og linagn for godt. Berre når feltet finst,
  // så ein gammal klient utan dei ikkje skriv 0 over eit kjøpt bruk.
  if (p.lineOwned != null) ut.lineOwned = tall(p.lineOwned, 9);
  if (p.lineAgn != null) ut.lineAgn = tall(p.lineAgn, 999);
  if (p.lineKroker != null) ut.lineKroker = Math.min(10, Math.max(3, tall(p.lineKroker, 10)));
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
const MAKS_TROFE = 160;        // dobbelt av de 86 som finnes. Aldri en grense noen når.
function vaskTrofe(t) {
  if (!Array.isArray(t)) return undefined;
  const ut = [];
  for (const x of t.slice(0, MAKS_TROFE)) {
    if (!x || typeof x !== "object") continue;
    if (typeof x.k !== "string" || !PEN_NOKKEL.test(x.k)) continue;
    ut.push({ k: x.k.slice(0, 24), ts: tall(x.ts, 9e15) });
  }
  return ut.length ? ut : undefined;
}
// Union på (nøkkel, tidspunkt). Et skap kan bare vokse.
function flettTrofe(gml, ny) {
  const alle = [...(Array.isArray(gml) ? gml : []), ...(Array.isArray(ny) ? ny : [])];
  const sett = new Map();
  for (const t of alle) if (t && typeof t.k === "string") sett.set(t.k + "@" + t.ts, t);
  return [...sett.values()].sort((a, b) => b.ts - a.ts).slice(0, MAKS_TROFE);
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
  const trofe = vaskTrofe(g.trofe); if (trofe) ut.trofe = trofe;
  const dager = vaskDager(g.dager, undefined); if (dager) ut.dager = dager; // manglet i hvitelista — døgnloggen ble kastet
  if (typeof g.tidligereNavn === "string") {
    const tn = g.tidligereNavn.replace(/\p{Cc}/gu, "").trim().slice(0, 14);
    if (tn && !FARLIGE.has(tn)) ut.tidligereNavn = tn;
  }
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
      for (const k of ["streak", "streakDag", "naadeMnd"]) // samme vern for streaken
        if (g[k] == null && gml[k] != null) g[k] = gml[k];
      g.dager = vaskDager(vaskDager(g.dager, undefined), gml.dager); // døgnene flettes, aldri overskrives
      const tf = flettTrofe(gml.trofe, g.trofe);                     // troféskapet vokser, krymper aldri
      if (tf.length) g.trofe = tf; else delete g.trofe;
      if (g.tidligereNavn == null && gml.tidligereNavn != null) g.tidligereNavn = gml.tidligereNavn;
      g.rod = Math.max(tall(gml.rod, 99), tall(g.rod, 99));         // kjøpt/opptjent kan aldri
      g.tidMs = Math.max(tall(gml.tidMs, 9e15), tall(g.tidMs, 9e15)); // krympe, uansett klokkerot
      g.streakBest = Math.max(tall(gml.streakBest, 9e15), tall(g.streakBest, 9e15)); // beste streak er en rekord — aldri ned
      for (const k of ["vinsj", "ekko", "turbo", "sattDekk"]) if (gml[k]) g[k] = true; // sette flagg kan aldri tas tilbake
      if (g.pots && gml.pots) for (const k of ["lineOwned", "lineKroker"]) // kjøpt line og krokar krymper aldri
        if (gml.pots[k] != null) g.pots[k] = Math.max(tall(gml.pots[k], 99), tall(g.pots[k], 99));
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

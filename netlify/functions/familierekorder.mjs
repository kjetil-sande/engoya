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

// ── Hastighetsgrense ──────────────────────────────────────────────────────────
// Koden er hashet før den blir blob-nøkkel, så lagret røper ingen koder. Men uten
// en grense kan hvem som helst prøve tusenvis av koder i sekundet, og da hjelper
// ingen kodelengde. Grensen er sjenerøs: en familie på fem enheter som synker
// hvert 45. sekund bruker ~7 kall i minuttet. 60 er nesten ti ganger det.
const TAK_MIN = 60;            // kall per minutt per IP
const TAK_TIME = 900;          // og per time — mot den tålmodige
// IP-en HASHES før den lagres. En IP-adresse er personopplysning, og vi trenger
// bare å vite at det er samme avsender — ikke hvem.
const ipNokkel = (req) => {
  const rå = req.headers.get("x-nf-client-connection-ip")
    || (req.headers.get("x-forwarded-for") || "").split(",")[0].trim()
    || "ukjent";
  return createHash("sha256").update("storkveita-ip:" + rå).digest("hex").slice(0, 32);
};

// ── Fiskerkort ────────────────────────────────────────────────────────────────
// Kortet deles ut av SERVEREN, ikke av enheten. Bare da kan vi love at ingen får
// samme kort: enheten kan umulig vite hva andre har fått. Kortet lagres aldri —
// det er hashen som blir nøkkel, akkurat som for familiekoden. Serveren ser det
// én gang, i svaret, og glemmer det.
const KORTORD = ["kveite","torsk","brosme","uer","sei","lyr","hyse","lange","makrell","steinbit",
 "breiflabb","akkar","havmus","skrei","sild","krabbe","hummer","reke","blaase","teine",
 "snelle","sluk","pilk","agn","krok","line","garn","ripa","kjol","baug",
 "styrhus","motor","propell","anker","vinsj","ekkolodd","kompass","kart","fyr","molo",
 "naust","brygge","kai","skjaer","grunne","egg","fjord","sund","holme","odde",
 "storm","kuling","bris","stille","taake","regn","sludd","snoe","sol","maane",
 "flo","fjaere","straum","doenning","bakevje","nordlys","midnattsol","morketid",
 "rusten","kjell","odd","ingrid","solveig","harald","jorunn","birger","marit","trygve"];

const tall = (v, maks) => Math.max(0, Math.min(maks, Number(v) || 0));

const egen = (o, k) => Object.prototype.hasOwnProperty.call(o, k); // aldri arvede egenskaper (toString & co.)

// Utstyr følger spilleren over nett (samme «siste innsending vinner»-regel som kroner),
// slik at familien kan logge inn på en ny enhet og få igjen stang, vinsj, turbosnelle osv.
const GEAR_TALL = ["rod", "fuel", "fuelMax", "svc", "forsTil", "havnNeste", "tidMs", "smorTs", "streak", "streakDag", "streakBest", "riggTs"];
const GEAR_JANEI = ["propOk", "vinsj", "ekko", "turbo", "cooler", "belte", "motorOk", "sattDekk"];
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
  // Rolexen ligger hos urmakeren i 30 døgn. Uten taket kunne en gal klokke parkere den
  // for alltid — og klokka er det dyreste enkeltfunnet i spillet.
  if (r.ferdig != null) return { ferdig: Math.min(tall(r.ferdig, 9e15), Date.now() + 31 * 864e5) };
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
    const e = { k: x.k.slice(0, 24), ts: tall(x.ts, 9e15) };
    if (x.borte === "solgt" || x.borte === "restaurert") e.borte = x.borte;
    ut.push(e);
  }
  return ut.length ? ut : undefined;
}
// Union på (nøkkel, tidspunkt). Et skap kan bare vokse.
function flettTrofe(gml, ny) {
  const alle = [...(Array.isArray(gml) ? gml : []), ...(Array.isArray(ny) ? ny : [])];
  const sett = new Map();
  for (const t of alle) {
    if (!t || typeof t.k !== "string") continue;
    const n = t.k + "@" + t.ts, har = sett.get(n);
    if (har) { if (t.borte) har.borte = t.borte; continue; }  // solgt er en ENVEIS dør
    sett.set(n, { ...t });
  }
  return [...sett.values()].sort((a, b) => b.ts - a.ts).slice(0, MAKS_TROFE);
}
function vaskFunnSett(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return undefined;
  const ut = {};
  for (const k of Object.keys(o).slice(0, 200))
    if (PEN_NOKKEL.test(k) && !FARLIGE.has(k) && o[k]) ut[k] = 1;
  return Object.keys(ut).length ? ut : undefined;
}
function vaskTur(t) {
  if (!t || typeof t !== "object" || Array.isArray(t)) return undefined;
  if (typeof t.fk !== "string" || !PEN_NOKKEL.test(t.fk)) return undefined;
  return { fk: t.fk, sum: tall(t.sum, 9e9), del: tall(t.del, 1),
           start: tall(t.start, 9e15),
           // Samme grep som smorTs under: serverens klokke er til å stole på, klientens er
           // ikke. Lengste lovlige tur er 100 timer, så fem døgn kapper aldri en ekte tur —
           // men en telefon med klokka stilt til 2035 låser ikke lenger turen for alltid.
           ferdig: Math.min(tall(t.ferdig, 9e15), Date.now() + 5 * 864e5),
           seed: tall(t.seed, 4e9), niv: tall(t.niv, 9) };
}
function vaskInvest(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const ut = {};
  const tur = vaskTur(v.tur); if (tur) ut.tur = tur;
  const utstyr = vaskTelleObjekt(v.utstyr, 30); if (utstyr) ut.utstyr = utstyr;
  const nei = vaskTelleObjekt(v.nei, 30); if (nei) ut.nei = nei;
  if (v.hist && typeof v.hist === "object" && !Array.isArray(v.hist)) {
    const h = {};
    for (const k of Object.keys(v.hist).slice(0, 30)) {
      if (!PEN_NOKKEL.test(k) || FARLIGE.has(k)) continue;
      const r = v.hist[k]; if (!r || typeof r !== "object") continue;
      h[k] = { turar: tall(r.turar, 9e6), inn: tall(r.inn, 9e12), ut: tall(r.ut, 9e12) };
    }
    if (Object.keys(h).length) ut.hist = h;
  }
  for (const k of ["neste", "nesteTid"]) if (v[k] != null) ut[k] = tall(v[k], 9e15);
  return Object.keys(ut).length ? ut : undefined;
}
function vaskInnboks(a) {
  if (!Array.isArray(a)) return undefined;
  const ut = [];
  for (const m of a.slice(0, 30)) {
    if (!m || typeof m !== "object") continue;
    if (typeof m.fk !== "string" || !PEN_NOKKEL.test(m.fk)) continue;
    if (typeof m.type !== "string" || !PEN_NOKKEL.test(m.type)) continue;
    const e = { id: tall(m.id, 4e9), fk: m.fk, type: m.type,
                tid: tall(m.tid, 9e15), lest: !!m.lest };
    for (const k of ["timar", "mult", "inn", "ut"]) if (m[k] != null) e[k] = tall(m[k], 9e12);
    if (typeof m.utfall === "string" && PEN_NOKKEL.test(m.utfall)) e.utfall = m.utfall;
    if (typeof m.tekst === "string") e.tekst = m.tekst.slice(0, 1200);
    ut.push(e);
  }
  return ut.length ? ut : undefined;
}
// Union på id. En melding som finnes ett sted finnes overalt.
function flettInnboks(gml, ny) {
  const sett = new Map();
  for (const m of [...(Array.isArray(gml) ? gml : []), ...(Array.isArray(ny) ? ny : [])]) {
    if (!m || m.id == null) continue;
    const har = sett.get(m.id);
    if (har) { if (m.lest) har.lest = true; continue; }   // lest er en enveis dør
    sett.set(m.id, { ...m });
  }
  return [...sett.values()].sort((a, b) => b.tid - a.tid).slice(0, 30);
}
function flettInvest(gml, ny) {
  const g = gml && typeof gml === "object" ? gml : {};
  const n = ny && typeof ny === "object" ? ny : {};
  const ut = { ...n };
  // Kjøpt trålutstyr kan aldri krympe — samme regel som rod og lineOwned.
  if (g.utstyr) { ut.utstyr = { ...(n.utstyr || {}) };
    for (const k of Object.keys(g.utstyr))
      ut.utstyr[k] = Math.max(tall(g.utstyr[k], 9), tall(ut.utstyr[k], 9)); }
  // Historien er tellere som bare går oppover.
  if (g.hist) { ut.hist = { ...(n.hist || {}) };
    for (const k of Object.keys(g.hist)) { const a = g.hist[k], b = ut.hist[k] || {};
      ut.hist[k] = { turar: Math.max(tall(a.turar, 9e6), tall(b.turar, 9e6)),
                     inn: Math.max(tall(a.inn, 9e12), tall(b.inn, 9e12)),
                     ut: Math.max(tall(a.ut, 9e12), tall(b.ut, 9e12)) }; } }
  // En tur som er betalt for og fortsatt ute skal ALDRI slettes av en enhet
  // som ikke vet om den. Er den ferdig, får den som henter den avgjøre.
  if (!ut.tur && g.tur && tall(g.tur.ferdig, 9e15) > Date.now()) ut.tur = g.tur;
  return Object.keys(ut).length ? ut : undefined;
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
  const funnSett = vaskFunnSett(g.funnSett); if (funnSett) ut.funnSett = funnSett;
  const invest = vaskInvest(g.invest); if (invest) ut.invest = invest;
  const innboks = vaskInnboks(g.innboks); if (innboks) ut.innboks = innboks;
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
      if (gml.funnSett) g.funnSett = { ...gml.funnSett, ...(g.funnSett || {}) };  // hatt er hatt
      const iv = flettInvest(gml.invest, g.invest); if (iv) g.invest = iv;
      const ib = flettInnboks(gml.innboks, g.innboks); if (ib.length) g.innboks = ib;
      if (g.tidligereNavn == null && gml.tidligereNavn != null) g.tidligereNavn = gml.tidligereNavn;
      g.rod = Math.max(tall(gml.rod, 99), tall(g.rod, 99));         // kjøpt/opptjent kan aldri
      g.tidMs = Math.max(tall(gml.tidMs, 9e15), tall(g.tidMs, 9e15)); // krympe, uansett klokkerot
      // Bærer riggTs fram når en gammel klient utelater feltet, OG håndhever max-flettingen
      // på serveren, så en ny klient med eldre riggTs ikke kan tråkke over familiens
      // nyeste service. Én linje, to jobber.
      g.riggTs = Math.max(tall(gml.riggTs, 9e15), tall(g.riggTs, 9e15));
      g.streakBest = Math.max(tall(gml.streakBest, 9e15), tall(g.streakBest, 9e15)); // beste streak er en rekord — aldri ned
      for (const k of ["vinsj", "ekko", "turbo", "cooler", "belte", "sattDekk"]) if (gml[k]) g[k] = true; // sette flagg kan aldri tas tilbake
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

  // Hastighetsgrensen ligger FØR alt annet — også før kortutdelingen — så en som
  // prøver seg må gjennom den uansett hvilken dør han banker på.
  const teljar = getStore({ name: "storkveita-takst", consistency: "strong" });
  const ipN = ipNokkel(req);
  const naa = Date.now();
  let t = (await teljar.get(ipN, { type: "json" })) || { m: naa, nm: 0, h: naa, nh: 0 };
  if (naa - t.m > 60_000) { t.m = naa; t.nm = 0; }
  if (naa - t.h > 3_600_000) { t.h = naa; t.nh = 0; }
  t.nm++; t.nh++;
  await teljar.setJSON(ipN, t);
  if (t.nm > TAK_MIN || t.nh > TAK_TIME) {
    return Response.json({ feil: "For mange forsøk. Vent litt og prøv igjen." },
      { status: 429, headers: { "Retry-After": "60" } });
  }

  // Nytt fiskerkort. Serveren trekker, sjekker at hashen er ledig, og merker den
  // som tatt i samme åndedrag. Enheten kunne aldri gjort dette selv — den vet
  // ingenting om hva andre har fått. Kortet returneres ÉN gang og lagres aldri.
  if (body.nyttKort) {
    const lagerK = getStore({ name: "familierekorder", consistency: "strong" });
    for (let forsok = 0; forsok < 6; forsok++) {
      // Fire FORSKJELLIGE ord. Entropien er praktisk talt uendret (2^38,3 mot 2^38,4),
      // men «brosme-brosme» i et kort man leser høyt ser ut som en feil.
      const b = new Uint32Array(9);
      globalThis.crypto.getRandomValues(b);
      const ord = [], brukt = new Set();
      for (let i = 0; ord.length < 4 && i < 9; i++) {
        const o = KORTORD[b[i] % KORTORD.length];
        if (!brukt.has(o)) { brukt.add(o); ord.push(o); }
      }
      if (ord.length < 4) continue;                      // ekstremt sjelden — trekk på nytt
      const kort = ord.join("-") + "-" + (1000 + (b[8] % 9000));
      const nk = createHash("sha256").update("storkveita:" + kort).digest("hex");
      if (await lagerK.get(nk, { type: "json" })) continue;   // alt tatt — trekk på nytt
      // Merkes som kort, ikke familiekode. Kontrollpanelet trenger å kunne skille dem
      // for å telle ærlig — uten merket ser et kort ut som en familie på én.
      await lagerK.setJSON(nk, { players: {}, kort: true, updatedAt: naa });
      return Response.json({ kort }, { headers: { "Cache-Control": "no-store" } });
    }
    return Response.json({ feil: "Fikk ikke laget kort akkurat nå. Prøv igjen." }, { status: 503 });
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

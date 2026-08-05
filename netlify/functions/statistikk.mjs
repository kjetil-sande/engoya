// Kontrollpanel for «Jakten på storkveita» — samlet statistikk, ingen personer.
//
// Alt her regnes ut av data som ALLEREDE ligger lagret for at spillet skal virke
// på tvers av enheter. Ingenting samles inn for statistikkens skyld, og ingenting
// forlater denne funksjonen som kan peke på en enkeltperson — med ETT unntak
// (eierens valg 5. aug): topplista sender kallenavn, bak panelets dør. Resten
// av svaret er navnløst, og kallenavn er selvvalgte spillernavn, aldri fulle navn.
//
// Låst med STATS_NOKKEL (Netlify → Environment variables). Mangler nøkkelen, er
// panelet stengt — det faller ALDRI tilbake til åpent.
//
// GET/POST med header  x-nokkel: <hemmelig>   →  { ... tall ... }

import { getStore } from "@netlify/blobs";

const ARTER_TOTALT = 38;      // FISH.length i fiske.html
const TROFE_TOTALT = 109;     // trofeMulige() kjørt mot den ekte FUNN-tabellen 6. aug (eremitten kom til)
const DAG = 864e5;

// Samme bestillingsdøgn som spillet og familierekorder.mjs: lokal dag som byttes 04:00
const serverBestillingsDag = () => { const d = new Date(Date.now() - 4 * 3600e3);
  return d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate(); };

const dagNr = (n) => {        // YYYYMMDD → dager siden 1970, for enkel avstandsregning
  const s = String(n);
  return Math.floor(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)) / DAG);
};

// ── Døra ─────────────────────────────────────────────────────────────────────
// ÉN dør om gangen, valgt av hva som er satt opp i Netlify:
//
//   PANEL_EPOST satt   →  Google-innlogging. Nøkkelen ignoreres helt.
//   bare STATS_NOKKEL  →  delt nøkkel (som før — så panelet ikke dør under omleggingen)
//   ingen av delene    →  stengt, 503. Faller ALDRI åpent.
//
// Selve tokenet valideres av Google på oauth2.googleapis.com/tokeninfo. Det er et
// bevisst valg framfor å verifisere JWT-signaturen her: den koden er kort å skrive
// og lett å skrive subtilt feil (glemt aud-sjekk, godtatt alg, utløp som ikke
// leses), og dette er et panel som åpnes noen ganger i uka. Google gjør
// kryptografien; vi sjekker at svaret gjelder VÅR app og RIKTIG person.
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

export default async (req) => {
  const medGoogle = !!(process.env.PANEL_EPOST || "").trim();
  if (medGoogle) {
    const nei = await googleDoer(req);
    if (nei) return Response.json({ feil: nei.feil, google: true, klientId: nei.klientId },
      { status: nei.status });
  } else {
    // .trim(): et usynlig mellomrom eller linjeskift limt inn i Netlify-feltet
    // skal ikke gi evig «Feil nøkkel» — panelet trimmer det brukeren skriver,
    // så serveren må trimme sitt.
    const fasit = (process.env.STATS_NOKKEL || "").trim();
    if (!fasit) {
      return Response.json({ feil: "Panelet er ikke satt opp: hverken PANEL_EPOST eller STATS_NOKKEL er satt i Netlify." },
        { status: 503 });
    }
    const gitt = req.headers.get("x-nokkel") || "";
    // Sammenligning i konstant tid er overkill her, men koster ingenting.
    let lik = gitt.length === fasit.length;
    for (let i = 0; i < Math.max(gitt.length, fasit.length); i++)
      if (gitt.charCodeAt(i) !== fasit.charCodeAt(i)) lik = false;
    if (!lik) return Response.json({ feil: "Nei." }, { status: 401 });
  }

  const lager = getStore({ name: "familierekorder", consistency: "strong" });
  const naa = Date.now();
  const iDag = Math.floor(naa / DAG);

  let koder = 0, kort = 0, tomme = 0;
  const fiskere = new Map();          // kallenavn → samlet bilde (dedup på tvers av kode og kort)

  const { blobs } = await lager.list();
  for (const b of blobs) {
    const fam = await lager.get(b.key, { type: "json" });
    if (!fam) continue;
    koder++;
    if (fam.kort) kort++;
    const spillere = Object.values(fam.players || {});
    if (!spillere.length) { tomme++; continue; }

    for (const p of spillere) {
      // Samme person kan ligge både under familiekoden og under sitt eget kort.
      // Vi slår sammen på kallenavn og beholder det STØRSTE av alt — det er den
      // samme monotone regelen spillet selv bruker, og den kan aldri telle for lite.
      const navn = String(p.name || "").trim();
      if (!navn) continue;
      const g = p.gear || {};
      const f = fiskere.get(navn) || { arter: 0, trofe: 0, tidMs: 0, dager: {}, ts: 0, utstyr: {},
        kr: 0, solgt: 0, bestFerdige: 0, streakBest: 0, gull: 0, tipsAnt: 0, tipsIder: {},
        arterSett: {}, trofeSolgt: 0, trofeRest: 0, pots: {}, uleste: 0,
        traalTur: false, traalUtstyr: {}, traalHist: {}, best: null, introSett: false,
        anmeldt: false, rolex: false, forsTil: 0, havnNeste: 0, smorTs: 0, svc: 0 };
      f.arter = Math.max(f.arter, Object.keys(p.caught || {}).length);
      f.trofe = Math.max(f.trofe, (g.trofe || []).filter((t) => !t.borte).length);
      f.tidMs = Math.max(f.tidMs, +g.tidMs || 0);
      f.ts = Math.max(f.ts, +p.ts || 0);
      for (const [d, ms] of Object.entries(g.dager || {}))
        f.dager[d] = Math.max(f.dager[d] || 0, +ms || 0);
      // Utstyret — alt sammen, ikke bare de fem gamle. rod teller nivå, resten er ja/nei.
      for (const k of ["rod", "vinsj", "ekko", "turbo", "belte", "cooler", "silke", "sattDekk", "propOk", "motorOk"])
        if (g[k]) f.utstyr[k] = Math.max(f.utstyr[k] || 0, k === "rod" ? +g[k] : 1);
      // Økonomi og fremdrift (monotont der spillet selv er monotont)
      f.kr = Math.max(f.kr, +p.kr || 0);
      f.solgt = Math.max(f.solgt, +g.solgt || 0);
      f.bestFerdige = Math.max(f.bestFerdige, +g.bestFerdige || 0);
      f.streakBest = Math.max(f.streakBest, +g.streakBest || 0);
      // Fangstboka: hvilke arter, og hvor mange gylne
      for (const [art, rec] of Object.entries(p.caught || {})) {
        f.arterSett[art] = 1;
        if (rec && rec.gold) f.gull = Math.max(f.gull, 1);
      }
      // Rustens tips: antall og hvilke (for utbredelses-toppen)
      const tips = Array.isArray(g.tips) ? g.tips : [];
      f.tipsAnt = Math.max(f.tipsAnt, tips.length);
      for (const tp of tips) if (tp && tp.k) f.tipsIder[tp.k] = 1;
      // Troféskapet: solgt og restaurert
      f.trofeSolgt = Math.max(f.trofeSolgt, (g.trofe || []).filter((t) => t.borte === "solgt").length);
      f.trofeRest = Math.max(f.trofeRest, (g.trofe || []).filter((t) => t.borte === "restaurert").length);
      // Teiner og liner
      const po = g.pots || {};
      for (const k of ["owned", "ownedH", "cap", "lineOwned", "lineKroker"])
        f.pots[k] = Math.max(f.pots[k] || 0, +po[k] || 0);
      // Tråler-motoren: aktiv tur, utstyrsnivå og historikk per NPC-fisker
      const inv = g.invest || {};
      if (inv.tur) f.traalTur = true;
      for (const [fk, niv] of Object.entries(inv.utstyr || {}))
        f.traalUtstyr[fk] = Math.max(f.traalUtstyr[fk] || 0, +niv || 0);
      for (const [fk, h] of Object.entries(inv.hist || {})) {
        const e = f.traalHist[fk] || (f.traalHist[fk] = { turar: 0, inn: 0, ut: 0 });
        e.turar = Math.max(e.turar, +h.turar || 0);
        e.inn = Math.max(e.inn, +h.inn || 0);
        e.ut = Math.max(e.ut, +h.ut || 0);
      }
      // Innboks, bestilling, vedlikehold, diverse
      f.uleste = Math.max(f.uleste, (Array.isArray(g.innboks) ? g.innboks : []).filter((m) => m && !m.lest && !m.borte).length);
      if (g.bestilling && (!f.best || (+g.bestilling.dag || 0) >= (+f.best.dag || 0)))
        f.best = { dag: +g.bestilling.dag || 0, ferdig: !!g.bestilling.ferdig, hentet: !!g.bestilling.hentet };
      if (g.bestillingIntroSett) f.introSett = true;
      if (g.anmeldt) f.anmeldt = true;
      if (g.rolex) f.rolex = true;
      f.forsTil = Math.max(f.forsTil, +g.forsTil || 0);
      f.havnNeste = Math.max(f.havnNeste, +g.havnNeste || 0);
      f.smorTs = Math.max(f.smorTs, +g.smorTs || 0);
      f.svc = Math.max(f.svc, +g.svc || 0);
      fiskere.set(navn, f);
    }
  }

  const alle = [...fiskere.values()];
  // Topplista er ENESTE sted kallenavn forlater serveren (eierens valg 5. aug) —
  // panelet står uansett bak Google-/nøkkeldøra. Resten av svaret er navnløst.
  const toppliste = [...fiskere.entries()]
    .map(([navn, f]) => ({ navn, arter: f.arter, trofe: f.trofe, kr: f.kr,
      timer: Math.round(Object.values(f.dager).reduce((a, b) => a + b, 0) / 3600000) }))
    .sort((a, b) => b.arter - a.arter || b.trofe - a.trofe || b.kr - a.kr)
    .slice(0, 100);
  const aktivInnen = (f, d) => Object.keys(f.dager).some((k) => iDag - dagNr(k) < d);
  const spiltMinutt = (f) => Math.round(Object.values(f.dager).reduce((a, b) => a + b, 0) / 60000);

  // Retention: av dem som begynte for minst en uke siden — hvor mange fisker fortsatt?
  const foerste = (f) => Math.min(...Object.keys(f.dager).map(dagNr));
  const modne = alle.filter((f) => Object.keys(f.dager).length && iDag - foerste(f) >= 7);
  const modneAktive = modne.filter((f) => aktivInnen(f, 7));

  const fordel = (verdier, bøtter) => {
    const ut = {};
    for (const [navn, test] of bøtter) ut[navn] = verdier.filter(test).length;
    return ut;
  };

  const minutter = alle.map(spiltMinutt).filter((m) => m > 0).sort((a, b) => a - b);
  const median = minutter.length ? minutter[Math.floor(minutter.length / 2)] : 0;

  return Response.json({
    hentet: new Date(naa).toISOString(),

    toppliste,

    folk: {
      fiskere: alle.length,
      koder, kort, tommeKoder: tomme,
      aktiveIDag: alle.filter((f) => aktivInnen(f, 1)).length,
      aktive7: alle.filter((f) => aktivInnen(f, 7)).length,
      aktive30: alle.filter((f) => aktivInnen(f, 30)).length,
    },

    tid: {
      totaltTimer: Math.round(alle.reduce((a, f) => a + spiltMinutt(f), 0) / 60),
      medianMinutt: median,
      snittPerFiskedagMinutt: (() => {
        let ms = 0, d = 0;
        for (const f of alle) for (const v of Object.values(f.dager)) { ms += v; d++; }
        return d ? Math.round(ms / d / 60000) : 0;
      })(),
      fiskedagerSnitt: alle.length
        ? +(alle.reduce((a, f) => a + Object.keys(f.dager).length, 0) / alle.length).toFixed(1) : 0,
    },

    retention: {
      modne: modne.length,                       // begynte for ≥ 7 dager siden
      fortsattAktive: modneAktive.length,        // og har fisket siste uke
      prosent: modne.length ? Math.round(100 * modneAktive.length / modne.length) : null,
    },

    progresjon: {
      arterTotalt: ARTER_TOTALT,
      trofeTotalt: TROFE_TOTALT,
      arterSnitt: alle.length ? +(alle.reduce((a, f) => a + f.arter, 0) / alle.length).toFixed(1) : 0,
      arterFordeling: fordel(alle, [
        ["0", (f) => f.arter === 0],
        ["1-9", (f) => f.arter >= 1 && f.arter <= 9],
        ["10-19", (f) => f.arter >= 10 && f.arter <= 19],
        ["20-29", (f) => f.arter >= 20 && f.arter <= 29],
        ["30-37", (f) => f.arter >= 30 && f.arter < ARTER_TOTALT],
        ["alle 38", (f) => f.arter >= ARTER_TOTALT],
      ]),
      trofeSnitt: alle.length ? +(alle.reduce((a, f) => a + f.trofe, 0) / alle.length).toFixed(1) : 0,
      ferdigeMedArter: alle.filter((f) => f.arter >= ARTER_TOTALT).length,
      ferdigeMedTrofe: alle.filter((f) => f.trofe >= TROFE_TOTALT).length,
      // «Tomme for innhold»: har alt av arter OG er fortsatt aktiv. Det er disse
      // som trenger noe nytt å gjøre — signalet eieren spurte etter.
      trengerMerAaGjoere: alle.filter((f) => f.arter >= ARTER_TOTALT && aktivInnen(f, 14)).length,
    },

    utstyr: {
      stangFordeling: fordel(alle, [
        ["Stang I", (f) => (f.utstyr.rod || 0) === 0],
        ["Stang II", (f) => (f.utstyr.rod || 0) === 1],
        ["Stang III", (f) => (f.utstyr.rod || 0) >= 2],
      ]),
      stangIII: alle.filter((f) => (f.utstyr.rod || 0) >= 2).length,
      vinsj: alle.filter((f) => f.utstyr.vinsj).length,
      ekkolodd: alle.filter((f) => f.utstyr.ekko).length,
      turbosnelle: alle.filter((f) => f.utstyr.turbo).length,
      kampbelte: alle.filter((f) => f.utstyr.belte).length,
      kjoleribbe: alle.filter((f) => f.utstyr.cooler).length,
      silkesnore: alle.filter((f) => f.utstyr.silke).length,
      krabbeteiner: alle.reduce((a, f) => a + (f.pots.owned || 0), 0),
      hummerteiner: alle.reduce((a, f) => a + (f.pots.ownedH || 0), 0),
      bunnliner: alle.reduce((a, f) => a + (f.pots.lineOwned || 0), 0),
      harRolexProsjekt: alle.filter((f) => f.rolex).length,
    },

    okonomi: {
      sumKr: alle.reduce((a, f) => a + f.kr, 0),
      medianKr: (() => { const v = alle.map((f) => f.kr).sort((a, b) => a - b);
        return v.length ? v[Math.floor(v.length / 2)] : 0; })(),
      sumSolgtFisk: alle.reduce((a, f) => a + f.solgt, 0),
      rikeste: alle.length ? Math.max(...alle.map((f) => f.kr)) : 0,
    },

    bestillinger: {
      harSettLappen: alle.filter((f) => f.introSett).length,
      fullfoerteTotalt: alle.reduce((a, f) => a + f.bestFerdige, 0),
      dagensTrukket: alle.filter((f) => f.best && f.best.dag === serverBestillingsDag()).length,
      dagensFerdig: alle.filter((f) => f.best && f.best.dag === serverBestillingsDag() && f.best.ferdig).length,
      dagensHentet: alle.filter((f) => f.best && f.best.dag === serverBestillingsDag() && f.best.hentet).length,
      snittFullfoerte: alle.length ? +(alle.reduce((a, f) => a + f.bestFerdige, 0) / alle.length).toFixed(1) : 0,
      fulleSykluser: alle.filter((f) => f.bestFerdige >= 7).length, // har nådd lapp nr 7 minst én gang
      tipsDeltUt: alle.reduce((a, f) => a + f.tipsAnt, 0),
    },

    tips: {
      snittAntall: alle.length ? +(alle.reduce((a, f) => a + f.tipsAnt, 0) / alle.length).toFixed(1) : 0,
      flestHos: alle.length ? Math.max(...alle.map((f) => f.tipsAnt)) : 0,
      // Hvilke tips som er mest utbredt — id-er, aldri navn
      utbredelse: (() => { const u = {};
        for (const f of alle) for (const k of Object.keys(f.tipsIder)) u[k] = (u[k] || 0) + 1;
        return Object.fromEntries(Object.entries(u).sort((a, b) => b[1] - a[1]).slice(0, 8)); })(),
    },

    arter: {
      // per art: hvor mange fiskere har den i boka — arts-id-er, aldri navn
      fanget: (() => { const u = {};
        for (const f of alle) for (const k of Object.keys(f.arterSett)) u[k] = (u[k] || 0) + 1;
        return Object.fromEntries(Object.entries(u).sort((a, b) => b[1] - a[1])); })(),
      harGyllen: alle.filter((f) => f.gull).length,
    },

    trofeer: {
      solgteTotalt: alle.reduce((a, f) => a + f.trofeSolgt, 0),
      restaurerteTotalt: alle.reduce((a, f) => a + f.trofeRest, 0),
    },

    traaler: {
      aktiveTurer: alle.filter((f) => f.traalTur).length,
      harInvestert: alle.filter((f) => Object.keys(f.traalHist).length).length,
      // per NPC-fisker: hvor mange spillere, turer, pengeflyt og spleiset utstyr
      perFisker: (() => { const u = {};
        for (const f of alle) {
          for (const [fk, h] of Object.entries(f.traalHist)) {
            const e = u[fk] || (u[fk] = { spillere: 0, turar: 0, inn: 0, ut: 0, utstyr: 0 });
            e.spillere++; e.turar += h.turar; e.inn += h.inn; e.ut += h.ut;
          }
          for (const [fk, niv] of Object.entries(f.traalUtstyr)) {
            const e = u[fk] || (u[fk] = { spillere: 0, turar: 0, inn: 0, ut: 0, utstyr: 0 });
            e.utstyr = Math.max(e.utstyr, niv);
          }
        }
        return u; })(),
    },

    innboksen: { ulesteTotalt: alle.reduce((a, f) => a + f.uleste, 0) },

    vedlikehold: {
      havneavgiftForfalt: alle.filter((f) => f.havnNeste && f.havnNeste < naa).length,
      forsikringUte: alle.filter((f) => f.forsTil && f.forsTil < naa).length,
      begroddeSkrog: alle.filter((f) => f.smorTs && naa - f.smorTs > 30 * DAG).length,
      hostendeMotorer: alle.filter((f) => f.svc > 250).length,
      streakBestINo: alle.length ? Math.max(...alle.map((f) => f.streakBest)) : 0,
      harAnmeldt: alle.filter((f) => f.anmeldt).length,
    },

    // ── Uka som gikk ────────────────────────────────────────────────────────
    // Døgnloggen gjør at vi kan sammenligne uke mot uke UTEN å lagre historikk:
    // hver fisker har minutter per dato, så begge vinduene finnes allerede i tallene.
    uke: (() => {
      const iVindu = (f, fra, til) => Object.keys(f.dager)
        .some((k) => { const d = iDag - dagNr(k); return d >= fra && d < til; });
      const minutt = (f, fra, til) => Object.entries(f.dager)
        .filter(([k]) => { const d = iDag - dagNr(k); return d >= fra && d < til; })
        .reduce((a, [, v]) => a + v, 0) / 60000;
      const startaI = (f, fra, til) => {
        if (!Object.keys(f.dager).length) return false;
        const d = iDag - foerste(f); return d >= fra && d < til;
      };
      const nye = alle.filter((f) => startaI(f, 0, 7)).length;
      const nyeFoer = alle.filter((f) => startaI(f, 7, 14)).length;
      const aktive = alle.filter((f) => iVindu(f, 0, 7)).length;
      const aktiveFoer = alle.filter((f) => iVindu(f, 7, 14)).length;
      const min = Math.round(alle.reduce((a, f) => a + minutt(f, 0, 7), 0));
      const minFoer = Math.round(alle.reduce((a, f) => a + minutt(f, 7, 14), 0));
      // Nær slutten: har over 85 % av artene og er fortsatt aktiv. Disse går tom
      // for innhold snart, og det er billigere å gi dem noe nytt før de slutter
      // enn å hente dem tilbake etterpå.
      const naerSlutten = alle.filter((f) => f.arter >= Math.ceil(ARTER_TOTALT * 0.85) && iVindu(f, 0, 14));
      return {
        // Ukenummer brukes til å velge tekstvariant i panelet. Da får samme uke
        // samme ordlyd uansett hvor mange ganger panelet lastes — variasjon uten
        // at det ser ut som tallene endrer seg.
        ukeNr: Math.floor(iDag / 7),
        // Åtte uker bakover, eldst først. Én setning kan ikke vise en kurve.
        serie: Array.from({ length: 8 }, (_, i) => {
          const u = 7 - i;
          return {
            minutt: Math.round(alle.reduce((a, f) => a + minutt(f, u * 7, (u + 1) * 7), 0)),
            aktive: alle.filter((f) => iVindu(f, u * 7, (u + 1) * 7)).length,
          };
        }),
        nye, nyeFoer,
        aktive, aktiveFoer,
        minutter: min, minutterFoer: minFoer,
        endringProsent: minFoer ? Math.round(100 * (min - minFoer) / minFoer) : null,
        snittMinuttPerAktiv: aktive ? Math.round(min / aktive) : 0,
        naerSlutten: naerSlutten.length,
        naerSluttenAndel: alle.length ? +(100 * naerSlutten.length / alle.length).toFixed(1) : 0,
        ferdigeOgAktive: alle.filter((f) => f.arter >= ARTER_TOTALT && iVindu(f, 0, 14)).length,
      };
    })(),

    merknad: "Fiskere telles på unikt kallenavn, så samme person under både familiekode " +
      "og fiskerkort telles én gang. To ulike personer med samme kallenavn telles også som én — " +
      "med få spillere er det uproblematisk, med mange bør tallet leses som et anslag.",
  }, { headers: { "Cache-Control": "no-store" } });
};

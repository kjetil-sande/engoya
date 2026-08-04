// Kontrollpanel for «Jakten på storkveita» — samlet statistikk, ingen personer.
//
// Alt her regnes ut av data som ALLEREDE ligger lagret for at spillet skal virke
// på tvers av enheter. Ingenting samles inn for statistikkens skyld, og ingenting
// forlater denne funksjonen som kan peke på en enkeltperson: kallenavn brukes bare
// til å telle unike fiskere, og sendes aldri ut.
//
// Låst med STATS_NOKKEL (Netlify → Environment variables). Mangler nøkkelen, er
// panelet stengt — det faller ALDRI tilbake til åpent.
//
// GET/POST med header  x-nokkel: <hemmelig>   →  { ... tall ... }

import { getStore } from "@netlify/blobs";

const ARTER_TOTALT = 38;      // FISH.length i fiske.html
const TROFE_TOTALT = 86;      // trofeMulige()
const DAG = 864e5;

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
      const f = fiskere.get(navn) || { arter: 0, trofe: 0, tidMs: 0, dager: {}, ts: 0, utstyr: {} };
      f.arter = Math.max(f.arter, Object.keys(p.caught || {}).length);
      f.trofe = Math.max(f.trofe, (g.trofe || []).filter((t) => !t.borte).length);
      f.tidMs = Math.max(f.tidMs, +g.tidMs || 0);
      f.ts = Math.max(f.ts, +p.ts || 0);
      for (const [d, ms] of Object.entries(g.dager || {}))
        f.dager[d] = Math.max(f.dager[d] || 0, +ms || 0);
      for (const k of ["rod", "vinsj", "ekko", "turbo", "belte"])
        if (g[k]) f.utstyr[k] = Math.max(f.utstyr[k] || 0, k === "rod" ? +g[k] : 1);
      fiskere.set(navn, f);
    }
  }

  const alle = [...fiskere.values()];
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
      stangIII: alle.filter((f) => (f.utstyr.rod || 0) >= 2).length,
      vinsj: alle.filter((f) => f.utstyr.vinsj).length,
      ekkolodd: alle.filter((f) => f.utstyr.ekko).length,
      turbosnelle: alle.filter((f) => f.utstyr.turbo).length,
      kampbelte: alle.filter((f) => f.utstyr.belte).length,
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

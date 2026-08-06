// Test av ukesrapporten: både tallene serveren regner ut, og setningen panelet
// skriver av dem. Setningen hentes UT AV kontrollpanel.html, ikke kopiert hit —
// det er koden som faktisk vises som testes.
//
//   node verktoy-uketest.mjs

import { readFileSync } from "node:fs";

const DAG = 864e5;
let feil = 0, ok = 0;
const sjekk = (navn, sant, ekstra = "") => {
  if (sant) { ok++; console.log("  OK   " + navn + (ekstra ? "   " + ekstra : "")); }
  else { feil++; console.log("  FEIL " + navn + (ekstra ? "   " + ekstra : "")); }
};

// ── Fake blob-lager, samme knep som verktoy-servertest ────────────────────────
const lager = new Map();
const fakeStore = () => ({
  list: async () => ({ blobs: [...lager.keys()].map((key) => ({ key })) }),
  get: async (k) => lager.get(k) || null,
  setJSON: async (k, v) => { lager.set(k, v); },
});

const kilde = readFileSync("netlify/functions/statistikk.mjs", "utf8")
  .replace(/import \{ getStore \} from "@netlify\/blobs";/,
    "const getStore = globalThis.__fakeStore;");
globalThis.__fakeStore = fakeStore;
process.env.STATS_NOKKEL = "test-nokkel";
const mod = await import("data:text/javascript;base64," + Buffer.from(kilde).toString("base64"));

const dagKode = (dagerSiden) => {
  const d = new Date(Date.now() - dagerSiden * DAG);
  return +(d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate());
};
const fisker = (navn, dager, arter = 0) => ({
  name: navn, ts: Date.now(), caught: Object.fromEntries(
    Array.from({ length: arter }, (_, i) => ["a" + i, { n: 1 }])),
  gear: { dager: Object.fromEntries(dager.map(([d, min]) => [dagKode(d), min * 60000])) },
});
const kjor = async () => {
  const r = await mod.default(new Request("https://x/", { headers: { "x-nokkel": "test-nokkel" } }));
  return r.json();
};
const sett = (folk) => { lager.clear(); lager.set("fam1", { players: Object.fromEntries(folk.map((p, i) => ["p" + i, p])) }); };

// ── Hent ukeSetning + hjelperne ut av panelet ────────────────────────────────
const panel = readFileSync("kontrollpanel.html", "utf8");
const biter = ["function tid(", "function no(", "function velg(", "function flertall(",
  "function sparkline(", "function ukeSetning("].map((start) => {
  const i = panel.indexOf(start);
  if (i < 0) throw new Error("fant ikke " + start + " i kontrollpanel.html");
  // Klammebalansering fram til funksjonen lukkes.
  let d = 0, j = panel.indexOf("{", i);
  for (let k = j; k < panel.length; k++) {
    if (panel[k] === "{") d++;
    else if (panel[k] === "}") { d--; if (!d) return panel.slice(i, k + 1); }
  }
  throw new Error("ubalansert: " + start);
});
const { ukeSetning } = await import("data:text/javascript;base64," + Buffer.from(
  biter.join("\n") + "\nexport { ukeSetning };").toString("base64"));

console.log("\n1. TALLENE — ÅTTE UKER BAKOVER");
sett([fisker("A", [[1, 30], [8, 60], [20, 45]])]);
let d = await kjor();
sjekk("serien har åtte uker", d.uke.serie.length === 8);
sjekk("siste bøtte er denne uka", d.uke.serie[7].minutt === 30, "=" + d.uke.serie[7].minutt);
sjekk("nest siste er uka før", d.uke.serie[6].minutt === 60, "=" + d.uke.serie[6].minutt);
sjekk("uke 20 dager tilbake havner i bøtte 5", d.uke.serie[5].minutt === 45, "=" + d.uke.serie[5].minutt);
sjekk("minutter denne uka", d.uke.minutter === 30, "=" + d.uke.minutter);
sjekk("minutter forrige uke", d.uke.minutterFoer === 60, "=" + d.uke.minutterFoer);
sjekk("endring −50 %", d.uke.endringProsent === -50, "=" + d.uke.endringProsent);
sjekk("ukeNr er et heltall", Number.isInteger(d.uke.ukeNr), "=" + d.uke.ukeNr);

console.log("\n2. NYE MOT AKTIVE");
sett([
  fisker("Ny", [[2, 20]]),                       // begynte denne uka
  fisker("Forrige", [[9, 20], [1, 10]]),         // begynte forrige uke, fisker fortsatt
  fisker("Gammel", [[40, 60], [3, 15]]),         // gammel traver
  fisker("Borte", [[50, 90]]),                   // sluttet
]);
d = await kjor();
sjekk("én ny denne uka", d.uke.nye === 1, "=" + d.uke.nye);
sjekk("én ny forrige uke", d.uke.nyeFoer === 1, "=" + d.uke.nyeFoer);
sjekk("tre aktive denne uka", d.uke.aktive === 3, "=" + d.uke.aktive);
sjekk("den som sluttet teller ikke", d.uke.aktive < 4);
sjekk("snitt per aktiv regnes av de aktive", d.uke.snittMinuttPerAktiv === 15,
  "=" + d.uke.snittMinuttPerAktiv);

console.log("\n3. GRENSEN FOR NYTT INNHOLD");
sett([
  fisker("Nesten", [[1, 30]], 49),   // 49 av 56 = over 85 %
  fisker("Ferdig", [[2, 30]], 56),   // alt
  fisker("Fersk", [[1, 30]], 4),
  fisker("Ferdig-men-borte", [[40, 30]], 56),
]);
d = await kjor();
sjekk("to nærmer seg grensen", d.uke.naerSlutten === 2, "=" + d.uke.naerSlutten);
sjekk("den som sluttet telles ikke som nær", d.uke.naerSlutten < 3);
sjekk("én er ferdig OG aktiv", d.uke.ferdigeOgAktive === 1, "=" + d.uke.ferdigeOgAktive);
sjekk("andel oppgitt", d.uke.naerSluttenAndel === 50, "=" + d.uke.naerSluttenAndel);

console.log("\n4. SETNINGEN — ALLE INNGANGER SVARER");
const rein = (h) => h.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const scener = [
  ["blank uke", { uke: { ukeNr: 1, nye: 0, aktive: 0, minutter: 0, minutterFoer: 0,
    endringProsent: null, serie: [], naerSlutten: 0, ferdigeOgAktive: 0, snittMinuttPerAktiv: 0 },
    retention: { prosent: null, modne: 0 } }, "Blankt"],
  ["noen er ferdige", { uke: { ukeNr: 2, nye: 3, aktive: 9, minutter: 400, minutterFoer: 380,
    endringProsent: 5, serie: [], naerSlutten: 4, naerSluttenAndel: 12.5, ferdigeOgAktive: 2,
    snittMinuttPerAktiv: 44 }, retention: { prosent: 55, modne: 12 } }, "Nedtelling"],
  ["bratt fall", { uke: { ukeNr: 3, nye: 1, aktive: 6, minutter: 100, minutterFoer: 300,
    endringProsent: -67, serie: [], naerSlutten: 0, ferdigeOgAktive: 0, snittMinuttPerAktiv: 17 },
    retention: { prosent: 40, modne: 10 } }, "Fallende"],
  ["tilstrømming", { uke: { ukeNr: 4, nye: 12, nyeFoer: 2, aktive: 20, minutter: 600,
    minutterFoer: 500, endringProsent: 20, serie: [], naerSlutten: 0, ferdigeOgAktive: 0,
    snittMinuttPerAktiv: 30 }, retention: { prosent: 50, modne: 8 } }, "Tilstrømming"],
  ["opptur", { uke: { ukeNr: 5, nye: 1, aktive: 7, minutter: 500, minutterFoer: 300,
    endringProsent: 67, serie: [], naerSlutten: 0, ferdigeOgAktive: 0, snittMinuttPerAktiv: 71 },
    retention: { prosent: 60, modne: 9 } }, "Stigende"],
  ["ingen nye", { uke: { ukeNr: 6, nye: 0, aktive: 5, minutter: 200, minutterFoer: 190,
    endringProsent: 5, serie: [], naerSlutten: 0, ferdigeOgAktive: 0, snittMinuttPerAktiv: 40 },
    retention: { prosent: 70, modne: 6 } }, "Lukket krets"],
  ["jevn uke", { uke: { ukeNr: 7, nye: 2, aktive: 6, minutter: 210, minutterFoer: 200,
    endringProsent: 5, serie: [], naerSlutten: 0, ferdigeOgAktive: 0, snittMinuttPerAktiv: 35 },
    retention: { prosent: 65, modne: 7 } }, "Jevnt"],
];
for (const [navn, data, puls] of scener) {
  const h = ukeSetning(data), t = rein(h);
  sjekk(navn + " → «" + puls + "»", h.includes(">" + puls + "<"),
    t.slice(t.indexOf(puls) + puls.length, t.indexOf(puls) + puls.length + 62).trim() + "…");
  sjekk("  " + navn + ": har et forslag", t.includes("Forslag:") && t.split("Forslag:")[1].length > 40);
  // «null» er et helt vanlig norsk ord og står med rette i teksten — det er bare
  // undefined og NaN som aldri kan være annet enn en lekkasje fra koden.
  sjekk("  " + navn + ": ingen udefinerte verdier", !/undefined|NaN/.test(t), t.length + " tegn");
}

console.log("\n5. SAMME UKE GIR SAMME TEKST");
const en = ukeSetning(scener[6][1]), to = ukeSetning(scener[6][1]);
sjekk("to kall gir identisk tekst", en === to);
const annen = ukeSetning({ ...scener[6][1], uke: { ...scener[6][1].uke, ukeNr: 8 } });
sjekk("neste uke gir en annen variant", annen !== en);

console.log("\n6. KURVA");
const med = ukeSetning({ ...scener[6][1], uke: { ...scener[6][1].uke,
  serie: [10, 20, 0, 40, 30, 50, 25, 60].map((m) => ({ minutt: m, aktive: 2 })) } });
sjekk("åtte søyler tegnes", (med.match(/<i class=/g) || []).length === 8);
sjekk("siste søyle er markert", med.includes('<i class="na"'));
sjekk("tom uke får fortsatt en strek", med.includes("height:2px"));
sjekk("høyeste uke er full høyde", med.includes("height:30px"));
sjekk("tomt datasett krasjer ikke", ukeSetning(scener[0][1]).length > 100);

console.log("\n" + (feil
  ? "✗ " + feil + " FEIL av " + (ok + feil)
  : "✓ BESTÅTT — " + ok + " sjekker: tallene stemmer, alle syv inngangene svarer, og kurva tegner seg."));
process.exit(feil ? 1 : 0);

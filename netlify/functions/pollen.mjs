// Pollenvarsel fra Google Pollen API (1×1 km, UPI-skala 0–5) for Engøya.
// Bruker samme nøkkel som åpningstidene: GOOGLE_PLACES_KEY.
// Mellomlagres én time — varselet oppdateres uansett bare daglig.

const POS = { lat: 66.8706, lon: 13.6733 };

export default async () => {
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) {
    return Response.json({ feil: "GOOGLE_PLACES_KEY mangler" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const url =
      `https://pollen.googleapis.com/v1/forecast:lookup?key=${key}` +
      `&location.latitude=${POS.lat}&location.longitude=${POS.lon}&days=4&languageCode=nb`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Pollen API svarte ${r.status}`);
    const d = await r.json();

    const dager = (d.dailyInfo || []).map((dag) => {
      const dato = dag.date ? `${dag.date.year}-${String(dag.date.month).padStart(2, "0")}-${String(dag.date.day).padStart(2, "0")}` : null;
      const pakk = (t) => ({
        kode: t.code,
        navn: t.displayName || t.code,
        verdi: t.indexInfo?.value ?? null,
        kategori: t.indexInfo?.category || null,
        iSesong: t.inSeason ?? null,
      });
      return {
        dato,
        typer: (dag.pollenTypeInfo || []).map(pakk),
        planter: (dag.plantInfo || []).map(pakk).filter((p) => p.verdi != null || p.iSesong),
      };
    });

    return Response.json(
      { hentet: new Date().toISOString(), region: d.regionCode, dager },
      { headers: { "Cache-Control": "public, max-age=3600", "Netlify-CDN-Cache-Control": "public, durable, max-age=3600" } }
    );
  } catch (e) {
    return Response.json({ feil: String(e.message || e) }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
};

export const config = { path: "/api/pollen" };

// Åpningstider fra Google Places API (New).
// Nøkkelen ligger i miljøvariabelen GOOGLE_PLACES_KEY (Netlify → Environment variables,
// lokalt i .env.local) — aldri i koden.
//
// Butikkene slås opp på navn (tekstsøk), så du slipper å finne Place-ID-er.
// Legg til flere med { bransje, sok } — evt. { bransje, sok, placeId } for å låse treffet.

const BUTIKKER = [
  { bransje: "Dagligvare", sok: "Coop Extra Ørnes" },
  { bransje: "Vinmonopol", sok: "Vinmonopolet Ørnes" },
  { bransje: "Varehus", sok: "Europris Ørnes" },
  { bransje: "Byggevare", sok: "Montér Ørnes" },
  { bransje: "Møbler", sok: "Møbelringen Dybvik Ørnes" },
  { bransje: "Kiosk", sok: "Mix Ørnes" },
  { bransje: "Bil og verksted", sok: "Jensen Service AS Ørnes" },
  { bransje: "Apotek", sok: "Vitusapotek Meløy" },
];

// Ørnes sentrum — brukes som geografisk bias for tekstsøket
const ORNES = { lat: 66.8676, lon: 13.7096 };
const FELT =
  "displayName,currentOpeningHours.openNow,currentOpeningHours.weekdayDescriptions,regularOpeningHours.weekdayDescriptions,googleMapsUri";

async function slaOpp(b, key) {
  try {
    let d;
    if (b.placeId) {
      const r = await fetch(`https://places.googleapis.com/v1/places/${b.placeId}?languageCode=nb`, {
        headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": FELT },
      });
      if (!r.ok) throw new Error(`Details ${r.status}`);
      d = await r.json();
    } else {
      const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": FELT.split(",").map((f) => `places.${f}`).join(","),
        },
        body: JSON.stringify({
          textQuery: b.sok,
          languageCode: "nb",
          locationBias: { circle: { center: { latitude: ORNES.lat, longitude: ORNES.lon }, radius: 6000 } },
        }),
      });
      if (!r.ok) throw new Error(`Search ${r.status}`);
      d = (await r.json()).places?.[0];
      if (!d) throw new Error("ingen treff");
    }
    const timer = d.currentOpeningHours ?? d.regularOpeningHours ?? {};
    return {
      bransje: b.bransje,
      navn: d.displayName?.text || b.sok,
      apenNa: d.currentOpeningHours?.openNow ?? null,
      ukedager: timer.weekdayDescriptions || [],
      lenke: d.googleMapsUri || null,
    };
  } catch (e) {
    return { bransje: b.bransje, navn: b.sok, apenNa: null, ukedager: [], lenke: null, feil: String(e.message || e) };
  }
}

export default async () => {
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) {
    return Response.json({ feil: "GOOGLE_PLACES_KEY mangler", butikker: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  const butikker = await Promise.all(BUTIKKER.map((b) => slaOpp(b, key)));
  return Response.json(
    { hentet: new Date().toISOString(), butikker },
    { headers: { "Cache-Control": "public, max-age=600", "Netlify-CDN-Cache-Control": "public, durable, max-age=600" } }
  );
};

export const config = { path: "/api/apningstider" };

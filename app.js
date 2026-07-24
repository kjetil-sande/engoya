/* ============================================================
   ENGØYA · app.js
   Felles for alle sidene: meny, dagskort, tidevann (Kartverket),
   vær/sjø/sol (MET/Yr), nordlys (NOAA), nyheter (Meløy kommune).
   Hver funksjon fyller bare de elementene som finnes på siden.
   ============================================================ */

/* ---------- INNSTILLINGER ---------- */

const CONFIG = {
  webcam: {
    // Adressen til kamerabildet. For Foscam (HD-modeller) er stillbilde-adressen:
    //   http://KAMERA-ADRESSE:PORT/cgi-bin/CGIProxy.fcgi?cmd=snapPicture2&usr=BRUKER&pwd=PASSORD
    //
    // ⚠ VIKTIG: alle som åpner nettsiden kan lese denne adressen — inkludert
    //   brukernavn og passord. Greit hjemme; på en offentlig side bør kameraet
    //   heller laste opp bilder via FTP. Se «Webkamera» i README.md.
    url: "",
    type: "image",     // "image" (stillbilde som oppdateres) eller "iframe"
    refreshSec: 60,
  },
  menuVideo: {
    // Film i menyen (spilles automatisk i loop, uten lyd).
    // engoya-loop.mp4 er en sømløs loop-utgave av video/engoya-web.mp4 —
    // ny film? Legg fila i video/ og pek på den her.
    url: "video/engoya-loop.mp4",
  },
  kryssing: {
    // «Tørrskodd til Messøya»: vindu vises når vannstanden er under denne
    // terskelen (cm over sjøkartnull). Anslag — juster etter erfaring!
    maksVannstand: 120,
  },
};

const POS = { lat: 66.8706, lon: 13.6733 };
const TZ = "Europe/Oslo";

const MENU_LINKS = [
  ["index.html", "Hjem"],
  ["tidevann.html", "Tidevann"],
  ["vaer.html", "Været"],
  ["sjo.html", "Sjø og telemetri"],
  ["sol.html", "Sol"],
  ["himmel.html", "Himmel"],
  ["kart.html", "Kartet"],
];

/* ---------- SMÅHJELPERE ---------- */

const $ = (sel) => document.querySelector(sel);

const fmtClock = new Intl.DateTimeFormat("nb-NO", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const fmtClockSec = new Intl.DateTimeFormat("nb-NO", { timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit" });
const fmtWeekday = new Intl.DateTimeFormat("nb-NO", { timeZone: TZ, weekday: "short" });
const fmtDayMonth = new Intl.DateTimeFormat("nb-NO", { timeZone: TZ, day: "numeric", month: "numeric" });
const fmtKey = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const fmtHour = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "numeric", hourCycle: "h23" });
const fmtMonth = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, month: "numeric" });

const dateKey = (d) => fmtKey.format(d);
const osloHour = (d) => parseInt(fmtHour.format(d), 10);
const osloMonth = (d) => parseInt(fmtMonth.format(d), 10);
const capFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const nbNum = (x, dec = 1) => x.toLocaleString("nb-NO", { minimumFractionDigits: 0, maximumFractionDigits: dec });

function osloLocalStamp(d) {
  const clock = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
  return `${dateKey(d)}T${clock}`;
}

function setStat(sel, html) { const el = $(sel); if (el) el.innerHTML = html; }
function setText(sel, text) { const el = $(sel); if (el) el.textContent = text; }
function showError(el, msg) { if (el) el.innerHTML = `<span class="err">⚠ ${msg}</span>`; }
function escapeHtml(s) { return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

const COMPASS = ["N", "NØ", "Ø", "SØ", "S", "SV", "V", "NV"];
const compassName = (deg) => COMPASS[Math.round(((deg % 360) + 360) % 360 / 45) % 8];

/* «Føles som»: vindavkjøling etter standardformelen (gjelder ved ≤10° og litt vind) */
function feelsLike(t, windMs) {
  if (t <= 10 && windMs >= 1.34) {
    const v = Math.pow(windMs * 3.6, 0.16);
    return 13.12 + 0.6215 * t - 11.37 * v + 0.3965 * t * v;
  }
  return t;
}

/* ---------- MENYEN ---------- */

function initMenu() {
  const here = location.pathname.split("/").pop() || "index.html";
  const links = MENU_LINKS
    .map(([href, label]) => `<a href="${href}"${href === here ? ' class="is-current"' : ""}>${label}</a>`)
    .join("");
  const promo = CONFIG.menuVideo.url
    ? `<div class="menu-promo"><video src="${CONFIG.menuVideo.url}" autoplay muted loop playsinline></video></div>`
    : `<div class="menu-promo"></div>`;

  document.body.insertAdjacentHTML(
    "afterbegin",
    `<header class="topbar">
      <div class="menu-pill">
        <a class="menu-logo" href="index.html" aria-label="Engøya — hjem"><img src="engoya-logo.png" alt="Engøya-vimpelen"></a>
        <button type="button" class="menu-burger" id="menuOpen" aria-label="Åpne menyen" aria-expanded="false">
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true"><path d="M1 1h16M1 7h16M1 13h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
    </header>
    <div class="menu-overlay" id="menuOverlay" hidden>
      <div class="menu-panel" role="dialog" aria-modal="true" aria-label="Meny">
        <div class="menu-panel-top">
          <a class="menu-logo" href="index.html"><img src="engoya-logo.png" alt="Engøya"></a>
          <button type="button" class="menu-close" id="menuClose" aria-label="Lukk menyen">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="menu-cols">
          <nav class="menu-links">${links}</nav>
          ${promo}
        </div>
        <div class="menu-foot">
          <span class="menu-foot-note">Vær, tidevann og sjø for øya</span>
          <div class="menu-foot-links">
            <a href="https://www.mattilsynet.no/mat-og-drikke/forbrukere/blaskjellvarsel" target="_blank" rel="noopener">Blåskjellvarsel</a>
            <a href="https://www.pollenvarslingen.no" target="_blank" rel="noopener">Pollenvarsel</a>
            <a href="https://www.meloy.kommune.no" target="_blank" rel="noopener" class="menu-foot-hl">Meløy kommune&nbsp;↗</a>
          </div>
        </div>
      </div>
    </div>`
  );

  const overlay = $("#menuOverlay");
  const openBtn = $("#menuOpen");
  const open = () => {
    overlay.hidden = false;
    document.body.classList.add("menu-open");
    openBtn.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    overlay.hidden = true;
    document.body.classList.remove("menu-open");
    openBtn.setAttribute("aria-expanded", "false");
  };
  openBtn.addEventListener("click", open);
  $("#menuClose").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !overlay.hidden) close(); });
}

/* ---------- VÆRGRADIENT + IKONER ---------- */

const GRADIENTS = {
  sunny:        ["#5ED1FF", "#50BCF7", "#41A9EF"],
  partlysunny:  ["#45B4F7", "#2F99E6", "#0F7ED4"],
  cloudy:       ["#4D92F4", "#3280EF", "#006EE8"],
  thunderstorm: ["#4C7CEE", "#2F66DF", "#0052D2"],
  rain:         ["#5669C9", "#3D55C0", "#1E41B4"],
  night:        ["#3245BD", "#1D3097", "#041E70"],
};

function gradientFor(code) {
  if (!code) return "cloudy";
  if (/_night$/.test(code)) return "night";
  const base = code.replace(/_(day|night|polartwilight)$/, "");
  if (base.includes("thunder")) return "thunderstorm";
  if (base.includes("rain") || base.includes("sleet") || base.includes("snow")) return "rain";
  if (base === "cloudy" || base === "fog") return "cloudy";
  if (base === "partlycloudy" || base === "fair") return "partlysunny";
  if (base === "clearsky") return "sunny";
  return "cloudy";
}

function applyCardGradients(code) {
  const g = GRADIENTS[gradientFor(code)];
  document.querySelectorAll('.kort[data-art="vaer"] .kort-illu, .page-hero[data-art="vaer"]').forEach((el) => {
    el.style.background = `linear-gradient(180deg, ${g[0]}, ${g[1]} 52%, ${g[2]})`;
  });
}

/* Yr-symbolkoder → 3D-ikonene i ikoner/ (brukes KUN i Været-blokkene) */
function symbolIcon(code) {
  if (!code) return "cloudy.png";
  const night = /_night$/.test(code);
  const base = code.replace(/_(day|night|polartwilight)$/, "");
  if (base.includes("thunder")) {
    return base.includes("rain") || base.includes("sleet") || base.includes("snow") ? "rainthunder.png" : "thunder.png";
  }
  if (base.includes("sleet")) return "sleet.png";
  if (base.includes("snow")) return "snow.png";
  if (base.includes("rain")) return "rain.png";
  if (base === "cloudy" || base === "fog") return "cloudy.png";
  if (base === "partlycloudy" || base === "fair") return night ? "partlycloudy-night.png" : "partlycloudy-day.png";
  if (base === "clearsky") return night ? "clearsky-night.png" : "clearsky-day.png";
  return "cloudy.png";
}

/* ---------- KARTET (kart.html) ---------- */

function initMap() {
  if (!$("#map")) return;

  const kv = (layer) =>
    L.tileLayer(`https://cache.kartverket.no/v1/wmts/1.0.0/${layer}/default/webmercator/{z}/{y}/{x}.png`, {
      maxZoom: 17,
      attribution: "© Kartverket",
    });

  const layers = { topo: kv("topo"), sjo: kv("sjokartraster") };

  const map = L.map("map", {
    center: [POS.lat, POS.lon],
    zoom: 14,
    layers: [layers.topo],
    scrollWheelZoom: false,
  });

  L.circleMarker([POS.lat, POS.lon], {
    radius: 9,
    color: "#1C1D1F",
    weight: 3,
    fillColor: "#FFFFFF",
    fillOpacity: 0.95,
  })
    .addTo(map)
    .bindTooltip("Engøya", { permanent: true, direction: "top", offset: [0, -12] });

  document.querySelectorAll(".map-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pick = btn.dataset.layer;
      Object.entries(layers).forEach(([name, lyr]) => {
        if (name === pick) map.addLayer(lyr);
        else map.removeLayer(lyr);
      });
      document.querySelectorAll(".map-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
    });
  });
}

/* ---------- TIDEVANN ---------- */

function parseTideXML(text) {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  if (doc.querySelector("parsererror")) throw new Error("Uleselig svar fra Kartverket");
  return doc;
}

function tideURL(params) {
  const q = new URLSearchParams({
    lat: POS.lat, lon: POS.lon,
    refcode: "cd", lang: "nb", dst: "1", tzone: "1",
    tide_request: "locationdata",
    ...params,
  });
  return `https://vannstand.kartverket.no/tideapi.php?${q}`;
}

async function loadTide() {
  const now = new Date();
  const tabFrom = `${dateKey(now)}T00:00`;
  const tabTo = osloLocalStamp(new Date(now.getTime() + 7 * 86400e3));
  const curveFrom = osloLocalStamp(new Date(now.getTime() - 6 * 3600e3));
  const curveTo = osloLocalStamp(new Date(now.getTime() + 30 * 3600e3));

  const [tabRes, curveRes] = await Promise.all([
    fetch(tideURL({ datatype: "tab", fromtime: tabFrom, totime: tabTo })),
    fetch(tideURL({ datatype: "pre", fromtime: curveFrom, totime: curveTo, interval: "10" })),
  ]);
  if (!tabRes.ok || !curveRes.ok) throw new Error("Kartverket svarte ikke");

  const tabDoc = parseTideXML(await tabRes.text());
  const curveDoc = parseTideXML(await curveRes.text());

  const loc = tabDoc.querySelector("location");
  if (loc && loc.getAttribute("descr")) {
    setText("#tideStationInfo", `cm over sjøkartnull · norsk lokaltid · ${loc.getAttribute("descr")}`);
  }

  const events = [...tabDoc.querySelectorAll("waterlevel")]
    .map((el) => ({
      time: new Date(el.getAttribute("time")),
      cm: parseFloat(el.getAttribute("value")),
      high: el.getAttribute("flag") === "high",
    }))
    .sort((a, b) => a.time - b.time);

  const points = [...curveDoc.querySelectorAll('data[type="prediction"] waterlevel')]
    .map((el) => ({ time: new Date(el.getAttribute("time")), cm: parseFloat(el.getAttribute("value")) }))
    .sort((a, b) => a.time - b.time);

  // Dagskortet: dagens hendelser
  const todays = events.filter((e) => dateKey(e.time) === dateKey(now));
  if (todays.length) {
    setText("#kTideSub", todays.map((e) => `${e.high ? "▲" : "▼"} ${fmtClock.format(e.time)}`).join("  "));
  }

  // Vannstand akkurat nå (sjo.html)
  if (points.length > 1) {
    setStat("#levelNow", `${Math.round(interpTide(points, now.getTime()))}<small> cm</small>`);
    setText("#levelNote", "over sjøkartnull");
  }

  renderNextTide(events, now);
  renderTideTable(events, now);
  renderKryssing(points, now);
  if (points.length > 5) renderTideChart(points, events, now);
  else $("#tideChartLoading")?.remove();
}

/* «Tørrskodd til Messøya»: vinduer der vannstanden er under terskelen */
function renderKryssing(points, now) {
  const list = $("#krysseList");
  if (!list) return;
  const T = CONFIG.kryssing.maksVannstand;
  setText("#krysseTerskel", nbNum(T, 0));

  const wins = [];
  let start = null, min = Infinity, prev = null;
  points.forEach((p) => {
    if (p.cm <= T) {
      if (!start) { start = p.time; min = p.cm; }
      if (p.cm < min) min = p.cm;
      prev = p.time;
    } else if (start) {
      wins.push({ from: start, to: prev, min });
      start = null; min = Infinity;
    }
  });
  if (start) wins.push({ from: start, to: points[points.length - 1].time, min });

  const todayKey = dateKey(now);
  const tomorrowKey = dateKey(new Date(now.getTime() + 86400e3));
  const upcoming = wins.filter((w) => w.to > now).slice(0, 4);

  if (!upcoming.length) {
    list.innerHTML = `<div class="krysse-item"><span class="krysse-day">Ingen vindu det neste halvannet døgnet</span><span class="krysse-info">vannstanden holder seg over ${nbNum(T, 0)} cm</span></div>`;
    return;
  }

  list.innerHTML = upcoming
    .map((w) => {
      const k = dateKey(w.from);
      const day = k === todayKey ? "I dag" : k === tomorrowKey ? "I morgen" : capFirst(fmtWeekday.format(w.from));
      const varighet = Math.round((w.to - w.from) / 60e3);
      return `<div class="krysse-item">
        <span class="krysse-day">${day}</span>
        <span class="krysse-tid"><strong>${fmtClock.format(w.from)}–${fmtClock.format(w.to)}</strong></span>
        <span class="krysse-info">ca. ${varighet} min · lavest ${nbNum(Math.round(w.min), 0)} cm</span>
      </div>`;
    })
    .join("");
}

function renderNextTide(events, now) {
  const next = events.find((e) => e.time > now);
  if (!next) return;
  setText("#kTideLabel", `Neste ${next.high ? "flo" : "fjære"}`);
  setStat("#kTideValue", `${fmtClock.format(next.time)}<small> · ${nbNum(Math.round(next.cm), 0)} cm</small>`);
}

function renderTideTable(events, now) {
  const wrap = $("#tideDays");
  if (!wrap) return;

  const todayKey = dateKey(now);
  const tomorrowKey = dateKey(new Date(now.getTime() + 86400e3));
  const byDay = new Map();
  events.forEach((e) => {
    const k = dateKey(e.time);
    if (k < todayKey) return;
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(e);
  });

  const rows = [...byDay.entries()].slice(0, 7).map(([k, evs]) => {
    const d = evs[0].time;
    let name = capFirst(fmtWeekday.format(d));
    if (k === todayKey) name = "I dag";
    else if (k === tomorrowKey) name = "I morgen";
    const chips = evs
      .map((e) => {
        const cls = `tide-ev ${e.high ? "is-high" : "is-low"}${e.time < now ? " is-past" : ""}`;
        return `<span class="${cls}"><span class="ev-arrow">${e.high ? "▲" : "▼"}</span>${e.high ? "Flo" : "Fjære"} ${fmtClock.format(e.time)}<span class="ev-cm">· ${nbNum(Math.round(e.cm), 0)} cm</span></span>`;
      })
      .join("");
    return `<div class="tide-day">
      <div class="tide-day-name">${name}<small>${fmtDayMonth.format(d)}</small></div>
      <div class="tide-events">${chips}</div>
    </div>`;
  });

  wrap.innerHTML = rows.join("");
}

let tideChartData = null;
let tideResizeHooked = false;

function renderTideChart(points, events, now) {
  const wrap = $("#tideChartWrap");
  if (!wrap) return;

  const wrapRect = wrap.getBoundingClientRect();
  const W = Math.max(340, Math.round(wrapRect.width || 660));
  const H = Math.round(Math.min(430, Math.max(225, (wrapRect.height || 0) - 8, W * 0.4)));
  const padL = 46, padR = 12, padT = 28, padB = 40;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const t0 = points[0].time.getTime(), t1 = points[points.length - 1].time.getTime();
  const maxCm = Math.max(...points.map((p) => p.cm));
  const yMax = Math.max(50, Math.ceil(maxCm / 50) * 50);

  const x = (t) => padL + ((t - t0) / (t1 - t0)) * plotW;
  const y = (v) => padT + (1 - v / yMax) * plotH;

  const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.time.getTime()).toFixed(1)},${y(p.cm).toFixed(1)}`).join("");
  const area = `${line}L${x(t1).toFixed(1)},${y(0)}L${x(t0).toFixed(1)},${y(0)}Z`;

  let grid = "";
  for (let v = 0; v <= yMax; v += 50) {
    grid += `<line x1="${padL}" y1="${y(v)}" x2="${W - padR}" y2="${y(v)}" class="tc-grid"/>`;
    grid += `<text x="${padL - 8}" y="${y(v) + 3.5}" class="tc-ylab">${v}</text>`;
  }

  let xticks = "";
  const firstTick = new Date(t0);
  firstTick.setMinutes(0, 0, 0);
  for (let t = firstTick.getTime(); t <= t1; t += 3600e3) {
    const h = osloHour(new Date(t));
    if (h % 6 !== 0 || t < t0) continue;
    xticks += `<line x1="${x(t)}" y1="${H - padB}" x2="${x(t)}" y2="${H - padB + 5}" class="tc-tick"/>`;
    xticks += `<text x="${x(t)}" y="${H - padB + 18}" class="tc-xlab">${String(h).padStart(2, "0")}</text>`;
    if (h === 0) {
      xticks += `<text x="${x(t)}" y="${H - padB + 32}" class="tc-xday">${fmtWeekday.format(new Date(t))}</text>`;
    }
  }

  let labels = "";
  events
    .filter((e) => e.time.getTime() > t0 + 30 * 60e3 && e.time.getTime() < t1 - 30 * 60e3)
    .forEach((e) => {
      const ex = Math.min(Math.max(x(e.time.getTime()), padL + 34), W - padR - 34);
      const ey = y(e.cm);
      const up = e.high;
      labels += `<circle cx="${x(e.time.getTime())}" cy="${ey}" r="3.4" class="tc-extreme"/>`;
      labels += `<text x="${ex}" y="${ey + (up ? -22 : 34)}" class="tc-exlab-cm">${Math.round(e.cm)} cm</text>`;
      labels += `<text x="${ex}" y="${ey + (up ? -9 : 21)}" class="tc-exlab">${up ? "flo" : "fjære"} ${fmtClock.format(e.time)}</text>`;
    });

  const nowT = now.getTime();
  const nowCm = interpTide(points, nowT);
  const nowMark =
    nowT > t0 && nowT < t1
      ? `<line x1="${x(nowT)}" y1="${padT - 6}" x2="${x(nowT)}" y2="${H - padB}" class="tc-now"/>
         <circle cx="${x(nowT)}" cy="${y(nowCm)}" r="5.5" class="tc-nowdot"/>
         <text x="${x(nowT)}" y="${padT - 12}" class="tc-nowlab">nå · ${Math.round(nowCm)} cm</text>`
      : "";

  const svg = `
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tidevannskurve for Engøya neste halvannet døgn" id="tideSvg">
    <style>
      .tc-grid { stroke: #E4E4E9; stroke-width: 1; }
      .tc-ylab { font: 500 11px "Spline Sans Mono", monospace; fill: #86868B; text-anchor: end; }
      .tc-tick { stroke: #C7C7CC; stroke-width: 1; }
      .tc-xlab { font: 500 11px "Spline Sans Mono", monospace; fill: #86868B; text-anchor: middle; }
      .tc-xday { font: 600 10px "Spline Sans Mono", monospace; fill: #6E6E73; text-anchor: middle; letter-spacing: .08em; text-transform: uppercase; }
      .tc-area { fill: rgba(98, 177, 234, .26); }
      .tc-line { fill: none; stroke: #3E8FD0; stroke-width: 2.2; stroke-linejoin: round; }
      .tc-extreme { fill: #3E8FD0; }
      .tc-exlab { font: 500 11px "Spline Sans Mono", monospace; fill: #6E6E73; text-anchor: middle; }
      .tc-exlab-cm { font: 700 13px "Spline Sans Mono", monospace; fill: #1C1D1F; text-anchor: middle; }
      .tc-now { stroke: #1C1D1F; stroke-width: 1.6; stroke-dasharray: 4 4; }
      .tc-nowdot { fill: #1C1D1F; stroke: #FFFFFF; stroke-width: 2.5; }
      .tc-nowlab { font: 700 11px "Spline Sans Mono", monospace; fill: #1C1D1F; text-anchor: middle; letter-spacing: .06em; }
      .tc-cross { stroke: rgba(28,29,31,.35); stroke-width: 1; stroke-dasharray: 3 3; opacity: 0; }
      .tc-crossdot { fill: #1C1D1F; stroke: #FFFFFF; stroke-width: 2; opacity: 0; }
    </style>
    <text x="${padL - 8}" y="${padT - 14}" class="tc-ylab">cm</text>
    ${grid}${xticks}
    <path d="${area}" class="tc-area"/>
    <path d="${line}" class="tc-line"/>
    ${labels}${nowMark}
    <line id="tideCross" x1="0" y1="${padT}" x2="0" y2="${H - padB}" class="tc-cross"/>
    <circle id="tideCrossDot" cx="0" cy="0" r="4.5" class="tc-crossdot"/>
    <rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" fill="transparent" id="tideHover"/>
  </svg>`;

  $("#tideChartLoading")?.remove();
  wrap.querySelector("#tideSvg")?.remove();
  wrap.insertAdjacentHTML("afterbegin", svg);

  tideChartData = { points, events };
  if (!tideResizeHooked) {
    tideResizeHooked = true;
    let rT;
    window.addEventListener("resize", () => {
      clearTimeout(rT);
      rT = setTimeout(() => {
        if (tideChartData) renderTideChart(tideChartData.points, tideChartData.events, new Date());
      }, 180);
    });
  }

  const svgEl = $("#tideSvg");
  const tip = $("#tideTip");
  const cross = $("#tideCross");
  const crossDot = $("#tideCrossDot");

  function onMove(ev) {
    const rect = svgEl.getBoundingClientRect();
    const fx = ((ev.clientX - rect.left) / rect.width) * W;
    if (fx < padL || fx > W - padR) return onLeave();
    const t = t0 + ((fx - padL) / plotW) * (t1 - t0);
    const v = interpTide(points, t);
    const cy = y(v);
    cross.setAttribute("x1", fx); cross.setAttribute("x2", fx);
    cross.style.opacity = 1;
    crossDot.setAttribute("cx", fx); crossDot.setAttribute("cy", cy);
    crossDot.style.opacity = 1;
    if (tip) {
      tip.hidden = false;
      tip.textContent = `kl. ${fmtClock.format(new Date(t))} · ${Math.round(v)} cm`;
      tip.style.left = `${(fx / W) * rect.width}px`;
      tip.style.top = `${(cy / H) * rect.height}px`;
    }
  }
  function onLeave() {
    cross.style.opacity = 0;
    crossDot.style.opacity = 0;
    if (tip) tip.hidden = true;
  }
  svgEl.addEventListener("pointermove", onMove);
  svgEl.addEventListener("pointerleave", onLeave);
}

function interpTide(points, t) {
  if (t <= points[0].time.getTime()) return points[0].cm;
  for (let i = 1; i < points.length; i++) {
    const tb = points[i].time.getTime();
    if (t <= tb) {
      const ta = points[i - 1].time.getTime();
      const f = (t - ta) / (tb - ta || 1);
      return points[i - 1].cm + f * (points[i].cm - points[i - 1].cm);
    }
  }
  return points[points.length - 1].cm;
}

/* ---------- VÆR + TELEMETRI ---------- */

async function loadWeather() {
  const res = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${POS.lat}&lon=${POS.lon}`);
  if (!res.ok) throw new Error("Yr svarte ikke");
  const json = await res.json();
  const series = json.properties.timeseries;

  // Været-dagskortet: gradient etter forholdene akkurat nå
  const sym0 =
    series[0].data.next_1_hours?.summary?.symbol_code ||
    series[0].data.next_6_hours?.summary?.symbol_code ||
    series[0].data.next_12_hours?.summary?.symbol_code;
  applyCardGradients(sym0);

  const first = series[0].data.instant.details;

  // Vær-dagskortet: temperatur nå + «føles som»
  if (first.air_temperature != null) {
    const fl = feelsLike(first.air_temperature, first.wind_speed ?? 0);
    setStat("#kVaerTemp", `${Math.round(first.air_temperature)}°<small> (føles som ${Math.round(fl)}°)</small>`);
  }

  // Vind-dagskortet
  if (first.wind_speed != null) {
    setStat("#kVindValue", `${nbNum(first.wind_speed, 0)} m/s`);
    const vb = [];
    if (first.wind_speed_of_gust != null) vb.push(`kast ${nbNum(first.wind_speed_of_gust, 0)} m/s`);
    if (first.wind_from_direction != null) vb.push(`fra ${compassName(first.wind_from_direction)}`);
    setText("#kVindSub", vb.join(" · "));
  }

  renderTelemetry(first, series);

  // Sol-siden: UV nå · Himmel-siden: skydekke nå
  if (first.ultraviolet_index_clear_sky != null) {
    setStat("#uvBig", nbNum(first.ultraviolet_index_clear_sky));
  }
  if (first.cloud_area_fraction != null) {
    setStat("#cloudNow", `${nbNum(first.cloud_area_fraction, 0)}<small> %</small>`);
  }

  // Døgnvis oppsummering
  const days = new Map();
  const get = (k) => {
    if (!days.has(k)) days.set(k, { temps: [], precip: 0, covered: new Set(), symbols: {}, firstSymbol: null, windMax: -1, windDir: 0, date: null });
    return days.get(k);
  };

  series.forEach((entry) => {
    const t = new Date(entry.time);
    const k = dateKey(t);
    const h = osloHour(t);
    const d = get(k);
    if (!d.date) d.date = t;
    const inst = entry.data.instant?.details || {};
    if (inst.air_temperature != null) d.temps.push(inst.air_temperature);
    if (inst.wind_speed != null && inst.wind_speed > d.windMax) {
      d.windMax = inst.wind_speed;
      d.windDir = inst.wind_from_direction || 0;
    }
    const s6 = entry.data.next_6_hours?.summary?.symbol_code;
    if (s6) {
      if (!(h in d.symbols)) d.symbols[h] = s6;
      if (!d.firstSymbol) d.firstSymbol = s6;
    }
  });

  series.forEach((entry) => {
    const t = new Date(entry.time);
    const d = days.get(dateKey(t));
    if (!d) return;
    const h = osloHour(t);
    const p1 = entry.data.next_1_hours?.details?.precipitation_amount;
    if (typeof p1 === "number" && !d.covered.has(h)) {
      d.precip += p1;
      d.covered.add(h);
    }
  });
  series.forEach((entry) => {
    const t = new Date(entry.time);
    const h = osloHour(t);
    if (h % 6 !== 0) return;
    const p6 = entry.data.next_6_hours?.details?.precipitation_amount;
    if (typeof p6 !== "number") return;
    const d = days.get(dateKey(t));
    if (!d) return;
    let overlap = false;
    for (let i = 0; i < 6; i++) if (d.covered.has(h + i)) overlap = true;
    if (!overlap) {
      d.precip += p6;
      for (let i = 0; i < 6; i++) d.covered.add(h + i);
    }
  });

  const todayKey = dateKey(new Date());
  const tomorrowKey = dateKey(new Date(Date.now() + 86400e3));
  const list = [...days.entries()].filter(([k]) => k >= todayKey).slice(0, 7);

  // 7-dagersvarselet (vaer.html)
  const grid = $("#forecastGrid");
  if (grid) {
    const maxPrecip = Math.max(1, ...list.map(([, d]) => d.precip));
    grid.innerHTML = list
      .map(([k, d]) => {
        let name = capFirst(fmtWeekday.format(d.date));
        if (k === todayKey) name = "I dag";
        else if (k === tomorrowKey) name = "I morgen";
        const symbol = d.symbols[12] || d.symbols[6] || d.symbols[18] || d.firstSymbol;
        const tMax = d.temps.length ? Math.round(Math.max(...d.temps)) : null;
        const tMin = d.temps.length ? Math.round(Math.min(...d.temps)) : null;
        const wet = d.precip >= 0.1;
        const barW = wet ? Math.max(6, (d.precip / maxPrecip) * 100) : 0;
        const wind = d.windMax >= 0 ? `<span class="fc-wind"><span class="w-arrow" style="transform:rotate(${Math.round(d.windDir + 180)}deg)" title="vind fra ${compassName(d.windDir)}">↑</span> ${nbNum(d.windMax, 0)} m/s</span>` : "";
        return `<div class="fc-day${k === todayKey ? " is-today" : ""}">
          <span class="fc-name">${name}</span>
          <span class="fc-date">${fmtDayMonth.format(d.date)}</span>
          <img class="fc-icon" src="ikoner/${symbolIcon(symbol)}" alt="">
          <span class="fc-temps">${tMax != null ? `${tMax}°` : "–"} <span class="t-min">/ ${tMin != null ? `${tMin}°` : "–"}</span></span>
          <span class="fc-precip-track"><span class="fc-precip-bar" style="width:${barW}%"></span></span>
          <span class="fc-precip-mm${wet ? "" : " is-dry"}">${wet ? `${nbNum(d.precip)} mm` : "tørt"}</span>
          ${wind}
        </div>`;
      })
      .join("");
  }

  setText("#footNote", `Hentet ${fmtClock.format(new Date())} · oppdater siden for ferske tall`);

  // Været-dagskortet
  if (list.length) {
    const d0 = list[0][1];
    const daySym = d0.symbols[12] || d0.symbols[6] || d0.symbols[18] || d0.firstSymbol;
    const icon = $("#kVaerIcon");
    if (icon) icon.src = `ikoner/${symbolIcon(daySym)}`;
    const heroIcon = $("#heroVaerIcon");
    if (heroIcon) heroIcon.src = `ikoner/${symbolIcon(daySym)}`;
    setText("#kVaerSub", d0.precip >= 0.1 ? `${nbNum(d0.precip)} mm nedbør i vente` : "Tørt resten av dagen");
  }
}

function renderTelemetry(first, series) {
  const grid = $("#teleGrid");
  if (!grid) return;

  let trend = "";
  const p0 = first.air_pressure_at_sea_level;
  const later = series[3]?.data?.instant?.details?.air_pressure_at_sea_level;
  if (p0 != null && later != null) {
    const diff = later - p0;
    if (diff > 1) trend = ` <small class="tele-trend" title="stigende">↗</small>`;
    else if (diff < -1) trend = ` <small class="tele-trend" title="fallende">↘</small>`;
    else trend = ` <small class="tele-trend" title="stabilt">→</small>`;
  }

  const tiles = [
    { v: p0, html: `${nbNum(p0 ?? 0, 0)}<small> hPa</small>${trend}`, label: "Trykk" },
    { v: first.wind_speed_of_gust, html: `${nbNum(first.wind_speed_of_gust ?? 0, 0)}<small> m/s</small>`, label: "Vindkast" },
    { v: first.relative_humidity, html: `${nbNum(first.relative_humidity ?? 0, 0)}<small> %</small>`, label: "Fuktighet" },
    { v: first.cloud_area_fraction, html: `${nbNum(first.cloud_area_fraction ?? 0, 0)}<small> %</small>`, label: "Skydekke" },
    { v: first.dew_point_temperature, html: `${nbNum(first.dew_point_temperature ?? 0)}<small>°</small>`, label: "Duggpunkt" },
  ].filter((t) => t.v != null);

  $("#teleLoading")?.remove();
  grid.insertAdjacentHTML(
    "afterbegin",
    tiles.map((t) => `<div class="tele"><span class="tele-value">${t.html}</span><span class="tele-label">${t.label}</span></div>`).join("")
  );
}

/* ---------- SJØEN ---------- */

function waveNote(h) {
  if (h < 0.2) return "nesten speilblankt";
  if (h < 0.5) return "smul sjø — fin båtdag";
  if (h < 1.25) return "litt sjø, men grei tur";
  if (h < 2.5) return "en del bølger — kle deg for sjøsprøyt";
  return "grov sjø — bli på land";
}

function seaTempNote(t) {
  if (t < 6) return "iskaldt";
  if (t < 10) return "friskt";
  if (t < 13) return "forfriskende";
  if (t < 16) return "fint badevann";
  return "nesten sydentilstander";
}

async function loadOcean() {
  const res = await fetch(`https://api.met.no/weatherapi/oceanforecast/2.0/complete?lat=${POS.lat}&lon=${POS.lon}`);
  if (!res.ok) throw new Error("Havvarselet svarte ikke");
  const json = await res.json();
  const d = json.properties.timeseries[0].data.instant.details;

  if (d.sea_water_temperature != null) {
    setStat("#kSjoValue", `${nbNum(d.sea_water_temperature, 0)}°`);
    const ks = [capFirst(seaTempNote(d.sea_water_temperature))];
    if (d.sea_surface_wave_height != null) ks.push(`Bølger ${nbNum(d.sea_surface_wave_height)} m`);
    setText("#kSjoSub", ks.join(" · "));
  }
  if (d.sea_surface_wave_height != null) {
    setStat("#waveHeight", `${nbNum(d.sea_surface_wave_height)}<small> m</small>`);
    setText("#waveNote", waveNote(d.sea_surface_wave_height));
  }
  if (d.sea_water_speed != null) {
    setStat("#current", `${nbNum(d.sea_water_speed)}<small> m/s</small>`);
    if (d.sea_water_to_direction != null) setText("#currentNote", `setter mot ${compassName(d.sea_water_to_direction)}`);
  }
}

/* ---------- SOL & HIMMEL ---------- */

async function loadSun() {
  const today = dateKey(new Date());
  const res = await fetch(`https://api.met.no/weatherapi/sunrise/3.0/sun?lat=${POS.lat}&lon=${POS.lon}&date=${today}&offset=%2B02%3A00`);
  if (!res.ok) throw new Error("Soltidene svarte ikke");
  const json = await res.json();
  const p = json.properties;

  const rise = p.sunrise?.time ? new Date(p.sunrise.time) : null;
  const set = p.sunset?.time ? new Date(p.sunset.time) : null;
  const polarDay = !rise && !set && p.solarnoon?.visible;
  const polarNight = !rise && !set && !p.solarnoon?.visible;

  renderSunArc(rise, set, polarDay);

  const parts = [];
  if (polarDay) {
    parts.push(`<span class="midnight-badge">☀ Midnattssol — sola går ikke ned</span>`);
    setStat("#kSolValue", `24<small> t</small>`);
    setText("#kSolSub", "midnattssol — sola går ikke ned");
  } else if (polarNight) {
    parts.push(`<span class="midnight-badge">🌑 Mørketid — sola kommer ikke opp</span>`);
    setStat("#kSolValue", `0<small> t</small>`);
    setText("#kSolSub", "mørketid — sola kommer ikke opp");
  } else if (rise && set) {
    const lenMin = Math.round((set - rise) / 60e3);
    parts.push(`<span>Opp <strong>${fmtClock.format(rise)}</strong></span>`);
    parts.push(`<span>Ned <strong>${fmtClock.format(set)}</strong></span>`);
    parts.push(`<span>Daglengde <strong>${Math.floor(lenMin / 60)} t ${String(lenMin % 60).padStart(2, "0")} min</strong></span>`);
    const midEl = p.solarmidnight?.disc_centre_elevation;
    if (typeof midEl === "number" && midEl > -6) {
      parts.push(`<span>Aldri mørkere enn skumring i natt ✨</span>`);
    }
    setStat("#kSolValue", `${Math.floor(lenMin / 60)}<small> t </small>${String(lenMin % 60).padStart(2, "0")}<small> min</small>`);
    setText("#kSolSub", `Opp ${fmtClock.format(rise)} · Ned ${fmtClock.format(set)}`);
  }
  const times = $("#sunTimes");
  if (times) times.innerHTML = parts.join("");
}

function renderSunArc(rise, set, polarDay) {
  const wrap = $("#sunArcWrap");
  if (!wrap) return;

  const W = 320, H = 150, cx = 160, cy = 126, r = 104;
  let f = null;
  if (polarDay) f = 0.5;
  else if (rise && set) {
    const now = Date.now();
    if (now >= rise.getTime() && now <= set.getTime()) f = (now - rise.getTime()) / (set.getTime() - rise.getTime());
  }

  let sun = "";
  if (f != null) {
    const sx = cx - r * Math.cos(Math.PI * f);
    const sy = cy - r * Math.sin(Math.PI * f);
    sun = `<circle cx="${sx}" cy="${sy}" r="18" fill="#FFB475" opacity=".35"/>
           <circle cx="${sx}" cy="${sy}" r="8.5" fill="#FFB475" stroke="#E8933F" stroke-width="1.5"/>`;
  }

  wrap.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <path d="M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}" fill="none" stroke="#E6CDBE" stroke-width="1.6" stroke-dasharray="5 6"/>
    <line x1="10" y1="${cy}" x2="${W - 10}" y2="${cy}" stroke="#7A6E68" stroke-width="1.4"/>
    <text x="12" y="${cy + 20}" style="font:500 10px 'Spline Sans Mono',monospace;fill:#A08D82;letter-spacing:.1em">ØST</text>
    <text x="${W - 12}" y="${cy + 20}" text-anchor="end" style="font:500 10px 'Spline Sans Mono',monospace;fill:#A08D82;letter-spacing:.1em">VEST</text>
    ${sun}
    ${f == null ? `<text x="${cx}" y="${cy - 30}" text-anchor="middle" style="font:500 13px 'Montserrat',sans-serif;fill:#6E6E73">Sola er under horisonten</text>` : ""}
  </svg>`;
}

const himmelSub = { kp: "", moon: "" };
function updateHimmelSub() {
  const parts = [himmelSub.kp, himmelSub.moon].filter(Boolean);
  if (parts.length) setText("#kHimmelSub", parts.join(" · "));
}

function loadMoon() {
  const synodic = 29.53058867;
  const epoch = Date.UTC(2000, 0, 6, 18, 14) / 86400e3;
  const phase = (((Date.now() / 86400e3 - epoch) % synodic) + synodic) % synodic;
  const idx = Math.round((phase / synodic) * 8) % 8;
  const emoji = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"][idx];
  const names = ["Nymåne", "Voksende månesigd", "Første kvarter", "Voksende måne", "Fullmåne", "Minkende måne", "Siste kvarter", "Minkende månesigd"][idx];
  setText("#moonEmoji", emoji);
  setText("#moonName", names);
  himmelSub.moon = `${emoji} ${names.toLowerCase()}`;
  updateHimmelSub();
}

async function loadAurora() {
  const res = await fetch("https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json");
  if (!res.ok) throw new Error("NOAA svarte ikke");
  const rows = await res.json();
  const now = Date.now();
  const soon = rows.filter((r) => {
    const t = Date.parse(`${r.time_tag}Z`);
    return r.observed !== "observed" && t >= now - 3 * 3600e3 && t <= now + 24 * 3600e3;
  });
  if (!soon.length) throw new Error("Ingen varsel nå");
  const kp = Math.max(...soon.map((r) => Number(r.kp)));

  setText("#kpBadge", `Kp ${nbNum(kp)}`);
  const month = osloMonth(new Date());
  let text, chance;
  if (month >= 5 && month <= 7) {
    text = "For lyst i midnattssola — kom igjen i høstmørket.";
    chance = "For lyst nå";
  } else if (kp >= 4) {
    text = "Sterk aktivitet — ut og se mot nord!";
    chance = "Stor sjanse";
  } else if (kp >= 2) {
    text = "Gode sjanser ved klar himmel.";
    chance = "God sjanse";
  } else {
    text = "Rolig — men det kan blusse opp likevel.";
    chance = "Liten sjanse";
  }
  setText("#auroraText", text);
  setText("#kHimmelValue", chance);
  himmelSub.kp = `Kp ${nbNum(kp)}`;
  updateHimmelSub();
}

/* ---------- BLÅSKJELL + POLLEN ---------- */

function initShell() {
  const m = osloMonth(new Date());
  const inSeason = m >= 3 && m <= 10;
  setText(
    "#shellNote",
    inSeason
      ? "I sesong — Mattilsynet publiserer nytt varsel hver fredag. Nærmeste prøvepunkt: Bodø (Kobbvika i Festvåg)."
      : "Utenfor varslingssesongen (mars–oktober). Nærmeste prøvepunkt: Bodø (Kobbvika i Festvåg)."
  );
}

function initPollen() {
  const m = osloMonth(new Date());
  let type, note;
  if (m <= 2) { type = "Rolig"; note = "Lite pollen i lufta nå"; }
  else if (m <= 4) { type = "Or og hassel"; note = "Tidlig trepollensesong"; }
  else if (m === 5) { type = "Bjørk"; note = "Bjørkesesong i nord"; }
  else if (m <= 8) { type = "Gress"; note = "Gressesongen pågår"; }
  else { type = "Rolig"; note = "Pollensesongen er på hell"; }
  setText("#kPollenValue", type);
  setText("#kPollenSub", note);
}

/* ---------- NYHETER FRA MELØY KOMMUNE ---------- */

async function loadNews() {
  const list = $("#newsList");
  if (!list) return;
  try {
    // /meloy-proxy/ videresendes til meloy.kommune.no — av dev-serveren lokalt
    // og av Netlify (netlify.toml) i produksjon.
    const res = await fetch("/meloy-proxy/");
    if (!res.ok) throw new Error("proxy nede");
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const seen = new Set();
    const items = [];
    doc.querySelectorAll('a[href*="/nyheter/"]').forEach((a) => {
      const href = a.getAttribute("href");
      const title = a.textContent.trim().replace(/\s+/g, " ");
      if (!href || !title || title.length < 12 || seen.has(href)) return;
      seen.add(href);
      items.push({ title, url: new URL(href, "https://www.meloy.kommune.no").href });
    });
    if (!items.length) throw new Error("fant ingen saker");
    list.innerHTML = items
      .slice(0, 5)
      .map((i) => `<a class="news-item" href="${i.url}" target="_blank" rel="noopener"><span class="news-title">${escapeHtml(i.title)}</span><span class="news-arrow">↗</span></a>`)
      .join("");
  } catch (err) {
    console.warn("Nyheter:", err);
    list.innerHTML = `<a class="news-item" href="https://www.meloy.kommune.no" target="_blank" rel="noopener"><span class="news-title">Fikk ikke hentet nyhetene automatisk — les dem hos Meløy kommune</span><span class="news-arrow">↗</span></a>`;
  }
}

/* ---------- WEBKAMERA ---------- */

function initWebcam() {
  const card = $("#camCard");
  if (!card) return;
  const { url, type, refreshSec } = CONFIG.webcam;

  if (!url) {
    card.innerHTML = `
      <div class="cam-placeholder">
        <span class="cam-ico">📷</span>
        <strong>Kamera kommer</strong>
        <p>Lim inn adressen i <code>CONFIG.webcam.url</code> øverst i <code>app.js</code>.
        Har du Foscam? Se «Webkamera» i <code>README.md</code> — og ikke legg brukernavn og passord på en offentlig side.</p>
      </div>`;
    return;
  }

  if (type === "iframe") {
    card.innerHTML = `<div class="cam-live"><iframe src="${url}" title="Webkamera på Engøya" loading="lazy" allowfullscreen></iframe></div>`;
    return;
  }

  card.innerHTML = `
    <div class="cam-live">
      <img id="camImg" src="${url}" alt="Direktebilde fra webkameraet på Engøya">
      <span class="cam-stamp" id="camStamp">direkte</span>
    </div>`;

  const img = $("#camImg");
  const stamp = $("#camStamp");
  const refresh = () => {
    const sep = url.includes("?") ? "&" : "?";
    img.src = `${url}${sep}t=${Date.now()}`;
    stamp.textContent = `oppdatert ${fmtClockSec.format(new Date())}`;
  };
  img.addEventListener("error", () => {
    stamp.textContent = "får ikke kontakt med kameraet";
  });
  if (refreshSec > 0) setInterval(refresh, refreshSec * 1000);
  stamp.textContent = `hentet ${fmtClockSec.format(new Date())}`;
}

/* ---------- DAGSKORT-KARUSELL ---------- */

function initCarousel() {
  const track = $("#kortTrack");
  const prev = $("#kortPrev");
  const next = $("#kortNext");
  if (!track || !prev || !next) return;

  const step = () => {
    const card = track.querySelector(".kort");
    if (!card) return 320;
    return card.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).gap) || 13);
  };

  const update = () => {
    prev.disabled = track.scrollLeft < 10;
    next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 10;
  };
  const go = (dir) => {
    const from = track.scrollLeft;
    const target = from + dir * step();
    track.scrollBy({ left: dir * step(), behavior: "smooth" });
    setTimeout(() => {
      if (Math.abs(track.scrollLeft - from) < 4) track.scrollTo({ left: target, behavior: "instant" });
      update();
    }, 450);
  };
  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));

  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ---------- OPPSTART ---------- */

function initReveal() {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.08 }
  );
  document.querySelectorAll(".sec").forEach((s) => io.observe(s));
}

initMenu();
initReveal();
initMap();
initWebcam();
initShell();
initPollen();
initCarousel();
loadMoon();
loadNews();

loadTide().catch((err) => {
  console.warn("Tidevann:", err);
  setText("#kTideLabel", "Tidevann");
  setText("#kTideSub", "fikk ikke hentet data");
  showError($("#tideDays"), "Fikk ikke hentet tidevann fra Kartverket — prøv å laste siden på nytt.");
  $("#tideChartLoading")?.remove();
});
loadWeather().catch((err) => {
  console.warn("Vær:", err);
  showError($("#forecastGrid"), "Fikk ikke hentet værvarselet fra Yr.");
  showError($("#teleLoading"), "Fikk ikke hentet telemetri fra Yr.");
});
loadOcean().catch((err) => {
  console.warn("Hav:", err);
  setText("#waveNote", "fikk ikke kontakt med havvarselet");
});
loadSun().catch((err) => {
  console.warn("Sol:", err);
  showError($("#sunTimes"), "Fikk ikke hentet soltidene.");
});
loadAurora().catch((err) => {
  console.warn("Nordlys:", err);
  setText("#auroraText", "Fikk ikke hentet romværet.");
});

// Samtykke til besøksstatistikk (Google Analytics) — ingen måling uten et aktivt «ja».
// Valget lagres i localStorage («engoya-samtykke»: ja/nei) og gjelder alle sidene.
(function(){
  var GA_ID = "G-0KD0LBJ22P";

  function startGA(){
    if (window.gtagStartet) return; window.gtagStartet = true;
    var s = document.createElement("script"); s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", GA_ID);
  }

  var valg = null;
  try { valg = localStorage.getItem("engoya-samtykke"); } catch(e) {}
  if (valg === "ja") { startGA(); return; }
  if (valg === "nei") return;

  function visBanner(){
    var b = document.createElement("div");
    b.id = "samtykkeBanner";
    b.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:520px;margin:0 auto;" +
      "background:#12313d;color:#f6ecd0;border:2px solid #2a5462;border-radius:14px;padding:14px 16px;" +
      "box-shadow:0 6px 24px rgba(0,0,0,.35);font-family:inherit;font-size:15px;line-height:1.45";
    b.innerHTML = '🍪 Vi bruker informasjonskapsler til anonym besøksstatistikk (Google Analytics), ' +
      'så vi ser hvor mange som er innom Engøya-sidene. Er det greit?' +
      '<div style="display:flex;gap:10px;margin-top:12px;justify-content:flex-end">' +
      '<button id="samtykkeNei" style="background:none;border:2px solid #4a7482;color:#f6ecd0;border-radius:10px;padding:8px 14px;font-size:14px;cursor:pointer">Nei takk</button>' +
      '<button id="samtykkeJa" style="background:#d9a94b;border:0;color:#3a2e05;font-weight:700;border-radius:10px;padding:8px 18px;font-size:14px;cursor:pointer;box-shadow:0 3px 0 #8a6a1e">Det er greit</button>' +
      '</div>';
    document.body.appendChild(b);
    function svar(v){ try { localStorage.setItem("engoya-samtykke", v); } catch(e) {}
      b.remove(); if (v === "ja") startGA(); }
    document.getElementById("samtykkeJa").onclick = function(){ svar("ja"); };
    document.getElementById("samtykkeNei").onclick = function(){ svar("nei"); };
  }

  if (document.body) visBanner();
  else document.addEventListener("DOMContentLoaded", visBanner);
})();

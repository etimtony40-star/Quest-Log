/* QuestLog Loading Screen
   Shows a styled splash for exactly 1.9 seconds, then fades out.
   Usage: put this as the FIRST script inside <head> so it appears instantly:
     <script src="loader.js"></script>
   Nothing else in your site needs to change. */
(function () {
  var TOTAL = 1900; // total time on screen (ms)
  var FADE = 300; // fade-out is the last 300ms of the 1.9s
  var start = Date.now();
  var root = document.documentElement;

  // Match the loader colors to the player's equipped theme (falls back to classic)
  var THEMES = {
    classic: ["#090d16", "#f59e0b", "#fde047"],
    pixel: ["#0b0b1e", "#fcd34d", "#f97316"],
    cyberpunk: ["#05010f", "#00f0ff", "#ff2bd6"],
    elven: ["#07140d", "#a3e635", "#34d399"],
    vampire: ["#12040a", "#fb7185", "#e11d48"],
  };
  var theme = "classic";
  try {
    var saved = JSON.parse(localStorage.getItem("questlog_rpg_v1"));
    if (saved && saved.rpg && saved.rpg.shop && THEMES[saved.rpg.shop.theme])
      theme = saved.rpg.shop.theme;
  } catch (e) {}
  var c = THEMES[theme];

  var TIPS = [
    "Sharpening swords…",
    "Counting the gold…",
    "Summoning the quest board…",
    "Awakening the hero…",
  ];

  var css = [
    "#ql-loader{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;",
    'background:var(--bg);color:#e2e8f0;font-family:Cinzel,Georgia,"Times New Roman",serif;overflow:hidden;',
    "opacity:1;transition:opacity " +
      FADE +
      "ms ease-out;padding:env(safe-area-inset-top) 16px env(safe-area-inset-bottom)}",
    "#ql-loader.ql-out{opacity:0;pointer-events:none}",
    "#ql-loader .ql-glow{position:absolute;width:140vmax;height:140vmax;left:50%;top:50%;transform:translate(-50%,-50%);",
    "background:radial-gradient(circle at center,color-mix(in srgb,var(--a) 22%,transparent) 0,transparent 38%);",
    "animation:qlBreathe 2.4s ease-in-out infinite}",
    "#ql-loader .ql-wrap{position:relative;width:min(88vw,420px);text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px}",
    "#ql-loader .ql-logo{width:92px;height:92px;border-radius:24px;padding:4px;background:linear-gradient(135deg,var(--b),var(--a));",
    "box-shadow:0 0 40px color-mix(in srgb,var(--a) 55%,transparent);animation:qlFloat 1.6s ease-in-out infinite}",
    "#ql-loader .ql-logo div{width:100%;height:100%;border-radius:20px;background:#0f172a;display:flex;align-items:center;justify-content:center;font-size:46px;line-height:1}",
    "#ql-loader .ql-title{font-size:clamp(1.9rem,8vw,2.8rem);font-weight:800;letter-spacing:.14em;text-transform:uppercase;line-height:1.1;",
    "background:linear-gradient(90deg,var(--a),var(--b),var(--a));-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}",
    "#ql-loader .ql-sub{font-size:clamp(.7rem,3vw,.85rem);color:#94a3b8;letter-spacing:.06em;margin:0}",
    "#ql-loader .ql-bar{width:100%;height:12px;border-radius:99px;background:rgba(2,6,23,.85);border:1px solid rgba(148,163,184,.3);overflow:hidden;margin-top:10px;padding:2px;box-sizing:border-box}",
    "#ql-loader .ql-bar i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,var(--b),var(--a));",
    "box-shadow:0 0 12px var(--a);animation:qlFill " +
      (TOTAL - FADE) +
      "ms cubic-bezier(.35,.1,.25,1) forwards}",
    "#ql-loader .ql-meta{width:100%;display:flex;justify-content:space-between;gap:10px;font-size:.75rem;color:#94a3b8;letter-spacing:.04em}",
    "#ql-loader .ql-meta b{color:var(--a);font-variant-numeric:tabular-nums;min-width:3.2em;text-align:right}",
    "#ql-loader .ql-ember{position:absolute;bottom:-12px;width:6px;height:6px;border-radius:50%;background:var(--a);opacity:0;",
    "box-shadow:0 0 10px var(--a);animation:qlRise 1.9s ease-in infinite}",
    "@keyframes qlFill{0%{width:0}100%{width:100%}}",
    "@keyframes qlFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}",
    "@keyframes qlBreathe{0%,100%{opacity:.6}50%{opacity:1}}",
    "@keyframes qlRise{0%{transform:translateY(0) scale(1);opacity:0}15%{opacity:.9}100%{transform:translateY(-105vh) scale(.4);opacity:0}}",
    "@media (prefers-reduced-motion:reduce){#ql-loader .ql-logo,#ql-loader .ql-glow,#ql-loader .ql-ember{animation:none}}",
  ].join("");

  var style = document.createElement("style");
  style.id = "ql-loader-style";
  style.textContent = css;
  root.appendChild(style);

  var el = document.createElement("div");
  el.id = "ql-loader";
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-label", "Loading QuestLog");
  el.style.setProperty("--bg", c[0]);
  el.style.setProperty("--a", c[1]);
  el.style.setProperty("--b", c[2]);

  var embers = "";
  for (var i = 0; i < 14; i++) {
    embers +=
      '<span class="ql-ember" style="left:' +
      (Math.random() * 100).toFixed(1) +
      "%;animation-delay:-" +
      (Math.random() * 1.9).toFixed(2) +
      "s;animation-duration:" +
      (1.5 + Math.random() * 1.2).toFixed(2) +
      's"></span>';
  }
  el.innerHTML =
    '<div class="ql-glow"></div>' +
    embers +
    '<div class="ql-wrap">' +
    '<div class="ql-logo"><div>⚔️</div></div>' +
    '<div class="ql-title">QuestLog</div>' +
    '<p class="ql-sub">Turn daily struggles into legendary conquests</p>' +
    '<div class="ql-bar"><i></i></div>' +
    '<div class="ql-meta"><span id="ql-tip">' +
    TIPS[0] +
    '</span><b id="ql-pct">0%</b></div>' +
    "</div>";
  root.appendChild(el);

  // Stop the page behind from scrolling while loading
  var prevOverflow = root.style.overflow;
  root.style.overflow = "hidden";

  // Percentage counter + rotating tips, driven by real elapsed time
  var pct = null,
    tip = null;
  function tick() {
    var t = Date.now() - start;
    pct = pct || document.getElementById("ql-pct");
    tip = tip || document.getElementById("ql-tip");
    var p = Math.min(100, Math.round((t / (TOTAL - FADE)) * 100));
    if (pct) pct.textContent = p + "%";
    if (tip)
      tip.textContent =
        TIPS[
          Math.min(
            TIPS.length - 1,
            Math.floor(t / ((TOTAL - FADE) / TIPS.length)),
          )
        ];
    if (t < TOTAL - FADE) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Fade out for the last 300ms, then remove everything at exactly 1.9s
  setTimeout(function () {
    el.classList.add("ql-out");
  }, TOTAL - FADE);
  setTimeout(function () {
    if (el.parentNode) el.parentNode.removeChild(el);
    if (style.parentNode) style.parentNode.removeChild(style);
    root.style.overflow = prevOverflow;
  }, TOTAL);
})();

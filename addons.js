/* QuestLog Add-ons: Loot & Inventory, Tavern Shop + 5 themes, Skill Trees,
   Dungeon Raid timer, Hero's Ledger, Spell-Book backup.
   Usage: put <script src="questlog-addons.js"></script> right before </body>,
   AFTER your main <script>. Nothing in your original code is modified. */
(function () {
  const $ = (id) => document.getElementById(id);
  const doc = document.documentElement;

  /* ---------- DATA ---------- */
  const RARITY = {
    common: { label: "Common", color: "#94a3b8" },
    rare: { label: "Rare", color: "#38bdf8" },
    epic: { label: "Epic", color: "#c084fc" },
    legendary: { label: "Legendary", color: "#f59e0b" },
  };
  const ATTRS = {
    strength: { label: "Strength", icon: "💪", hint: "Gym / Health" },
    intellect: { label: "Intellect", icon: "🧠", hint: "Coding / Reading" },
    charisma: {
      label: "Charisma",
      icon: "🗣️",
      hint: "Networking / Socializing",
    },
  };
  const SLOTS = {
    head: "🪖",
    weapon: "🗡️",
    body: "🛡️",
    ring: "💍",
    boots: "👢",
    trinket: "📿",
  };
  // a = attribute boosted, v = bonus amount, s = slot
  const LOOT_DB = {
    common: [
      {
        id: "c1",
        n: "Worn Leather Cap",
        s: "head",
        e: "🎩",
        a: "strength",
        v: 1,
      },
      {
        id: "c2",
        n: "Quill of Notes",
        s: "weapon",
        e: "🪶",
        a: "intellect",
        v: 1,
      },
      { id: "c3", n: "Patched Tunic", s: "body", e: "👕", a: "charisma", v: 1 },
      { id: "c4", n: "Travel Boots", s: "boots", e: "👞", a: "strength", v: 1 },
      { id: "c5", n: "Copper Ring", s: "ring", e: "💍", a: "charisma", v: 2 },
    ],
    rare: [
      {
        id: "r1",
        n: "Steel Helm of Resolve",
        s: "head",
        e: "⛑️",
        a: "strength",
        v: 3,
      },
      {
        id: "r2",
        n: "Ergonomic Mouse of Precision",
        s: "weapon",
        e: "🖱️",
        a: "intellect",
        v: 3,
      },
      {
        id: "r3",
        n: "Silken Cloak of Charm",
        s: "body",
        e: "🧥",
        a: "charisma",
        v: 3,
      },
      {
        id: "r4",
        n: "Boots of Swift Strides",
        s: "boots",
        e: "🥾",
        a: "strength",
        v: 3,
      },
    ],
    epic: [
      {
        id: "e1",
        n: "Titanium Keyboard of Focus",
        s: "weapon",
        e: "⌨️",
        a: "intellect",
        v: 5,
      },
      {
        id: "e2",
        n: "Crown of the Silver Tongue",
        s: "head",
        e: "👑",
        a: "charisma",
        v: 5,
      },
      {
        id: "e3",
        n: "Dragonscale Vest",
        s: "body",
        e: "🦺",
        a: "strength",
        v: 5,
      },
      {
        id: "e4",
        n: "Amulet of Endless Coffee",
        s: "trinket",
        e: "☕",
        a: "intellect",
        v: 4,
      },
    ],
    legendary: [
      {
        id: "l1",
        n: "Excalibur, the Deadline Slayer",
        s: "weapon",
        e: "⚔️",
        a: "strength",
        v: 8,
      },
      {
        id: "l2",
        n: "Orb of Omniscient Docs",
        s: "trinket",
        e: "🔮",
        a: "intellect",
        v: 8,
      },
      {
        id: "l3",
        n: "Mantle of the Guildmaster",
        s: "body",
        e: "🎖️",
        a: "charisma",
        v: 8,
      },
      {
        id: "l4",
        n: "Signet of the Eternal Streak",
        s: "ring",
        e: "🧿",
        a: "intellect",
        v: 7,
      },
    ],
  };
  const ITEMS = {};
  Object.keys(LOOT_DB).forEach((r) =>
    LOOT_DB[r].forEach((i) => {
      ITEMS[i.id] = Object.assign({ r }, i);
    }),
  );

  const SKILLS = {
    strength: [
      { n: "Iron Skin", req: 2, ic: "🛡️", fx: { gold: 0.05 } },
      { n: "Berserker Rage", req: 4, ic: "🔥", fx: { xp: 0.05 } },
      { n: "Titan Soul", req: 6, ic: "🏔️", fx: { xp: 0.05, luck: 6 } },
    ],
    intellect: [
      { n: "Scholar's Eye", req: 2, ic: "👁️", fx: { xp: 0.05 } },
      { n: "Arcane Insight", req: 4, ic: "📖", fx: { xp: 0.05, gold: 0.05 } },
      { n: "Archmage Mind", req: 6, ic: "🌌", fx: { xp: 0.1, luck: 4 } },
    ],
    charisma: [
      { n: "Silver Tongue", req: 2, ic: "💬", fx: { gold: 0.05 } },
      { n: "Guild Leader", req: 4, ic: "🏰", fx: { gold: 0.1 } },
      { n: "Realm Legend", req: 6, ic: "🎭", fx: { gold: 0.05, luck: 8 } },
    ],
  };

  const THEMES = [
    {
      id: "classic",
      n: "Classic Guild Hall",
      cost: 0,
      d: "The original QuestLog look.",
      sw: ["#f59e0b", "#1e293b", "#090d16"],
    },
    {
      id: "pixel",
      n: "Retro 8-Bit Pixel Dungeon",
      cost: 40,
      d: "Blocky corners, arcade fonts, checkered floors.",
      sw: ["#fcd34d", "#22224a", "#0b0b1e"],
    },
    {
      id: "cyberpunk",
      n: "Cyberpunk Neon Tavern",
      cost: 60,
      d: "Neon glow, grid lines and a rainy-night vibe.",
      sw: ["#00f0ff", "#1a0b3a", "#05010f"],
    },
    {
      id: "elven",
      n: "Minimalist Elven Woods",
      cost: 50,
      d: "Calm forest greens and storybook serifs.",
      sw: ["#a3e635", "#163528", "#07140d"],
    },
    {
      id: "vampire",
      n: "Crimson Vampire Keep",
      cost: 80,
      d: "Blood-red accents in a gothic castle.",
      sw: ["#fb7185", "#331019", "#12040a"],
    },
  ];

  /* ---------- STATE ---------- */
  function ensure() {
    const r = (state.rpg = state.rpg || {});
    r.inventory = r.inventory || [];
    r.equipped = r.equipped || {};
    r.attrXP = Object.assign(
      { strength: 0, intellect: 0, charisma: 0 },
      r.attrXP,
    );
    r.shop = r.shop || {};
    r.shop.owned = r.shop.owned || ["classic"];
    if (!r.shop.owned.includes("classic")) r.shop.owned.push("classic");
    r.shop.theme = r.shop.theme || "classic";
    r.history = r.history || [];
    r.raids = Object.assign({ won: 0, fled: 0, lost: 0 }, r.raids);
    r.chests = r.chests || 0;
    doc.setAttribute(
      "data-theme",
      r.shop.owned.includes(r.shop.theme) ? r.shop.theme : "classic",
    );
  }

  /* ---------- RNG ---------- */
  function weightedPick(list, weightFn) {
    const total = list.reduce((s, i) => s + weightFn(i), 0);
    let r = Math.random() * total;
    for (const i of list) {
      r -= weightFn(i);
      if (r <= 0) return i;
    }
    return list[list.length - 1];
  }
  function rollLoot(boost, luck) {
    boost = boost || 0;
    luck = luck || 0;
    const w = {
      common: Math.max(10, 60 - boost * 1.2 - luck),
      rare: 25,
      epic: 11 + boost * 0.6,
      legendary: 4 + boost * 0.4 + luck * 0.5,
    };
    const rk = weightedPick(Object.keys(RARITY), (k) => w[k]);
    return ITEMS[weightedPick(LOOT_DB[rk], () => 1).id];
  }

  /* ---------- STATS & SKILLS ---------- */
  const baseLevel = (a) => 1 + Math.floor(Math.sqrt(state.rpg.attrXP[a] / 25));
  const gearBonus = (a) =>
    Object.values(state.rpg.equipped).reduce(
      (s, id) => s + (ITEMS[id] && ITEMS[id].a === a ? ITEMS[id].v : 0),
      0,
    );
  const effLevel = (a) => baseLevel(a) + Math.floor(gearBonus(a) / 2);
  function unlockedList(a) {
    let prev = true;
    return SKILLS[a].map((n) => (prev = prev && effLevel(a) >= n.req));
  }
  function bonuses() {
    const b = { xp: 0, gold: 0, luck: 0 };
    Object.keys(SKILLS).forEach((a) =>
      unlockedList(a).forEach((on, i) => {
        if (on) for (const k in SKILLS[a][i].fx) b[k] += SKILLS[a][i].fx[k];
      }),
    );
    return b;
  }
  const fxText = (fx) =>
    Object.keys(fx)
      .map((k) =>
        k === "luck"
          ? `+${fx[k]} Luck`
          : `+${Math.round(fx[k] * 100)}% ${k === "xp" ? "XP" : "Gold"}`,
      )
      .join(", ");
  function topTitle() {
    let best = null;
    Object.keys(SKILLS).forEach((a) =>
      unlockedList(a).forEach((on, i) => {
        if (on && (!best || SKILLS[a][i].req >= best.req)) best = SKILLS[a][i];
      }),
    );
    return best ? best.n : null;
  }

  function grantRewards(xp, gold) {
    const c = state.character;
    c.currentXP += xp;
    c.gold += gold;
    c.stats.totalXpEarned = (c.stats.totalXpEarned || 0) + xp;
    let up = false,
      n = 0;
    while (c.currentXP >= c.xpNeededForNextLevel) {
      up = true;
      n++;
      c.currentXP -= c.xpNeededForNextLevel;
      c.level += 1;
      c.xpNeededForNextLevel = Math.round(c.xpNeededForNextLevel * 1.2);
      c.gold += 10;
    }
    saveState();
    render();
    if (up) {
      playSound("levelup");
      showLevelUpModal(n);
    }
  }
  const mid = () => [window.innerWidth / 2, window.innerHeight / 2];

  /* ---------- STYLES / FONTS / LIBS ---------- */
  const css = `
  :root{--rc:#94a3b8}
  .hub-tab.on{background:#f59e0b!important;color:#020617!important}
  .hub-pane{display:none}.hub-pane.on{display:block}
  .doll{display:grid;grid-template-columns:repeat(3,64px);grid-auto-rows:64px;gap:10px;justify-content:center}
  .slot{border:2px dashed #475569;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:26px;background:rgba(2,6,23,.6);cursor:pointer;position:relative}
  .slot small{font-size:8px;opacity:.7;text-transform:uppercase;letter-spacing:.05em}
  .slot.full{border-style:solid;border-color:var(--rc);box-shadow:0 0 12px var(--rc)}
  .slot.empty{opacity:.45}
  .doll-avatar{font-size:38px;border:3px solid #f59e0b;border-radius:18px;background:#020617;display:flex;align-items:center;justify-content:center}
  .inv-item{border:2px solid var(--rc);border-radius:12px;padding:8px 4px;text-align:center;background:rgba(2,6,23,.6);cursor:pointer;transition:transform .15s;position:relative}
  .inv-item:hover{transform:translateY(-3px);box-shadow:0 0 14px var(--rc)}
  .inv-item .nm{font-size:10px;line-height:1.15;margin-top:2px;color:#e2e8f0}
  .inv-item .eq{position:absolute;top:-8px;right:-6px;font-size:9px;font-weight:800;background:#10b981;color:#022c22;border-radius:9px;padding:1px 6px}
  @keyframes chestBounce{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-18px) rotate(2deg)}}
  .chest-scene{perspective:900px;width:210px;height:250px;margin:0 auto;animation:chestBounce 1s ease-in-out infinite;cursor:pointer}
  .chest-scene.flipped{animation:none}
  .chest-inner{position:relative;width:100%;height:100%;transition:transform .85s cubic-bezier(.2,.8,.2,1);transform-style:preserve-3d}
  .chest-scene.flipped .chest-inner{transform:rotateY(180deg)}
  .chest-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px;text-align:center}
  .chest-front{font-size:96px;background:radial-gradient(circle,#78350f,#1c0f05);border:3px solid #f59e0b;box-shadow:0 0 40px rgba(245,158,11,.55)}
  .chest-back{transform:rotateY(180deg);background:linear-gradient(160deg,#0f172a,#020617);border:3px solid var(--rc);box-shadow:0 0 45px var(--rc)}
  .bar{height:12px;border-radius:99px;background:rgba(2,6,23,.8);border:1px solid #334155;overflow:hidden}
  .bar>div{height:100%;transition:width .4s}
  @keyframes bossFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-10px) scale(1.06)}}
  .boss{font-size:84px;animation:bossFloat 2.4s ease-in-out infinite;display:inline-block}
  .parch{background:radial-gradient(ellipse at center,#f3e2b3 0%,#e2c88a 70%,#c9a45f 100%);color:#4a2c12;border:3px solid #7a4e1d;box-shadow:inset 0 0 50px rgba(120,70,20,.45),0 10px 30px rgba(0,0,0,.5);font-family:'IM Fell English','Cinzel',Georgia,serif}
  .parch h3,.parch h4{font-family:'Cinzel',Georgia,serif;color:#5b3210}
  .parch .fact{border-bottom:1px dashed rgba(91,50,16,.5)}
  .tree-wrap svg text{font-family:inherit;fill:#e2e8f0}
  /* ===== THEMES (switched with <html data-theme="...">) ===== */
  html[data-theme="pixel"]{--bg:#0b0b1e;--surf:#14142e;--card:#22224a;--bd:#5a5ad8;--ac:#fcd34d;--ac2:#f97316;--tx:#e5e7ff;--hf:'Press Start 2P',monospace;--bf:'Courier New',monospace;
    --pat:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='16' height='16' fill='%23101030'/%3E%3Crect x='16' y='16' width='16' height='16' fill='%23101030'/%3E%3C/svg%3E")}
  html[data-theme="cyberpunk"]{--bg:#05010f;--surf:#0d0221;--card:#1a0b3a;--bd:#7a2cff;--ac:#00f0ff;--ac2:#ff2bd6;--tx:#e0f7ff;--hf:'Orbitron',sans-serif;--bf:system-ui,sans-serif;
    --pat:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cpath d='M48 0H0v48' fill='none' stroke='%23ff2bd6' stroke-opacity='.12'/%3E%3C/svg%3E")}
  html[data-theme="elven"]{--bg:#07140d;--surf:#0d2418;--card:#163528;--bd:#3f7a52;--ac:#a3e635;--ac2:#34d399;--tx:#e8f5e0;--hf:'IM Fell English',Georgia,serif;--bf:Georgia,serif;
    --pat:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cpath d='M10 70q20-40 40-10q-20 25-40 10zM60 25q15-25 28-5q-12 18-28 5z' fill='%23a3e635' fill-opacity='.07'/%3E%3C/svg%3E")}
  html[data-theme="vampire"]{--bg:#12040a;--surf:#1f0a12;--card:#331019;--bd:#7f1d36;--ac:#fb7185;--ac2:#e11d48;--tx:#fde8ec;--hf:'Cinzel',Georgia,serif;--bf:Georgia,serif;
    --pat:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 40L40 0' stroke='%23e11d48' stroke-opacity='.1'/%3E%3C/svg%3E")}
  html:not([data-theme="classic"]) body#app-body{background-color:var(--bg)!important;background-image:var(--pat);color:var(--tx);font-family:var(--bf)}
  html:not([data-theme="classic"]) [class*="bg-slate-9"]{background-color:var(--surf)!important}
  html:not([data-theme="classic"]) [class*="bg-slate-8"]{background-color:var(--card)!important}
  html:not([data-theme="classic"]) [class*="from-slate"]{background-image:none!important;background-color:var(--card)!important}
  html:not([data-theme="classic"]) [class*="border-slate-"]{border-color:var(--bd)!important}
  html:not([data-theme="classic"]) [class*="text-slate-1"],html:not([data-theme="classic"]) [class*="text-slate-2"],html:not([data-theme="classic"]) [class*="text-slate-3"]{color:var(--tx)!important}
  html:not([data-theme="classic"]) [class*="text-amber-"],html:not([data-theme="classic"]) [class*="border-amber-"]{color:var(--ac)!important}
  html:not([data-theme="classic"]) [class*="border-amber-"]{border-color:var(--ac)!important}
  html:not([data-theme="classic"]) [class*="from-amber"]{--tw-gradient-from:var(--ac)!important;--tw-gradient-via:var(--ac2)!important;--tw-gradient-to:var(--ac)!important;--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-via),var(--tw-gradient-to)!important}
  html:not([data-theme="classic"]) h1,html:not([data-theme="classic"]) h2,html:not([data-theme="classic"]) h3{font-family:var(--hf)}
  html:not([data-theme="classic"]) .hub-tab.on{background:var(--ac)!important}
  html:not([data-theme="classic"]) .slot,html:not([data-theme="classic"]) .doll-avatar{border-color:var(--bd)}
  html[data-theme="pixel"] *{border-radius:0!important}
  html[data-theme="pixel"] h1,html[data-theme="pixel"] h2,html[data-theme="pixel"] h3{letter-spacing:0;line-height:1.5}
  html[data-theme="pixel"] h1{font-size:1.1rem}
  html[data-theme="cyberpunk"] h1,html[data-theme="cyberpunk"] h2,html[data-theme="cyberpunk"] h3{text-shadow:0 0 10px var(--ac)}
  html[data-theme="cyberpunk"] section{box-shadow:0 0 22px rgba(255,43,214,.18)!important}
  html[data-theme="elven"] h1,html[data-theme="elven"] h2,html[data-theme="elven"] h3{font-style:italic}
  html[data-theme="pixel"] h2{font-size:1rem}
  html[data-theme="pixel"] h3{font-size:.8rem}
  /* ===== RESPONSIVE LAYER (applies to every theme) ===== */
  html,body{max-width:100%;overflow-x:hidden}
  body{padding-bottom:env(safe-area-inset-bottom)}
  img,svg,canvas,video{max-width:100%}
  button,select,summary{touch-action:manipulation}
  .float-text{position:fixed!important}
  h1,h2,h3,h4,h5,p,label,.nm{overflow-wrap:anywhere}
  #hub,#hub *{min-width:0}
  #theme-switcher{max-width:100%;text-overflow:ellipsis}
  header .gap-2{flex-wrap:wrap}
  #level-modal>div,#avatar-modal>div,#chest-modal>div{max-height:92vh;max-height:92dvh;overflow-y:auto}
  #chest-modal{overflow-y:auto}
  .hub-tab{white-space:nowrap;flex:0 0 auto;min-height:38px}
  #tree-svg{overflow-x:auto}
  @media (max-width:640px){
    header{text-align:center}
    header>div{justify-content:center;flex-wrap:wrap;width:100%}
    header .gap-2{justify-content:center}
    #theme-switcher{max-width:48vw}
    input,select,textarea{font-size:16px!important}
    #hub{padding:1rem}
    #hub>div:first-child{flex-wrap:nowrap!important;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch}
    #raid-duration{width:100%!important}
    #raid-idle .flex{flex-direction:column;align-items:stretch}
    .parch{padding:1rem!important}
    .chest-scene{width:180px;height:220px}
    .chest-front{font-size:80px}
    .boss{font-size:64px}
    .float-text{font-size:.8rem}
    html[data-theme="pixel"] h1{font-size:.8rem}
    html[data-theme="pixel"] h2{font-size:.85rem}
    html[data-theme="pixel"] h3{font-size:.65rem}
    html[data-theme="cyberpunk"] h1{letter-spacing:.04em}
  }
  @media (max-width:360px){
    .doll{grid-template-columns:repeat(3,56px);grid-auto-rows:56px;gap:8px}
    .slot{font-size:22px}
  }
  `;
  const st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);
  const fl = document.createElement("link");
  fl.rel = "stylesheet";
  fl.href =
    "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=IM+Fell+English&family=Orbitron:wght@500;800&family=Press+Start+2P&display=swap";
  document.head.appendChild(fl);
  // Favicon = the QuestLog logo (gold gradient tile + dark inner square + crossed swords)
  (function () {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#d97706"/><stop offset=".5" stop-color="#f59e0b"/><stop offset="1" stop-color="#fde047"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><rect x="4" y="4" width="56" height="56" rx="13" fill="#0f172a"/><text x="32" y="33" font-size="36" text-anchor="middle" dominant-baseline="central">⚔️</text></svg>`;
    document.querySelectorAll('link[rel~="icon"]').forEach((l) => l.remove());
    const ic = document.createElement("link");
    ic.rel = "icon";
    ic.type = "image/svg+xml";
    ic.href = "data:image/svg+xml," + encodeURIComponent(svg);
    document.head.appendChild(ic);
  })();
  const cj = document.createElement("script");
  cj.src =
    "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
  cj.onload = () => {
    if ($("tab-ledger").classList.contains("on")) renderLedger();
  };
  document.head.appendChild(cj);

  /* ---------- INJECT MARKUP ---------- */
  const selCls =
    "w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer";
  $("toggle-audio-btn").insertAdjacentHTML(
    "beforebegin",
    `<select id="theme-switcher" onchange="QL.themeSelect(this.value)" title="Switch theme" class="px-2 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300 cursor-pointer"></select>`,
  );
  $("reward-preview-pill").parentElement.insertAdjacentHTML(
    "beforebegin",
    `<div><label for="quest-attr" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Discipline <span class="text-slate-500 normal-case font-medium">(feeds your skill tree · Hard quests always drop loot)</span></label>
      <select id="quest-attr" class="${selCls}">
        <option value="strength">💪 Strength — Gym / Health</option>
        <option value="intellect" selected>🧠 Intellect — Coding / Reading</option>
        <option value="charisma">🗣️ Charisma — Networking / Socializing</option>
      </select></div>`,
  );

  const tabs = [
    ["inv", "🎒 Inventory"],
    ["tree", "⚔️ Skill Tree"],
    ["raid", "⏳ Dungeon Raid"],
    ["shop", "🎨 Tavern Shop"],
    ["ledger", "📊 Hero's Ledger"],
    ["book", "💾 Spell-Book"],
  ];
  const hub = `<section id="hub" class="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
    <div class="flex flex-wrap gap-2 mb-5">${tabs.map((t) => `<button class="hub-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-400 hover:text-white transition-all" data-tab="${t[0]}" onclick="QL.showTab('${t[0]}')">${t[1]}</button>`).join("")}</div>

    <div id="tab-inv" class="hub-pane"><div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div class="md:col-span-5"><h3 class="text-sm font-black uppercase text-white mb-3">Paper-Doll Loadout</h3><div id="doll" class="doll"></div><div id="gear-stats" class="mt-4 flex flex-wrap justify-center gap-2 text-xs"></div></div>
      <div class="md:col-span-7"><div class="flex items-center justify-between mb-3"><h3 class="text-sm font-black uppercase text-white">Backpack</h3><span id="inv-count" class="text-xs text-slate-400"></span></div><div id="inv-grid" class="grid grid-cols-3 sm:grid-cols-4 gap-3"></div><p class="text-[11px] text-slate-500 mt-3">Click an item to equip / unequip. Duplicates are salvaged for +10 Gold.</p></div>
    </div></div>

    <div id="tab-tree" class="hub-pane"><div id="tree-stats" class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4"></div><div class="tree-wrap bg-slate-950/60 border border-slate-800 rounded-2xl p-2"><div id="tree-svg"></div></div><p class="text-[11px] text-slate-500 mt-2">Earn XP in a discipline to raise its stat. Nodes unlock in order along each path once the stat requirement is met (gear adds half its bonus).</p></div>

    <div id="tab-raid" class="hub-pane">
      <div id="raid-idle" class="text-center space-y-4 py-4">
        <div class="text-6xl">🏰</div><h3 class="text-lg font-black uppercase text-white">Dungeon Raid</h3>
        <p class="text-sm text-slate-400 max-w-md mx-auto">Enter the Boss Room and stay on this tab until the timer ends. Leave to browse elsewhere and the boss strikes you. Victory grants XP, gold and boosted loot.</p>
        <div class="flex flex-wrap items-center justify-center gap-3"><select id="raid-duration" class="${selCls} !w-auto"><option value="1">Skirmish — 1 min (test)</option><option value="15">Short Raid — 15 min</option><option value="25" selected>Pomodoro — 25 min</option><option value="45">Deep Raid — 45 min</option></select>
        <button onclick="QL.startRaid()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-white font-black text-sm uppercase tracking-wide shadow-lg">⚔️ Enter Boss Room</button></div>
        <p id="raid-result" class="text-sm font-semibold text-amber-400 min-h-[1.25rem]"></p>
      </div>
      <div id="raid-room" class="hidden text-center space-y-4 py-2">
        <div id="raid-boss" class="boss">🐉</div>
        <div class="max-w-md mx-auto"><div class="flex justify-between text-[11px] text-slate-400 mb-1"><span>Boss HP</span><span id="raid-timer" class="font-mono text-lg text-white">25:00</span></div><div class="bar"><div id="raid-bosshp" style="background:linear-gradient(90deg,#be123c,#f43f5e);width:100%"></div></div></div>
        <div class="max-w-md mx-auto"><div class="flex justify-between text-[11px] text-slate-400 mb-1"><span>Your HP</span><span id="raid-hptxt">100</span></div><div class="bar"><div id="raid-herohp" style="background:linear-gradient(90deg,#059669,#34d399);width:100%"></div></div></div>
        <p id="raid-log" class="text-sm text-slate-300 min-h-[1.25rem]"></p>
        <button onclick="QL.fleeRaid()" class="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-rose-400">🏳️ Flee (−3 Gold)</button>
      </div>
    </div>

    <div id="tab-shop" class="hub-pane"><div class="flex items-center justify-between mb-3"><h3 class="text-sm font-black uppercase text-white">🍺 The Tavern Shop</h3><span class="text-xs text-amber-400 font-bold">Your gold: <span id="shop-gold">0</span> G</span></div><div id="shop-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div></div>

    <div id="tab-ledger" class="hub-pane"><div class="parch rounded-2xl p-5 sm:p-7 space-y-5">
      <div class="text-center"><h3 class="text-2xl font-bold tracking-wide">The Hero's Ledger</h3><p class="italic text-sm opacity-80">A chronicle of valorous deeds, penned by the realm's scribes</p></div>
      <div id="ledger-facts" class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div><h4 class="text-center font-bold mb-1">Deeds by Day of the Week</h4><div class="relative h-56"><canvas id="ledger-bar"></canvas></div></div><div><h4 class="text-center font-bold mb-1">Glory Earned, Past Seven Days</h4><div class="relative h-56"><canvas id="ledger-line"></canvas></div></div></div>
      <p id="ledger-note" class="text-center italic text-sm"></p>
    </div></div>

    <div id="tab-book" class="hub-pane"><div class="max-w-xl space-y-4">
      <h3 class="text-sm font-black uppercase text-white">📖 Spell-Book Backup &amp; Sync</h3>
      <p class="text-sm text-slate-400">Save your whole hero (quests, gear, themes, history) to a file, then load it in any browser. No server needed.</p>
      <div class="flex flex-wrap gap-3"><button onclick="QL.exportSave()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm">📜 Export Character Sheet</button>
      <button onclick="document.getElementById('import-file').click()" class="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-slate-200 font-bold text-sm hover:bg-slate-700">📥 Import Spellbook</button>
      <input id="import-file" type="file" accept=".json,application/json" class="hidden" onchange="QL.importSave(this)"></div>
      <p id="book-msg" class="text-sm font-semibold min-h-[1.25rem]"></p>
    </div></div>
  </section>`;
  document.querySelector("footer").insertAdjacentHTML("beforebegin", hub);

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div id="chest-modal" class="fixed inset-0 z-[60] hidden items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"><div class="text-center space-y-6">
    <h3 class="text-2xl font-black uppercase tracking-wider text-amber-400">Loot Drop!</h3>
    <div id="chest-scene" class="chest-scene" onclick="QL.openChest()"><div class="chest-inner"><div class="chest-face chest-front">🧰</div><div id="chest-back" class="chest-face chest-back"></div></div></div>
    <p id="chest-hint" class="text-sm text-slate-300">Tap the chest to break the seal!</p>
    <button id="chest-close" onclick="QL.closeChest()" class="hidden px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider">Claim Loot</button></div></div>`,
  );

  /* ---------- LOOT / INVENTORY ---------- */
  let chest = { boost: 0, luck: 0, opened: false };
  function showChest(boost, luck) {
    chest = { boost: boost || 0, luck: luck || 0, opened: false };
    $("chest-scene").classList.remove("flipped");
    $("chest-hint").textContent = "Tap the chest to break the seal!";
    $("chest-close").classList.add("hidden");
    $("chest-modal").classList.remove("hidden");
    $("chest-modal").classList.add("flex");
    playSound("create");
  }
  function openChest() {
    if (chest.opened) return;
    chest.opened = true;
    const it = rollLoot(chest.boost, chest.luck),
      R = RARITY[it.r],
      dup = state.rpg.inventory.includes(it.id);
    if (dup) state.character.gold += 10;
    else state.rpg.inventory.push(it.id);
    state.rpg.chests++;
    const back = $("chest-back");
    back.style.setProperty("--rc", R.color);
    back.innerHTML = `<div class="text-[10px] font-black uppercase tracking-widest" style="color:${R.color}">${R.label}</div><div class="text-6xl my-2">${it.e}</div><div class="text-sm font-black text-white leading-tight">${it.n}</div><div class="text-xs font-bold mt-1" style="color:${R.color}">+${it.v} ${ATTRS[it.a].label}</div><div class="text-[10px] text-slate-400 mt-1 capitalize">${it.s} slot</div>${dup ? '<div class="text-[10px] text-amber-400 mt-1">Duplicate salvaged: +10 G</div>' : ""}`;
    $("chest-scene").classList.add("flipped");
    $("chest-hint").textContent = dup
      ? "Already owned. Salvaged for gold."
      : "New gear added to your backpack!";
    setTimeout(() => $("chest-close").classList.remove("hidden"), 800);
    const [x, y] = mid();
    triggerParticleBurst(
      x,
      y,
      it.r === "legendary" ? 70 : it.r === "epic" ? 45 : 25,
      [R.color, "#ffffff", "#fbbf24"],
    );
    playSound(it.r === "legendary" || it.r === "epic" ? "levelup" : "complete");
    saveState();
    renderGear();
  }
  function closeChest() {
    $("chest-modal").classList.add("hidden");
    $("chest-modal").classList.remove("flex");
    render();
  }
  function toggleEquip(id) {
    const it = ITEMS[id],
      eq = state.rpg.equipped;
    if (eq[it.s] === id) delete eq[it.s];
    else eq[it.s] = id;
    saveState();
    playSound("coin");
    render();
  }
  function renderGear() {
    const r = state.rpg,
      eq = r.equipped;
    const slot = (s) => {
      const it = ITEMS[eq[s]];
      return it
        ? `<div class="slot full" style="--rc:${RARITY[it.r].color}" title="${it.n} (click to unequip)" onclick="QL.equip('${it.id}')">${it.e}<small>${s}</small></div>`
        : `<div class="slot empty" title="Empty ${s} slot">${SLOTS[s]}<small>${s}</small></div>`;
    };
    $("doll").innerHTML =
      slot("trinket") +
      slot("head") +
      slot("ring") +
      slot("weapon") +
      `<div class="doll-avatar">${state.character.avatar || "🧙‍♂️"}</div>` +
      slot("body") +
      "<div></div>" +
      slot("boots") +
      "<div></div>";
    $("gear-stats").innerHTML = Object.keys(ATTRS)
      .map(
        (a) =>
          `<span class="px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800">${ATTRS[a].icon} ${ATTRS[a].label}: <b class="text-amber-400">${baseLevel(a)}</b> <span class="text-emerald-400">+${gearBonus(a)}</span></span>`,
      )
      .join("");
    $("inv-count").textContent =
      `${r.inventory.length} / ${Object.keys(ITEMS).length} collected`;
    $("inv-grid").innerHTML = r.inventory.length
      ? r.inventory
          .map((id) => {
            const it = ITEMS[id],
              on = eq[it.s] === id;
            return `<div class="inv-item" style="--rc:${RARITY[it.r].color}" onclick="QL.equip('${id}')" title="${RARITY[it.r].label} · +${it.v} ${ATTRS[it.a].label}">${on ? '<span class="eq">EQUIPPED</span>' : ""}<div class="text-2xl">${it.e}</div><div class="nm">${it.n}</div><div class="text-[10px] font-bold" style="color:${RARITY[it.r].color}">+${it.v} ${ATTRS[it.a].label.slice(0, 3).toUpperCase()}</div></div>`;
          })
          .join("")
      : '<div class="col-span-full text-center text-sm text-slate-500 border border-dashed border-slate-800 rounded-xl p-6">No loot yet. Conquer Hard quests or win Dungeon Raids!</div>';
  }

  /* ---------- SKILL TREE ---------- */
  let treeNarrow = null;
  function renderTree() {
    $("tree-stats").innerHTML = Object.keys(ATTRS)
      .map((a) => {
        const L = baseLevel(a),
          xp = state.rpg.attrXP[a],
          lo = 25 * (L - 1) * (L - 1),
          hi = 25 * L * L,
          pct = Math.round(((xp - lo) / (hi - lo)) * 100);
        return `<div class="bg-slate-950/60 border border-slate-800 rounded-xl p-3"><div class="flex justify-between text-xs font-bold"><span>${ATTRS[a].icon} ${ATTRS[a].label}</span><span class="text-amber-400">Lv ${effLevel(a)}${gearBonus(a) ? ` <span class="text-emerald-400">(+${Math.floor(gearBonus(a) / 2)} gear)</span>` : ""}</span></div><div class="bar my-1.5"><div style="width:${pct}%;background:linear-gradient(90deg,#6366f1,#38bdf8)"></div></div><div class="text-[10px] text-slate-500">${xp} / ${hi} XP · ${ATTRS[a].hint}</div></div>`;
      })
      .join("");
    const narrow = window.innerWidth < 640;
    treeNarrow = narrow;
    const ac = "var(--ac,#f59e0b)",
      avatar = state.character.avatar || "🧙‍♂️";
    const node = (a, n, i, x, y, on, ty) =>
      `<g opacity="${on ? 1 : 0.55}"><title>${n.n}: ${fxText(n.fx)} (requires ${ATTRS[a].label} Lv ${n.req})</title><circle cx="${x}" cy="${y}" r="${narrow ? 22 : 24}" fill="${on ? ac : "#0f172a"}" stroke="${on ? "#fff" : "#475569"}" stroke-width="2"/><text x="${x}" y="${y + 8}" text-anchor="middle" font-size="${narrow ? 20 : 22}">${on ? n.ic : "🔒"}</text><text x="${x}" y="${y + ty}" text-anchor="middle" font-size="${narrow ? 10 : 12}" font-weight="700">${n.n}</text><text x="${x}" y="${y + ty + (narrow ? 12 : 14)}" text-anchor="middle" font-size="${narrow ? 9 : 10}" opacity=".75">${on ? fxText(n.fx) : "Needs Lv " + n.req}</text></g>`;
    let s;
    if (!narrow) {
      const xs = { strength: 120, intellect: 360, charisma: 600 },
        ys = [135, 225, 315];
      s = '<svg viewBox="0 0 720 385" class="w-full h-auto">';
      Object.keys(SKILLS).forEach((a) => {
        const u = unlockedList(a);
        let px = 360,
          py = 42;
        SKILLS[a].forEach((n, i) => {
          s += `<line x1="${px}" y1="${py}" x2="${xs[a]}" y2="${ys[i]}" stroke="${u[i] ? ac : "#475569"}" stroke-width="${u[i] ? 4 : 2}" ${u[i] ? "" : 'stroke-dasharray="6 6"'}/>`;
          px = xs[a];
          py = ys[i];
        });
      });
      s += `<circle cx="360" cy="42" r="27" fill="#0f172a" stroke="${ac}" stroke-width="3"/><text x="360" y="52" text-anchor="middle" font-size="28">${avatar}</text>`;
      Object.keys(SKILLS).forEach((a) => {
        const u = unlockedList(a);
        s += `<text x="${xs[a]}" y="100" text-anchor="middle" font-size="12" font-weight="800" style="fill:${ac}">${ATTRS[a].icon} ${ATTRS[a].label.toUpperCase()}</text>`;
        SKILLS[a].forEach((n, i) => {
          s += node(a, n, i, xs[a], ys[i], u[i], 41);
        });
      });
    } else {
      // Mobile: hero on top-left, a vertical trunk, and one horizontal skill chain per discipline
      const keys = Object.keys(SKILLS),
        ry = (i) => 105 + i * 105,
        nx = [105, 195, 285];
      s = `<svg viewBox="0 0 360 ${ry(2) + 62}" class="w-full h-auto">`;
      let py = 35;
      keys.forEach((a, i) => {
        const u = unlockedList(a),
          y = ry(i);
        s += `<line x1="30" y1="${py}" x2="30" y2="${y}" stroke="${u[0] ? ac : "#475569"}" stroke-width="${u[0] ? 4 : 2}" ${u[0] ? "" : 'stroke-dasharray="6 6"'}/>`;
        let px = 30;
        SKILLS[a].forEach((n, k) => {
          s += `<line x1="${px}" y1="${y}" x2="${nx[k]}" y2="${y}" stroke="${u[k] ? ac : "#475569"}" stroke-width="${u[k] ? 4 : 2}" ${u[k] ? "" : 'stroke-dasharray="6 6"'}/>`;
          px = nx[k];
        });
        py = y;
      });
      s += `<circle cx="30" cy="35" r="22" fill="#0f172a" stroke="${ac}" stroke-width="3"/><text x="30" y="43" text-anchor="middle" font-size="22">${avatar}</text><text x="62" y="39" font-size="11" font-weight="800" style="fill:${ac}">YOUR HERO</text>`;
      keys.forEach((a, i) => {
        const u = unlockedList(a),
          y = ry(i);
        s += `<circle cx="30" cy="${y}" r="20" fill="#0f172a" stroke="${ac}" stroke-width="2"/><text x="30" y="${y + 7}" text-anchor="middle" font-size="18">${ATTRS[a].icon}</text><text x="30" y="${y + 36}" text-anchor="middle" font-size="8" font-weight="800" style="fill:${ac}">${ATTRS[a].label.toUpperCase()}</text>`;
        SKILLS[a].forEach((n, k) => {
          s += node(a, n, k, nx[k], y, u[k], 38);
        });
      });
    }
    $("tree-svg").innerHTML = s + "</svg>";
  }

  /* ---------- DUNGEON RAID ---------- */
  let raid = null;
  const BOSSES = ["🐉", "👹", "🧟", "🦑", "🧌", "💀"];
  const BASE_TITLE = document.title;
  const fmt = (t) =>
    String(Math.floor(t / 60)).padStart(2, "0") +
    ":" +
    String(t % 60).padStart(2, "0");
  function notify() {
    try {
      if ("Notification" in window && Notification.permission === "granted")
        new Notification("⚠️ Warning: Boss is attacking!", {
          body: "Return to QuestLog and keep fighting!",
        });
    } catch (e) {}
  }
  function startRaid() {
    if (raid) return;
    try {
      if ("Notification" in window && Notification.permission === "default")
        Notification.requestPermission();
    } catch (e) {}
    const m = +$("raid-duration").value;
    raid = {
      m,
      total: m * 60,
      left: m * 60,
      hp: 100,
      boss: BOSSES[Math.floor(Math.random() * BOSSES.length)],
      paused: false,
      hiddenAt: 0,
      log: "The boss awakens. Stay focused!",
    };
    raid.timer = setInterval(() => {
      if (!raid || raid.paused || document.hidden) return;
      raid.left--;
      if (raid.left <= 0) endRaid("win");
      else renderRaid();
    }, 1000);
    $("raid-result").textContent = "";
    playSound("create");
    renderRaid();
  }
  function renderRaid() {
    $("raid-idle").classList.toggle("hidden", !!raid);
    $("raid-room").classList.toggle("hidden", !raid);
    if (!raid) return;
    $("raid-boss").textContent = raid.boss;
    $("raid-timer").textContent = fmt(raid.left);
    $("raid-bosshp").style.width = (raid.left / raid.total) * 100 + "%";
    $("raid-herohp").style.width = Math.max(0, raid.hp) + "%";
    $("raid-hptxt").textContent = Math.max(0, raid.hp) + " / 100";
    $("raid-log").textContent = raid.log;
  }
  function endRaid(res) {
    clearInterval(raid.timer);
    clearInterval(raid.notifyT);
    document.title = BASE_TITLE;
    const m = raid.m,
      b = bonuses(),
      [x, y] = mid();
    let msg;
    raid = null;
    if (res === "win") {
      const xp = Math.round(Math.max(2, m * 2) * (1 + b.xp)),
        g = Math.round(m * (1 + b.gold));
      state.rpg.raids.won++;
      state.rpg.history.push({
        t: new Date().toISOString(),
        xp,
        gold: g,
        attr: null,
        d: "raid",
        src: "raid",
      });
      msg =
        `🏆 Boss defeated! +${xp} XP, +${g} Gold` +
        (m >= 15 ? " and a boss chest!" : ".");
      triggerParticleBurst(x, y, 60);
      playSound("complete");
      grantRewards(xp, g);
      if (m >= 15) setTimeout(() => showChest(30, b.luck), 600);
    } else {
      const lost = Math.min(state.character.gold, res === "lose" ? 5 : 3);
      state.character.gold -= lost;
      state.rpg.raids[res === "lose" ? "lost" : "fled"]++;
      msg =
        res === "lose"
          ? `💀 The boss overwhelmed you. −${lost} Gold.`
          : `🏳️ You fled the Boss Room. −${lost} Gold.`;
      playSound("penalty");
      spawnFloatText(`-${lost} Gold`, x, y, "text-rose-400");
      saveState();
      render();
    }
    $("raid-result").textContent = msg;
    renderRaid();
  }
  function fleeRaid() {
    if (raid && confirm("Flee the Boss Room? You will lose 3 gold."))
      endRaid("flee");
  }
  document.addEventListener("visibilitychange", () => {
    if (!raid) return;
    if (document.hidden) {
      raid.paused = true;
      raid.hiddenAt = Date.now();
      document.title = "⚠️ Boss is attacking!";
      notify();
      raid.notifyT = setInterval(notify, 15000);
    } else {
      clearInterval(raid.notifyT);
      document.title = BASE_TITLE;
      raid.paused = false;
      const away = Math.round((Date.now() - raid.hiddenAt) / 1000),
        dmg = Math.min(60, 10 + Math.floor(away / 5) * 2);
      raid.hp -= dmg;
      raid.log = `You wandered off for ${away}s. The boss struck for ${dmg} damage!`;
      playSound("penalty");
      document.body.classList.add("penalty-flash");
      setTimeout(() => document.body.classList.remove("penalty-flash"), 650);
      if (raid.hp <= 0) endRaid("lose");
      else renderRaid();
    }
  });

  /* ---------- TAVERN SHOP & THEMES ---------- */
  function setTheme(id) {
    if (!state.rpg.shop.owned.includes(id)) return;
    state.rpg.shop.theme = id;
    doc.setAttribute("data-theme", id);
    saveState();
    renderShop();
    syncSwitcher();
  }
  function buyTheme(id) {
    const t = THEMES.find((x) => x.id === id),
      [x, y] = mid();
    if (state.rpg.shop.owned.includes(id)) return;
    if (state.character.gold < t.cost) {
      playSound("penalty");
      spawnFloatText(
        `Need ${t.cost - state.character.gold} more Gold`,
        x,
        y,
        "text-rose-400",
      );
      return;
    }
    state.character.gold -= t.cost;
    state.rpg.shop.owned.push(id);
    playSound("levelup");
    triggerParticleBurst(x, y, 40);
    setTheme(id);
    render();
  }
  function themeSelect(v) {
    if (state.rpg.shop.owned.includes(v)) setTheme(v);
    else {
      syncSwitcher();
      showTab("shop");
      $("hub").scrollIntoView({ behavior: "smooth" });
    }
  }
  function syncSwitcher() {
    const o = state.rpg.shop.owned;
    $("theme-switcher").innerHTML = THEMES.map(
      (t) =>
        `<option value="${t.id}" ${t.id === state.rpg.shop.theme ? "selected" : ""}>${o.includes(t.id) ? "🎨" : "🔒"} ${t.n}${o.includes(t.id) ? "" : " (" + t.cost + "G)"}</option>`,
    ).join("");
  }
  function renderShop() {
    $("shop-gold").textContent = state.character.gold;
    $("shop-grid").innerHTML = THEMES.map((t) => {
      const own = state.rpg.shop.owned.includes(t.id),
        cur = state.rpg.shop.theme === t.id;
      const btn = cur
        ? '<button disabled class="w-full py-2 rounded-lg bg-emerald-600/30 text-emerald-300 text-xs font-black">✓ Equipped</button>'
        : own
          ? `<button onclick="QL.setTheme('${t.id}')" class="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-black">Equip Theme</button>`
          : `<button onclick="QL.buyTheme('${t.id}')" class="w-full py-2 rounded-lg ${state.character.gold >= t.cost ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950" : "bg-slate-800 text-slate-500"} text-xs font-black">Buy for ${t.cost} 🪙</button>`;
      return `<div class="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3"><div class="flex h-10 rounded-lg overflow-hidden border border-slate-700">${t.sw.map((c) => `<div class="flex-1" style="background:${c}"></div>`).join("")}</div><div><div class="font-black text-sm text-white">${t.n}</div><div class="text-xs text-slate-400">${t.d}</div></div>${btn}</div>`;
    }).join("");
  }

  /* ---------- HERO'S LEDGER ---------- */
  function renderLedger() {
    const h = state.rpg.history,
      days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
    const cnt = [0, 0, 0, 0, 0, 0, 0];
    h.forEach((e) => cnt[new Date(e.t).getDay()]++);
    const best = cnt.indexOf(Math.max.apply(null, cnt)),
      deeds = h.filter((e) => e.src === "quest").length;
    const totXP = h.reduce((s, e) => s + e.xp, 0),
      totG = h.reduce((s, e) => s + e.gold, 0);
    const fav = Object.keys(ATTRS).sort(
      (a, b) => state.rpg.attrXP[b] - state.rpg.attrXP[a],
    )[0];
    const facts = [
      ["Most Valorous Day", h.length ? days[best] : "—"],
      ["Deeds Chronicled", deeds],
      ["Glory Amassed", totXP + " XP"],
      ["Bounty Plundered", totG + " Gold"],
      ["Bosses Vanquished", state.rpg.raids.won],
      ["Quests Abandoned", state.character.stats.questsFailed || 0],
      ["Treasures Unearthed", state.rpg.chests],
      ["Favored Discipline", state.rpg.attrXP[fav] ? ATTRS[fav].label : "—"],
    ];
    $("ledger-facts").innerHTML = facts
      .map(
        (f) =>
          `<div class="fact flex justify-between py-1"><span>${f[0]}</span><b>${f[1]}</b></div>`,
      )
      .join("");
    $("ledger-note").textContent = h.length
      ? ""
      : "The pages are blank. Complete a quest to begin your legend.";
    if (typeof Chart === "undefined") {
      $("ledger-note").textContent =
        "Chart.js could not load (offline?). Stats above are still accurate.";
      return;
    }
    const last7 = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    const xpDay = last7.map((d) =>
      h
        .filter((e) => new Date(e.t).toDateString() === d.toDateString())
        .reduce((s, e) => s + e.xp, 0),
    );
    const font = { family: "'Cinzel', Georgia, serif", size: 11 },
      ink = "#5b3210",
      grid = "rgba(91,50,16,.18)";
    const tip = {
      backgroundColor: "#3b2412",
      titleColor: "#f3dfa8",
      bodyColor: "#f3dfa8",
      borderColor: "#c9a45f",
      borderWidth: 2,
      cornerRadius: 18,
      caretSize: 11,
      caretPadding: 8,
      displayColors: false,
      yAlign: "bottom",
      titleFont: font,
      bodyFont: font,
      padding: 10,
    };
    const opts = (label) => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: Object.assign(
          { callbacks: { label: (c) => `📍 ${c.parsed.y} ${label}` } },
          tip,
        ),
      },
      scales: {
        x: { ticks: { color: ink, font }, grid: { color: grid } },
        y: {
          beginAtZero: true,
          ticks: { color: ink, font, precision: 0 },
          grid: { color: grid },
        },
      },
    });
    const mk = (id, cfg) => {
      const c = $(id);
      const old = Chart.getChart(c);
      if (old) old.destroy();
      new Chart(c, cfg);
    };
    mk("ledger-bar", {
      type: "bar",
      data: {
        labels: days.map((d) => d.slice(0, 3)),
        datasets: [
          {
            data: cnt,
            backgroundColor: cnt.map((v, i) =>
              i === best && v ? "#8b2e16" : "rgba(122,78,29,.75)",
            ),
            borderColor: "#4a2c12",
            borderWidth: 2,
            borderRadius: 4,
          },
        ],
      },
      options: opts("deeds"),
    });
    mk("ledger-line", {
      type: "line",
      data: {
        labels: last7.map((d) =>
          d.toLocaleDateString([], { weekday: "short" }),
        ),
        datasets: [
          {
            data: xpDay,
            borderColor: "#7a2e12",
            backgroundColor: "rgba(139,46,22,.18)",
            fill: true,
            tension: 0.3,
            borderWidth: 3,
            pointStyle: "triangle",
            pointRadius: 8,
            pointHoverRadius: 11,
            pointBackgroundColor: "#8b2e16",
            pointBorderColor: "#3b2412",
          },
        ],
      },
      options: opts("XP"),
    });
  }

  /* ---------- SPELL-BOOK ---------- */
  function bookMsg(t, ok) {
    const m = $("book-msg");
    m.textContent = t;
    m.className =
      "text-sm font-semibold min-h-[1.25rem] " +
      (ok ? "text-emerald-400" : "text-rose-400");
  }
  function exportSave() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            app: "questlog",
            version: 2,
            exportedAt: new Date().toISOString(),
            state,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "questlog_save.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    bookMsg("Character sheet exported as questlog_save.json", true);
    playSound("coin");
  }
  function importSave(input) {
    const f = input.files[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const d = JSON.parse(fr.result),
          s = d.state || d;
        if (!s || !s.character || !Array.isArray(s.quests))
          throw new Error("Not a QuestLog save");
        if (!confirm("Replace your current hero with this spellbook?")) return;
        state = s;
        ensure();
        saveState();
        render();
        bookMsg(
          "Spellbook loaded. Welcome back, " +
            (s.character.name || "hero") +
            "!",
          true,
        );
        playSound("levelup");
      } catch (e) {
        bookMsg("Import failed: " + e.message, false);
        playSound("penalty");
      }
      input.value = "";
    };
    fr.readAsText(f);
  }

  /* ---------- TABS ---------- */
  function showTab(n) {
    document
      .querySelectorAll(".hub-pane")
      .forEach((p) => p.classList.toggle("on", p.id === "tab-" + n));
    document
      .querySelectorAll(".hub-tab")
      .forEach((b) => b.classList.toggle("on", b.dataset.tab === n));
    if (n === "ledger") renderLedger();
    if (n === "tree") renderTree();
    if (n === "raid") renderRaid();
  }

  /* ---------- HOOKS INTO YOUR EXISTING CODE (wrap, never replace) ---------- */
  function renderExtras() {
    const t = topTitle(),
      el = $("char-title");
    if (t && el)
      el.textContent = getTitleForLevel(state.character.level) + " · " + t;
    renderGear();
    renderShop();
    syncSwitcher();
    if ($("tab-tree").classList.contains("on")) renderTree();
    if ($("tab-ledger").classList.contains("on")) renderLedger();
  }
  const _render = window.render;
  window.render = function () {
    _render();
    renderExtras();
  };

  const _complete = window.handleCompleteQuest;
  window.handleCompleteQuest = function (id, ev) {
    const q = state.quests.find((x) => x.id === id);
    if (!q || q.completed) return _complete(id, ev);
    const b = bonuses(),
      before = q.attr ? effLevel(q.attr) : 0;
    _complete(id, ev);
    const bx = Math.round(q.xpReward * b.xp),
      bg = Math.round(q.goldReward * b.gold);
    state.rpg.history.push({
      t: new Date().toISOString(),
      xp: q.xpReward + bx,
      gold: q.goldReward + bg,
      attr: q.attr || null,
      d: q.difficulty,
      src: "quest",
    });
    const [x, y] = mid();
    if (q.attr && ATTRS[q.attr]) {
      state.rpg.attrXP[q.attr] += q.xpReward;
      if (effLevel(q.attr) > before)
        setTimeout(
          () =>
            spawnFloatText(
              `${ATTRS[q.attr].icon} ${ATTRS[q.attr].label} Lv ${effLevel(q.attr)}!`,
              x,
              y - 60,
              "text-indigo-300",
            ),
          500,
        );
    }
    if (bx || bg) grantRewards(bx, bg);
    else {
      saveState();
      render();
    }
    const chance =
      q.difficulty === "hard" ? 1 : q.difficulty === "medium" ? 0.35 : 0;
    if (Math.random() < chance) setTimeout(() => showChest(0, b.luck), 900);
  };

  const _create = window.handleCreateQuest;
  window.handleCreateQuest = function (e) {
    const n = state.quests.length,
      attr = $("quest-attr").value;
    _create(e);
    if (state.quests.length > n) {
      state.quests[0].attr = attr;
      saveState();
      render();
    }
  };

  const _card = window.createActiveQuestCardHTML;
  window.createActiveQuestCardHTML = function (q) {
    let h = _card(q);
    if (q.attr && ATTRS[q.attr])
      h = h.replace(
        "<h4 ",
        `<div class="text-[10px] font-bold text-indigo-300 mb-1">${ATTRS[q.attr].icon} ${ATTRS[q.attr].label}</div><h4 `,
      );
    return h;
  };

  const _reset = window.confirmResetData;
  window.confirmResetData = function () {
    const was = state;
    _reset();
    if (state !== was) {
      ensure();
      saveState();
      render();
    }
  };

  let _rt = null;
  window.addEventListener("resize", () => {
    clearTimeout(_rt);
    _rt = setTimeout(() => {
      if (
        $("tab-tree").classList.contains("on") &&
        window.innerWidth < 640 !== treeNarrow
      )
        renderTree();
    }, 150);
  });
  window.addEventListener("orientationchange", () =>
    setTimeout(() => {
      if ($("tab-tree").classList.contains("on")) renderTree();
    }, 250),
  );

  window.QL = {
    showTab,
    openChest,
    closeChest,
    equip: toggleEquip,
    startRaid,
    fleeRaid,
    setTheme,
    buyTheme,
    themeSelect,
    exportSave,
    importSave,
    showChest,
  };

  ensure();
  showTab("inv");
  render();
})();

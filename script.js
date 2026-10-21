const STORAGE_KEY = "questlog_rpg_v1";

const DIFFICULTY_CONFIG = {
  easy: {
    label: "Easy",
    xp: 10,
    gold: 5,
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    borderAccent: "border-l-4 border-l-emerald-500",
    dotColor: "bg-emerald-400",
  },
  medium: {
    label: "Medium",
    xp: 25,
    gold: 15,
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    borderAccent: "border-l-4 border-l-amber-500",
    dotColor: "bg-amber-400",
  },
  hard: {
    label: "Hard",
    xp: 50,
    gold: 30,
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    borderAccent: "border-l-4 border-l-rose-500",
    dotColor: "bg-rose-400",
  },
};

// Rank titles based on character level
const RANK_TITLES = [
  "Novice Wanderer",
  "Dungeon Scout",
  "Blade Apprentice",
  "Guild Vanguard",
  "Shadow Slayer",
  "Arcane Knight",
  "High Warlord",
  "Mythic Champion",
  "Immortal Legend",
];

// Initial default state
const DEFAULT_STATE = {
  quests: [
    {
      id: "demo-1",
      title: "Defeat the Morning Sloth (Wake up on time)",
      difficulty: "easy",
      xpReward: 10,
      goldReward: 5,
      deadline: getRelativeDateString(0),
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-2",
      title: "Brew the Elixir of Focus (25min Deep Work)",
      difficulty: "medium",
      xpReward: 25,
      goldReward: 15,
      deadline: getRelativeDateString(1),
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-3",
      title: "Tame the Boss: Ship Hackathon Project MVP",
      difficulty: "hard",
      xpReward: 50,
      goldReward: 30,
      deadline: getRelativeDateString(2),
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    },
  ],
  character: {
    name: "Arcane Scribe",
    avatar: "🧙‍♂️",
    level: 1,
    currentXP: 35,
    xpNeededForNextLevel: 100,
    gold: 25,
    stats: {
      questsCompleted: 0,
      questsFailed: 0,
      totalXpEarned: 35,
    },
  },
  audioEnabled: true,
};

// Reactive State instance
let state = loadState();
let currentSearchTerm = "";
let currentFilter = "all";

// Helper: relative ISO date format YYYY-MM-DD
function getRelativeDateString(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split("T")[0];
}

// Load state from localStorage with fallback
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate character structure
      if (parsed && parsed.character && Array.isArray(parsed.quests)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error reading from localStorage, using defaults", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

// Save state to localStorage
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}

// Reset data
function confirmResetData() {
  if (
    confirm(
      "Are you sure you want to reset all quests and character progress to initial state?",
    )
  ) {
    localStorage.removeItem(STORAGE_KEY);
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
    render();
    playSound("penalty");
  }
}

// Sound Synthesizer using Web Audio API (Zero external audio files!)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function toggleAudio() {
  state.audioEnabled = !state.audioEnabled;
  saveState();
  updateAudioToggleUI();
  if (state.audioEnabled) {
    playSound("coin");
  }
}

function updateAudioToggleUI() {
  const icon = document.getElementById("audio-icon");
  const label = document.getElementById("audio-label");
  if (state.audioEnabled) {
    icon.textContent = "🔊";
    label.textContent = "SFX On";
  } else {
    icon.textContent = "🔇";
    label.textContent = "SFX Muted";
  }
}

function playSound(type) {
  if (!state.audioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === "coin") {
      // Cheerful chime: arpeggio 987Hz -> 1318Hz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === "complete") {
      // Victory trill
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.18, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.29);
      });
    } else if (type === "levelup") {
      // Grand fanfare
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.12, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.42);
      });
    } else if (type === "penalty") {
      // Low fail buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(75, now + 0.3);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === "create") {
      // Crisp sword equip click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.1);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch (err) {
    console.warn("Audio playback not supported or blocked", err);
  }
}

// Particle FX Engine for screen celebrations
const canvas = document.getElementById("fx-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
let animationFrameId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function triggerParticleBurst(
  x,
  y,
  count = 35,
  colors = ["#f59e0b", "#10b981", "#38bdf8", "#fbbf24", "#ffffff"],
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 3;
    particles.push({
      x: x || window.innerWidth / 2,
      y: y || window.innerHeight / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (Math.random() * 4 + 2),
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.02 + 0.015,
      gravity: 0.25,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
    });
  }

  if (!animationFrameId) {
    animateParticles();
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.alpha -= p.decay;
    p.rotation += p.rotSpeed;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;
    // Draw spark diamond
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.lineTo(p.size * 0.7, 0);
    ctx.lineTo(0, p.size);
    ctx.lineTo(-p.size * 0.7, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  if (particles.length > 0) {
    animationFrameId = requestAnimationFrame(animateParticles);
  } else {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// Floating text indicator (+25 XP, -2 Gold, etc.)
function spawnFloatText(text, x, y, colorClass = "text-emerald-400") {
  const el = document.createElement("div");
  el.className = `float-text ${colorClass} text-sm sm:text-base select-none`;
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 1250);
}

// Get rank title from level
function getTitleForLevel(level) {
  const index = Math.min(Math.floor((level - 1) / 1), RANK_TITLES.length - 1);
  return `Level ${level} ${RANK_TITLES[index]}`;
}

// UI RENDER ENGINE
function render() {
  renderCharacterDashboard();
  renderQuests();
  updateAudioToggleUI();
}

function renderCharacterDashboard() {
  const { character } = state;

  // Avatar & Identity
  document.getElementById("avatar-emoji").textContent =
    character.avatar || "🧙‍♂️";
  document.getElementById("char-level-badge").textContent = character.level;
  document.getElementById("char-name").textContent = character.name || "Hero";
  document.getElementById("char-title").textContent = getTitleForLevel(
    character.level,
  );

  // Stats counters
  document.getElementById("stat-completed-count").textContent =
    character.stats.questsCompleted || 0;
  document.getElementById("stat-failed-count").textContent =
    character.stats.questsFailed || 0;

  // XP Calculations
  const currentXP = character.currentXP;
  const neededXP = character.xpNeededForNextLevel;
  const pct = Math.min(100, Math.round((currentXP / neededXP) * 100));

  document.getElementById("char-current-xp").textContent = currentXP;
  document.getElementById("char-needed-xp").textContent = neededXP;
  document.getElementById("char-xp-pct").textContent = `(${pct}%)`;

  const progressBar = document.getElementById("xp-progress-bar");
  progressBar.style.width = `${pct}%`;

  const remainingXP = Math.max(0, neededXP - currentXP);
  document.getElementById("xp-remaining-text").textContent =
    `${remainingXP} XP to next tier`;

  // Gold counter
  document.getElementById("char-gold").textContent = character.gold;
}

function renderQuests() {
  const activeList = document.getElementById("active-quest-list");
  const completedList = document.getElementById("completed-quest-list");
  const clearBtn = document.getElementById("clear-completed-btn");

  // Filter active and completed
  const allActive = state.quests.filter((q) => !q.completed);
  const allCompleted = state.quests.filter((q) => q.completed);

  // Update badge counts
  document.getElementById("active-badge-count").textContent = allActive.length;
  document.getElementById("completed-badge-count").textContent =
    allCompleted.length;

  if (allCompleted.length > 0) {
    clearBtn.classList.remove("hidden");
  } else {
    clearBtn.classList.add("hidden");
  }

  // Apply Search & Difficulty Filters
  const filterMatches = (q) => {
    const matchesSearch =
      !currentSearchTerm ||
      q.title.toLowerCase().includes(currentSearchTerm.toLowerCase());
    const matchesDiff =
      currentFilter === "all" || q.difficulty === currentFilter;
    return matchesSearch && matchesDiff;
  };

  const visibleActive = allActive.filter(filterMatches);
  const visibleCompleted = allCompleted.filter(filterMatches);

  // RENDER ACTIVE LIST
  if (visibleActive.length === 0) {
    activeList.innerHTML = `
          <div class="flex flex-col items-center justify-center p-8 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl text-center space-y-2">
            <span class="text-3xl">🛡️</span>
            <p class="text-sm font-semibold text-slate-300">No active quests in your ledger</p>
            <p class="text-xs text-slate-500 max-w-xs">Accept a new challenge above to earn XP and amass your gold treasury!</p>
          </div>
        `;
  } else {
    activeList.innerHTML = visibleActive
      .map((quest) => createActiveQuestCardHTML(quest))
      .join("");
  }

  // RENDER COMPLETED LIST
  if (visibleCompleted.length === 0) {
    completedList.innerHTML = `
          <div class="flex flex-col items-center justify-center p-8 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl text-center space-y-2">
            <span class="text-3xl">📜</span>
            <p class="text-sm font-semibold text-slate-400">Chronicle is empty</p>
            <p class="text-xs text-slate-500">Completed deeds will be etched into this scroll of valor.</p>
          </div>
        `;
  } else {
    completedList.innerHTML = visibleCompleted
      .map((quest) => createCompletedQuestCardHTML(quest))
      .join("");
  }
}

function createActiveQuestCardHTML(quest) {
  const config =
    DIFFICULTY_CONFIG[quest.difficulty] || DIFFICULTY_CONFIG.medium;

  // Calculate deadline status
  let deadlineBadge = "";
  if (quest.deadline) {
    const todayStr = getRelativeDateString(0);
    if (quest.deadline < todayStr) {
      deadlineBadge = `<span class="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-md">⚠️ Overdue: ${quest.deadline}</span>`;
    } else if (quest.deadline === todayStr) {
      deadlineBadge = `<span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">⏳ Due Today</span>`;
    } else {
      deadlineBadge = `<span class="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">📅 ${quest.deadline}</span>`;
    }
  }

  return `
        <div id="quest-${quest.id}" class="group relative bg-slate-800/75 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl p-4 shadow-md transition-all duration-200 ${config.borderAccent}">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            
            <div class="flex-1 min-w-0 pr-2">
              <div class="flex flex-wrap items-center gap-2 mb-1.5">
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${config.badgeClass}">
                  ${config.label}
                </span>
                ${deadlineBadge}
              </div>
              <h4 class="text-sm sm:text-base font-bold text-slate-100 group-hover:text-white transition-colors break-words">
                ${escapeHTML(quest.title)}
              </h4>
              
              <div class="flex items-center gap-3 mt-2 text-xs font-semibold">
                <span class="text-emerald-400 flex items-center gap-1">
                  <span>⚡</span> +${quest.xpReward} XP
                </span>
                <span class="text-amber-400 flex items-center gap-1">
                  <span>🪙</span> +${quest.goldReward} Gold
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
              <!-- Abandon / Fail Quest (Penalty) -->
              <button 
                onclick="handleDeleteActiveQuest('${quest.id}', event)" 
                class="p-2 rounded-lg bg-slate-900/60 hover:bg-rose-950/60 border border-slate-700/80 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition-all transform hover:scale-105 active:scale-95" 
                title="Abandon Quest (Incurs -2 Gold Penalty!)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <!-- Victory / Complete Quest Button -->
              <button 
                onclick="handleCompleteQuest('${quest.id}', event)" 
                class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40 transform hover:scale-105 active:scale-95 transition-all"
                title="Claim Victory"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Conquer</span>
              </button>
            </div>

          </div>
        </div>
      `;
}

function createCompletedQuestCardHTML(quest) {
  const config =
    DIFFICULTY_CONFIG[quest.difficulty] || DIFFICULTY_CONFIG.medium;
  const completedTime = quest.completedAt
    ? new Date(quest.completedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Completed";

  return `
        <div class="group relative bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 opacity-80 hover:opacity-100 transition-all">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div class="min-w-0">
              <h5 class="text-xs sm:text-sm font-semibold text-slate-300 line-through decoration-slate-500 truncate">
                ${escapeHTML(quest.title)}
              </h5>
              <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                <span>Earned: +${quest.xpReward} XP / +${quest.goldReward} G</span>
                <span>•</span>
                <span>${completedTime}</span>
              </div>
            </div>
          </div>

          <!-- Delete from archive (no penalty) -->
          <button 
            onclick="handleDeleteCompletedQuest('${quest.id}')" 
            class="p-1.5 text-slate-600 hover:text-slate-400 transition-colors shrink-0" 
            title="Remove from journal"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      `;
}

// GAMIFIED INTERACTIONS & LOGIC

// 1. Create Quest
function handleCreateQuest(e) {
  e.preventDefault();
  const titleInput = document.getElementById("quest-title");
  const diffSelect = document.getElementById("quest-difficulty");
  const dateInput = document.getElementById("quest-deadline");

  const title = titleInput.value.trim();
  if (!title) return;

  const difficulty = diffSelect.value || "medium";
  const config = DIFFICULTY_CONFIG[difficulty];

  const newQuest = {
    id: "quest-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    title: title,
    difficulty: difficulty,
    xpReward: config.xp,
    goldReward: config.gold,
    deadline: dateInput.value || null,
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
  };

  state.quests.unshift(newQuest);
  saveState();
  render();

  // Audio & feedback
  playSound("create");
  titleInput.value = "";
  titleInput.blur();

  // Quick visual burst at the form button
  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    const rect = submitBtn.getBoundingClientRect();
    triggerParticleBurst(rect.left + rect.width / 2, rect.top, 12, [
      "#f59e0b",
      "#fbbf24",
    ]);
  }
}

// 2. Complete Quest
function handleCompleteQuest(questId, event) {
  const questIndex = state.quests.findIndex((q) => q.id === questId);
  if (questIndex === -1) return;

  const quest = state.quests[questIndex];
  quest.completed = true;
  quest.completedAt = new Date().toISOString();

  // Rewards
  const earnedXP = quest.xpReward;
  const earnedGold = quest.goldReward;

  // Update state
  state.character.currentXP += earnedXP;
  state.character.gold += earnedGold;
  state.character.stats.questsCompleted =
    (state.character.stats.questsCompleted || 0) + 1;
  state.character.stats.totalXpEarned =
    (state.character.stats.totalXpEarned || 0) + earnedXP;

  // Click coordinate for float text & burst
  let clickX = window.innerWidth / 2;
  let clickY = window.innerHeight / 2;
  if (event && event.clientX) {
    clickX = event.clientX;
    clickY = event.clientY;
  }

  // Visual particle burst & floating text
  triggerParticleBurst(clickX, clickY, 30, [
    "#10b981",
    "#34d399",
    "#f59e0b",
    "#fbbf24",
    "#ffffff",
  ]);
  spawnFloatText(
    `+${earnedXP} XP! +${earnedGold} Gold!`,
    clickX,
    clickY - 20,
    "text-emerald-400",
  );

  // Check for Level Up!
  let didLevelUp = false;
  let levelsGained = 0;

  while (state.character.currentXP >= state.character.xpNeededForNextLevel) {
    didLevelUp = true;
    levelsGained++;
    state.character.currentXP -= state.character.xpNeededForNextLevel;
    state.character.level += 1;
    // Level up formula: scale next level required XP by 20%
    state.character.xpNeededForNextLevel = Math.round(
      state.character.xpNeededForNextLevel * 1.2,
    );
    // Bonus gold for leveling up
    state.character.gold += 10;
  }

  saveState();
  render();

  if (didLevelUp) {
    playSound("levelup");
    showLevelUpModal(levelsGained);
  } else {
    playSound("complete");
  }

  triggerCoinJingle();
}

// 3. Delete Active Quest (Penalty: Lose 2 Gold)
function handleDeleteActiveQuest(questId, event) {
  const quest = state.quests.find((q) => q.id === questId);
  if (!quest) return;

  if (
    !confirm(
      `Abandon quest "${quest.title}"?\n\nA true hero keeps their word! Abandoning an active quest inflicts a 2 Gold penalty.`,
    )
  ) {
    return;
  }

  // Remove quest
  state.quests = state.quests.filter((q) => q.id !== questId);

  // Penalty: deduct 2 gold (minimum 0)
  const previousGold = state.character.gold;
  state.character.gold = Math.max(0, state.character.gold - 2);
  const goldLost = previousGold - state.character.gold;

  state.character.stats.questsFailed =
    (state.character.stats.questsFailed || 0) + 1;

  // Sound & Screen Flash
  playSound("penalty");
  document.body.classList.add("penalty-flash");
  setTimeout(() => document.body.classList.remove("penalty-flash"), 650);

  // Coordinate for floater
  let clickX = window.innerWidth / 2;
  let clickY = window.innerHeight / 2;
  if (event && event.clientX) {
    clickX = event.clientX;
    clickY = event.clientY;
  }

  triggerParticleBurst(clickX, clickY, 15, ["#f43f5e", "#fb7185", "#991b1b"]);
  spawnFloatText(
    `-2 Gold! Quest Abandoned ⚠️`,
    clickX,
    clickY - 20,
    "text-rose-400",
  );

  saveState();
  render();
}

// 4. Delete Completed Quest (No Penalty)
function handleDeleteCompletedQuest(questId) {
  state.quests = state.quests.filter((q) => q.id !== questId);
  saveState();
  render();
}

// 5. Clear All Completed Quests
function clearCompletedQuests() {
  if (confirm("Purge all completed records from your archives?")) {
    state.quests = state.quests.filter((q) => !q.completed);
    saveState();
    render();
    playSound("create");
  }
}

// Level Up Modal Functions
function showLevelUpModal(levelsGained) {
  const modal = document.getElementById("level-modal");
  const levelText = document.getElementById("modal-new-level");
  const titleText = document.getElementById("modal-new-title");
  const xpCapText = document.getElementById("modal-next-xp-cap");

  levelText.textContent = `Level ${state.character.level}`;
  titleText.textContent = getTitleForLevel(state.character.level);
  xpCapText.textContent = `${state.character.xpNeededForNextLevel} XP`;

  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.remove("opacity-0");
  }, 20);

  // Trigger glorious screen confetti
  triggerParticleBurst(window.innerWidth / 2, window.innerHeight / 3, 60, [
    "#f59e0b",
    "#fbbf24",
    "#10b981",
    "#6366f1",
    "#ec4899",
    "#ffffff",
  ]);
}

function closeLevelModal() {
  const modal = document.getElementById("level-modal");
  modal.classList.add("opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

// Avatar Selection Modal
function openAvatarModal() {
  const modal = document.getElementById("avatar-modal");
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.remove("opacity-0");
  }, 20);
}

function closeAvatarModal() {
  const modal = document.getElementById("avatar-modal");
  modal.classList.add("opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

function selectAvatar(emoji) {
  state.character.avatar = emoji;
  saveState();
  renderCharacterDashboard();
  closeAvatarModal();
  playSound("coin");
}

function editCharacterName() {
  const currentName = state.character.name || "Hero";
  const newName = prompt("Enter your Heroic Moniker:", currentName);
  if (newName && newName.trim()) {
    state.character.name = newName.trim().substring(0, 24);
    saveState();
    renderCharacterDashboard();
    playSound("coin");
  }
}

// Coin icon animation trigger
function triggerCoinJingle() {
  const coin = document.getElementById("gold-coin-icon");
  if (coin) {
    coin.classList.remove("coin-spin");
    void coin.offsetWidth; // Force reflow
    coin.classList.add("coin-spin");
  }
}

// Quick Date setter for quest form
function setQuickDate(type) {
  const dateInput = document.getElementById("quest-deadline");
  if (type === "today") {
    dateInput.value = getRelativeDateString(0);
  } else if (type === "tomorrow") {
    dateInput.value = getRelativeDateString(1);
  }
  playSound("create");
}

// Form Reward Preview
function updateRewardPreview() {
  const diff = document.getElementById("quest-difficulty").value;
  const config = DIFFICULTY_CONFIG[diff] || DIFFICULTY_CONFIG.medium;
  document.getElementById("preview-xp").textContent = `+${config.xp}`;
  document.getElementById("preview-gold").textContent = `+${config.gold}`;
}

// Search & Filter Handlers
function handleSearch(term) {
  currentSearchTerm = term.trim();
  renderQuests();
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("bg-amber-500", "text-slate-950");
    btn.classList.add("bg-slate-800", "text-slate-400");
  });

  const activeBtn = document.getElementById(`filter-${filter}`);
  if (activeBtn) {
    activeBtn.classList.remove("bg-slate-800", "text-slate-400");
    activeBtn.classList.add("bg-amber-500", "text-slate-950");
  }

  renderQuests();
}

// Utility: XSS prevention
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Initializer
window.addEventListener("DOMContentLoaded", () => {
  // Set default deadline to today
  const deadlineInput = document.getElementById("quest-deadline");
  if (deadlineInput) {
    deadlineInput.value = getRelativeDateString(1); // default tomorrow
  }

  updateRewardPreview();
  render();

  // Listen for click on window to enable audio context if needed
  window.addEventListener(
    "click",
    () => {
      if (state.audioEnabled && !audioCtx) {
        getAudioContext();
      }
    },
    { once: true },
  );
});

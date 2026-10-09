import {
  createGame,
  inputFoot,
  releaseAll,
  step,
  target,
  MISSIONS,
  objective,
  stars,
  snapshot,
} from "./engine.js";
import { drawScene, drawWardrobe, drawClothing } from "./render.js";
import {
  CATALOG,
  DEFAULT_OUTFIT,
  available,
  validateOutfit,
  rewardFor,
} from "./customization.js";
import { FINAL_NOTE } from "./content.js";
import { icon } from "./icons.js";
import { lockTouchViewport } from "./touch-guard.js";
const $ = (id) => document.getElementById(id);
const basePath = new URL("./", document.baseURI).pathname;
const SAVE_KEY =
  "office-chair-save-v1" + (basePath === "/" ? "" : `:${basePath}`);
const isIOS = /iPhone|iPod/.test(navigator.userAgent);
const isPhone = isIOS || /Android/i.test(navigator.userAgent);
let data = {
  version: 2,
  results: {},
  resume: null,
  sound: true,
  outfit: { ...DEFAULT_OUTFIT },
};
try {
  const old = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
  if (old && [1, 2].includes(old.version)) {
    for (let id = 0; id < MISSIONS.length; id++) {
      const r = old.results?.[id];
      if (
        r &&
        Number.isFinite(r.time) &&
        Number.isInteger(r.stars) &&
        r.stars >= 1 &&
        r.stars <= 3
      )
        data.results[id] = {
          stars: r.stars,
          time: Math.max(0, r.time),
          pushes: Math.max(0, Number(r.pushes) || 0),
          hits: Math.max(0, Number(r.hits) || 0),
        };
    }
    data.sound =
      typeof old.sound === "boolean"
        ? old.sound
        : old.settings?.sound !== false;
    data.outfit = validateOutfit(old.outfit, data.results);
    const r = old.resume,
      m = MISSIONS[r?.missionId];
    if (
      m &&
      Number.isInteger(r.missionId) &&
      typeof r.free === "boolean" &&
      [
        "x",
        "y",
        "vx",
        "vy",
        "angle",
        "time",
        "pushes",
        "hits",
        "stage",
        "coffee",
      ].every((k) => Number.isFinite(r[k])) &&
      Number.isInteger(r.stage) &&
      r.stage >= 0 &&
      r.stage <
        (m.kind === "errands"
          ? m.stops.length
          : m.kind === "route"
            ? m.gates.length + 1
            : m.kind === "delivery"
              ? 2
              : 1) &&
      [null, "coffee", "pen", "paper", "letter"].includes(r.carrying)
    )
      data.resume = r;
  }
} catch {}
let game = null,
  view = "menu",
  clock = 0,
  lastFrame = 0,
  acc = 0,
  hudClock = 0,
  saveClock = 0,
  audio = null,
  toastTimer = null;
let introReturnView = "menu";
let levelsPage = 0,
  wardrobeCategory = "color",
  wardrobePage = 0,
  wardrobeOrigin = "menu";
let registration = null,
  cacheReady = false,
  reloading = false,
  storageFailed = false,
  legacyWorker = false;
const pointerFeet = new Map(),
  pendingWorkers = new WeakSet();
function hydrate(root = document) {
  root
    .querySelectorAll("[data-icon]")
    .forEach((e) => (e.innerHTML = icon(e.dataset.icon)));
}
hydrate();
if (isPhone) lockTouchViewport();
function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    if (!storageFailed) {
      storageFailed = true;
      toast("Прогресс не сохраняется в этом браузере");
    }
  }
}
function saveRun() {
  if (game && ["playing", "paused"].includes(game.phase)) {
    data.resume = snapshot(game);
    save();
  }
}
function toast(text) {
  $("global-toast").textContent = text;
  $("global-toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(
    () => $("global-toast").classList.remove("show"),
    2500,
  );
}
function soundButtons() {
  document.querySelectorAll('[data-action="sound"]').forEach((b) => {
    b.innerHTML = icon(data.sound ? "sound" : "muted");
    b.setAttribute(
      "aria-label",
      data.sound ? "Выключить звук" : "Включить звук",
    );
  });
}
function unlockAudio() {
  if (!data.sound) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume().catch(() => {});
  } catch {}
}
function tone(freq, duration = 0.12, delay = 0) {
  if (!data.sound || audio?.state !== "running") return;
  const o = audio.createOscillator(),
    gain = audio.createGain(),
    now = audio.currentTime + delay;
  o.type = "sine";
  o.frequency.value = freq;
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.045, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  o.connect(gain).connect(audio.destination);
  o.start(now);
  o.stop(now + duration + 0.02);
}
function unlocked(id) {
  return id === 0 || !!data.results[id - 1];
}
function firstUnfinished() {
  return MISSIONS.find((m) => !data.results[m.id])?.id ?? 0;
}
function updateMenu() {
  $("menu-progress").textContent = `${Object.keys(data.results).length} / 12`;
  $("play-main").innerHTML =
    `${data.resume ? "Продолжить" : Object.keys(data.results).length === 12 ? "Уровни" : "Поехали"} ${icon("arrow")}`;
}
function showView(next) {
  view = next;
  document.querySelectorAll(".view").forEach((s) => (s.hidden = s.id !== next));
  if (next === "menu") updateMenu();
  if (next === "missions") renderMissions();
  if (next === "wardrobe") renderWardrobe();
}
function clearInputs() {
  pointerFeet.clear();
  if (game) releaseAll(game);
  for (const f of ["left", "right"])
    $("foot-" + f).setAttribute("aria-pressed", "false");
  $("brake-indicator").classList.remove("active");
}
function syncInputs() {
  if (game?.phase !== "playing") return;
  const feet = [...pointerFeet.values()];
  for (const f of ["left", "right"]) {
    const down = feet.includes(f);
    inputFoot(game, f, down);
    $("foot-" + f).setAttribute("aria-pressed", String(down));
  }
  $("brake-indicator").classList.toggle(
    "active",
    game.feet.left && game.feet.right,
  );
}
for (const f of ["left", "right"]) {
  const b = $("foot-" + f);
  b.addEventListener("pointerdown", (e) => {
    if (
      game?.phase !== "playing" ||
      (e.pointerType === "mouse" && e.button !== 0)
    )
      return;
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    pointerFeet.set(e.pointerId, f);
    syncInputs();
    unlockAudio();
  });
  const up = (e) => {
    pointerFeet.delete(e.pointerId);
    syncInputs();
  };
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    b.addEventListener(event, up);
}
for (const event of ["selectstart", "contextmenu", "dragstart"])
  document.addEventListener(event, (e) => e.preventDefault());
function closeDialogs() {
  document.querySelectorAll("dialog[open]").forEach((d) => d.close());
}
function showDialog(id) {
  if (!$(id).open) $(id).showModal();
}
function pause() {
  if (game?.phase !== "playing") return;
  game.phase = "paused";
  clearInputs();
  saveRun();
  showDialog("pause-dialog");
}
function exitToMenu() {
  saveRun();
  clearInputs();
  game = null;
  closeDialogs();
  $("letter-text").textContent = "";
  showView("menu");
}
function closeIntro() {
  clearInputs();
  game = null;
  closeDialogs();
  showView(introReturnView);
}
function prepareMission(id, free = false, restore = false) {
  if (!isPhone || (!free && !unlocked(id))) return;
  introReturnView = view === "missions" ? "missions" : "menu";
  clearInputs();
  game = null;
  closeDialogs();
  game = createGame(id, free, restore ? data.resume : null);
  game.outfit = { ...data.outfit };
  acc = 0;
  showView("game");
  $("game-number").textContent = free ? "" : `${id + 1} / 12`;
  $("game-title").textContent = free ? "Покататься" : MISSIONS[id].title;
  updateHud();
  if (restore || free) {
    unlockAudio();
    saveRun();
    return;
  }
  game.phase = "ready";
  const m = MISSIONS[id];
  $("intro-number").textContent = `${id + 1} / 12`;
  $("intro-title").textContent = m.title;
  $("intro-text").textContent = m.text;
  $("first-help").hidden = id !== 0 || !!data.results[0];
  showDialog("intro-dialog");
}
$("start-mission").addEventListener("click", () => {
  if (!game) return;
  game.phase = "playing";
  $("intro-dialog").close();
  unlockAudio();
  saveRun();
  acc = 0;
});
function restart() {
  const id = game?.missionId ?? 0,
    free = game?.free ?? false;
  data.resume = null;
  save();
  prepareMission(id, free);
}
function updateHud() {
  if (!game) return;
  $("objective-text").textContent = objective(game);
  $("timer").textContent =
    `${Math.floor(game.time / 60)}:${String(Math.floor(game.time % 60)).padStart(2, "0")}`;
  $("coffee-level").hidden = game.carrying !== "coffee";
  $("coffee-level").querySelector("b").textContent = `${game.coffee}%`;
}
function renderMissions() {
  $("mission-list").replaceChildren();
  for (const m of MISSIONS.slice(levelsPage * 6, levelsPage * 6 + 6)) {
    const b = document.createElement("button"),
      r = data.results[m.id];
    b.className = "mission-card";
    b.disabled = !unlocked(m.id);
    b.setAttribute("aria-label", `Уровень ${m.id + 1}: ${m.title}`);
    b.innerHTML = `<span class="number">${String(m.id + 1).padStart(2, "0")}</span>${icon(m.icon)}<strong>${m.title}</strong><span class="mission-stars">${[1, 2, 3].map((i) => icon("star", r?.stars >= i ? "earned" : "")).join("")}</span>${b.disabled ? icon("lock", "card-lock") : ""}`;
    b.addEventListener("click", () => prepareMission(m.id));
    $("mission-list").append(b);
  }
  $("levels-page").textContent = `${levelsPage + 1} / 2`;
  $("levels-prev").disabled = levelsPage === 0;
  $("levels-next").disabled = levelsPage === 1;
}
$("levels-prev").addEventListener("click", () => {
  levelsPage = 0;
  renderMissions();
});
$("levels-next").addEventListener("click", () => {
  levelsPage = 1;
  renderMissions();
});
function openWardrobe(origin = "menu") {
  wardrobeOrigin = origin;
  clearInputs();
  closeDialogs();
  showView("wardrobe");
}
function renderWardrobe() {
  const items = CATALOG[wardrobeCategory],
    pages = Math.ceil(items.length / 6);
  wardrobePage = Math.min(wardrobePage, pages - 1);
  document
    .querySelectorAll("[data-category]")
    .forEach((b) =>
      b.setAttribute(
        "aria-selected",
        String(b.dataset.category === wardrobeCategory),
      ),
    );
  $("wardrobe-list").replaceChildren();
  for (const item of items.slice(wardrobePage * 6, wardrobePage * 6 + 6)) {
    const open = available(item, data.results),
      b = document.createElement("button");
    b.className = "wardrobe-item";
    b.disabled = !open;
    b.dataset.item = item.id;
    b.setAttribute(
      "aria-label",
      open ? item.name : `${item.name}: уровень ${item.level}`,
    );
    b.setAttribute(
      "aria-pressed",
      String(data.outfit[wardrobeCategory] === item.id),
    );
    b.innerHTML = `<canvas></canvas><span class="item-name">${item.name}</span>${!open ? `${icon("lock")}<span class="unlock-level">Уровень ${item.level}</span>` : ""}`;
    b.addEventListener("click", () => {
      data.outfit[wardrobeCategory] = item.id;
      if (game) game.outfit = { ...data.outfit };
      save();
      renderWardrobe();
    });
    $("wardrobe-list").append(b);
    const outfit = { ...data.outfit, [wardrobeCategory]: item.id };
    requestAnimationFrame(() =>
      drawClothing(b.querySelector("canvas"), outfit),
    );
  }
  $("wardrobe-page").textContent = `${wardrobePage + 1} / ${pages}`;
  $("wardrobe-prev").disabled = wardrobePage === 0;
  $("wardrobe-next").disabled = wardrobePage === pages - 1;
  requestAnimationFrame(() => drawWardrobe($("wardrobe-canvas"), data.outfit));
}
document.querySelectorAll("[data-category]").forEach((b) =>
  b.addEventListener("click", () => {
    wardrobeCategory = b.dataset.category;
    wardrobePage = 0;
    renderWardrobe();
  }),
);
$("wardrobe-prev").addEventListener("click", () => {
  wardrobePage--;
  renderWardrobe();
});
$("wardrobe-next").addEventListener("click", () => {
  wardrobePage++;
  renderWardrobe();
});
function showWin() {
  const id = game.missionId,
    reward = rewardFor(id);
  $("win-stars").innerHTML = [1, 2, 3]
    .map((i) => icon("star", stars(game) >= i ? "earned" : ""))
    .join("");
  $("win-title").textContent = `Уровень ${id + 1} пройден`;
  $("reward-name").textContent = [
    reward.color.name,
    reward.print.name,
    reward.style?.name,
  ]
    .filter(Boolean)
    .join(" · ");
  $("next-mission").innerHTML =
    `${id === 11 ? "Открыть записку" : "Дальше"} ${icon(id === 11 ? "heart" : "arrow")}`;
  showDialog("win-dialog");
  requestAnimationFrame(() =>
    drawWardrobe($("reward-canvas"), {
      ...data.outfit,
      color: reward.color.id,
      print: reward.print.id,
      ...(reward.style ? { style: reward.style.id } : {}),
    }),
  );
}
function win() {
  const id = game.missionId,
    s = stars(game),
    old = data.results[id];
  if (!old || s > old.stars || (s === old.stars && game.time < old.time))
    data.results[id] = {
      stars: s,
      time: game.time,
      pushes: game.pushes,
      hits: game.hits,
    };
  data.resume = null;
  save();
  clearInputs();
  [392, 494, 587].forEach((f, i) => tone(f, 0.25, i * 0.1));
  showWin();
}
function showLetter() {
  if (
    game?.phase !== "won" ||
    game.missionId !== 11 ||
    !MISSIONS.every((m) => data.results[m.id])
  )
    return;
  closeDialogs();
  $("letter-text").textContent = FINAL_NOTE;
  showDialog("letter-dialog");
}
$("next-mission").addEventListener("click", () => {
  if (game?.phase !== "won") return;
  if (game.missionId === 11) showLetter();
  else prepareMission(game.missionId + 1);
});
const actions = {
  play: () => {
    if (data.resume && unlocked(data.resume.missionId))
      prepareMission(data.resume.missionId, data.resume.free, true);
    else if (Object.keys(data.results).length === 12) showView("missions");
    else prepareMission(firstUnfinished());
  },
  free: () => prepareMission(0, true),
  missions: () => {
    levelsPage = Math.floor(firstUnfinished() / 6);
    showView("missions");
  },
  menu: exitToMenu,
  wardrobe: () => openWardrobe(),
  "wardrobe-back": () => {
    if (wardrobeOrigin === "win" && game?.phase === "won") {
      showView("game");
      showWin();
    } else exitToMenu();
  },
  "try-reward": () => {
    if (game?.phase !== "won") return;
    const r = rewardFor(game.missionId);
    data.outfit = {
      ...data.outfit,
      color: r.color.id,
      print: r.print.id,
      ...(r.style ? { style: r.style.id } : {}),
    };
    game.outfit = { ...data.outfit };
    save();
    wardrobeCategory = "color";
    wardrobePage = Math.floor((game.missionId + 1) / 6);
    openWardrobe("win");
  },
  pause,
  resume: () => {
    if (game?.phase === "paused") {
      game.phase = "playing";
      closeDialogs();
      acc = 0;
      unlockAudio();
    }
  },
  restart,
  retry: restart,
  exit: exitToMenu,
  sound: () => {
    data.sound = !data.sound;
    save();
    soundButtons();
    if (data.sound) {
      unlockAudio();
      tone(494);
    }
  },
  install: () => {
    updateInstall();
    showDialog("install-dialog");
  },
};
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-action]");
  if (a) {
    actions[a.dataset.action]?.();
    return;
  }
  const b = e.target.closest("[data-close]");
  if (b) {
    const d = b.closest("dialog");
    if (d.id === "intro-dialog") closeIntro();
    else d.close();
  }
});
for (const d of document.querySelectorAll("dialog"))
  d.addEventListener("cancel", (e) => {
    e.preventDefault();
    if (d.id === "pause-dialog") actions.resume();
    else if (d.id === "intro-dialog") closeIntro();
    else if (["win-dialog", "letter-dialog"].includes(d.id)) exitToMenu();
    else d.close();
  });
window.addEventListener("blur", () => {
  clearInputs();
  if (view === "game") pause();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInputs();
    if (view === "game") pause();
    saveRun();
  }
});
window.addEventListener("pagehide", saveRun);
function deviceLayout() {
  const landscape = innerWidth > innerHeight;
  $("device-gate").hidden = isPhone;
  $("app").hidden = !isPhone || landscape;
  $("rotate-gate").hidden = !isPhone || !landscape;
  if (landscape && game?.phase === "playing") pause();
  if (view === "wardrobe") requestAnimationFrame(() => renderWardrobe());
}
window.addEventListener("resize", deviceLayout);
deviceLayout();
function updateInstall() {
  $("install-text").textContent =
    navigator.standalone || matchMedia("(display-mode: standalone)").matches
      ? "Игра на главном экране."
      : isIOS
        ? "Safari → «Поделиться» → «На экран Домой»."
        : "Меню браузера ⋮ → «Установить приложение» или «Добавить на главный экран».";
}
async function checkOffline() {
  const worker = navigator.serviceWorker?.controller || registration?.active;
  if (!worker || pendingWorkers.has(worker)) return;
  pendingWorkers.add(worker);
  const channel = new MessageChannel();
  channel.port1.onmessage = (e) => {
    if (e.data?.type === "CACHE_STATUS") {
      pendingWorkers.delete(worker);
      if (
        navigator.serviceWorker.controller &&
        worker !== navigator.serviceWorker.controller
      ) {
        channel.port1.close();
        return;
      }
      legacyWorker = e.data.version !== "office-chair-v2.0.2";
      cacheReady = !!e.data.ready && !legacyWorker;
      if (legacyWorker && registration?.waiting) {
        $("update-banner").hidden = true;
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      updateInstall();
      channel.port1.close();
    }
  };
  worker.postMessage({ type: "CACHE_STATUS" }, [channel.port2]);
}
if (isPhone && "serviceWorker" in navigator && isSecureContext) {
  navigator.serviceWorker
    .register("./sw.js", { scope: "./" })
    .then(async (reg) => {
      registration = reg;
      if (reg.waiting) $("update-banner").hidden = false;
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        sw?.addEventListener("statechange", () => {
          if (sw.state === "installed") {
            checkOffline();
            if (navigator.serviceWorker.controller) {
              if (legacyWorker)
                reg.waiting?.postMessage({ type: "SKIP_WAITING" });
              else $("update-banner").hidden = false;
            }
          }
        });
      });
      await navigator.serviceWorker.ready;
      checkOffline();
    })
    .catch(() => {});
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) location.reload();
    else checkOffline();
  });
}
$("apply-update").addEventListener("click", () => {
  if (!registration?.waiting) return;
  saveRun();
  save();
  reloading = true;
  registration.waiting.postMessage({ type: "SKIP_WAITING" });
});
const menuHero = createGame(0, true);
menuHero.x = 469;
menuHero.y = 593;
menuHero.angle = -1.1;
function loop(t) {
  const delta = lastFrame ? Math.min((t - lastFrame) / 1000, 0.1) : 0;
  lastFrame = t;
  clock += delta;
  hudClock += delta;
  saveClock += delta;
  if (isPhone && !$("app").hidden) {
    if (view === "game" && game) {
      if (game.phase === "playing") {
        acc = Math.min(acc + delta, 0.1);
        while (acc >= 1 / 120) {
          step(game, 1 / 120);
          acc -= 1 / 120;
        }
        for (const e of game.events.splice(0)) {
          if (e.type === "push") tone(e.both ? 170 : 145, 0.07);
          if (e.type === "bump") tone(78, 0.1);
          if (["pickup", "gate", "stop"].includes(e.type)) tone(523, 0.15);
          if (e.type === "win") win();
        }
        if (saveClock > 1.5) {
          saveClock = 0;
          saveRun();
        }
      }
      if (hudClock > 0.1) {
        hudClock = 0;
        updateHud();
      }
      drawScene($("game-canvas"), game, clock, { labels: false });
    }
    if (view === "menu") {
      menuHero.outfit = data.outfit;
      menuHero.x = 474 + Math.sin(clock * 0.35) * 12;
      menuHero.y = 593 + Math.cos(clock * 0.35) * 9;
      drawScene($("menu-canvas"), menuHero, clock, {
        menu: true,
        labels: false,
      });
    }
  }
  requestAnimationFrame(loop);
}
soundButtons();
updateMenu();
if (isPhone) {
  save();
  requestAnimationFrame(loop);
  if (new URLSearchParams(location.search).get("mode") === "free")
    prepareMission(0, true);
}

export const WORLD = { width: 900, height: 980 };
export const POINTS = {
  desk: { x: 280, y: 658, label: "Твой стол" },
  coffee: { x: 610, y: 523, label: "Кофе" },
  board: { x: 218, y: 233, label: "Доска" },
  printer: { x: 255, y: 536, label: "Принтер" },
  mat: { x: 718, y: 827, label: "Коврик winter time" },
};
export const OBSTACLES = [
  { x: 105, y: 100, w: 240, h: 62, type: "board" },
  { x: 594, y: 115, w: 165, h: 175, type: "boxes" },
  { x: 665, y: 422, w: 157, h: 82, type: "coffee" },
  { x: 100, y: 439, w: 109, h: 104, type: "printer" },
  { x: 108, y: 754, w: 316, h: 97, type: "desk" },
  { x: 807, y: 753, w: 43, h: 43, type: "water" },
  { x: 813, y: 859, w: 36, h: 45, type: "can" },
  { x: 780, y: 348, w: 41, h: 40, type: "chair" },
  { x: 740, y: 645, w: 43, h: 42, type: "chair" },
];
const gates = [
  { x: 435, y: 212, label: "Первый поворот" },
  { x: 500, y: 330, label: "Мимо контейнеров" },
  { x: 758, y: 380, label: "Узкий проход" },
  { x: 552, y: 644, label: "Последний поворот" },
];
export const MISSIONS = [
  {
    id: 0,
    title: "Первая поездка",
    caption: "Знакомство с колёсиками",
    icon: "chair",
    text: "Доедь до коврика с зелёной машиной и спокойно остановись в круге.",
    kind: "park",
    destination: "mat",
    limit: 16,
    par: 60,
  },
  {
    id: 1,
    title: "Кофе едет",
    caption: "Доставить без приключений",
    icon: "coffee",
    text: "Забери кофе у кофеварки и привези к своему столу. На обеих остановках подержи тормоз.",
    kind: "delivery",
    pickup: "coffee",
    destination: "desk",
    item: "coffee",
    limit: 25,
    par: 85,
  },
  {
    id: 2,
    title: "Где мой маркер?",
    caption: "Немного цвета для доски",
    icon: "pen",
    text: "Забери цветной маркер со стола и доставь к доске у окна.",
    kind: "delivery",
    pickup: "desk",
    destination: "board",
    item: "pen",
    limit: 26,
    par: 80,
  },
  {
    id: 3,
    title: "Королева поворотов",
    caption: "Красивый маршрут по офису",
    icon: "route",
    text: "Проедь через четыре отмеченных круга по порядку. В конце припаркуйся на коврике.",
    kind: "route",
    destination: "mat",
    gates,
    limit: 42,
    par: 110,
  },
  {
    id: 4,
    title: "Распечатка прибыла",
    caption: "От принтера до чёрного лотка",
    icon: "paper",
    text: "Забери лист у принтера и привези его в органайзер на своём столе.",
    kind: "delivery",
    pickup: "printer",
    destination: "desk",
    item: "paper",
    limit: 23,
    par: 75,
  },
  {
    id: 5,
    title: "У тебя сообщение",
    caption: "Доставка конверта",
    icon: "heart",
    text: "Забери конверт у доски и вернись к своему столу. Остановись у стола.",
    kind: "delivery",
    pickup: "board",
    destination: "desk",
    item: "letter",
    limit: 28,
    par: 90,
  },
  {
    id: 6,
    title: "Кофе переехал",
    icon: "coffee",
    text: "Забери кофе слева и отвези к столу.",
    kind: "delivery",
    pickup: "coffee",
    destination: "desk",
    item: "coffee",
    limit: 28,
  },
  {
    id: 7,
    title: "Доска у двери",
    icon: "pen",
    text: "Маркер со стола — к доске у двери.",
    kind: "delivery",
    pickup: "desk",
    destination: "board",
    item: "pen",
    limit: 32,
  },
  {
    id: 8,
    title: "Новый маршрут",
    icon: "route",
    text: "Четыре круга, затем парковка на коврике.",
    kind: "route",
    destination: "mat",
    gates: [
      { x: 425, y: 220 },
      { x: 515, y: 370 },
      { x: 320, y: 603 },
      { x: 485, y: 690 },
    ],
    limit: 45,
  },
  {
    id: 9,
    title: "Два дела",
    icon: "paper",
    text: "Кофе — к столу. Распечатка — к доске.",
    kind: "errands",
    stops: [
      { point: "coffee", collect: "coffee", goal: "Забери кофе" },
      { point: "desk", deliver: true, goal: "Кофе — к столу" },
      { point: "printer", collect: "paper", goal: "Забери распечатку" },
      { point: "board", deliver: true, goal: "Распечатка — к доске" },
    ],
    limit: 58,
  },
  {
    id: 10,
    title: "Три парковки",
    icon: "chair",
    text: "Остановись у принтера, у кофе и на коврике.",
    kind: "errands",
    stops: [
      { point: "printer", goal: "Парковка у принтера" },
      { point: "coffee", goal: "Парковка у кофе" },
      { point: "mat", goal: "Парковка на коврике" },
    ],
    limit: 48,
  },
  {
    id: 11,
    title: "Через весь офис",
    icon: "heart",
    text: "Конверт у доски. Через кофе и коврик — к столу.",
    kind: "errands",
    stops: [
      { point: "board", collect: "letter", goal: "Забери конверт" },
      { point: "coffee", gate: true, goal: "Проедь мимо кофе" },
      { point: "mat", gate: true, goal: "Проедь через коврик" },
      { point: "desk", deliver: true, goal: "Конверт — к столу" },
    ],
    limit: 55,
  },
];
export function layoutFor(id) {
  const obstacles = OBSTACLES.map((o) => ({ ...o })),
    points = structuredClone(POINTS);
  let mat = { x: 644, y: 788, w: 151, h: 86 };
  const move = (type, x, y) =>
    Object.assign(
      obstacles.find((o) => o.type === type),
      { x, y },
    );
  const point = (key, x, y) => Object.assign(points[key], { x, y });
  if (id === 6) {
    move("coffee", 115, 407);
    point("coffee", 190, 552);
    move("printer", 704, 429);
    point("printer", 758, 603);
  }
  if (id === 7 || id === 11) {
    move("board", 543, 100);
    point("board", 663, 233);
    move("boxes", 135, 115);
  }
  if (id === 8) {
    move("desk", 440, 758);
    point("desk", 610, 666);
    mat = { x: 123, y: 835, w: 151, h: 86 };
    point("mat", 198, 875);
  }
  if (id === 9) {
    move("board", 500, 110);
    point("board", 620, 233);
    move("boxes", 110, 130);
    move("coffee", 115, 382);
    point("coffee", 190, 524);
    move("printer", 670, 470);
    point("printer", 725, 612);
    move("desk", 440, 754);
    point("desk", 610, 666);
  }
  if (id === 10) {
    move("boxes", 500, 240);
    move("coffee", 655, 115);
    point("coffee", 730, 259);
    move("printer", 110, 520);
    point("printer", 260, 620);
  }
  return { obstacles, points, mat };
}
export function objective(g) {
  if (g.free) return "";
  const m = MISSIONS[g.missionId];
  if (m.kind === "errands") return m.stops[g.stage]?.goal || "";
  if (m.kind === "route" && g.stage < m.gates.length)
    return `Круг ${g.stage + 1} / ${m.gates.length}`;
  if (m.kind === "delivery" && g.stage === 0)
    return `Забери ${{ coffee: "кофе", pen: "маркер", paper: "распечатку", letter: "конверт" }[m.item]}`;
  return m.destination === "mat"
    ? "Парковка на коврике"
    : m.destination === "board"
      ? "К доске"
      : "К столу";
}
export function createGame(missionId = 0, free = false, saved = null) {
  const g = {
    missionId,
    free,
    layout: layoutFor(missionId),
    phase: "playing",
    x: 280,
    y: 617,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    time: 0,
    pushes: 0,
    hits: 0,
    stage: 0,
    dwell: 0,
    carrying: null,
    coffee: 100,
    combo: null,
    feet: { left: false, right: false },
    held: 0,
    repeat: 0,
    anim: { left: 0, right: 0 },
    bumpCooldown: 0,
    trail: [],
    events: [],
    lastFoot: null,
  };
  if (saved && saved.missionId === missionId && saved.free === free) {
    for (const k of [
      "x",
      "y",
      "vx",
      "vy",
      "angle",
      "time",
      "pushes",
      "hits",
      "stage",
      "carrying",
      "coffee",
    ])
      if (typeof saved[k] === typeof g[k] || k === "carrying") g[k] = saved[k];
    g.x = Math.max(80, Math.min(850, g.x));
    g.y = Math.max(180, Math.min(920, g.y));
  }
  return g;
}
export function speed(g) {
  return Math.hypot(g.vx, g.vy);
}
export function inputFoot(g, foot, down) {
  if (g.phase !== "playing" || !["left", "right"].includes(foot)) return;
  if (g.feet[foot] === down) return;
  g.feet[foot] = down;
  g.held = 0;
  g.repeat = 0;
  if (down) {
    g.anim[foot] = 0.38;
    g.lastFoot = foot;
    if (!g.combo) g.combo = { age: 0, left: g.feet.left, right: g.feet.right };
    g.combo[foot] = true;
  }
}
export function releaseAll(g) {
  g.feet.left = false;
  g.feet.right = false;
  g.combo = null;
  g.held = 0;
  g.repeat = 0;
}
function push(g, left, right) {
  const both = left && right;
  g.angle += left && !right ? 0.29 : right && !left ? -0.29 : 0;
  const thrust = both ? 218 : 157;
  g.vx += Math.cos(g.angle) * thrust;
  g.vy += Math.sin(g.angle) * thrust;
  const s = speed(g);
  if (s > 235) {
    g.vx *= 235 / s;
    g.vy *= 235 / s;
  }
  g.pushes++;
  if (left) g.anim.left = 0.38;
  if (right) g.anim.right = 0.38;
  g.events.push({ type: "push", both });
}
export function target(g) {
  if (g.free) return null;
  const m = MISSIONS[g.missionId];
  if (m.kind === "route" && g.stage < m.gates.length)
    return { ...m.gates[g.stage], radius: 45, rolling: true };
  if (m.kind === "errands") {
    const stop = m.stops[g.stage];
    return stop
      ? {
          ...g.layout.points[stop.point],
          radius: stop.gate ? 45 : 53,
          rolling: !!stop.gate,
          pickup: !!stop.collect,
        }
      : null;
  }
  if (m.kind === "delivery" && g.stage === 0)
    return { ...g.layout.points[m.pickup], radius: 53, pickup: true };
  return { ...g.layout.points[m.destination], radius: 57 };
}
export function stars(g) {
  const m = MISSIONS[g.missionId];
  return 1 + (g.hits === 0 ? 1 : 0) + (g.pushes <= m.limit ? 1 : 0);
}
export function snapshot(g) {
  return Object.fromEntries(
    [
      "missionId",
      "free",
      "x",
      "y",
      "vx",
      "vy",
      "angle",
      "time",
      "pushes",
      "hits",
      "stage",
      "carrying",
      "coffee",
    ].map((k) => [k, g[k]]),
  );
}
function collision(g, nx, ny, penetration) {
  const impact = -(g.vx * nx + g.vy * ny);
  g.x += nx * penetration;
  g.y += ny * penetration;
  if (impact > 0) {
    g.vx += nx * impact * 1.36;
    g.vy += ny * impact * 1.36;
    g.vx *= 0.76;
    g.vy *= 0.76;
  }
  if (impact > 38 && g.bumpCooldown <= 0) {
    g.hits++;
    g.bumpCooldown = 0.55;
    g.events.push({ type: "bump" });
    if (g.carrying === "coffee") g.coffee = Math.max(0, g.coffee - 17);
  }
}
export function step(g, dt) {
  if (g.phase !== "playing") return;
  dt = Math.min(Math.max(dt, 0), 0.035);
  g.time += dt;
  g.bumpCooldown = Math.max(0, g.bumpCooldown - dt);
  for (const f of ["left", "right"]) g.anim[f] = Math.max(0, g.anim[f] - dt);
  if (g.combo) {
    g.combo.age += dt;
    const paired = g.combo.left && g.combo.right;
    if (paired && g.feet.left && g.feet.right) {
      if (g.combo.age >= 0.24) g.combo = null;
    } else if (g.combo.age >= 0.075) {
      push(g, g.combo.left, g.combo.right);
      g.combo = null;
    }
  }
  const l = g.feet.left,
    r = g.feet.right;
  g.held += l || r ? dt : -g.held;
  g.repeat += dt;
  const brake = l && r && g.held > 0.2;
  if (l !== r && g.held > 0.3) {
    g.angle += (l ? 1 : -1) * 1.38 * dt;
    if (g.repeat > 0.49) {
      push(g, l, r);
      g.repeat = 0;
    }
  }
  const mr = g.layout.mat,
    mat = g.x > mr.x && g.x < mr.x + mr.w && g.y > mr.y && g.y < mr.y + mr.h;
  const friction = brake ? 11.5 : mat ? 2.5 : 0.9;
  g.vx *= Math.exp(-friction * dt);
  g.vy *= Math.exp(-friction * dt);
  if (speed(g) < 1.5) {
    g.vx = 0;
    g.vy = 0;
  }
  g.x += g.vx * dt;
  g.y += g.vy * dt;
  const radius = 21;
  if (g.x < 65 + radius) collision(g, 1, 0, 65 + radius - g.x);
  if (g.x > 859 - radius) collision(g, -1, 0, g.x - (859 - radius));
  if (g.y < 90 + radius) collision(g, 0, 1, 90 + radius - g.y);
  if (g.y > 932 - radius) collision(g, 0, -1, g.y - (932 - radius));
  for (const o of g.layout.obstacles) {
    const cx = Math.max(o.x, Math.min(o.x + o.w, g.x)),
      cy = Math.max(o.y, Math.min(o.y + o.h, g.y));
    const dx = g.x - cx,
      dy = g.y - cy,
      d = Math.hypot(dx, dy);
    if (d > 0 && d < radius) collision(g, dx / d, dy / d, radius - d);
    else if (d === 0) {
      const sides = [
        { d: g.x - o.x, nx: -1, ny: 0 },
        { d: o.x + o.w - g.x, nx: 1, ny: 0 },
        { d: g.y - o.y, nx: 0, ny: -1 },
        { d: o.y + o.h - g.y, nx: 0, ny: 1 },
      ].sort((a, b) => a.d - b.d);
      collision(g, sides[0].nx, sides[0].ny, sides[0].d + radius);
    }
  }
  if (
    speed(g) > 30 &&
    (g.trail.length === 0 ||
      Math.hypot(g.x - g.trail.at(-1).x, g.y - g.trail.at(-1).y) > 10)
  )
    g.trail.push({ x: g.x, y: g.y, t: g.time });
  g.trail = g.trail.filter((p) => g.time - p.t < 2.8).slice(-90);
  const t = target(g);
  if (t) {
    const close = Math.hypot(g.x - t.x, g.y - t.y) < t.radius;
    if (t.rolling) {
      if (close) {
        g.stage++;
        g.events.push({ type: "gate", stage: g.stage });
      }
    } else {
      g.dwell = close && speed(g) < 30 ? g.dwell + dt : 0;
      if (g.dwell > 0.65) {
        const m = MISSIONS[g.missionId];
        g.dwell = 0;
        if (m.kind === "errands") {
          const stop = m.stops[g.stage];
          if (stop.collect) {
            g.carrying = stop.collect;
            g.events.push({ type: "pickup", item: stop.collect });
          }
          if (stop.deliver) g.carrying = null;
          g.stage++;
          if (g.stage === m.stops.length) {
            g.phase = "won";
            releaseAll(g);
            g.events.push({ type: "win", stars: stars(g) });
          } else g.events.push({ type: "stop", stage: g.stage });
        } else if (t.pickup) {
          g.stage = 1;
          g.carrying = m.item;
          g.events.push({ type: "pickup", item: m.item });
        } else {
          g.phase = "won";
          releaseAll(g);
          g.events.push({ type: "win", stars: stars(g) });
        }
      }
    }
  }
}

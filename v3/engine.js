import {
  CHAIR_RADIUS,
  WALK_RADIUS,
  OFFICE_BOUNDS,
  footprintsFor,
} from "./geometry.js";
import {
  WALK_TASKS,
  BREAK_TASKS,
  SHIFT_TASKS,
  STREET,
  WORK_POINTS,
  createWorkState,
  currentTask,
  taskReady,
  taskTarget,
  stepWorkday,
  actionFor,
  interact as workInteract,
  workClock,
  clockLabel,
} from "./workday.js";
export const WORLD = { width: 900, height: 980 };
export { actionFor, workClock, clockLabel };
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
  { x: 80, y: 692, w: 26, h: 34, type: "basket" },
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
  {
    id: 12,
    title: "Успеть до звонка",
    caption: "Кресло против часов",
    icon: "chair",
    text: "Три круга и парковка до звонка. На всё — 90 секунд. Если опоздать, кресло опрокинется, а Даша окажется на полу.",
    kind: "route",
    destination: "mat",
    timeLimit: 90,
    limit: 36,
    gates: [
      { x: 435, y: 270 },
      { x: 540, y: 530 },
      { x: 550, y: 745 },
    ],
  },
  {
    id: 13,
    title: "На своих двоих",
    caption: "Звонок, кресло и прогулка",
    icon: "phone",
    text: "Двигайся джойстиком. Подойди к телефону и нажми «Позвонить». Затем сядь в кресло, прокатись до коврика и встань. В кресле работают привычные две ноги.",
    kind: "workday",
    tasks: WALK_TASKS,
    timeLimit: 180,
    limit: 20,
  },
  {
    id: 14,
    title: "На перекур",
    caption: "Выйти к Держпрому",
    icon: "leaf",
    text: "Позвони, прокатись, встань и выйди через дверь. Сделай перерыв с видом на Держпром и вернись к работе. Если зайдёт посетитель, подойди и ответь ему.",
    kind: "workday",
    tasks: BREAK_TASKS,
    timeLimit: 300,
    limit: 30,
  },
  {
    id: 15,
    title: "С девяти до пяти",
    caption: "Один длинный рабочий день",
    icon: "clock",
    text: "Полная смена: звонки, документы, кресло и перекуры. Посетители мешают работать, полиция смотрит в окна. Ответь на вопросы и закончи все дела к 17:00. Восемь офисных часов проходят за 12 минут. Пауза и сохранение доступны в любой момент.",
    kind: "shift",
    tasks: SHIFT_TASKS,
    limit: 60,
  },
];
export function stageCount(mission) {
  return mission.tasks
    ? mission.tasks.length
    : mission.kind === "errands"
      ? mission.stops.length
      : mission.kind === "route"
        ? mission.gates.length + 1
        : mission.kind === "delivery"
          ? 2
          : 1;
}
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
  if (m.tasks) {
    if (g.work.reply) return "Отвечаем посетителю…";
    if (
      g.work.visitors.some(
        (v) =>
          !v.leaving &&
          g.area === "office" &&
          Math.hypot(g.x - v.x, g.y - v.y) < 155,
      )
    )
      return "Посетитель отвлекает · ответь ему";
    const task = currentTask(g, m);
    if (!task) return "Дела сделаны · дождись 17:00";
    if (!taskReady(g, task))
      return `До ${clockLabel(task.from)} — свободное время`;
    if ((task.area || "office") !== g.area)
      return g.area === "street" ? "Вернись в офис" : "Выйди к офису";
    if (task.action === "ride" && g.mode === "walk")
      return "Сядь в кресло, чтобы продолжить поездку";
    return task.goal;
  }
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
    mode: MISSIONS[missionId]?.tasks && !free ? "walk" : "chair",
    area: "office",
    joystick: { x: 0, y: 0 },
    parkedChair: { x: 280, y: 658, angle: Math.PI / 2 },
    interaction: null,
    work:
      MISSIONS[missionId]?.tasks && !free ? createWorkState(saved?.work) : null,
    fall: null,
  };
  if (g.work) {
    g.x = 338;
    g.y = 650;
    g.angle = Math.PI / 2;
  }
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
      if (
        (typeof g[k] === "number" && Number.isFinite(saved[k])) ||
        (k === "carrying" &&
          [null, "coffee", "pen", "paper", "letter"].includes(saved[k]))
      )
        g[k] = saved[k];
    if (g.work) {
      g.mode = saved.mode === "chair" ? "chair" : "walk";
      g.area =
        saved.area === "street" && g.mode === "walk" ? "street" : "office";
      if (
        ["x", "y", "angle"].every((key) =>
          Number.isFinite(saved.parkedChair?.[key]),
        )
      )
        g.parkedChair = {
          x: Math.max(86, Math.min(838, saved.parkedChair.x)),
          y: Math.max(111, Math.min(911, saved.parkedChair.y)),
          angle: saved.parkedChair.angle,
        };
      if (
        saved.interaction?.stage === g.stage &&
        Number.isFinite(saved.interaction.elapsed)
      ) {
        const optionalBreak =
          saved.interaction.task === false &&
          saved.interaction.type === "smoke" &&
          g.area === "street";
        const task = MISSIONS[missionId].tasks[g.stage];
        const duration = optionalBreak
          ? 8
          : saved.interaction.type === task?.action
            ? task.duration
            : 0;
        if (duration)
          g.interaction = {
            type: saved.interaction.type,
            stage: g.stage,
            area: g.area,
            duration,
            task: !optionalBreak,
            elapsed: Math.max(0, Math.min(duration, saved.interaction.elapsed)),
          };
      }
    }
    const bounds = g.area === "street" ? STREET.bounds : OFFICE_BOUNDS;
    g.x = Math.max(
      bounds.left + CHAIR_RADIUS,
      Math.min(bounds.right - CHAIR_RADIUS, g.x),
    );
    g.y = Math.max(
      bounds.top + CHAIR_RADIUS,
      Math.min(bounds.bottom - CHAIR_RADIUS, g.y),
    );
    g.time = Math.max(0, g.time);
    g.stage = Math.max(
      0,
      Math.min(stageCount(MISSIONS[missionId]), Math.floor(g.stage)),
    );
  }
  return g;
}
export function speed(g) {
  return Math.hypot(g.vx, g.vy);
}
export function inputFoot(g, foot, down) {
  if (
    g.phase !== "playing" ||
    g.mode !== "chair" ||
    !["left", "right"].includes(foot)
  )
    return;
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
  g.joystick = { x: 0, y: 0 };
}
export function inputJoystick(g, x, y) {
  if (
    g.phase !== "playing" ||
    g.mode !== "walk" ||
    !Number.isFinite(x) ||
    !Number.isFinite(y)
  )
    return;
  const length = Math.max(1, Math.hypot(x, y));
  g.joystick = { x: x / length, y: y / length };
}
export function interact(g) {
  if (g.work) {
    workInteract(g, MISSIONS[g.missionId]);
    releaseAll(g);
  }
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
  if (m.tasks) {
    const task = currentTask(g, m);
    if (!taskReady(g, task)) return null;
    if ((task.area || "office") !== g.area)
      return {
        ...(g.area === "street" ? STREET.points.entrance : WORK_POINTS.exit),
        radius: 53,
      };
    if (task.action === "ride" && g.mode === "walk")
      return { ...g.parkedChair, radius: 53 };
    return taskTarget(g, task);
  }
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
  if (m.kind === "shift")
    return (
      1 + (g.work.stress < 50 ? 1 : 0) + (g.work.answered.length >= 4 ? 1 : 0)
    );
  return 1 + (g.hits === 0 ? 1 : 0) + (g.pushes <= m.limit ? 1 : 0);
}
export function snapshot(g) {
  const result = Object.fromEntries(
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
  if (g.work)
    Object.assign(result, {
      mode: g.mode,
      area: g.area,
      parkedChair: { ...g.parkedChair },
      work: {
        stress: g.work.stress,
        answered: [...g.work.answered],
        visitors: structuredClone(g.work.visitors),
        police: g.work.police,
        policeSince: g.work.policeSince,
      },
      interaction: g.interaction ? { ...g.interaction } : null,
    });
  return result;
}
function finish(g) {
  g.phase = "won";
  releaseAll(g);
  g.events.push({ type: "win", stars: stars(g) });
}
function lose(g, reason) {
  g.fall = { age: 0, reason };
  g.phase = g.mode === "chair" ? "falling" : "lost";
  g.vx = g.vy = 0;
  releaseAll(g);
  g.events.push({ type: g.phase === "falling" ? "fall" : "lose", reason });
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
  dt = Math.min(Math.max(dt, 0), 0.035);
  if (g.phase === "falling") {
    g.fall.age += dt;
    if (g.fall.age >= 1.35) {
      g.phase = "lost";
      g.events.push({ type: "lose", reason: g.fall.reason });
    }
    return;
  }
  if (g.phase !== "playing") return;
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
  if (g.mode === "walk") {
    const walking = Math.hypot(g.joystick.x, g.joystick.y) > 0.08;
    g.vx = walking ? g.joystick.x * 145 : 0;
    g.vy = walking ? g.joystick.y * 145 : 0;
    if (walking) g.angle = Math.atan2(g.vy, g.vx);
  } else {
    const friction = brake ? 11.5 : mat ? 2.5 : 0.9;
    g.vx *= Math.exp(-friction * dt);
    g.vy *= Math.exp(-friction * dt);
  }
  if (speed(g) < 1.5) {
    g.vx = 0;
    g.vy = 0;
  }
  g.x += g.vx * dt;
  g.y += g.vy * dt;
  const radius = g.mode === "walk" ? WALK_RADIUS : CHAIR_RADIUS;
  const bounds = g.area === "street" ? STREET.bounds : OFFICE_BOUNDS;
  if (g.x < bounds.left + radius)
    collision(g, 1, 0, bounds.left + radius - g.x);
  if (g.x > bounds.right - radius)
    collision(g, -1, 0, g.x - (bounds.right - radius));
  if (g.y < bounds.top + radius) collision(g, 0, 1, bounds.top + radius - g.y);
  if (g.y > bounds.bottom - radius)
    collision(g, 0, -1, g.y - (bounds.bottom - radius));
  const solids =
    g.area === "street"
      ? STREET.buildings
      : g.layout.obstacles.flatMap(footprintsFor);
  if (g.work && g.mode === "walk" && g.area === "office")
    solids.push({ x: g.parkedChair.x, y: g.parkedChair.y, radius: 19 });
  for (const o of solids) {
    if (o.radius !== undefined) {
      const dx = g.x - o.x,
        dy = g.y - o.y,
        distance = Math.hypot(dx, dy),
        overlap = radius + o.radius - distance;
      if (overlap > 0)
        collision(
          g,
          distance ? dx / distance : 1,
          distance ? dy / distance : 0,
          overlap,
        );
      continue;
    }
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
  const mission = MISSIONS[g.missionId];
  if (g.work) {
    const result = stepWorkday(g, mission, dt);
    if (result?.lost) lose(g, result.lost);
    else if (result?.won) finish(g);
  }
  if (
    !g.free &&
    g.phase === "playing" &&
    mission.timeLimit &&
    g.time >= mission.timeLimit
  ) {
    lose(
      g,
      g.mode === "chair"
        ? "Время вышло. Даша и кресло решили отдохнуть на полу."
        : "Время вышло. Дела подождут следующей попытки.",
    );
  }
  if (g.work || g.phase !== "playing") return;
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

export const SHIFT_SECONDS = 720;
export const SHIFT_START = 9 * 60;
export const SHIFT_END = 17 * 60;
export const STREET = {
  width: 1300,
  height: 1240,
  bounds: { left: 45, top: 35, right: 1255, bottom: 1200 },
  buildings: [
    { x: 120, y: 130, w: 250, h: 360, type: "landmark" },
    { x: 475, y: 80, w: 350, h: 410, type: "landmark" },
    { x: 930, y: 130, w: 250, h: 360, type: "landmark" },
    { x: 720, y: 885, w: 490, h: 275, type: "office" },
    { x: 80, y: 920, w: 330, h: 240, type: "neighbour" },
  ],
  points: {
    entrance: { x: 665, y: 1010, label: "В офис" },
    smoke: { x: 548, y: 919, label: "Перекур" },
  },
};
export const WORK_POINTS = {
  phone: { x: 280, y: 658, label: "Телефон" },
  chair: { x: 280, y: 658, label: "Кресло" },
  exit: { x: 436, y: 160, label: "Выход" },
};

const call = (from, goal = "Позвони клиенту") => ({
  point: "phone",
  action: "call",
  duration: 5,
  from,
  goal,
});
const work = (from, goal = "Разбери документы") => ({
  point: "desk",
  action: "work",
  duration: 9,
  from,
  goal,
});
const ride = (from) => [
  { point: "chair", action: "sit", from, goal: "Сядь в кресло" },
  { point: "mat", action: "ride", goal: "Прокатись до коврика и затормози" },
  { action: "stand", goal: "Встань с кресла" },
];
const breakTime = (from) => [
  { point: "exit", action: "exit", from, goal: "Выйди из офиса" },
  {
    area: "street",
    point: "smoke",
    action: "smoke",
    duration: 8,
    goal: "Сделай перерыв у офиса",
  },
  {
    area: "street",
    point: "entrance",
    action: "enter",
    goal: "Вернись в офис",
  },
];
export const WALK_TASKS = [call(0), ...ride(0)];
export const BREAK_TASKS = [
  call(0),
  ...ride(0),
  ...breakTime(0),
  work(0, "Вернись к документам"),
];
export const SHIFT_TASKS = [
  call(540, "09:00 · Первый звонок"),
  work(550),
  ...ride(585),
  call(615, "10:15 · Перезвони клиенту"),
  ...breakTime(650),
  work(690, "11:30 · Подготовь документы"),
  call(735, "12:15 · Уточни детали"),
  {
    point: "coffee",
    action: "coffee",
    duration: 5,
    from: 765,
    goal: "12:45 · Кофейная пауза",
  },
  work(795, "13:15 · Разбери почту"),
  ...ride(825),
  ...breakTime(870),
  call(915, "15:15 · Последний клиент"),
  work(960, "16:00 · Закончи документы"),
  {
    point: "desk",
    action: "work",
    duration: 6,
    from: 1000,
    goal: "16:40 · Закрой рабочий день",
  },
];
const VISITS = [
  { at: 35, phrase: "А что у вас тут такое?", color: "#b89773" },
  {
    at: 142,
    phrase: "Ну рассказывайте, чем вы тут занимаетесь",
    color: "#8e91a5",
  },
  { at: 277, phrase: "А что у вас тут такое?", color: "#91a282" },
  {
    at: 435,
    phrase: "Ну рассказывайте, чем вы тут занимаетесь",
    color: "#b38789",
  },
  {
    at: 585,
    phrase: "Я только спросить. А что у вас тут такое?",
    color: "#879f9f",
  },
];

export function isWorkMission(mission) {
  return !!mission.tasks;
}
export function workClock(g) {
  return g.missionId === 15
    ? Math.min(
        SHIFT_END,
        SHIFT_START + (g.time * (SHIFT_END - SHIFT_START)) / SHIFT_SECONDS,
      )
    : SHIFT_START + g.time;
}
export function clockLabel(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(Math.floor(minutes % 60)).padStart(2, "0")}`;
}
export function createWorkState(saved) {
  const visitors = [];
  for (const source of Array.isArray(saved?.visitors) ? saved.visitors : []) {
    const visit = VISITS[source?.id];
    if (
      !visit ||
      !Number.isInteger(source.id) ||
      visitors.some((v) => v.id === source.id) ||
      !Number.isFinite(source.x) ||
      !Number.isFinite(source.y)
    )
      continue;
    visitors.push({
      id: source.id,
      ...visit,
      since: visit.at,
      x: Math.max(100, Math.min(800, source.x)),
      y: Math.max(146, Math.min(700, source.y)),
      leaving: source.leaving === true,
    });
  }
  return {
    stress: Number.isFinite(saved?.stress)
      ? Math.max(0, Math.min(100, saved.stress))
      : 0,
    answered: Array.isArray(saved?.answered)
      ? [
          ...new Set(
            saved.answered.filter(
              (id) => Number.isInteger(id) && id >= 0 && id < VISITS.length,
            ),
          ),
        ]
      : [],
    visitors,
    reply: null,
    police: saved?.police === true,
    policeSince: Number.isFinite(saved?.policeSince)
      ? Math.max(0, saved.policeSince)
      : 0,
  };
}
export function currentTask(g, mission) {
  return mission.tasks?.[g.stage] || null;
}
export function taskReady(g, task) {
  return task && (!task.from || workClock(g) >= task.from);
}
export function taskTarget(g, task) {
  if (!task) return null;
  if (!task.point) return { x: g.x, y: g.y, radius: 50 };
  if (task.point === "chair") return { ...g.parkedChair, radius: 53 };
  const point = (
    task.area === "street"
      ? STREET.points
      : { ...g.layout.points, ...WORK_POINTS }
  )[task.point];
  return { ...point, radius: task.action === "ride" ? 57 : 53 };
}
export function nearbyVisitor(g) {
  if (!g.work || g.area !== "office") return null;
  return (
    g.work.visitors.find(
      (v) => !v.leaving && Math.hypot(g.x - v.x, g.y - v.y) < 155,
    ) || null
  );
}
function closeTo(g, t) {
  return Math.hypot(g.x - t.x, g.y - t.y) < t.radius;
}
const LABELS = {
  call: "Позвонить",
  work: "Работать",
  coffee: "Сделать кофе",
  sit: "Сесть",
  stand: "Встать",
  exit: "Выйти",
  enter: "В офис",
  smoke: "Перекур",
};
export function actionFor(g, mission) {
  if (!g.work || g.phase !== "playing") return null;
  if (g.work.reply) return { type: "reply", label: "Отвечаем…", busy: true };
  const visitor = nearbyVisitor(g);
  if (visitor)
    return { type: "reply", label: "Ответить", visitorId: visitor.id };
  if (g.interaction)
    return {
      type: g.interaction.type,
      label: `${LABELS[g.interaction.type]}…`,
      busy: true,
    };
  const task = currentTask(g, mission);
  if (
    taskReady(g, task) &&
    (task.area || "office") === g.area &&
    closeTo(g, taskTarget(g, task)) &&
    task.action !== "ride"
  ) {
    const mode = task.action === "stand" ? "chair" : "walk";
    if (g.mode === mode && Math.hypot(g.vx, g.vy) < 25)
      return {
        type: task.action,
        label: LABELS[task.action],
        task: true,
        duration: task.duration || 0,
      };
  }
  if (g.mode === "chair" && Math.hypot(g.vx, g.vy) < 25)
    return { type: "stand", label: "Встать" };
  if (g.area === "office" && g.mode === "walk") {
    if (closeTo(g, { ...g.parkedChair, radius: 53 }))
      return { type: "sit", label: "Сесть" };
    if (closeTo(g, { ...WORK_POINTS.exit, radius: 53 }))
      return { type: "exit", label: "Выйти" };
  }
  if (g.area === "street") {
    if (closeTo(g, { ...STREET.points.entrance, radius: 53 }))
      return { type: "enter", label: "В офис" };
    if (closeTo(g, { ...STREET.points.smoke, radius: 53 }))
      return { type: "smoke", label: "Перекур", duration: 8 };
  }
  return null;
}
export function completeTask(g) {
  g.stage++;
  g.dwell = 0;
  g.interaction = null;
  g.events.push({ type: "stop", stage: g.stage });
}
export function interact(g, mission) {
  const action = actionFor(g, mission);
  if (!action || action.busy) return;
  if (action.type === "reply") {
    g.work.reply = { id: action.visitorId, elapsed: 0 };
    return;
  }
  if (action.duration) {
    g.interaction = {
      type: action.type,
      duration: action.duration,
      elapsed: 0,
      stage: g.stage,
      area: g.area,
      task: !!action.task,
    };
    return;
  }
  if (action.type === "sit") {
    Object.assign(g, {
      x: g.parkedChair.x,
      y: g.parkedChair.y,
      angle: g.parkedChair.angle,
      mode: "chair",
    });
  } else if (action.type === "stand") {
    g.parkedChair = { x: g.x, y: g.y, angle: g.angle };
    g.x += 38;
    g.mode = "walk";
  } else if (action.type === "exit") {
    g.area = "street";
    Object.assign(g, STREET.points.entrance);
    g.angle = Math.PI;
  } else if (action.type === "enter") {
    g.area = "office";
    Object.assign(g, WORK_POINTS.exit);
    g.y += 25;
    g.angle = Math.PI / 2;
  }
  g.vx = g.vy = 0;
  g.joystick = { x: 0, y: 0 };
  g.events.push({ type: "mode" });
  if (action.task) completeTask(g);
}

export function stepWorkday(g, mission, dt) {
  const shift = mission.kind === "shift";
  const visits = shift ? VISITS : g.missionId === 14 ? VISITS.slice(0, 1) : [];
  for (let id = 0; id < visits.length; id++) {
    const visit = visits[id];
    if (
      g.time >= visit.at &&
      g.time < visit.at + 92 &&
      !g.work.answered.includes(id) &&
      !g.work.visitors.some((v) => v.id === id)
    ) {
      g.work.visitors.push({
        id,
        x: 436,
        y: 146,
        since: visit.at,
        ...visit,
        leaving: false,
      });
      g.events.push({ type: "visitor", text: visit.phrase });
    }
  }
  for (const visitor of g.work.visitors) {
    visitor.leaving ||= g.time - visitor.since > 92;
    // The central aisle stays clear of every furniture footprint.
    const goal = visitor.leaving ? WORK_POINTS.exit : { x: 436, y: 630 };
    const dx = goal.x - visitor.x,
      dy = goal.y - visitor.y,
      distance = Math.hypot(dx, dy);
    if (distance > 4) {
      const travel = Math.min(distance, 72 * dt);
      visitor.x += (dx / distance) * travel;
      visitor.y += (dy / distance) * travel;
    }
  }
  g.work.visitors = g.work.visitors.filter((v) => !(v.leaving && v.y < 170));
  const visitor = nearbyVisitor(g);
  if (g.work.reply) {
    const replying = g.work.visitors.find(
      (v) => v.id === g.work.reply.id && !v.leaving,
    );
    if (
      !replying ||
      g.area !== "office" ||
      Math.hypot(g.x - replying.x, g.y - replying.y) >= 160 ||
      Math.hypot(g.vx, g.vy) > 25
    )
      g.work.reply = null;
    else {
      g.work.reply.elapsed += dt;
      if (g.work.reply.elapsed >= 2.5) {
        replying.leaving = true;
        g.work.answered.push(replying.id);
        g.work.reply = null;
        g.work.stress = Math.max(0, g.work.stress - 9);
        g.events.push({ type: "reply", text: "Хорошего дня!" });
      }
    }
  }
  const minute = workClock(g);
  const police =
    shift &&
    ((minute >= 610 && minute < 700) || (minute >= 880 && minute < 975));
  if (police && !g.work.police) {
    g.work.policeSince = g.time;
    g.events.push({
      type: "police",
      text: "К офису приехала полиция. Смотрят в окна.",
    });
  }
  g.work.police = police;
  g.work.stress = Math.max(
    0,
    Math.min(100, g.work.stress + (visitor ? 0.65 : -0.08) * dt),
  );
  let task = currentTask(g, mission);
  if (taskReady(g, task)) {
    const alreadyDone =
      (task.action === "sit" && g.mode === "chair") ||
      (task.action === "stand" && g.mode === "walk") ||
      (task.action === "exit" && g.area === "street") ||
      (task.action === "enter" && g.area === "office");
    if (alreadyDone) {
      completeTask(g);
      task = currentTask(g, mission);
    }
  }
  if (g.interaction) {
    const point = g.interaction.task
      ? taskTarget(g, task)
      : { ...STREET.points.smoke, radius: 53 };
    if (
      !point ||
      g.interaction.stage !== g.stage ||
      g.area !== g.interaction.area ||
      !closeTo(g, point) ||
      Math.hypot(g.vx, g.vy) > 25
    )
      g.interaction = null;
    else if (!visitor && !g.work.reply) {
      g.interaction.elapsed += dt;
      if (g.interaction.elapsed >= g.interaction.duration) {
        if (["smoke", "coffee"].includes(g.interaction.type))
          g.work.stress = Math.max(0, g.work.stress - 22);
        if (g.interaction.task) completeTask(g);
        else {
          g.interaction = null;
          g.events.push({ type: "stop", stage: g.stage });
        }
      }
    }
  }
  if (
    taskReady(g, task) &&
    task.action === "ride" &&
    g.mode === "chair" &&
    g.area === "office"
  ) {
    g.dwell =
      closeTo(g, taskTarget(g, task)) && Math.hypot(g.vx, g.vy) < 30
        ? g.dwell + dt
        : 0;
    if (g.dwell >= 0.8) completeTask(g);
  }
  if (g.work.stress >= 100)
    return { lost: "Слишком много вопросов. Пора начать смену заново." };
  if (shift && g.time >= SHIFT_SECONDS) {
    return g.stage >= mission.tasks.length
      ? { won: true }
      : { lost: "Уже 17:00, а дела остались. Попробуем ещё одну смену?" };
  }
  if (!shift && g.stage >= mission.tasks.length) return { won: true };
  return null;
}

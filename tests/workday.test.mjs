import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  inputJoystick,
  inputFoot,
  interact,
  actionFor,
  step,
  target,
  MISSIONS,
  snapshot,
  objective,
} from "../v3/engine-3.0.2.js";
import { STREET, SHIFT_SECONDS, workClock } from "../v3/workday.js";
import {
  footprintsFor,
  distanceToSolid,
  OFFICE_BOUNDS,
} from "../v3/geometry.js";
const tick = (g, seconds) => {
  for (let i = 0; i < Math.ceil(seconds * 120); i++) step(g, 1 / 120);
};
function place(g, t) {
  g.x = t.x;
  g.y = t.y;
  g.vx = g.vy = 0;
  inputJoystick(g, 0, 0);
}

test("joystick walks in world space, normalizes diagonals and releases without drifting", () => {
  const g = createGame(13);
  inputFoot(g, "left", true);
  assert.equal(g.feet.left, false);
  const x = g.x,
    y = g.y;
  inputJoystick(g, 1, -1);
  tick(g, 0.25);
  assert.ok(g.x > x + 20 && g.y < y - 20);
  assert.ok(Math.hypot(g.vx, g.vy) <= 145.0001);
  inputJoystick(g, 0, 0);
  const stopped = g.x;
  tick(g, 0.5);
  assert.equal(g.x, stopped);
  g.phase = "paused";
  inputJoystick(g, 1, 0);
  tick(g, 1);
  assert.equal(g.x, stopped);
});
test("calls need an explicit action; moving cancels work; sitting switches controls", () => {
  const g = createGame(13);
  place(g, target(g));
  tick(g, 1);
  assert.equal(g.stage, 0);
  interact(g);
  tick(g, 2);
  assert.equal(g.stage, 0);
  inputJoystick(g, 1, 0);
  tick(g, 0.2);
  assert.equal(g.interaction, null);
  place(g, target(g));
  interact(g);
  tick(g, 5.1);
  assert.equal(g.stage, 1);
  interact(g);
  assert.equal(g.mode, "chair");
  inputJoystick(g, 1, 0);
  assert.deepEqual(g.joystick, { x: 0, y: 0 });
  place(g, target(g));
  tick(g, 0.9);
  assert.equal(g.stage, 3);
  interact(g);
  assert.equal(g.mode, "walk");
  tick(g, 0.02);
  assert.equal(g.phase, "won");
});
test("visitors interrupt calls until answered, then leave and work resumes", () => {
  const g = createGame(15);
  place(g, target(g));
  interact(g);
  tick(g, 1);
  g.time = 40;
  g.work.visitors = [
    {
      id: 0,
      x: 350,
      y: 630,
      since: 35,
      phrase: "А что у вас тут такое?",
      color: "#888",
      leaving: false,
    },
  ];
  const elapsed = g.interaction.elapsed;
  tick(g, 0.5);
  assert.equal(g.interaction.elapsed, elapsed);
  assert.match(objective(g), /Посетитель/);
  assert.equal(actionFor(g, MISSIONS[15]).type, "reply");
  interact(g);
  tick(g, 2.6);
  assert.deepEqual(g.work.answered, [0]);
  tick(g, 5);
  assert.equal(g.stage, 1);
});
test("leaving and returning preserve the parked chair and indoor location", () => {
  const g = createGame(14);
  g.stage = 4;
  place(g, target(g));
  const parked = { ...g.parkedChair };
  interact(g);
  assert.equal(g.area, "street");
  assert.deepEqual(g.parkedChair, parked);
  place(g, target(g));
  interact(g);
  tick(g, 8.1);
  assert.equal(g.stage, 6);
  assert.equal(target(g).label, "В офис");
  place(g, target(g));
  interact(g);
  assert.equal(g.area, "office");
  assert.ok(g.y < 200);
  assert.equal(g.stage, 7);
});
test("snapshots restore outdoor work, answered questions and a neutral joystick", () => {
  const g = createGame(15);
  g.stage = 7;
  g.area = "street";
  g.x = 548;
  g.y = 919;
  g.time = 220;
  g.work.stress = 35;
  g.work.answered = [0, 1];
  g.parkedChair = { x: 718, y: 827, angle: 1 };
  assert.equal(MISSIONS[15].tasks[g.stage].action, "smoke");
  interact(g);
  tick(g, 2);
  inputJoystick(g, 1, 0);
  const restored = createGame(15, false, snapshot(g));
  assert.equal(restored.area, "street");
  assert.equal(restored.mode, "walk");
  assert.deepEqual(restored.parkedChair, g.parkedChair);
  assert.deepEqual(restored.work.answered, [0, 1]);
  assert.deepEqual(restored.joystick, { x: 0, y: 0 });
  assert.equal(restored.interaction.elapsed, g.interaction.elapsed);
});
test("police arrive on schedule; the shift wins at 17:00 only if work is complete", () => {
  const g = createGame(15);
  g.time = 106;
  step(g, 0.01);
  assert.equal(g.work.police, true);
  assert.equal(g.events.filter((e) => e.type === "police").length, 1);
  step(g, 0.01);
  assert.equal(g.events.filter((e) => e.type === "police").length, 1);
  g.stage = MISSIONS[15].tasks.length;
  g.time = SHIFT_SECONDS - 1;
  step(g, 0.02);
  assert.equal(g.phase, "playing");
  tick(g, 1.1);
  assert.equal(workClock(g), 17 * 60);
  assert.equal(g.phase, "won");
  const unfinished = createGame(15);
  unfinished.time = SHIFT_SECONDS - 0.01;
  step(unfinished, 0.02);
  assert.equal(unfinished.phase, "lost");
  assert.match(unfinished.fall.reason, /17:00/);
});

// Flood-fill player-sized floor space: targets must be reachable, not just empty.
function reachable(bounds, solids, start, targets, radius) {
  const size = 12,
    key = (x, y) => `${x},${y}`;
  const origin = {
    x: Math.round(start.x / size),
    y: Math.round(start.y / size),
  };
  const seen = new Set([key(origin.x, origin.y)]),
    queue = [origin];
  for (let i = 0; i < queue.length; i++)
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const x = queue[i].x + dx,
        y = queue[i].y + dy,
        px = x * size,
        py = y * size,
        id = key(x, y);
      if (
        seen.has(id) ||
        px < bounds.left + radius ||
        px > bounds.right - radius ||
        py < bounds.top + radius ||
        py > bounds.bottom - radius ||
        solids.some((s) => distanceToSolid(px, py, s) < radius)
      )
        continue;
      seen.add(id);
      queue.push({ x, y });
    }
  for (const t of targets)
    assert.ok(
      queue.some((p) => Math.hypot(p.x * size - t.x, p.y * size - t.y) < 20),
      `unreachable target ${t.label || `${t.x},${t.y}`}`,
    );
}
test("all office and street destinations connect through player-sized passages", () => {
  for (const mission of MISSIONS) {
    const g = createGame(mission.id),
      targets = [];
    if (mission.tasks)
      for (let stage = 0; stage < mission.tasks.length; stage++) {
        g.stage = stage;
        g.time = SHIFT_SECONDS - 1;
        if ((mission.tasks[stage].area || "office") === "office")
          targets.push(target(g));
      }
    else {
      const count =
        mission.kind === "errands"
          ? mission.stops.length
          : mission.kind === "route"
            ? mission.gates.length + 1
            : mission.kind === "delivery"
              ? 2
              : 1;
      for (let stage = 0; stage < count; stage++) {
        g.stage = stage;
        targets.push(target(g));
      }
    }
    reachable(
      OFFICE_BOUNDS,
      g.layout.obstacles.flatMap(footprintsFor),
      { x: 280, y: 617 },
      targets.filter(Boolean),
      21,
    );
  }
  reachable(
    STREET.bounds,
    STREET.buildings,
    STREET.points.entrance,
    Object.values(STREET.points),
    16,
  );
});

test("all walking chapters and the entire scheduled shift complete through their actions", () => {
  for (const id of [13, 14, 15]) {
    const g = createGame(id);
    const mission = MISSIONS[id];
    for (let frame = 0; frame < 44000 && g.phase === "playing"; frame++) {
      const t = target(g);
      if (t && !g.interaction && !g.work.reply) place(g, t);
      const visitor = g.work.visitors.find((v) => !v.leaving);
      if (visitor && g.area === "office" && !g.interaction && !g.work.reply)
        place(g, { x: visitor.x - 40, y: visitor.y });
      const action = actionFor(g, mission);
      if (action && !action.busy && (action.task || action.type === "reply"))
        interact(g);
      step(g, 1 / 60);
    }
    assert.equal(
      g.phase,
      "won",
      `${mission.title}: stopped at stage ${g.stage}`,
    );
    assert.equal(g.stage, mission.tasks.length);
    if (id === 15) {
      assert.equal(workClock(g), 1020);
      assert.ok(g.work.answered.length >= 4);
      assert.equal(g.events.filter((e) => e.type === "police").length, 2);
    }
  }
});
test("an unscheduled outdoor break resumes and keeps visitor positions and police arrival", () => {
  const g = createGame(15);
  g.time = 160;
  g.area = "street";
  g.x = 548;
  g.y = 919;
  g.work.stress = 65;
  g.work.police = true;
  g.work.policeSince = 105;
  g.work.visitors = [{ id: 1, x: 436, y: 600, since: 142, leaving: false }];
  interact(g);
  tick(g, 2);
  assert.equal(g.interaction.task, false);
  const restored = createGame(15, false, snapshot(g));
  assert.deepEqual(
    restored.work.visitors.map((v) => [v.id, v.x, v.y]),
    g.work.visitors.map((v) => [v.id, v.x, v.y]),
  );
  assert.equal(restored.work.policeSince, 105);
  tick(restored, 6.1);
  assert.equal(restored.interaction, null);
  assert.equal(restored.stage, 0);
  assert.ok(restored.work.stress < 44);
  assert.equal(
    restored.events.some((e) => e.type === "police"),
    false,
  );
});
test("wandering outside or standing mid-ride gives a route back to the required control and room", () => {
  const g = createGame(15);
  g.area = "street";
  Object.assign(g, STREET.points.entrance);
  assert.equal(target(g).label, "В офис");
  assert.equal(objective(g), "Вернись в офис");
  interact(g);
  tick(g, 0.05);
  assert.equal(g.area, "office");
  g.stage = 3;
  g.time = 100;
  g.mode = "walk";
  assert.deepEqual(
    [target(g).x, target(g).y],
    [g.parkedChair.x, g.parkedChair.y],
  );
  place(g, target(g));
  interact(g);
  assert.equal(g.mode, "chair");
  assert.equal(g.stage, 3);
  assert.equal(target(g).x, g.layout.points.mat.x);
});

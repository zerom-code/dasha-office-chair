import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  inputFoot,
  step,
  speed,
  target,
  MISSIONS,
  stars,
  OBSTACLES,
  snapshot,
  layoutFor,
} from "../v3/engine-3.0.2.js";
import { footprintsFor, distanceToSolid } from "../v3/geometry.js";
const tick = (g, s) => {
  for (let i = 0; i < Math.ceil(s * 120); i++) step(g, 1 / 120);
};
test("paired presses produce one straight impulse and preserve momentum after release", () => {
  const g = createGame();
  inputFoot(g, "left", true);
  inputFoot(g, "right", true);
  tick(g, 0.06);
  inputFoot(g, "left", false);
  inputFoot(g, "right", false);
  tick(g, 0.04);
  assert.equal(g.pushes, 1);
  assert.equal(g.angle, -Math.PI / 2);
  assert.ok(speed(g) > 180);
  const y = g.y;
  tick(g, 0.25);
  assert.ok(g.y < y - 20);
});
test("single feet turn in opposite directions and held pair brakes", () => {
  const l = createGame(),
    r = createGame();
  inputFoot(l, "left", true);
  inputFoot(r, "right", true);
  tick(l, 0.1);
  tick(r, 0.1);
  assert.ok(l.angle > r.angle);
  const g = createGame();
  g.vx = 220;
  inputFoot(g, "left", true);
  inputFoot(g, "right", true);
  tick(g, 1);
  assert.ok(speed(g) < 5);
});
test("all chair missions support pickup, route checkpoints, stationary completion and scoring", () => {
  for (const m of MISSIONS.filter((m) => !m.tasks)) {
    const g = createGame(m.id);
    let iterations = 0;
    while (g.phase === "playing" && iterations++ < 10) {
      const t = target(g);
      g.x = t.x;
      g.y = t.y;
      g.vx = g.vy = 0;
      tick(g, 0.8);
    }
    assert.equal(g.phase, "won", m.title);
    assert.equal(stars(g), 3);
    if (m.kind === "delivery") assert.equal(g.carrying, m.item);
  }
});
test("speeding through a delivery target does not pick up an item", () => {
  const g = createGame(1),
    t = target(g);
  g.x = t.x;
  g.y = t.y;
  g.vx = 150;
  step(g, 0.025);
  assert.equal(g.stage, 0);
  assert.equal(g.carrying, null);
});
test("collisions reflect motion, keep chair outside solid furniture and reduce carried coffee", () => {
  const g = createGame(1),
    o = OBSTACLES.find((o) => o.type === "coffee");
  g.x = o.x - 22;
  g.y = o.y + 30;
  g.vx = 180;
  g.carrying = "coffee";
  tick(g, 0.1);
  assert.ok(g.x <= o.x - 21);
  assert.equal(g.hits, 1);
  assert.equal(g.coffee, 83);
  assert.ok(g.vx < 0);
});
test("paused simulation does not advance and snapshot restores run without held input", () => {
  const g = createGame(2);
  g.phase = "paused";
  tick(g, 2);
  assert.equal(g.time, 0);
  g.phase = "playing";
  g.stage = 1;
  g.carrying = "pen";
  g.x = 333;
  const restored = createGame(2, false, snapshot(g));
  assert.equal(restored.x, 333);
  assert.equal(restored.carrying, "pen");
  assert.equal(restored.stage, 1);
  assert.equal(restored.feet.left, false);
});

test("all starts and targets remain clear of furniture in every layout", () => {
  for (const m of MISSIONS) {
    if (m.tasks) continue;
    const g = createGame(m.id),
      positions = [{ x: g.x, y: g.y }];
    for (
      let stage = 0;
      stage <
      (m.kind === "errands"
        ? m.stops.length
        : m.kind === "route"
          ? m.gates.length + 1
          : m.kind === "delivery"
            ? 2
            : 1);
      stage++
    ) {
      g.stage = stage;
      positions.push(target(g));
    }
    for (const pos of positions) {
      assert.ok(
        pos.x > 86 && pos.x < 838 && pos.y > 111 && pos.y < 911,
        m.title,
      );
      for (const o of g.layout.obstacles)
        for (const solid of footprintsFor(o)) {
          assert.ok(
            distanceToSolid(pos.x, pos.y, solid) >= 21,
            `${m.title}: target overlaps ${o.type}`,
          );
        }
    }
  }
});
test("the lane beneath the container shadows stays open, while container bases are solid", () => {
  const g = createGame(0, true);
  g.x = 610;
  g.y = 245;
  g.vx = 130;
  tick(g, 0.6);
  assert.ok(g.x > 660);
  assert.equal(g.hits, 0);
  const container = footprintsFor(OBSTACLES.find((o) => o.type === "boxes"))[3];
  g.x = container.x - 22;
  g.y = container.y + 15;
  g.vx = 140;
  g.vy = 0;
  tick(g, 0.1);
  assert.ok(g.x <= container.x - 21);
  assert.ok(g.hits > 0);
});
test("level 13 falls at 30 seconds, freezes controls, then reports defeat once", () => {
  const g = createGame(12);
  g.time = 29.98;
  step(g, 0.01);
  assert.equal(g.phase, "playing");
  step(g, 0.02);
  assert.equal(g.phase, "falling");
  inputFoot(g, "left", true);
  assert.equal(g.feet.left, false);
  tick(g, 1.5);
  assert.equal(g.phase, "lost");
  assert.equal(g.events.filter((event) => event.type === "lose").length, 1);
  const t = g.time;
  tick(g, 3);
  assert.equal(g.time, t);
  const free = createGame(12, true);
  free.time = 200;
  step(free, 0.03);
  assert.equal(free.phase, "playing");
});
test("late levels use different furniture layouts and moved mat changes friction", () => {
  const base = layoutFor(0);
  for (let id = 6; id < 12; id++) assert.notDeepEqual(layoutFor(id), base);
  const g = createGame(8, true);
  g.x = 198;
  g.y = 875;
  g.vx = 100;
  tick(g, 0.1);
  assert.ok(g.vx < 80);
});
test("multi-stop delivery changes its carried item at each stop", () => {
  const g = createGame(9);
  const visit = () => {
    const t = target(g);
    g.x = t.x;
    g.y = t.y;
    g.vx = g.vy = 0;
    tick(g, 0.7);
  };
  visit();
  assert.equal(g.carrying, "coffee");
  assert.equal(g.stage, 1);
  visit();
  assert.equal(g.carrying, null);
  visit();
  assert.equal(g.carrying, "paper");
  visit();
  assert.equal(g.carrying, null);
  assert.equal(g.phase, "won");
});

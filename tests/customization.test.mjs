import test from "node:test";
import assert from "node:assert/strict";
import {
  COLORS,
  PRINTS,
  STYLES,
  rewardFor,
  available,
  validateOutfit,
} from "../v3/customization.js";
import { MISSIONS } from "../v3/engine.js";
test("every mission has a usable unique reward, including all new walking levels", () => {
  const results = {},
    colors = new Set(),
    prints = new Set();
  for (let id = 0; id < MISSIONS.length; id++) {
    const reward = rewardFor(id);
    assert.equal(available(reward.color, results), false);
    assert.equal(available(reward.print, results), false);
    results[id] = { stars: 1 };
    assert.equal(available(reward.color, results), true);
    assert.equal(available(reward.print, results), true);
    colors.add(reward.color.id);
    prints.add(reward.print.id);
    assert.equal(!!reward.style, (id + 1) % 3 === 0);
  }
  assert.equal(colors.size, MISSIONS.length);
  assert.equal(prints.size, MISSIONS.length);
  assert.equal(COLORS.length, MISSIONS.length + 1);
  assert.equal(PRINTS.length, MISSIONS.length + 1);
  assert.equal(STYLES.length, 6);
});
test("locked and unknown saved outfits fall back while earned clothes are restored", () => {
  assert.deepEqual(
    validateOutfit({ color: "milk", print: "bow", style: "collar" }, {}),
    { color: "black", print: "plain", style: "crew" },
  );
  const results = { 0: {}, 2: {} };
  assert.deepEqual(
    validateOutfit(
      { color: "rose", print: "flower", style: "hoodie" },
      results,
    ),
    { color: "rose", print: "flower", style: "hoodie" },
  );
});

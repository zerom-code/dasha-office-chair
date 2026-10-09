import test from "node:test";
import assert from "node:assert/strict";
import {
  COLORS,
  PRINTS,
  STYLES,
  rewardFor,
  available,
  validateOutfit,
} from "../v2/customization.js";
test("each of twelve levels unlocks a unique color and print, with extra styles every third level", () => {
  const results = {},
    colors = new Set(),
    prints = new Set();
  for (let id = 0; id < 12; id++) {
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
  assert.equal(colors.size, 12);
  assert.equal(prints.size, 12);
  assert.equal(COLORS.length, 13);
  assert.equal(PRINTS.length, 13);
  assert.equal(STYLES.length, 5);
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

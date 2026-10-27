// Run: npm test. Covers the merge rules the sync relies on (public/js/sync-core.js).
const test = require("node:test");
const assert = require("node:assert");
const SyncCore = require("../public/js/sync-core.js");
const defaultState = require("../default-state.json");

const clone = (value) => JSON.parse(JSON.stringify(value));
const base = SyncCore.docFromState(defaultState);
const baseState = () => clone(SyncCore.stateFromDoc(base));
// Server order: A's batch first, then B's, both diffed against the same old doc.
const mergeBoth = (a, b) =>
  SyncCore.stateFromDoc(SyncCore.applyOps(SyncCore.applyOps(base, SyncCore.diffStateToOps(base, a)), SyncCore.diffStateToOps(base, b)));

test("order keys stay sorted and valid", () => {
  const keys = SyncCore.evenKeys(200);
  keys.forEach((key, index) => {
    assert.ok(SyncCore.isValidKey(key));
    if (index) {
      assert.ok(keys[index - 1] < key);
    }
  });
  let key = null;
  for (let i = 0; i < 100; i += 1) {
    const next = SyncCore.keyBetween(null, key);
    assert.ok(SyncCore.isValidKey(next) && (!key || next < key));
    key = next;
  }
});

test("doc round-trips the plain state (minus per-device settings)", () => {
  const expected = clone(defaultState);
  delete expected.settings.historyLimit;
  delete expected.history;
  assert.deepStrictEqual(SyncCore.stateFromDoc(base), expected);
});

test("random edits round-trip through diff + apply", () => {
  let seed = 7;
  const rand = (n) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % n;
  };
  for (let round = 0; round < 300; round += 1) {
    const next = baseState();
    for (let step = 0; step < 1 + rand(6); step += 1) {
      const category = next.categories[rand(next.categories.length)];
      const kind = rand(6);
      if (kind === 0 && category.links.length) {
        category.links[rand(category.links.length)].label = `L${rand(999)}`;
      } else if (kind === 1 && category.links.length > 1) {
        const [link] = category.links.splice(rand(category.links.length), 1);
        category.links.splice(rand(category.links.length + 1), 0, link);
      } else if (kind === 2 && category.links.length) {
        const [link] = category.links.splice(rand(category.links.length), 1);
        next.categories[rand(next.categories.length)].links.unshift(link);
      } else if (kind === 3) {
        category.links.push({ id: `new_${round}_${step}`, label: "N", url: "https://n.example/" });
      } else if (kind === 4 && category.links.length) {
        category.links.splice(rand(category.links.length), 1);
      } else {
        const [moved] = next.categories.splice(rand(next.categories.length), 1);
        next.categories.splice(rand(next.categories.length + 1), 0, moved);
      }
    }
    assert.deepStrictEqual(SyncCore.stateFromDoc(SyncCore.applyOps(base, SyncCore.diffStateToOps(base, next))), next);
  }
});

test("a small change produces a small op", () => {
  const renamed = baseState();
  renamed.categories[0].links[0].label = "改名";
  assert.deepStrictEqual(SyncCore.diffStateToOps(base, renamed), [
    { c: "links", id: renamed.categories[0].links[0].id, set: { label: "改名" } },
  ]);
  const moved = baseState();
  const [link] = moved.categories[1].links.splice(5, 1);
  moved.categories[1].links.unshift(link);
  const ops = SyncCore.diffStateToOps(base, moved);
  assert.strictEqual(ops.length, 1);
  assert.deepStrictEqual(Object.keys(ops[0].set), ["$k"]);
});

test("concurrent rename and move of the same link both survive", () => {
  const a = baseState();
  a.categories[0].links[2].label = "A改名";
  const b = baseState();
  const [link] = b.categories[0].links.splice(2, 1);
  b.categories[2].links.splice(1, 0, link);
  b.categories[1].name = "B改分类";
  const merged = mergeBoth(a, b);
  assert.strictEqual(merged.categories[2].links[1].label, "A改名");
  assert.strictEqual(merged.categories[1].name, "B改分类");
});

test("a stale client only sends its own fields", () => {
  const a = baseState();
  a.settings.tagOpacity = 50;
  const b = baseState();
  b.categories[0].name = "B";
  const merged = mergeBoth(a, b);
  assert.strictEqual(merged.settings.tagOpacity, 50);
  assert.strictEqual(merged.categories[0].name, "B");
});

test("delete wins over a concurrent edit; concurrent inserts are both kept", () => {
  const deleted = baseState();
  const id = deleted.categories[0].links[0].id;
  deleted.categories[0].links.shift();
  const edited = baseState();
  edited.categories[0].links[0].label = "改名";
  assert.ok(!mergeBoth(deleted, edited).categories[0].links.some((link) => link.id === id));

  const first = baseState();
  first.categories[0].links.splice(1, 0, { id: "i1", label: "I1", url: "https://a.example/" });
  const second = baseState();
  second.categories[0].links.splice(1, 0, { id: "i2", label: "I2", url: "https://b.example/" });
  const ids = mergeBoth(first, second).categories[0].links.map((link) => link.id);
  assert.ok(ids.includes("i1") && ids.includes("i2"));
});

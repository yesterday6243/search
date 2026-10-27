// Field-level sync core, shared verbatim by the browser (window.SyncCore) and the server (require).
//
// The synced data is kept as a normalized "doc" instead of nested arrays:
//   settings:   { "siteTitle": …, "background.provider": … }      flattened setting paths
//   root:       { selectedEngineId }
//   categories: { [id]: { name, isPinned, $k } }                   $k = fractional order key
//   links:      { [id]: { label, url, $p, $k } }                   $p = parent category id
//   engines:    { [id]: { name, urlTemplate, $k } }
//   tomb:       { "links:<id>": 1, … }                              deleted ids (never resurrected)
//
// Every change is an operation on one entity or setting, so a rename and a move made at the same time
// on two devices touch different fields and both survive. Order uses fractional keys: moving an item
// only rewrites that item's key, never its neighbours'. The server applies ops in arrival order
// (per-field last-writer-wins) and both sides run the same applyOps, so every client converges.
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.SyncCore = api;
  }
})(typeof self !== "undefined" ? self : this, function () {
  const COLLECTIONS = ["categories", "links", "engines"];
  // Per-device preferences that are never synced.
  const LOCAL_ONLY_SETTINGS = new Set(["historyLimit"]);
  const KEY_DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";
  const KEY_PATTERN = /^[0-9a-z]{0,127}[1-9a-z]$/;

  // ---------- fractional order keys (Greenspan / rocicorp "fractional-indexing" midpoint) ----------
  function midpoint(a, b) {
    if (b != null) {
      let n = 0;
      while ((a[n] || "0") === b[n]) {
        n += 1;
      }
      if (n > 0) {
        return b.slice(0, n) + midpoint(a.slice(n), b.slice(n));
      }
    }
    const digitA = a ? KEY_DIGITS.indexOf(a[0]) : 0;
    const digitB = b != null ? KEY_DIGITS.indexOf(b[0]) : KEY_DIGITS.length;
    if (digitB - digitA > 1) {
      return KEY_DIGITS[Math.round((digitA + digitB) / 2)];
    }
    if (b != null && b.length > 1) {
      return b.slice(0, 1);
    }
    return KEY_DIGITS[digitA] + midpoint(a.slice(1), null);
  }

  // A key strictly between a and b (null = open end).
  function keyBetween(a, b) {
    const lower = a || "";
    if (b != null && lower >= b) {
      throw new Error(`keyBetween: ${lower} >= ${b}`);
    }
    return midpoint(lower, b == null ? null : b);
  }

  // n evenly spaced short keys, for building a doc from plain arrays.
  function evenKeys(n) {
    let width = 1;
    while (36 ** width < (n + 1) * 4) {
      width += 1;
    }
    const step = Math.floor(36 ** width / (n + 1));
    return Array.from({ length: n }, (_, index) =>
      ((index + 1) * step).toString(36).padStart(width, "0").replace(/0+$/, "")
    );
  }

  function isValidKey(value) {
    return typeof value === "string" && KEY_PATTERN.test(value);
  }

  function compareEntries(a, b) {
    const ka = a[1].$k;
    const kb = b[1].$k;
    if (ka !== kb) {
      return ka < kb ? -1 : 1;
    }
    return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
  }

  // ---------- doc <-> plain state ----------
  function flattenSettings(settings, prefix = "", out = {}) {
    Object.entries(settings && typeof settings === "object" ? settings : {}).forEach(([key, value]) => {
      const path = prefix + key;
      if (!prefix && LOCAL_ONLY_SETTINGS.has(key)) {
        return;
      }
      if (value && typeof value === "object" && !Array.isArray(value)) {
        flattenSettings(value, `${path}.`, out);
      } else if (value !== undefined) {
        out[path] = value;
      }
    });
    return out;
  }

  function unflattenSettings(flat) {
    const out = {};
    Object.entries(flat || {}).forEach(([path, value]) => {
      const parts = path.split(".");
      let node = out;
      parts.slice(0, -1).forEach((part) => {
        if (!node[part] || typeof node[part] !== "object") {
          node[part] = {};
        }
        node = node[part];
      });
      node[parts[parts.length - 1]] = value;
    });
    return out;
  }

  function emptyDoc() {
    return { v: 1, settings: {}, root: {}, categories: {}, links: {}, engines: {}, tomb: {} };
  }

  function normalizeDoc(doc) {
    const source = doc && typeof doc === "object" ? doc : {};
    const out = emptyDoc();
    out.settings = { ...(source.settings || {}) };
    out.root = { ...(source.root || {}) };
    COLLECTIONS.forEach((collection) => {
      out[collection] = { ...(source[collection] || {}) };
    });
    out.tomb = { ...(source.tomb || {}) };
    return out;
  }

  function entityFields(item, omit) {
    const fields = {};
    Object.entries(item || {}).forEach(([key, value]) => {
      if (key !== "id" && key !== omit && key[0] !== "$" && value !== undefined) {
        fields[key] = value;
      }
    });
    return fields;
  }

  function docFromState(state) {
    const doc = emptyDoc();
    doc.settings = flattenSettings(state?.settings);
    if (typeof state?.selectedEngineId === "string") {
      doc.root.selectedEngineId = state.selectedEngineId;
    }
    const engines = Array.isArray(state?.engines) ? state.engines : [];
    const engineKeys = evenKeys(engines.length);
    engines.forEach((engine, index) => {
      if (engine?.id && !doc.engines[engine.id]) {
        doc.engines[engine.id] = { ...entityFields(engine), $k: engineKeys[index] };
      }
    });
    const categories = Array.isArray(state?.categories) ? state.categories : [];
    const categoryKeys = evenKeys(categories.length);
    categories.forEach((category, index) => {
      if (!category?.id || doc.categories[category.id]) {
        return;
      }
      doc.categories[category.id] = { ...entityFields(category, "links"), $k: categoryKeys[index] };
      const links = Array.isArray(category.links) ? category.links : [];
      const linkKeys = evenKeys(links.length);
      links.forEach((link, linkIndex) => {
        if (!link?.id) {
          return;
        }
        // Ids must be unique across the whole doc; a duplicate (old data) gets a stable suffix.
        const id = doc.links[link.id] ? `${link.id}_${category.id}_${linkIndex}`.slice(0, 40) : link.id;
        doc.links[id] = { ...entityFields(link), $p: category.id, $k: linkKeys[linkIndex] };
      });
    });
    return doc;
  }

  function stripEntity(id, record) {
    const out = { id };
    Object.entries(record).forEach(([key, value]) => {
      if (key[0] !== "$") {
        out[key] = value;
      }
    });
    return out;
  }

  function sortedEntries(records) {
    return Object.entries(records || {})
      .filter(([, record]) => record && isValidKey(record.$k))
      .sort(compareEntries);
  }

  function stateFromDoc(doc) {
    const source = normalizeDoc(doc);
    const linksByParent = new Map();
    sortedEntries(source.links).forEach(([id, record]) => {
      if (!linksByParent.has(record.$p)) {
        linksByParent.set(record.$p, []);
      }
      linksByParent.get(record.$p).push(stripEntity(id, record));
    });
    const engines = sortedEntries(source.engines).map(([id, record]) => stripEntity(id, record));
    const selected = source.root.selectedEngineId;
    return {
      settings: unflattenSettings(source.settings),
      engines,
      selectedEngineId: engines.some((engine) => engine.id === selected) ? selected : engines[0]?.id || "",
      categories: sortedEntries(source.categories).map(([id, record]) => ({
        ...stripEntity(id, record),
        links: linksByParent.get(id) || [],
      })),
    };
  }

  // ---------- applying ops ----------
  function applyOpInPlace(doc, op) {
    if (!op || typeof op !== "object") {
      return doc;
    }
    if (op.c === "reset") {
      return normalizeDoc(op.doc);
    }
    if (op.c === "settings") {
      Object.entries(op.set || {}).forEach(([path, value]) => {
        doc.settings[path] = value;
      });
      (op.unset || []).forEach((path) => {
        delete doc.settings[path];
      });
      return doc;
    }
    if (op.c === "root") {
      Object.assign(doc.root, op.set || {});
      return doc;
    }
    if (!COLLECTIONS.includes(op.c) || typeof op.id !== "string") {
      return doc;
    }
    const tombKey = `${op.c}:${op.id}`;
    if (op.del) {
      delete doc[op.c][op.id];
      doc.tomb[tombKey] = 1;
      return doc;
    }
    if (doc.tomb[tombKey]) {
      return doc;
    }
    const record = { ...(doc[op.c][op.id] || {}), ...(op.set || {}) };
    (op.unset || []).forEach((field) => {
      delete record[field];
    });
    doc[op.c][op.id] = record;
    return doc;
  }

  function applyOps(doc, ops) {
    let next = normalizeDoc(JSON.parse(JSON.stringify(doc || emptyDoc())));
    (ops || []).forEach((op) => {
      next = applyOpInPlace(next, op);
    });
    return next;
  }

  // ---------- diff: plain state (what the UI produced) -> ops against the doc it was based on ----------
  function sameValue(a, b) {
    return a === b || JSON.stringify(a) === JSON.stringify(b);
  }

  // Indices of the longest strictly increasing run of keys (those items keep their position keys).
  function longestIncreasing(keys) {
    const tails = [];
    const tailIndex = [];
    const previous = new Array(keys.length).fill(-1);
    keys.forEach((key, index) => {
      if (key == null) {
        return;
      }
      let lo = 0;
      let hi = tails.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (tails[mid] < key) {
          lo = mid + 1;
        } else {
          hi = mid;
        }
      }
      tails[lo] = key;
      tailIndex[lo] = index;
      previous[index] = lo > 0 ? tailIndex[lo - 1] : -1;
    });
    const keep = new Array(keys.length).fill(false);
    let cursor = tailIndex[tails.length - 1];
    while (cursor != null && cursor >= 0) {
      keep[cursor] = true;
      cursor = previous[cursor];
    }
    return keep;
  }

  function diffList(baseDoc, collection, items, parentId, seen, ops) {
    const records = baseDoc[collection];
    const list = items.filter((item) => item?.id && !seen.has(item.id) && seen.add(item.id));
    const keys = list.map((item) => {
      const record = records[item.id];
      if (!record || !isValidKey(record.$k)) {
        return null;
      }
      return collection !== "links" || record.$p === parentId ? record.$k : null;
    });
    const keep = longestIncreasing(keys);
    let previousKey = null;
    list.forEach((item, index) => {
      let key = keys[index];
      if (!keep[index]) {
        let right = null;
        for (let next = index + 1; next < list.length; next += 1) {
          if (keep[next]) {
            right = keys[next];
            break;
          }
        }
        key = keyBetween(previousKey, right);
      }
      previousKey = key;

      const record = records[item.id];
      const fields = entityFields(item, collection === "categories" ? "links" : undefined);
      const set = {};
      Object.entries(fields).forEach(([field, value]) => {
        if (!record || !sameValue(record[field], value)) {
          set[field] = value;
        }
      });
      const unset = record
        ? Object.keys(record).filter((field) => field[0] !== "$" && !(field in fields))
        : [];
      if (!record || record.$k !== key) {
        set.$k = key;
      }
      if (collection === "links" && (!record || record.$p !== parentId)) {
        set.$p = parentId;
      }
      if (Object.keys(set).length || unset.length) {
        const op = { c: collection, id: item.id, set };
        if (unset.length) {
          op.unset = unset;
        }
        ops.push(op);
      }
    });
  }

  function diffStateToOps(baseDocInput, state) {
    const baseDoc = normalizeDoc(baseDocInput);
    const ops = [];

    const nextSettings = flattenSettings(state?.settings);
    const set = {};
    Object.entries(nextSettings).forEach(([path, value]) => {
      if (!sameValue(baseDoc.settings[path], value)) {
        set[path] = value;
      }
    });
    if (Object.keys(set).length) {
      ops.push({ c: "settings", set });
    }
    if (typeof state?.selectedEngineId === "string" && state.selectedEngineId !== baseDoc.root.selectedEngineId) {
      ops.push({ c: "root", set: { selectedEngineId: state.selectedEngineId } });
    }

    const seen = { engines: new Set(), categories: new Set(), links: new Set() };
    const engines = Array.isArray(state?.engines) ? state.engines : [];
    const categories = Array.isArray(state?.categories) ? state.categories : [];
    diffList(baseDoc, "engines", engines, undefined, seen.engines, ops);
    diffList(baseDoc, "categories", categories, undefined, seen.categories, ops);
    categories.forEach((category) => {
      if (category?.id && Array.isArray(category.links)) {
        diffList(baseDoc, "links", category.links, category.id, seen.links, ops);
      }
    });
    COLLECTIONS.forEach((collection) => {
      Object.keys(baseDoc[collection]).forEach((id) => {
        if (!seen[collection].has(id)) {
          ops.push({ c: collection, id, del: 1 });
        }
      });
    });
    return ops;
  }

  return {
    COLLECTIONS,
    LOCAL_ONLY_SETTINGS,
    keyBetween,
    evenKeys,
    isValidKey,
    flattenSettings,
    unflattenSettings,
    emptyDoc,
    normalizeDoc,
    docFromState,
    stateFromDoc,
    applyOpInPlace,
    applyOps,
    diffStateToOps,
  };
});

// Field-level cloud sync for logged-in users. Data model and merge rules: sync-core.js;
// protocol: docs/API.md (同步). Classic script sharing the page's global scope; load order is in index.html.
//
// Local store (localStorage, shared by every tab of this browser):
//   { username, rev, base, outbox, pending, syncedAt }
//   base    = doc confirmed by the server at `rev`
//   outbox  = { id, ops } batch being sent; kept until acknowledged, retries reuse the id (idempotent)
//   pending = ops made locally since then
// What a tab shows = base + outbox + pending. Pushes carry only the changed fields and go out 1.5s
// after the last change; pulls ask "anything after rev?" when the page is shown / focused and once a
// minute while visible (an idle answer is ~50 bytes). Other tabs follow via the `storage` event.

function loadSyncStore() {
  if (!authState.loggedIn || !authState.username) {
    return null;
  }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SYNC_STORE_KEY) || "null");
    if (!parsed || parsed.username !== authState.username || !parsed.base || !Number.isInteger(parsed.rev)) {
      return null;
    }
    return {
      ...parsed,
      outbox: parsed.outbox && Array.isArray(parsed.outbox.ops) ? parsed.outbox : null,
      pending: Array.isArray(parsed.pending) ? parsed.pending : [],
    };
  } catch {
    return null;
  }
}

function saveSyncStore(store) {
  try {
    window.localStorage.setItem(SYNC_STORE_KEY, JSON.stringify(store));
  } catch (error) {
    console.warn("sync store not saved", error);
  }
}

function clearSyncStore() {
  try {
    window.localStorage.removeItem(SYNC_STORE_KEY);
  } catch {}
  syncViewDoc = null;
  lastRenderedSyncKey = "";
  window.clearTimeout(syncPushTimer);
  syncPushTimer = 0;
  syncPhase = "idle";
}

function hasUnsentSyncChanges(store = loadSyncStore()) {
  return Boolean(store && (store.outbox || store.pending.length));
}

function createSyncBatchId() {
  return window.crypto?.randomUUID?.() || `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

// One push/pull at a time across all tabs, so two tabs never send the same outbox concurrently.
function withSyncLock(task) {
  return navigator.locks?.request ? navigator.locks.request("mx-sync", task) : task();
}

function isPointerDragActive() {
  return Boolean(tagPointerDrag.card || tagPointerDrag.settling || rowPointerDrag.row || rowPointerDrag.settling);
}

// Shows base + unsent ops. Skips applyState when nothing synced changed; remote updates wait for a
// running drag to finish so the board isn't rebuilt under the pointer.
function renderSyncView(store, { historyLimit, remote = false } = {}) {
  if (remote && isPointerDragActive()) {
    window.setTimeout(() => {
      const latest = loadSyncStore();
      if (latest) {
        renderSyncView(latest, { remote: true });
      }
    }, 300);
    return;
  }
  syncViewDoc = SyncCore.applyOps(store.base, [...(store.outbox?.ops || []), ...store.pending]);
  const synced = SyncCore.stateFromDoc(syncViewDoc);
  const renderKey = JSON.stringify(synced);
  const localHistoryLimit = historyLimit ?? appState?.settings?.historyLimit;
  if (renderKey === lastRenderedSyncKey && localHistoryLimit === appState?.settings?.historyLimit) {
    renderSyncStatus();
    return;
  }
  lastRenderedSyncKey = renderKey;
  const state = sanitizeCachedStateSnapshot({
    ...synced,
    settings: { ...synced.settings, historyLimit: localHistoryLimit },
  });
  applyState({ state, updatedAt: store.syncedAt || new Date().toISOString() });
}

// Local edit: diff what the UI produced against the doc it was based on, queue only those ops.
function commitLocalStateChange(nextState, { baseDoc } = {}) {
  const store = loadSyncStore();
  if (!store || !syncViewDoc) {
    return false;
  }
  const ops = SyncCore.diffStateToOps(baseDoc || syncViewDoc, nextState);
  if (ops.length) {
    store.pending.push(...ops);
    saveSyncStore(store);
    scheduleSyncPush();
  }
  renderSyncView(store, { historyLimit: nextState.settings?.historyLimit });
  return true;
}

function scheduleSyncPush(delay = SYNC_PUSH_DELAY_MS) {
  window.clearTimeout(syncPushTimer);
  syncPushTimer = window.setTimeout(() => {
    syncPushTimer = 0;
    void pushSync();
  }, delay);
  renderSyncStatus();
}

function mergeSyncPayload(store, payload) {
  // A reply older than what another tab already merged must not roll the store back.
  if (payload.rev < store.rev) {
    if (store.outbox && payload.ack === store.outbox.id) {
      store.outbox = null;
    }
    return;
  }
  if (payload.doc) {
    store.base = payload.doc;
  } else {
    let rev = store.rev;
    (payload.batches || []).forEach((batch) => {
      if (batch.rev > rev) {
        store.base = SyncCore.applyOps(store.base, batch.ops);
        rev = batch.rev;
      }
      if (store.outbox && batch.id === store.outbox.id) {
        store.outbox = null;
      }
    });
  }
  if (store.outbox && payload.ack === store.outbox.id) {
    store.outbox = null;
  }
  store.rev = payload.rev;
  store.syncedAt = new Date().toISOString();
}

async function handleSyncError(error) {
  if (error?.status === 401) {
    syncPhase = "idle";
    await refreshAuthStatus();
    renderSyncStatus();
    return;
  }
  console.warn("sync failed, will retry", error);
  syncPhase = "offline";
  if (hasUnsentSyncChanges()) {
    scheduleSyncPush(SYNC_RETRY_MS);
  }
  renderSyncStatus();
}

async function pushSync() {
  window.clearTimeout(syncPushTimer);
  syncPushTimer = 0;
  if (!authState.loggedIn) {
    return;
  }
  await withSyncLock(async () => {
    let store = loadSyncStore();
    if (!store) {
      return;
    }
    if (!store.outbox && store.pending.length) {
      store.outbox = { id: createSyncBatchId(), ops: store.pending };
      store.pending = [];
      saveSyncStore(store);
    }
    if (!store.outbox) {
      return;
    }
    syncPhase = "pushing";
    renderSyncStatus();
    try {
      const payload = await fetchJson("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ since: store.rev, batchId: store.outbox.id, ops: store.outbox.ops }),
      });
      store = loadSyncStore();
      if (!store) {
        return;
      }
      mergeSyncPayload(store, payload);
      saveSyncStore(store);
      syncPhase = "idle";
      renderSyncView(store, { remote: true });
      if (store.pending.length) {
        scheduleSyncPush();
      }
    } catch (error) {
      await handleSyncError(error);
    }
  });
  renderSyncStatus();
}

async function pullSync() {
  if (!authState.loggedIn) {
    return;
  }
  await withSyncLock(async () => {
    let store = loadSyncStore();
    if (!store) {
      return;
    }
    try {
      const payload = await fetchJson(`/api/sync?since=${store.rev}`);
      store = loadSyncStore();
      if (!store) {
        return;
      }
      syncPhase = "idle";
      if (payload.doc || payload.batches?.length || payload.rev !== store.rev) {
        mergeSyncPayload(store, payload);
        saveSyncStore(store);
        renderSyncView(store, { remote: true });
      }
    } catch (error) {
      await handleSyncError(error);
    }
  });
  renderSyncStatus();
}

// Push if there is something to send (the reply carries remote changes too), otherwise just pull.
async function syncNow({ force = false } = {}) {
  if (!authState.loggedIn || (!force && Date.now() - lastSyncPullAt < SYNC_PULL_MIN_GAP_MS)) {
    return;
  }
  lastSyncPullAt = Date.now();
  if (hasUnsentSyncChanges()) {
    await pushSync();
  } else {
    await pullSync();
  }
}

// Page hidden / closing: send what's queued with keepalive. The reply isn't awaited; the outbox stays
// until a later push or pull sees it acknowledged (the server ignores a repeated batch id).
function flushSyncOnHide() {
  const store = loadSyncStore();
  if (!store || !hasUnsentSyncChanges(store)) {
    return;
  }
  window.clearTimeout(syncPushTimer);
  syncPushTimer = 0;
  if (!store.outbox) {
    store.outbox = { id: createSyncBatchId(), ops: store.pending };
    store.pending = [];
    saveSyncStore(store);
  }
  try {
    void fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ since: store.rev, batchId: store.outbox.id, ops: store.outbox.ops }),
    }).catch(() => {});
  } catch {}
}

// After login / on boot. `legacyState` = edits from the pre-sync version that never reached the cloud.
async function startUserSync({ legacyState = null } = {}) {
  let store = loadSyncStore();
  if (store) {
    renderSyncView(store);
    await syncNow({ force: true });
    return true;
  }
  try {
    const payload = await fetchJson("/api/sync");
    store = {
      v: 2,
      username: authState.username,
      rev: payload.rev,
      base: payload.doc,
      outbox: null,
      pending: legacyState ? SyncCore.diffStateToOps(payload.doc, legacyState) : [],
      syncedAt: new Date().toISOString(),
    };
    saveSyncStore(store);
    lastRenderedSyncKey = "";
    renderSyncView(store);
    if (store.pending.length) {
      scheduleSyncPush(0);
    }
    return true;
  } catch (error) {
    await handleSyncError(error);
    return false;
  }
}

function handleSyncStorageEvent(event) {
  if (event.storageArea !== window.localStorage || event.key !== SYNC_STORE_KEY) {
    return;
  }
  const store = loadSyncStore();
  if (store) {
    renderSyncView(store, { remote: true });
  } else {
    renderSyncStatus();
  }
}

function bindSyncEvents() {
  window.addEventListener("storage", handleSyncStorageEvent);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushSyncOnHide();
    } else {
      void syncNow();
    }
  });
  window.addEventListener("pagehide", flushSyncOnHide);
  window.addEventListener("focus", () => void syncNow());
  window.addEventListener("online", () => void syncNow({ force: true }));
  window.setInterval(() => {
    if (document.visibilityState === "visible") {
      void syncNow();
    }
  }, SYNC_POLL_INTERVAL_MS);
}

// The pre-sync version kept a "dirty" flag per user; read it once to migrate unsynced local edits.
function takeLegacyDirtyFlag(username) {
  try {
    const store = JSON.parse(window.localStorage.getItem(SYNC_META_STORAGE_KEY) || "{}");
    window.localStorage.removeItem(SYNC_META_STORAGE_KEY);
    return Boolean(store?.[username]?.dirty);
  } catch {
    return false;
  }
}

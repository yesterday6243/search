// Cloud backup page and the backup/sync status pill.
// Classic script sharing the page's global scope; load order is defined in index.html.

async function handleManualSyncClick() {
  if (syncModalBusy) {
    return;
  }
  if (!authState.loggedIn) {
    openAuthModal(authState.userCount === 0 ? AUTH_MODE_REGISTER : AUTH_MODE_LOGIN);
    return;
  }
  openSyncModal();
}

function openSyncModal() {
  if (!syncModal) {
    return;
  }
  syncModal.classList.remove("hidden");
  syncModal.setAttribute("aria-hidden", "false");
  setSyncModalMessage("");
  syncModalLoaded = syncModalBackups.length > 0;
  renderSyncModalMeta();
  renderBackupList();
  syncOverlayVisibility();
  void refreshBackupList();
}

function closeSyncModal() {
  if (!syncModal) {
    return;
  }
  syncModal.classList.add("hidden");
  syncModal.setAttribute("aria-hidden", "true");
  setSyncModalMessage("");
  syncOverlayVisibility();
}

function renderSyncModalMeta() {
  if (syncModalMeta) {
    syncModalMeta.textContent = authState.loggedIn
      ? `已登录 ${authState.username || ""} · 改动会自动备份，也可随时手动备份`
      : "登录后可管理云端备份与同步。";
  }
  renderSyncModalStatus();
}

function renderSyncModalStatus() {
  if (!syncStatusCard || !syncStatusTitle || !syncStatusDetail) {
    return;
  }
  const meta = getCurrentSyncMeta();
  const latest = syncModalBackups[0];
  let tone = "success";
  let title = "云端备份已是最新";
  let detail = latest?.createdAt
    ? `最近一次备份 ${formatRelativeTime(latest.createdAt)}`
    : "本地改动不会自动上传，需要时手动备份。";

  if (!authState.loggedIn) {
    tone = "default";
    title = "尚未登录";
    detail = "登录后即可把首页配置备份到云端。";
  } else if (autoBackupInFlight) {
    tone = "warning";
    title = "正在自动备份…";
    detail = "正在把最新改动保存到云端。";
  } else if (meta.dirty) {
    tone = "warning";
    title = "有未备份的改动";
    detail = autoBackupTimer
      ? "停止修改 30 秒后会自动备份，也可以立即创建一份手动备份。"
      : "当前改动只保存在本机，建议立即备份。";
  } else if (syncModalAutoBackup?.createdAt) {
    title = "已自动备份";
    detail = `最近一次自动备份 ${formatRelativeTime(syncModalAutoBackup.createdAt)}，改动后会自动更新。`;
  } else if (meta.lastAction === "sync" && meta.lastActionAt) {
    title = "已从云端恢复";
    detail = `${formatRelativeTime(meta.lastActionAt)}同步到本机`;
  } else if (!latest && syncModalLoaded) {
    tone = "default";
    title = "还没有云端备份";
    detail = "创建第一份备份，换设备时可以一键恢复。";
  }

  syncStatusCard.dataset.tone = tone;
  syncStatusTitle.textContent = title;
  syncStatusDetail.textContent = detail;
}

function setSyncModalMessage(message = "", tone = "error") {
  if (!syncModalMessage) {
    return;
  }
  if (!message) {
    syncModalMessage.textContent = "";
    syncModalMessage.classList.add("hidden");
    syncModalMessage.dataset.tone = "";
    return;
  }
  syncModalMessage.textContent = message;
  syncModalMessage.classList.remove("hidden");
  syncModalMessage.dataset.tone = tone;
}

function setSyncModalBusyState(busy) {
  syncModalBusy = Boolean(busy);
  syncStatus?.classList.toggle("is-busy", syncModalBusy);
  syncStatus?.setAttribute("aria-busy", syncModalBusy ? "true" : "false");
  syncModal?.classList.toggle("is-busy", syncModalBusy);
  if (backupNowButton) {
    backupNowButton.disabled = syncModalBusy;
  }
  if (refreshBackupsButton) {
    refreshBackupsButton.disabled = syncModalBusy;
  }
  syncBackupList?.querySelectorAll("button").forEach((button) => {
    button.disabled = syncModalBusy;
  });
}

async function handleSyncAuthError(error) {
  if (error?.status !== 401) {
    return false;
  }
  await refreshAuthStatus();
  closeSyncModal();
  renderSyncStatus();
  openAuthModal(authState.userCount === 0 ? AUTH_MODE_REGISTER : AUTH_MODE_LOGIN);
  return true;
}

async function refreshBackupList() {
  if (!authState.loggedIn) {
    return;
  }
  setSyncModalBusyState(true);
  setSyncModalMessage("");
  try {
    const payload = await fetchJson("/api/backups");
    syncModalBackups = Array.isArray(payload?.backups) ? payload.backups : [];
    applyBackupLimit(payload);
    syncModalLoaded = true;
    renderBackupList();
  } catch (error) {
    console.error(error);
    if (await handleSyncAuthError(error)) {
      return;
    }
    setSyncModalMessage(error.message || "云端备份列表加载失败");
  } finally {
    setSyncModalBusyState(false);
  }
}

function getBackupStatsText(summary = {}) {
  return [
    Number.isFinite(summary.categories) ? `${summary.categories} 个分类` : "",
    Number.isFinite(summary.links) ? `${summary.links} 个标签` : "",
    Number.isFinite(summary.engines) ? `${summary.engines} 个引擎` : "",
    summary.bytes ? formatByteSize(summary.bytes) : "",
  ].filter(Boolean);
}

// Absolute timestamp first (that's what tells versions apart), relative time after it.
function renderBackupTime(createdAt) {
  if (!createdAt) {
    return "<time>未知时间</time>";
  }
  return `<time datetime="${escapeAttribute(createdAt)}">${escapeHtml(formatPreciseTime(createdAt))} · ${escapeHtml(formatRelativeTime(createdAt))}</time>`;
}

// Auto backups: the latest version is pinned above the manual list, older timestamped versions
// fold underneath it. Restore only (no rename / delete).
function renderAutoBackupRow(backup, { isHistory = false } = {}) {
  const backupId = escapeAttribute(backup.id || "");
  return `
    <article class="sync-backup-item is-auto${isHistory ? " is-auto-history" : ""}">
      <span class="sync-backup-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M12 4a8 8 0 0 1 7.75 6H22l-3.5 4-3.5-4h2.67A6 6 0 1 0 12 18a5.96 5.96 0 0 0 4.24-1.76l1.42 1.42A8 8 0 1 1 12 4Zm-1 4h2v4.59l3.2 3.2-1.4 1.42L11 13.41V8Z" /></svg>
      </span>
      <div class="sync-backup-body">
        <div class="sync-backup-title-row">
          <p class="sync-backup-title">${isHistory ? "自动备份 · 历史版本" : "自动备份"}</p>
          ${isHistory ? "" : '<span class="sync-backup-badge is-auto">最新</span>'}
        </div>
        <p class="sync-backup-meta">
          ${renderBackupTime(backup.createdAt || "")}
          ${getBackupStatsText(backup.summary).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </p>
      </div>
      <div class="sync-backup-actions">
        <button class="ghost-button sync-backup-restore" type="button" data-backup-action="restore" data-backup-id="${backupId}">恢复</button>
      </div>
    </article>
  `;
}

function renderAutoBackupSection() {
  if (!syncModalAutoBackup) {
    return "";
  }
  const history = syncModalAutoBackups.filter((backup) => backup.id !== syncModalAutoBackup.id);
  const toggle = history.length
    ? `
      <button class="sync-auto-history-toggle" type="button" data-backup-action="toggle-auto-history" data-backup-id="auto" aria-expanded="${syncAutoHistoryOpen ? "true" : "false"}">
        <span>${syncAutoHistoryOpen ? "收起" : "查看"}自动备份历史（${history.length} 个版本）</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
      </button>
    `
    : "";
  const historyRows = syncAutoHistoryOpen
    ? history.map((backup) => renderAutoBackupRow(backup, { isHistory: true })).join("")
    : "";
  return renderAutoBackupRow(syncModalAutoBackup) + toggle + historyRows;
}

function toggleAutoBackupHistory() {
  syncAutoHistoryOpen = !syncAutoHistoryOpen;
  renderBackupList();
}

function applyBackupLimit(payload) {
  if (payload && "autoBackup" in payload) {
    syncModalAutoBackup = payload.autoBackup || null;
  }
  if (Array.isArray(payload?.autoBackups)) {
    syncModalAutoBackups = payload.autoBackups;
  }
  const limit = Number(payload?.backupLimit);
  if (Number.isInteger(limit) && limit > 0) {
    syncModalBackupLimit = limit;
  }
}

function renderBackupList() {
  if (!syncBackupList) {
    return;
  }
  if (syncBackupCount) {
    syncBackupCount.textContent = syncModalLoaded ? `手动 ${syncModalBackups.length} / ${syncModalBackupLimit}` : "";
  }
  renderSyncModalStatus();

  if (!syncModalLoaded && authState.loggedIn) {
    syncBackupList.innerHTML = Array.from({ length: 3 }, () => '<div class="sync-backup-skeleton" aria-hidden="true"><span></span><span></span></div>').join("");
    return;
  }

  const autoRow = renderAutoBackupSection();
  if (!syncModalBackups.length) {
    syncBackupList.innerHTML = autoRow + `
      <div class="sync-backup-empty">
        <span class="sync-backup-empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M6.5 19a4.5 4.5 0 0 1-.67-8.95A6 6 0 0 1 17.5 8.6 4.25 4.25 0 0 1 17.25 19H6.5Z" /></svg>
        </span>
        <strong>还没有云端备份</strong>
        <span>点击上方「立即备份」，把当前首页配置保存到云端。</span>
      </div>
    `;
    return;
  }

  syncBackupList.innerHTML = autoRow + syncModalBackups
    .map((backup, index) => {
      const backupId = escapeAttribute(backup.id || "");
      const createdAt = backup.createdAt || "";
      const backupName = (backup.name || `备份 ${syncModalBackups.length - index}`).trim();
      const summary = backup.summary || {};
      const stats = [
        Number.isFinite(summary.categories) ? `${summary.categories} 个分类` : "",
        Number.isFinite(summary.links) ? `${summary.links} 个标签` : "",
        Number.isFinite(summary.engines) ? `${summary.engines} 个引擎` : "",
        summary.bytes ? formatByteSize(summary.bytes) : "",
      ].filter(Boolean);
      return `
        <article class="sync-backup-item" style="--item-index:${index}">
          <span class="sync-backup-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M4 5h16v4H4V5Zm1 5h14v9H5v-9Zm4 2v2h6v-2H9Z" /></svg>
          </span>
          <div class="sync-backup-body">
            <div class="sync-backup-title-row">
              <p class="sync-backup-title" title="${escapeAttribute(backupName)}">${escapeHtml(backupName)}</p>
              ${index === 0 ? '<span class="sync-backup-badge">最新</span>' : ""}
              <button class="sync-backup-rename" type="button" data-backup-action="rename" data-backup-id="${backupId}" data-backup-name="${escapeAttribute(backupName)}" aria-label="重命名" title="重命名">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.06 6.19 3.75 3.75L8.75 19H5v-3.75l9.06-9.06Zm1.42-1.42 1.6-1.6a1 1 0 0 1 1.41 0l2.34 2.34a1 1 0 0 1 0 1.41l-1.6 1.6-3.75-3.75Z" /></svg>
              </button>
            </div>
            <p class="sync-backup-meta">
              ${renderBackupTime(createdAt)}
              ${stats.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
            </p>
          </div>
          <div class="sync-backup-actions">
            <button class="ghost-button sync-backup-restore" type="button" data-backup-action="restore" data-backup-id="${backupId}">恢复</button>
            <button class="modal-icon-button danger" type="button" data-backup-action="delete" data-backup-id="${backupId}" aria-label="删除备份" title="删除备份">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-.8 11.1A2 2 0 0 1 15.2 22H8.8a2 2 0 0 1-2-1.9L6 9Zm4 2v8h2v-8h-2Zm4 0v8h2v-8h-2Z" /></svg>
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

async function handleBackupNow() {
  if (!authState.loggedIn || !appState || syncModalBusy) {
    return;
  }
  setSyncModalBusyState(true);
  setSyncModalMessage("");
  try {
    const payload = await fetchJson("/api/backups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state: {
          settings: appState.settings,
          engines: appState.engines,
          selectedEngineId: appState.selectedEngineId,
          categories: appState.categories,
        },
      }),
    });
    syncModalBackups = Array.isArray(payload?.backups) ? payload.backups : syncModalBackups;
    applyBackupLimit(payload);
    syncModalLoaded = true;
    markSyncAction("backup");
    renderBackupList();
    setSyncModalMessage("当前本地数据已备份到云端。", "success");
    showNotice("当前本地数据已备份到云端", "success");
  } catch (error) {
    console.error(error);
    if (await handleSyncAuthError(error)) {
      return;
    }
    setSyncModalMessage(error.message || "备份失败，请稍后重试");
  } finally {
    setSyncModalBusyState(false);
  }
}

async function handleRestoreBackup(backupId) {
  if (!authState.loggedIn || !backupId || syncModalBusy) {
    return;
  }
  const confirmed = await openConfirmDialog({
    title: "同步到本地",
    message: "同步会用所选云端备份覆盖当前本地数据。当前本地未备份改动会被替换，是否继续？",
    confirmText: "同步到本地",
    scopeElement: syncModal,
  });
  if (!confirmed) {
    return;
  }
  setSyncModalBusyState(true);
  setSyncModalMessage("");
  try {
    const payload = await fetchJson(`/api/backups/${encodeURIComponent(backupId)}`);
    await hydrateServerIconCacheForState(payload.state);
    applyState(
      {
        state: payload.state,
        updatedAt: new Date().toISOString(),
      },
      { persistLocalCache: true, preserveLocalHistoryLimit: true }
    );
    queuePromoteRelevantIconCacheEntries(payload.state);
    markSyncAction("sync");
    setSyncModalMessage("云端备份已同步到当前设备。", "success");
    showNotice("云端备份已同步到当前设备", "success");
  } catch (error) {
    console.error(error);
    if (await handleSyncAuthError(error)) {
      return;
    }
    setSyncModalMessage(error.message || "同步失败，请稍后重试");
  } finally {
    setSyncModalBusyState(false);
  }
}

async function handleRenameBackup(backupId, currentName = "") {
  if (!authState.loggedIn || !backupId || syncModalBusy) {
    return;
  }
  const result = await openConfirmDialog({
    title: "重命名备份",
    message: "修改这条云端备份的显示名称，方便后续识别。",
    confirmText: "保存名称",
    scopeElement: syncModal,
    inputValue: currentName,
    inputLabel: "备份名称",
    inputPlaceholder: "输入备份名称",
  });
  if (!result?.confirmed) {
    return;
  }
  const nextName = String(result.value || "").trim();
  if (!nextName) {
    setSyncModalMessage("备份名称不能为空");
    return;
  }

  setSyncModalBusyState(true);
  setSyncModalMessage("");
  try {
    const payload = await fetchJson(`/api/backups/${encodeURIComponent(backupId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nextName }),
    });
    syncModalBackups = Array.isArray(payload?.backups) ? payload.backups : syncModalBackups;
    renderBackupList();
    setSyncModalMessage("备份名称已更新。", "success");
    showNotice("备份名称已更新", "success");
  } catch (error) {
    console.error(error);
    if (await handleSyncAuthError(error)) {
      return;
    }
    setSyncModalMessage(error.message || "重命名失败，请稍后重试");
  } finally {
    setSyncModalBusyState(false);
  }
}

async function handleDeleteBackup(backupId) {
  if (!authState.loggedIn || !backupId || syncModalBusy) {
    return;
  }
  const confirmed = await openConfirmDialog({
    title: "删除云端备份",
    message: "删除后这条云端备份将无法恢复。是否继续？",
    confirmText: "删除",
    tone: "danger",
    scopeElement: syncModal,
  });
  if (!confirmed) {
    return;
  }
  setSyncModalBusyState(true);
  setSyncModalMessage("");
  try {
    const payload = await fetchJson(`/api/backups/${encodeURIComponent(backupId)}`, {
      method: "DELETE",
    });
    syncModalBackups = Array.isArray(payload?.backups) ? payload.backups : [];
    applyBackupLimit(payload);
    renderBackupList();
    setSyncModalMessage("云端备份已删除。", "success");
    showNotice("云端备份已删除", "success");
  } catch (error) {
    console.error(error);
    if (await handleSyncAuthError(error)) {
      return;
    }
    setSyncModalMessage(error.message || "删除失败，请稍后重试");
  } finally {
    setSyncModalBusyState(false);
  }
}

function loadSyncMetaStore() {
  try {
    const raw = window.localStorage.getItem(SYNC_META_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function persistSyncMetaStore(store) {
  try {
    window.localStorage.setItem(SYNC_META_STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

function getDefaultSyncMeta(username = "") {
  return {
    username,
    dirty: false,
    lastAction: "",
    lastActionAt: "",
  };
}

function getCurrentSyncMeta() {
  if (!authState.loggedIn || !authState.username) {
    return getDefaultSyncMeta();
  }
  const store = loadSyncMetaStore();
  const entry = store[authState.username];
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return getDefaultSyncMeta(authState.username);
  }
  return {
    username: authState.username,
    dirty: Boolean(entry.dirty),
    lastAction: ["backup", "sync", "auto"].includes(entry.lastAction) ? entry.lastAction : "",
    lastActionAt:
      typeof entry.lastActionAt === "string" && entry.lastActionAt.trim()
        ? entry.lastActionAt.trim()
        : "",
  };
}

function saveCurrentSyncMeta(meta) {
  if (!authState.loggedIn || !authState.username) {
    return;
  }
  const nextMeta = {
    username: authState.username,
    dirty: Boolean(meta?.dirty),
    lastAction: ["backup", "sync", "auto"].includes(meta?.lastAction) ? meta.lastAction : "",
    lastActionAt:
      typeof meta?.lastActionAt === "string" && meta.lastActionAt.trim()
        ? meta.lastActionAt.trim()
        : "",
  };
  const store = loadSyncMetaStore();
  store[authState.username] = nextMeta;
  persistSyncMetaStore(store);
}

function markSyncDirty() {
  if (!authState.loggedIn) {
    return;
  }
  localChangeVersion += 1;
  const meta = getCurrentSyncMeta();
  saveCurrentSyncMeta({
    ...meta,
    dirty: true,
  });
  scheduleAutoBackup();
  renderSyncStatus();
}

// Debounced: every change restarts the timer, so a burst of edits is saved once, 30s after the last one.
function scheduleAutoBackup(delay = AUTO_BACKUP_DELAY_MS) {
  if (!authState.loggedIn) {
    return;
  }
  window.clearTimeout(autoBackupTimer);
  autoBackupTimer = window.setTimeout(() => {
    autoBackupTimer = 0;
    void runAutoBackup();
  }, delay);
}

function hasPendingAutoBackup() {
  return Boolean(autoBackupTimer || autoBackupInFlight);
}

async function runAutoBackup({ keepalive = false } = {}) {
  if (!authState.loggedIn || !appState) {
    return;
  }
  if (autoBackupInFlight) {
    // A save is already running; make sure the newer changes get their own save afterwards.
    await autoBackupInFlight;
    if (getCurrentSyncMeta().dirty) {
      scheduleAutoBackup(0);
    }
    return;
  }
  window.clearTimeout(autoBackupTimer);
  autoBackupTimer = 0;
  const savedVersion = localChangeVersion;
  const request = fetchJson("/api/backups/auto", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    keepalive,
    body: JSON.stringify({
      state: {
        settings: appState.settings,
        engines: appState.engines,
        selectedEngineId: appState.selectedEngineId,
        categories: appState.categories,
      },
    }),
  });
  autoBackupInFlight = request;
  renderSyncStatus();
  try {
    const payload = await request;
    if (payload?.autoBackup) {
      syncModalAutoBackup = payload.autoBackup;
      syncModalAutoBackups = [payload.autoBackup, ...syncModalAutoBackups.filter((backup) => backup.id !== payload.autoBackup.id)];
    }
    // Only clear "unbacked" if nothing changed while the request was in flight.
    if (localChangeVersion === savedVersion) {
      markSyncAction("auto");
    }
    if (syncModal && !syncModal.classList.contains("hidden")) {
      renderBackupList();
    }
  } catch (error) {
    console.warn("auto backup failed, will retry", error);
    if (error?.status === 401) {
      return;
    }
    scheduleAutoBackup(AUTO_BACKUP_RETRY_MS);
  } finally {
    autoBackupInFlight = null;
    renderSyncStatus();
  }
}

// Leaving the page (tab hidden / closed / logout) shouldn't lose the last 30s of changes.
function flushAutoBackup({ keepalive = false } = {}) {
  if (!autoBackupTimer || !authState.loggedIn) {
    return autoBackupInFlight || Promise.resolve();
  }
  return runAutoBackup({ keepalive });
}

function markSyncAction(action) {
  if (!authState.loggedIn) {
    return;
  }
  saveCurrentSyncMeta({
    username: authState.username,
    dirty: false,
    lastAction: action,
    lastActionAt: new Date().toISOString(),
  });
  renderSyncStatus();
}

function renderSyncStatus() {
  if (!syncStatus) {
    return;
  }

  let message = "云端备份就绪";
  let tone = "success";

  if (!authState.loggedIn) {
    message = authState.userCount ? "登录后可手动备份/同步" : "注册后可手动备份/同步";
    tone = "default";
  } else {
    const meta = getCurrentSyncMeta();
    if (autoBackupInFlight) {
      message = "正在自动备份…";
      tone = "warning";
    } else if (meta.dirty) {
      message = autoBackupTimer ? "待自动备份" : "未备份改动";
      tone = "warning";
    } else if (meta.lastAction === "auto" && meta.lastActionAt) {
      message = `已自动备份 · ${formatTime(meta.lastActionAt)}`;
      tone = "success";
    } else if (meta.lastAction === "backup" && meta.lastActionAt) {
      message = `已备份数据 · ${formatTime(meta.lastActionAt)}`;
      tone = "success";
    } else if (meta.lastAction === "sync" && meta.lastActionAt) {
      message = `已同步数据 · ${formatTime(meta.lastActionAt)}`;
      tone = "success";
    }
  }

  syncStatus.innerHTML = `<span class="sync-dot" aria-hidden="true"></span><span>${escapeHtml(message)}</span>`;
  syncStatus.title = authState.loggedIn ? "点击管理云端备份与同步" : "登录后可管理云端备份与同步";
  syncStatus.classList.remove("status-success", "status-error", "status-warning");
  if (tone === "success") {
    syncStatus.classList.add("status-success");
  } else if (tone === "error") {
    syncStatus.classList.add("status-error");
  } else if (tone === "warning") {
    syncStatus.classList.add("status-warning");
  }
}

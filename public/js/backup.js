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
      ? `已登录 ${authState.username || ""} · 改动实时同步到所有窗口和设备`
      : "登录后可管理云端备份与同步。";
  }
  renderSyncModalStatus();
}

// One place that turns the sync state into a tone + short title + detail (status pill and backup page).
function getSyncStatusInfo() {
  if (!authState.loggedIn) {
    return {
      tone: "default",
      pill: authState.userCount ? "登录后可同步" : "注册后可同步",
      title: "尚未登录",
      detail: "登录后首页配置会在所有窗口和设备间自动同步。",
    };
  }
  const store = loadSyncStore();
  const unsent = hasUnsentSyncChanges(store);
  if (syncPhase === "pushing") {
    return { tone: "warning", pill: "同步中…", title: "正在同步…", detail: "正在把刚才的改动上传到云端。" };
  }
  if (syncPhase === "offline") {
    return {
      tone: "warning",
      pill: unsent ? "未同步 · 稍后重试" : "暂时离线",
      title: "暂时无法连接云端",
      detail: "改动已保存在本机，恢复连接后会自动同步。",
    };
  }
  if (unsent) {
    return { tone: "warning", pill: "待同步", title: "有改动等待同步", detail: "停止修改后约 1 秒自动上传，只发送改动的部分。" };
  }
  const syncedAt = store?.syncedAt || "";
  return {
    tone: "success",
    pill: syncedAt ? `已同步 · ${formatTime(syncedAt)}` : "已同步",
    title: "已与云端同步",
    detail: syncedAt
      ? `最近同步 ${formatRelativeTime(syncedAt)}，其他窗口和设备的改动会自动合并进来。`
      : "其他窗口和设备的改动会自动合并进来。",
  };
}

function renderSyncModalStatus() {
  if (!syncStatusCard || !syncStatusTitle || !syncStatusDetail) {
    return;
  }
  const info = getSyncStatusInfo();
  syncStatusCard.dataset.tone = info.tone;
  syncStatusTitle.textContent = info.title;
  syncStatusDetail.textContent = info.detail;
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

// Auto snapshots (server-side, at most hourly, before a change lands): the newest is pinned above the
// manual list, older ones fold underneath it. Restore only (no rename / delete).
function renderAutoBackupRow(backup, { isHistory = false } = {}) {
  const backupId = escapeAttribute(backup.id || "");
  return `
    <article class="sync-backup-item is-auto${isHistory ? " is-auto-history" : ""}">
      <span class="sync-backup-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M12 4a8 8 0 0 1 7.75 6H22l-3.5 4-3.5-4h2.67A6 6 0 1 0 12 18a5.96 5.96 0 0 0 4.24-1.76l1.42 1.42A8 8 0 1 1 12 4Zm-1 4h2v4.59l3.2 3.2-1.4 1.42L11 13.41V8Z" /></svg>
      </span>
      <div class="sync-backup-body">
        <div class="sync-backup-title-row">
          <p class="sync-backup-title">${isHistory ? "自动快照" : "自动快照 · 最新"}</p>
          ${isHistory ? "" : '<span class="sync-backup-badge is-auto">自动</span>'}
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
        <span>${syncAutoHistoryOpen ? "收起" : "查看"}更早的自动快照（${history.length} 个）</span>
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
    title: "恢复备份",
    message: "恢复会用所选备份替换当前首页配置，并同步到你所有的窗口和设备。恢复前的状态会自动留一份快照，是否继续？",
    confirmText: "恢复",
    scopeElement: syncModal,
  });
  if (!confirmed) {
    return;
  }
  setSyncModalBusyState(true);
  setSyncModalMessage("");
  try {
    // Send queued edits first so they land before (and are replaced by) the restore, not after it.
    await pushSync();
    await fetchJson(`/api/backups/${encodeURIComponent(backupId)}/restore`, { method: "POST" });
    await pullSync();
    if (appState) {
      await hydrateServerIconCacheForState(appState);
      queuePromoteRelevantIconCacheEntries(appState);
    }
    await refreshBackupList();
    setSyncModalMessage("已恢复，并同步到所有窗口和设备。", "success");
    showNotice("备份已恢复", "success");
  } catch (error) {
    console.error(error);
    if (await handleSyncAuthError(error)) {
      return;
    }
    setSyncModalMessage(error.message || "恢复失败，请稍后重试");
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

function renderSyncStatus() {
  if (!syncStatus) {
    return;
  }
  const info = getSyncStatusInfo();
  syncStatus.innerHTML = `<span class="sync-dot" aria-hidden="true"></span><span>${escapeHtml(info.pill)}</span>`;
  syncStatus.title = authState.loggedIn ? "点击查看同步状态与备份" : "登录后可同步与备份";
  syncStatus.classList.remove("status-success", "status-error", "status-warning");
  if (info.tone === "success") {
    syncStatus.classList.add("status-success");
  } else if (info.tone === "error") {
    syncStatus.classList.add("status-error");
  } else if (info.tone === "warning") {
    syncStatus.classList.add("status-warning");
  }
  if (syncModal && !syncModal.classList.contains("hidden")) {
    renderSyncModalStatus();
  }
}

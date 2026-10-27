// App state: apply/update, local snapshots, sanitising, and the settings values applied to the page.
// Classic script sharing the page's global scope; load order is defined in index.html.

function applyState(payload, options = {}) {
  const previousBackgroundRefreshKey = currentBackgroundRefreshKey;
  const persistLocalCache = options.persistLocalCache !== false;
  const localHistoryLimit = appState?.settings?.historyLimit;
  const nextState = {
    ...payload.state,
    updatedAt: payload.updatedAt,
  };
  if (options.preserveLocalHistoryLimit && localHistoryLimit != null) {
    nextState.settings = {
      ...nextState.settings,
      historyLimit: normalizeHistoryLimit(localHistoryLimit),
    };
  }
  nextState.history = loadLocalHistory(
    nextState.engines,
    nextState.selectedEngineId,
    nextState.settings.historyLimit
  );

  appState = nextState;
  trimExpandedCategoryState();
  appState.categories.filter((category) => category.isPinned).forEach((category) => expandedCategoryIds.add(category.id));

  const placeholder = normalizePlaceholder(appState.settings.subtitle);
  const searchBarHeight = normalizeSearchBarHeight(appState.settings.searchBarHeight);
  const tagOpacity = normalizeTagOpacity(appState.settings.tagOpacity);
  const bingRecentCount = normalizeBingRecentCount(appState.settings?.background?.bingRecentCount);
  appState.settings.searchBarHeight = searchBarHeight;
  appState.settings.tagOpacity = tagOpacity;
  appState.settings.background.bingRecentCount = bingRecentCount;

  document.title = appState.settings.siteTitle || BRAND_NAME;
  applyIconTheme(appState.settings.iconTheme);
  renderBrandIdentity();
  searchInput.placeholder = placeholder;
  applySearchBarHeight(searchBarHeight);
  applyTagOpacity(tagOpacity);
  updateSearchClearButton();
  updateHistoryCountLabel();
  renderActiveEngineButton();
  applyBackgroundOverlayOpacity(appState.settings.background.overlayOpacity);
  renderBackgroundFieldVisibility(appState.settings.background);
  const nextBackgroundRefreshKey = getBackgroundRefreshKey(appState.settings.background);
  const shouldRefreshBackground =
    !currentBackgroundUrl || previousBackgroundRefreshKey !== nextBackgroundRefreshKey;
  currentBackgroundRefreshKey = nextBackgroundRefreshKey;
  if (shouldRefreshBackground) {
    void refreshBackgroundNow({ manual: false, force: previousBackgroundRefreshKey !== nextBackgroundRefreshKey });
  }
  scheduleBackgroundRotation();
  // Engine switches, settings tweaks etc. don't touch the board: skip rebuilding every card and icon.
  renderTagBoardIfChanged();
  renderHistoryList(searchInput.value);
  renderSettingsHistoryList();
  renderEngineMenu();
  primeEngineButtonIcons();
  queueTagViewportFadeUpdate();
  queueIconReadyStateCheck();

  if (persistLocalCache && authState.loggedIn) {
    persistStateSnapshot({
      state: appState,
      updatedAt: appState.updatedAt,
      username: authState.username,
    });
    persistUiPrefsSnapshot(appState.settings);
  }
  renderSyncStatus();
  scheduleIconDiscovery();
}

function normalizeBrandIconUrl(value) {
  if (typeof value !== "string" || !value.trim() || value.length > 500) {
    return "";
  }
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function renderBrandIdentity() {
  if (!appState) {
    return;
  }
  brandTextDisplay.textContent = appState.settings.brandLabel?.trim() || BRAND_NAME;
  const theme = ICON_THEMES.find((item) => item.id === appState.settings.iconTheme) || ICON_THEMES[0];
  const iconUrl = theme.file;
  brandIconDisplay.onerror = () => {
    brandIconDisplay.onerror = null;
    brandIconDisplay.src = ICON_THEMES[0].file;
    siteFavicon.href = ICON_THEMES[0].file;
  };
  brandIconDisplay.src = iconUrl;
  siteFavicon.href = iconUrl;
}

function applyIconTheme(themeId) {
  const theme = ICON_THEMES.find((item) => item.id === themeId) || ICON_THEMES[0];
  settingsDrawer.dataset.colorTheme = theme.id;
  [authModal, syncModal, confirmModal, quickAddModal].forEach((dialog) => {
    if (dialog) {
      dialog.dataset.colorTheme = theme.id;
    }
  });
  settingsDrawer.style.setProperty("--settings-theme-panel", theme.panel);
  settingsDrawer.style.setProperty("--settings-theme-accent", theme.accent);
}

function normalizeOverlayOpacity(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 100;
  }
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function applyBackgroundOverlayOpacity(opacity) {
  const safe = normalizeOverlayOpacity(opacity) / 100;
  document.documentElement.style.setProperty("--bg-overlay-opacity", String(safe));
}

function normalizeSearchBarHeight(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 68;
  }
  return Math.max(SEARCH_BAR_HEIGHT_MIN, Math.min(SEARCH_BAR_HEIGHT_MAX, Math.round(numeric)));
}

function normalizeTagOpacity(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 94;
  }
  return Math.max(35, Math.min(100, Math.round(numeric)));
}

function normalizeHistoryLimit(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 100;
  }
  return Math.max(1, Math.min(500, Math.round(numeric)));
}

function applyTagOpacity(opacity) {
  const safe = normalizeTagOpacity(opacity) / 100;
  const soft = Math.max(0, safe - 0.03);
  const border = Math.max(0, safe - 0.08);
  document.documentElement.style.setProperty("--tag-surface-opacity", String(safe));
  document.documentElement.style.setProperty("--tag-surface-opacity-soft", String(soft));
  document.documentElement.style.setProperty("--tag-border-opacity", String(border));
}

function applySearchBarHeight(height) {
  const safe = normalizeSearchBarHeight(height);
  document.documentElement.style.setProperty("--search-height", `${safe}px`);
}

function normalizeBingRecentCount(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 8;
  }
  return Math.max(BING_RECENT_COUNT_MIN, Math.min(BING_RECENT_COUNT_MAX, Math.round(numeric)));
}

async function updateState(patch, options = {}) {
  const baseState = appState || structuredClone(GUEST_STATE);
  const mergedState = mergeLocalState(baseState, patch);
  const nextState = sanitizeCachedStateSnapshot(mergedState);
  if (!nextState.engines.some((engine) => engine.id === nextState.selectedEngineId)) {
    nextState.selectedEngineId = nextState.engines[0]?.id || "";
  }
  nextState.history = Array.isArray(baseState.history) ? structuredClone(baseState.history) : [];
  const payload = {
    state: nextState,
    updatedAt: new Date().toISOString(),
  };
  applyState(payload);
  if (authState.loggedIn && options.markDirty !== false) {
    markSyncDirty();
  }
  return payload;
}

function loadPersistedStateSnapshot() {
  try {
    const raw = window.localStorage.getItem(STATE_SNAPSHOT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    if (!parsed.state || typeof parsed.state !== "object" || Array.isArray(parsed.state)) {
      return null;
    }

    return {
      state: sanitizeCachedStateSnapshot(parsed.state),
      updatedAt:
        typeof parsed.updatedAt === "string" && parsed.updatedAt.trim()
          ? parsed.updatedAt
          : new Date().toISOString(),
      username:
        typeof parsed.username === "string" && parsed.username.trim()
          ? parsed.username.trim()
          : "",
    };
  } catch {
    return null;
  }
}

function persistStateSnapshot(payload) {
  try {
    const state = payload?.state && typeof payload.state === "object" ? payload.state : null;
    if (!state) {
      return;
    }
    window.localStorage.setItem(
      STATE_SNAPSHOT_STORAGE_KEY,
      JSON.stringify({
        state,
        updatedAt:
          typeof payload?.updatedAt === "string" && payload.updatedAt.trim()
            ? payload.updatedAt
            : new Date().toISOString(),
        username: typeof payload?.username === "string" ? payload.username : "",
      })
    );
  } catch {}
}

function clearPersistedStateSnapshot() {
  try {
    window.localStorage.removeItem(STATE_SNAPSHOT_STORAGE_KEY);
  } catch {}
}

function sanitizeCachedStateSnapshot(state) {
  const source = state && typeof state === "object" ? state : {};
  const settingsSource = source.settings && typeof source.settings === "object" ? source.settings : {};
  const backgroundSource =
    settingsSource.background && typeof settingsSource.background === "object"
      ? settingsSource.background
      : {};

  return {
    settings: {
      siteTitle:
        typeof settingsSource.siteTitle === "string" && settingsSource.siteTitle.trim()
          ? settingsSource.siteTitle.trim()
          : BRAND_NAME,
      brandLabel:
        typeof settingsSource.brandLabel === "string" && settingsSource.brandLabel.trim()
          ? settingsSource.brandLabel.trim().slice(0, 24)
          : BRAND_NAME,
      iconTheme: ICON_THEMES.some((theme) => theme.id === settingsSource.iconTheme)
        ? settingsSource.iconTheme
        : "graphite",
      brandIconUrl: normalizeBrandIconUrl(settingsSource.brandIconUrl),
      subtitle:
        typeof settingsSource.subtitle === "string" && settingsSource.subtitle.trim()
          ? settingsSource.subtitle.trim()
          : "搜索网页",
      searchBarHeight: normalizeSearchBarHeight(settingsSource.searchBarHeight),
      tagOpacity: normalizeTagOpacity(settingsSource.tagOpacity),
      searchSuggestions: settingsSource.searchSuggestions !== false,
      background: {
        provider:
          backgroundSource.provider === "custom_url" ||
          backgroundSource.provider === "picsum_seed" ||
          backgroundSource.provider === "bing_hourly"
            ? backgroundSource.provider
            : "bing_hourly",
        seed:
          typeof backgroundSource.seed === "string" && backgroundSource.seed.trim()
            ? backgroundSource.seed.trim()
            : "linen-warm",
        customUrl:
          typeof backgroundSource.customUrl === "string" ? backgroundSource.customUrl.trim() : "",
        overlayOpacity: normalizeOverlayOpacity(backgroundSource.overlayOpacity),
        bingRecentCount: normalizeBingRecentCount(backgroundSource.bingRecentCount),
      },
      historyLimit: normalizeHistoryLimit(settingsSource.historyLimit),
    },
    engines: Array.isArray(source.engines) ? source.engines : [],
    selectedEngineId: typeof source.selectedEngineId === "string" ? source.selectedEngineId : "",
    categories: Array.isArray(source.categories) ? source.categories : [],
    history: Array.isArray(source.history) ? source.history : [],
  };
}

function mergeLocalState(current, patch) {
  const currentState = current && typeof current === "object" ? current : structuredClone(GUEST_STATE);
  const nextPatch = patch && typeof patch === "object" ? patch : {};
  return {
    ...currentState,
    ...nextPatch,
    settings: {
      ...currentState.settings,
      ...(nextPatch.settings || {}),
      background: {
        ...currentState.settings.background,
        ...(nextPatch.settings?.background || {}),
      },
    },
    engines: Array.isArray(nextPatch.engines) ? nextPatch.engines : currentState.engines,
    categories: Array.isArray(nextPatch.categories) ? nextPatch.categories : currentState.categories,
    history: Array.isArray(nextPatch.history) ? nextPatch.history : currentState.history,
    selectedEngineId:
      typeof nextPatch.selectedEngineId === "string"
        ? nextPatch.selectedEngineId
        : currentState.selectedEngineId,
  };
}

function persistUiPrefsSnapshot(settings) {
  try {
    const source = settings && typeof settings === "object" ? settings : {};
    const backgroundSource =
      source.background && typeof source.background === "object" ? source.background : {};
    window.localStorage.setItem(
      UI_PREFS_STORAGE_KEY,
      JSON.stringify({
        searchBarHeight: normalizeSearchBarHeight(source.searchBarHeight),
        tagOpacity: normalizeTagOpacity(source.tagOpacity),
        overlayOpacity: normalizeOverlayOpacity(backgroundSource.overlayOpacity),
      })
    );
  } catch {}
}

function normalizePlaceholder(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed || trimmed === "把常用搜索和常访问的网站，收在一个安静的首页里。") {
    return "搜索网页";
  }
  return trimmed;
}

function trimExpandedCategoryState() {
  if (!appState) {
    return;
  }

  const alive = new Set(appState.categories.map((category) => category.id));
  for (const categoryId of Array.from(expandedCategoryIds)) {
    if (!alive.has(categoryId)) {
      expandedCategoryIds.delete(categoryId);
    }
  }
}

// Cross-tab sync. Every tab keeps its own in-memory state, so without this a second, stale window
// would write its old copy back (local snapshot + auto backup) on its next change and undo the
// first window's edits. The `storage` event fires in the *other* tabs whenever one tab persists
// a snapshot; adopt it when it's newer than what this tab has.
function handleCrossTabStorage(event) {
  if (event.storageArea !== window.localStorage) {
    return;
  }
  if (event.key === SYNC_META_STORAGE_KEY) {
    renderSyncStatus();
    return;
  }
  if (event.key !== STATE_SNAPSHOT_STORAGE_KEY || !event.newValue || !authState.loggedIn) {
    return;
  }
  const payload = loadPersistedStateSnapshot();
  if (!payload || payload.username !== authState.username) {
    return;
  }
  const incomingTime = Date.parse(payload.updatedAt) || 0;
  const currentTime = Date.parse(appState?.updatedAt) || 0;
  if (incomingTime <= currentTime) {
    return;
  }
  pendingExternalStatePayload = payload;
  applyPendingExternalState();
}

function applyPendingExternalState() {
  const payload = pendingExternalStatePayload;
  if (!payload) {
    return;
  }
  // Re-rendering the board mid-drag would yank the cards away from the pointer; retry afterwards.
  if (tagPointerDrag.card || tagPointerDrag.settling || rowPointerDrag.row || rowPointerDrag.settling) {
    window.setTimeout(applyPendingExternalState, 300);
    return;
  }
  pendingExternalStatePayload = null;
  // The tab that made the change owns its auto backup; this tab's copy is now identical, so drop our
  // pending save, and bump the version so an in-flight save can't mark the newer change as backed up.
  window.clearTimeout(autoBackupTimer);
  autoBackupTimer = 0;
  localChangeVersion += 1;
  applyState(payload, { persistLocalCache: false });
  if (settingsDraft) {
    settingsDraftStale = true;
    showNotice("其他窗口刚修改了首页配置，重新打开设置可看到最新内容");
  }
}

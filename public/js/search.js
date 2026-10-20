// Search box: engine button/menu, submit, local history, engine suggestions and dropdown keyboard navigation.
// Classic script sharing the page's global scope; load order is defined in index.html.

function playEngineSwapAnimation() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof activeEngineIcon.animate !== "function") {
    return;
  }
  activeEngineIcon.animate(
    [
      { opacity: 0, scale: "0.55", rotate: "-18deg" },
      { opacity: 1, scale: "1", rotate: "0deg" },
    ],
    { duration: 340, easing: "cubic-bezier(0.2, 0.9, 0.3, 1.3)" }
  );
}

function renderActiveEngineButton() {
  const activeEngine = getActiveEngine();
  if (!activeEngine) {
    currentActiveEngineId = "";
    activeEngineIcon.innerHTML = buildIconMarkup({ host: "", sources: [] }, "");
    return;
  }

  const iconData = getFaviconUrlFromTemplate(activeEngine.urlTemplate);
  const renderSource = getPreferredIconDisplaySource(iconData);
  const renderKey = `${activeEngine.id}|${renderSource}`;
  let iconNode = engineButtonIconNodeCache.get(activeEngine.id) || null;
  const shouldRefreshNode = !iconNode || engineRenderKeyCache.get(activeEngine.id) !== renderKey;

  if (shouldRefreshNode) {
    engineRenderKeyCache.set(activeEngine.id, renderKey);
    const wrapper = document.createElement("div");
    wrapper.innerHTML = buildIconMarkup(iconData, activeEngine.name).trim();
    iconNode = wrapper.firstElementChild;
    if (iconNode) {
      engineButtonIconNodeCache.set(activeEngine.id, iconNode);
    }
  }

  if (
    iconNode &&
    (currentActiveEngineId !== activeEngine.id || activeEngineIcon.firstElementChild !== iconNode)
  ) {
    const switchedEngine = Boolean(currentActiveEngineId) && currentActiveEngineId !== activeEngine.id;
    activeEngineIcon.replaceChildren(iconNode);
    currentActiveEngineId = activeEngine.id;
    if (switchedEngine) {
      playEngineSwapAnimation();
    }
  }

  engineToggleButton.title = `当前搜索引擎：${activeEngine.name}`;
  engineToggleButton.setAttribute("aria-label", `切换搜索引擎，当前为 ${activeEngine.name}`);
  queueIconReadyStateCheck();
}

function primeEngineButtonIcons() {
  if (!appState?.engines?.length) {
    return;
  }

  appState.engines.forEach((engine) => {
    const iconData = getFaviconUrlFromTemplate(engine.urlTemplate);
    const renderSource = getPreferredIconDisplaySource(iconData);
    const renderKey = `${engine.id}|${renderSource}`;
    const existing = engineButtonIconNodeCache.get(engine.id) || null;
    if (existing && engineRenderKeyCache.get(engine.id) === renderKey) {
      return;
    }

    engineRenderKeyCache.set(engine.id, renderKey);
    const wrapper = document.createElement("div");
    wrapper.innerHTML = buildIconMarkup(iconData, engine.name).trim();
    const node = wrapper.firstElementChild;
    if (node) {
      engineButtonIconNodeCache.set(engine.id, node);
    }
  });
}

function renderHistoryList(keyword = "") {
  if (!appState) {
    return;
  }

  searchDropdownTypedText = keyword;
  searchDropdownActiveIndex = -1;
  const trimmed = keyword.trim();
  const query = trimmed.toLowerCase();

  if (document.activeElement !== searchInput) {
    historyPanel.classList.add("hidden");
    return;
  }

  const matchingHistory = appState.history.filter((entry) => !query || entry.query.toLowerCase().includes(query));
  const historyEntries = query ? matchingHistory.slice(0, SEARCH_DROPDOWN_HISTORY_WITH_QUERY) : matchingHistory;
  const suggestionsEnabled = Boolean(trimmed) && appState.settings.searchSuggestions !== false;
  const historyTexts = new Set(historyEntries.map((entry) => entry.query.toLowerCase()));
  // Until this query's results arrive, keep showing the previous list's still-matching items (no flicker).
  const cachedSuggestions = searchSuggestCache.get(getSuggestCacheKey(trimmed));
  const previousSuggestions = lastRenderedSuggestions;
  const sourceSuggestions = cachedSuggestions
    || previousSuggestions.filter((item) => item.toLowerCase().includes(query));
  const suggestions = suggestionsEnabled
    ? sourceSuggestions.filter((item) => item.toLowerCase() !== query && !historyTexts.has(item.toLowerCase()))
    : [];
  lastRenderedSuggestions = suggestions;

  if (suggestionsEnabled) {
    queueSearchSuggestions(trimmed);
  }

  if (!historyEntries.length && !suggestions.length) {
    const awaitingSuggestions = suggestionsEnabled && !cachedSuggestions && previousSuggestions.length;
    if (awaitingSuggestions && !historyPanel.classList.contains("hidden")) {
      lastRenderedSuggestions = previousSuggestions;
      return;
    }
    if (query) {
      historyPanel.classList.add("hidden");
      return;
    }
    historyPanel.innerHTML = '<div class="empty-state">还没有搜索历史，首次搜索后仅保存在当前浏览器。</div>';
    historyPanel.classList.remove("hidden");
    return;
  }

  const historyMarkup = historyEntries
    .map((entry) => {
      const engine = appState.engines.find((item) => item.id === entry.engineId);
      const iconUrl = engine ? getFaviconUrlFromTemplate(engine.urlTemplate) : "";
      return `
        <div class="history-item" role="button" tabindex="0" data-history-id="${escapeAttribute(entry.id)}" data-query="${escapeAttribute(entry.query)}" title="填入搜索框">
          ${buildIconMarkup(iconUrl, engine?.name || entry.query, "history-engine-icon")}
          <div class="history-text">
            <div class="history-query">${escapeHtml(entry.query)}</div>
            <div class="history-meta">${escapeHtml(engine?.name || "搜索")} · ${formatTime(entry.createdAt)}</div>
          </div>
          <button class="history-search-button" type="button" data-history-search title="用当前搜索引擎搜索">搜索</button>
        </div>
      `;
    })
    .join("");

  const suggestionMarkup = suggestions
    .map(
      (text) => `
        <div class="history-item suggestion-item" role="button" tabindex="0" data-suggestion="${escapeAttribute(text)}" title="搜索：${escapeAttribute(text)}">
          <span class="suggestion-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 1.8a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm5.61 10.04 3.39 3.39-1.27 1.27-3.39-3.39 1.27-1.27Z" /></svg>
          </span>
          <div class="history-text">
            <div class="history-query suggestion-text">${highlightSuggestion(text, trimmed)}</div>
          </div>
          <button class="suggestion-fill-button" type="button" data-suggestion-fill aria-label="填入搜索框" title="填入搜索框">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h9v2H10.41l8.3 8.29-1.42 1.42L9 10.41V16H7V7Z" /></svg>
          </button>
        </div>
      `
    )
    .join("");

  historyPanel.innerHTML = historyMarkup + suggestionMarkup;
  historyPanel.classList.remove("hidden");
  engineMenu.classList.add("hidden");
}

// Google-style: the part you typed stays regular, the completion is bold.
function highlightSuggestion(text, typed) {
  if (typed && text.toLowerCase().startsWith(typed.toLowerCase())) {
    return `<span class="suggestion-typed">${escapeHtml(text.slice(0, typed.length))}</span><strong>${escapeHtml(text.slice(typed.length))}</strong>`;
  }
  return escapeHtml(text);
}

function getSuggestCacheKey(query) {
  const engine = getActiveEngine();
  return `${getHostFromTemplate(engine?.urlTemplate || "")}|${query.toLowerCase()}`;
}

function queueSearchSuggestions(query) {
  window.clearTimeout(searchSuggestTimer);
  if (searchSuggestCache.has(getSuggestCacheKey(query))) {
    return;
  }
  searchSuggestTimer = window.setTimeout(() => {
    void fetchSearchSuggestions(query);
  }, SEARCH_SUGGEST_DEBOUNCE_MS);
}

async function fetchSearchSuggestions(query) {
  searchSuggestController?.abort();
  const controller = new AbortController();
  searchSuggestController = controller;
  const cacheKey = getSuggestCacheKey(query);
  try {
    const engineHost = getHostFromTemplate(getActiveEngine()?.urlTemplate || "");
    const payload = await fetchJson(
      `/api/suggest?q=${encodeURIComponent(query)}&engine=${encodeURIComponent(engineHost)}`,
      { signal: controller.signal }
    );
    const suggestions = Array.isArray(payload?.suggestions) ? payload.suggestions.filter((item) => typeof item === "string") : [];
    searchSuggestCache.set(cacheKey, suggestions);
    if (searchSuggestCache.size > 200) {
      searchSuggestCache.delete(searchSuggestCache.keys().next().value);
    }
    // Only repaint if the user is still looking at this query (and not arrowing through rows).
    if (searchDropdownTypedText.trim() === query && searchDropdownActiveIndex === -1 && document.activeElement === searchInput) {
      renderHistoryList(searchDropdownTypedText);
    }
  } catch (error) {
    if (error?.name !== "AbortError") {
      console.warn("search suggestions unavailable", error);
    }
  } finally {
    if (searchSuggestController === controller) {
      searchSuggestController = null;
    }
  }
}

function getSearchDropdownRows() {
  return historyPanel.classList.contains("hidden")
    ? []
    : Array.from(historyPanel.querySelectorAll("[data-history-id], [data-suggestion]"));
}

function getSearchDropdownRowText(row) {
  return row.dataset.suggestion ?? row.dataset.query ?? "";
}

// ↑/↓ preview each row's text in the input (like the browser address bar), Esc restores what was typed.
function handleSearchDropdownKeydown(event) {
  const rows = getSearchDropdownRows();
  if (event.key === "Escape") {
    if (searchDropdownActiveIndex !== -1) {
      searchInput.value = searchDropdownTypedText;
      updateSearchClearButton();
    }
    closeMenus();
    return;
  }
  if ((event.key !== "ArrowDown" && event.key !== "ArrowUp") || !rows.length || event.isComposing) {
    return;
  }
  event.preventDefault();
  const step = event.key === "ArrowDown" ? 1 : -1;
  let next = searchDropdownActiveIndex + step;
  if (next >= rows.length) {
    next = -1;
  } else if (next < -1) {
    next = rows.length - 1;
  }
  searchDropdownActiveIndex = next;
  rows.forEach((row, index) => row.classList.toggle("is-active", index === next));
  if (next === -1) {
    searchInput.value = searchDropdownTypedText;
  } else {
    searchInput.value = getSearchDropdownRowText(rows[next]);
    rows[next].scrollIntoView({ block: "nearest" });
  }
  updateSearchClearButton();
}

function renderEngineMenu() {
  if (!appState) {
    return;
  }

  engineMenu.innerHTML = appState.engines
    .map((engine) => {
      const iconUrl = getFaviconUrlFromTemplate(engine.urlTemplate);
      const host = getHostFromTemplate(engine.urlTemplate);
      const active = engine.id === appState.selectedEngineId;
      return `
        <button class="engine-item" type="button" data-engine-id="${escapeAttribute(engine.id)}" style="${active ? "background: rgba(65, 88, 138, 0.06);" : ""}">
          ${buildIconMarkup(iconUrl, engine.name, "menu-engine-icon")}
          <div>
            <div class="engine-name">${escapeHtml(engine.name)}</div>
            <div class="engine-url">${escapeHtml(host || engine.urlTemplate)}</div>
          </div>
          <div class="history-meta">${active ? "当前" : "切换"}</div>
        </button>
      `;
    })
    .join("");
  queueIconReadyStateCheck();
}

async function triggerSearchFromIcon() {
  if (!searchInput.value.trim()) {
    searchInput.focus();
    return;
  }

  searchForm.requestSubmit();
}

async function handleSearch(event) {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    searchInput.focus();
    return;
  }

  const activeEngine = getActiveEngine();
  if (!activeEngine) {
    showNotice("没有可用的搜索引擎，请先在设置里添加一个", "error");
    return;
  }

  const url = activeEngine.urlTemplate.replace("%s", encodeURIComponent(query));
  addLocalHistoryEntry(query, activeEngine.id);

  window.open(url, "_blank", "noopener,noreferrer");
  closeMenus();
  searchInput.select();
  updateSearchClearButton();
}

async function clearHistory() {
  const confirmed = await openConfirmDialog({
    title: "清空本地搜索历史",
    message: `这会删除当前浏览器里最近 ${normalizeHistoryLimit(appState?.settings?.historyLimit)} 条搜索历史，且不会影响云端备份。是否继续？`,
    confirmText: "清空历史",
    tone: "danger",
    scopeElement: settingsDrawer,
  });
  if (!confirmed) {
    return;
  }

  if (!appState) {
    return;
  }

  appState.history = [];
  persistLocalHistory(appState.history);
  updateHistoryCountLabel();
  renderHistoryList(searchInput.value);
  renderSettingsHistoryList();
  showNotice("本地搜索历史已清空", "success");
}

function deleteLocalHistoryEntry(historyId) {
  if (!appState || !historyId) {
    return;
  }
  appState.history = appState.history.filter((entry) => entry.id !== historyId);
  persistLocalHistory(appState.history);
  updateHistoryCountLabel();
  renderHistoryList(searchInput.value);
  renderSettingsHistoryList();
}

function closeMenus() {
  historyPanel.classList.add("hidden");
  engineMenu.classList.add("hidden");
  engineToggleButton.setAttribute("aria-expanded", "false");
}

function handleSearchBarPointerDown(event) {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  if (target.closest("button") || target === searchInput) {
    return;
  }

  event.preventDefault();
  const position = searchInput.value.length;
  searchInput.focus();
  searchInput.setSelectionRange(position, position);
  renderHistoryList(searchInput.value);
}

function updateSearchClearButton() {
  const hasValue = Boolean(searchInput.value.trim());
  searchClearButton.classList.toggle("hidden", !hasValue);
}

function addLocalHistoryEntry(query, engineId) {
  if (!appState) {
    return;
  }

  const limit = normalizeHistoryLimit(appState.settings?.historyLimit);
  const normalizedQuery = sanitizeHistoryQuery(query);
  if (!normalizedQuery) {
    return;
  }

  const validEngineIds = new Set(appState.engines.map((engine) => engine.id));
  const safeEngineId = validEngineIds.has(engineId) ? engineId : appState.selectedEngineId;
  const nextHistory = [
    {
      id: createId("history"),
      query: normalizedQuery,
      engineId: safeEngineId,
      createdAt: new Date().toISOString(),
    },
    ...appState.history.filter(
      (entry) => !(entry.query === normalizedQuery && entry.engineId === safeEngineId)
    ),
  ].slice(0, limit);

  appState.history = nextHistory;
  persistLocalHistory(nextHistory);
  updateHistoryCountLabel();
  renderHistoryList(searchInput.value);
  renderSettingsHistoryList();
}

function loadLocalHistory(engines, selectedEngineId, limit = 100) {
  const validEngineIds = new Set((engines || []).map((engine) => engine.id));
  const safeLimit = normalizeHistoryLimit(limit);
  let parsed = [];

  try {
    const raw = window.localStorage.getItem(LOCAL_HISTORY_STORAGE_KEY);
    parsed = raw ? JSON.parse(raw) : [];
  } catch {
    parsed = [];
  }

  if (!Array.isArray(parsed)) {
    persistLocalHistory([]);
    return [];
  }

  const normalized = parsed
    .map((entry) => normalizeLocalHistoryEntry(entry, validEngineIds, selectedEngineId))
    .filter(Boolean)
    .slice(0, safeLimit);

  persistLocalHistory(normalized);
  return normalized;
}

function normalizeLocalHistoryEntry(entry, validEngineIds, selectedEngineId) {
  const query = sanitizeHistoryQuery(entry?.query);
  if (!query) {
    return null;
  }

  const rawEngineId = typeof entry?.engineId === "string" ? entry.engineId.trim() : "";
  const safeEngineId = validEngineIds.has(rawEngineId) ? rawEngineId : selectedEngineId;
  const createdAt = new Date(entry?.createdAt || Date.now());

  return {
    id:
      typeof entry?.id === "string" && entry.id.trim()
        ? entry.id.trim().slice(0, 40)
        : createId("history"),
    query,
    engineId: safeEngineId,
    createdAt: Number.isNaN(createdAt.getTime()) ? new Date().toISOString() : createdAt.toISOString(),
  };
}

function sanitizeHistoryQuery(value) {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}

function persistLocalHistory(history) {
  try {
    window.localStorage.setItem(LOCAL_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn("local history persist failed", error);
  }
}

function getActiveEngine() {
  return appState?.engines.find((engine) => engine.id === appState.selectedEngineId) || null;
}

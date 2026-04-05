const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchBar = document.querySelector(".search-bar");
const searchStage = document.querySelector(".search-stage");
const searchIconButton = document.getElementById("searchIconButton");
const searchClearButton = document.getElementById("searchClearButton");
const historyPanel = document.getElementById("historyPanel");
const engineMenu = document.getElementById("engineMenu");
const activeEngineIcon = document.getElementById("activeEngineIcon");
const siteTitleDisplay = document.getElementById("siteTitleDisplay");
const tagBoard = document.getElementById("tagBoard");
const syncStatus = document.getElementById("syncStatus");
const settingsDrawer = document.getElementById("settingsDrawer");
const settingsTrail = document.getElementById("settingsTrail");
const settingsScroll = document.getElementById("settingsScroll");
const settingsQuickScroll = document.getElementById("settingsQuickScroll");
const settingsQuickThumb = document.getElementById("settingsQuickThumb");
const drawerScrim = document.getElementById("drawerScrim");
const openSettingsButton = document.getElementById("openSettingsButton");
const closeSettingsButton = document.getElementById("closeSettingsButton");
const logoutButton = document.getElementById("logoutButton");
const cancelSettingsButton = document.getElementById("cancelSettingsButton");
const settingsForm = document.getElementById("settingsForm");
const engineToggleButton = document.getElementById("engineToggleButton");
const addEngineButton = document.getElementById("addEngineButton");
const addCategoryButton = document.getElementById("addCategoryButton");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const historyCountLabel = document.getElementById("historyCountLabel");
const engineEditor = document.getElementById("engineEditor");
const categoryEditor = document.getElementById("categoryEditor");
const siteTitleInput = document.getElementById("siteTitleInput");
const searchPlaceholderInput = document.getElementById("searchPlaceholderInput");
const searchBarHeightInput = document.getElementById("searchBarHeightInput");
const searchBarHeightValue = document.getElementById("searchBarHeightValue");
const tagOpacityInput = document.getElementById("tagOpacityInput");
const tagOpacityValue = document.getElementById("tagOpacityValue");
const backgroundProviderInput = document.getElementById("backgroundProviderInput");
const backgroundSeedInput = document.getElementById("backgroundSeedInput");
const backgroundCustomUrlInput = document.getElementById("backgroundCustomUrlInput");
const backgroundOpacityInput = document.getElementById("backgroundOpacityInput");
const backgroundOpacityValue = document.getElementById("backgroundOpacityValue");
const backgroundSeedField = document.getElementById("backgroundSeedField");
const backgroundUrlField = document.getElementById("backgroundUrlField");
const authModal = document.getElementById("authModal");
const closeAuthButton = document.getElementById("closeAuthButton");
const authTabLogin = document.getElementById("authTabLogin");
const authTabRegister = document.getElementById("authTabRegister");
const authTitle = document.getElementById("authTitle");
const authMeta = document.getElementById("authMeta");
const authMessage = document.getElementById("authMessage");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginUsernameInput = document.getElementById("loginUsernameInput");
const loginPasswordInput = document.getElementById("loginPasswordInput");
const registerUsernameInput = document.getElementById("registerUsernameInput");
const registerPasswordInput = document.getElementById("registerPasswordInput");
const registerPasswordConfirmInput = document.getElementById("registerPasswordConfirmInput");
const registerSubmitButton = document.getElementById("registerSubmitButton");
const BRAND_NAME = "mx search";
const MAX_TAGS_PER_ROW = 10;
const LOCAL_HISTORY_STORAGE_KEY = "mx_search_local_history_v1";
const BACKGROUND_SWITCH_INTERVAL_MS = 60 * 60 * 1000;
const ICON_CACHE_STORAGE_KEY = "mx_icon_source_cache_v1";
const ICON_CACHE_MAX_ENTRIES = 300;
const SEARCH_BAR_HEIGHT_MIN = 52;
const SEARCH_BAR_HEIGHT_MAX = 96;
const TAG_FADE_START_DISTANCE = 34;
const TAG_FADE_HIDDEN_OFFSET = 2;
const USER_LIMIT = 50;
const AUTH_MODE_LOGIN = "login";
const AUTH_MODE_REGISTER = "register";
const GUEST_STATE = {
  settings: {
    siteTitle: "mx search",
    subtitle: "搜索网页",
    searchBarHeight: 68,
    tagOpacity: 94,
    background: {
      provider: "bing_hourly",
      seed: "linen-warm",
      customUrl: "",
      overlayOpacity: 100,
    },
    historyLimit: 100,
  },
  engines: [
    { id: "google", name: "Google", urlTemplate: "https://www.google.com/search?q=%s" },
    { id: "bing", name: "Bing", urlTemplate: "https://www.bing.com/search?q=%s" },
    { id: "baidu", name: "Baidu", urlTemplate: "https://www.baidu.com/s?wd=%s" },
  ],
  selectedEngineId: "google",
  categories: [],
  history: [],
};
const expandedCategoryIds = new Set();
const dragState = {
  categoryId: "",
  linkId: "",
};
const categoryDragState = {
  categoryId: "",
  targetCategoryId: "",
  dropPosition: "before",
};

let appState = null;
let settingsDraft = null;
let syncTimer = null;
let settingsTrailFrame = 0;
let settingsQuickScrollFrame = 0;
let tagViewportFadeFrame = 0;
let tagLabelFitFrame = 0;
let backgroundIntervalTimer = 0;
let backgroundDelayTimer = 0;
let currentBackgroundUrl = "";
let currentBingImageIndex = -1;
let authMode = AUTH_MODE_LOGIN;
let pendingOpenSettingsAfterAuth = false;
const settingsQuickDragState = {
  active: false,
  pointerId: null,
  pointerOffsetY: 0,
};
let authState = {
  loggedIn: false,
  username: "",
  userCount: 0,
  userLimit: USER_LIMIT,
  canRegister: true,
};
let iconSourceCache = loadIconSourceCache();
let currentActiveEngineId = "";
const engineButtonIconNodeCache = new Map();
const engineRenderKeyCache = new Map();
let bingBackgroundCache = {
  expiresAt: 0,
  images: [],
};

boot();

async function boot() {
  bindEvents();
  await refreshAuthStatus();
  if (authState.loggedIn) {
    await loadState();
  } else {
    applyGuestState();
  }
  syncTimer = window.setInterval(pollState, 20000);
}

function bindEvents() {
  searchForm.addEventListener("submit", handleSearch);
  searchBar?.addEventListener("pointerdown", handleSearchBarPointerDown);
  searchInput.addEventListener("focus", () => renderHistoryList(searchInput.value));
  searchInput.addEventListener("input", () => {
    updateSearchClearButton();
    renderHistoryList(searchInput.value);
  });
  searchIconButton.addEventListener("click", () => {
    void triggerSearchFromIcon();
  });
  searchClearButton.addEventListener("click", () => {
    searchInput.value = "";
    updateSearchClearButton();
    searchInput.focus();
    renderHistoryList("");
  });

  engineToggleButton.addEventListener("click", () => {
    const hidden = engineMenu.classList.contains("hidden");
    if (hidden) {
      renderEngineMenu();
      historyPanel.classList.add("hidden");
      engineMenu.classList.remove("hidden");
      engineToggleButton.setAttribute("aria-expanded", "true");
      return;
    }

    closeMenus();
  });

  openSettingsButton.addEventListener("click", () => {
    void handleOpenSettingsClick();
  });
  closeSettingsButton.addEventListener("click", closeSettings);
  cancelSettingsButton.addEventListener("click", closeSettings);
  logoutButton.addEventListener("click", () => {
    void handleLogout();
  });
  closeAuthButton.addEventListener("click", () => {
    pendingOpenSettingsAfterAuth = false;
    closeAuthModal();
  });
  authTabLogin.addEventListener("click", () => switchAuthMode(AUTH_MODE_LOGIN));
  authTabRegister.addEventListener("click", () => switchAuthMode(AUTH_MODE_REGISTER));
  loginForm.addEventListener("submit", (event) => {
    void handleLoginSubmit(event);
  });
  registerForm.addEventListener("submit", (event) => {
    void handleRegisterSubmit(event);
  });
  drawerScrim.addEventListener("click", () => {
    if (!authModal.classList.contains("hidden")) {
      pendingOpenSettingsAfterAuth = false;
      closeAuthModal();
      return;
    }
    closeSettings();
  });
  addEngineButton.addEventListener("click", addEngineDraft);
  addCategoryButton.addEventListener("click", addCategoryDraft);
  clearHistoryButton.addEventListener("click", clearHistory);

  settingsForm.addEventListener("submit", saveSettings);
  settingsForm.addEventListener("input", handleSettingsInput);
  settingsForm.addEventListener("click", handleSettingsClick);
  settingsScroll.addEventListener("scroll", handleSettingsScroll, { passive: true });
  settingsQuickScroll?.addEventListener("pointerdown", handleSettingsQuickTrackPointerDown);
  settingsQuickThumb?.addEventListener("pointerdown", handleSettingsQuickThumbPointerDown);
  window.addEventListener("pointermove", handleSettingsQuickThumbPointerMove);
  window.addEventListener("pointerup", handleSettingsQuickThumbPointerUp);
  window.addEventListener("pointercancel", handleSettingsQuickThumbPointerUp);
  window.addEventListener("scroll", queueTagViewportFadeUpdate, { passive: true });
  window.addEventListener("resize", queueSettingsQuickScrollUpdate, { passive: true });
  window.addEventListener("resize", queueTagViewportFadeUpdate, { passive: true });
  window.addEventListener("resize", queueTagLabelFit, { passive: true });
  siteTitleDisplay.addEventListener("click", () => {
    void refreshBackgroundNow({ manual: true, force: true });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-panel")) {
      closeMenus();
    }
  });

  historyPanel.addEventListener("click", (event) => {
    const item = event.target.closest("[data-history-id]");
    if (!item) {
      return;
    }

    searchInput.value = item.dataset.query || "";
    updateSearchClearButton();
    searchInput.focus();
    closeMenus();
  });

  engineMenu.addEventListener("click", async (event) => {
    const item = event.target.closest("[data-engine-id]");
    if (!item) {
      return;
    }

    await updateState({ selectedEngineId: item.dataset.engineId });
    closeMenus();
  });

  tagBoard.addEventListener("click", (event) => {
    const button = event.target.closest("[data-toggle-category]");
    if (!button) {
      return;
    }

    const categoryId = button.dataset.toggleCategory;
    if (!categoryId) {
      return;
    }
    toggleCategoryExpanded(categoryId);
  });

  tagBoard.addEventListener("dragstart", handleTagDragStart);
  tagBoard.addEventListener("dragover", handleTagDragOver);
  tagBoard.addEventListener("drop", handleTagDrop);
  tagBoard.addEventListener("dragend", handleTagDragEnd);
}

function createGuestPayload() {
  return {
    state: structuredClone(GUEST_STATE),
    updatedAt: new Date().toISOString(),
  };
}

function applyGuestState() {
  const payload = createGuestPayload();
  applyState(payload);
  const message = authState.userCount
    ? "未登录，点击右上角设置可登录后同步"
    : "还没有账号，点击右上角设置先注册";
  setStatus(message, "default");
}

function updateAuthMeta() {
  if (!authMeta) {
    return;
  }
  authMeta.textContent = "";
  authMeta.classList.add("hidden");
}

function setAuthMessage(message = "", tone = "error") {
  if (!authMessage) {
    return;
  }
  if (!message) {
    authMessage.textContent = "";
    authMessage.classList.add("hidden");
    authMessage.dataset.tone = "";
    return;
  }
  authMessage.textContent = message;
  authMessage.classList.remove("hidden");
  authMessage.dataset.tone = tone;
}

function switchAuthMode(mode) {
  authMode = mode === AUTH_MODE_REGISTER ? AUTH_MODE_REGISTER : AUTH_MODE_LOGIN;
  authTabLogin.classList.toggle("is-active", authMode === AUTH_MODE_LOGIN);
  authTabRegister.classList.toggle("is-active", authMode === AUTH_MODE_REGISTER);
  loginForm.classList.toggle("hidden", authMode !== AUTH_MODE_LOGIN);
  registerForm.classList.toggle("hidden", authMode !== AUTH_MODE_REGISTER);
  authTitle.textContent = authMode === AUTH_MODE_REGISTER ? "注册账号" : "登录账号";

  const registerBlocked = !authState.canRegister && authMode === AUTH_MODE_REGISTER;
  registerSubmitButton.disabled = registerBlocked;
  if (registerBlocked) {
    setAuthMessage("注册人数已达上限（50），请使用已有账号登录。", "error");
  } else if (!authMessage.classList.contains("hidden")) {
    setAuthMessage("");
  }
}

function syncOverlayVisibility() {
  const hasOverlay =
    !settingsDrawer.classList.contains("hidden") || !authModal.classList.contains("hidden");
  drawerScrim.classList.toggle("hidden", !hasOverlay);
  document.body.classList.toggle("drawer-open", hasOverlay);
}

function openAuthModal(preferredMode = AUTH_MODE_LOGIN) {
  updateAuthMeta();
  setAuthMessage("");
  switchAuthMode(preferredMode);
  authModal.classList.remove("hidden");
  authModal.setAttribute("aria-hidden", "false");
  syncOverlayVisibility();

  if (authMode === AUTH_MODE_REGISTER) {
    registerUsernameInput.focus();
  } else {
    loginUsernameInput.focus();
  }
}

function closeAuthModal() {
  authModal.classList.add("hidden");
  authModal.setAttribute("aria-hidden", "true");
  setAuthMessage("");
  syncOverlayVisibility();
}

async function refreshAuthStatus() {
  try {
    const payload = await fetchJson("/api/auth/status");
    authState = {
      loggedIn: Boolean(payload.loggedIn),
      username: payload.username || "",
      userCount: Number(payload.userCount) || 0,
      userLimit: Number(payload.userLimit) || USER_LIMIT,
      canRegister: Boolean(payload.canRegister),
    };
  } catch (error) {
    console.error(error);
    authState = {
      loggedIn: false,
      username: "",
      userCount: 0,
      userLimit: USER_LIMIT,
      canRegister: true,
    };
  }
  updateAuthMeta();
}

async function handleOpenSettingsClick() {
  if (authState.loggedIn) {
    openSettings();
    return;
  }
  pendingOpenSettingsAfterAuth = true;
  const mode = authState.userCount === 0 ? AUTH_MODE_REGISTER : AUTH_MODE_LOGIN;
  openAuthModal(mode);
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value;

  if (!username || !password) {
    setAuthMessage("请输入账号和密码");
    return;
  }

  try {
    await fetchJson("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    await refreshAuthStatus();
    await loadState(true);
    closeAuthModal();
    setStatus(`欢迎回来，${authState.username}`, "success");
    if (pendingOpenSettingsAfterAuth) {
      pendingOpenSettingsAfterAuth = false;
      openSettings();
    }
  } catch (error) {
    console.error(error);
    setAuthMessage(error.message || "登录失败，请稍后重试");
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const username = registerUsernameInput.value.trim();
  const password = registerPasswordInput.value;
  const confirm = registerPasswordConfirmInput.value;

  if (!authState.canRegister) {
    setAuthMessage("注册人数已达上限（50），请使用已有账号登录。");
    switchAuthMode(AUTH_MODE_LOGIN);
    return;
  }

  if (!username) {
    setAuthMessage("请输入账号");
    return;
  }
  if (password.length < 8) {
    setAuthMessage("密码至少 8 位");
    return;
  }
  if (password !== confirm) {
    setAuthMessage("两次输入的密码不一致");
    return;
  }

  try {
    await fetchJson("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    await refreshAuthStatus();
    await loadState(true);
    closeAuthModal();
    setStatus(`注册成功，欢迎 ${authState.username}`, "success");
    if (pendingOpenSettingsAfterAuth) {
      pendingOpenSettingsAfterAuth = false;
      openSettings();
    }
  } catch (error) {
    console.error(error);
    setAuthMessage(error.message || "注册失败，请稍后重试");
    if (error?.status === 409 && error?.payload?.code === "USER_LIMIT_REACHED") {
      await refreshAuthStatus();
      switchAuthMode(AUTH_MODE_LOGIN);
    }
  }
}

async function handleLogout() {
  if (!window.confirm("确认退出登录吗？")) {
    return;
  }

  try {
    await fetchJson("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.error(error);
  }

  await refreshAuthStatus();
  closeSettings();
  applyGuestState();
  setStatus("已退出登录", "success");
}

async function loadState(silent = false) {
  try {
    const payload = await fetchJson("/api/state");
    applyState(payload);
    if (!silent) {
      setStatus("云端数据已同步", "success");
    }
  } catch (error) {
    console.error(error);
    if (error?.status === 401) {
      await refreshAuthStatus();
      applyGuestState();
      if (!silent) {
        setStatus("登录后可同步个人数据", "error");
      }
      return;
    }
    setStatus("同步失败，请检查服务是否在线", "error");
  }
}

async function pollState() {
  if (!authState.loggedIn || !appState || !settingsDrawer.classList.contains("hidden")) {
    return;
  }

  try {
    const payload = await fetchJson("/api/state");
    if (payload.updatedAt !== appState.updatedAt) {
      applyState(payload);
      setStatus("检测到其他设备更新，已自动同步", "success");
    }
  } catch (error) {
    console.error(error);
    if (error?.status === 401) {
      await refreshAuthStatus();
      applyGuestState();
    }
  }
}

function applyState(payload) {
  const nextState = {
    ...payload.state,
    updatedAt: payload.updatedAt,
  };
  nextState.history = loadLocalHistory(
    nextState.engines,
    nextState.selectedEngineId,
    nextState.settings.historyLimit
  );

  appState = nextState;
  trimExpandedCategoryState();

  const placeholder = normalizePlaceholder(appState.settings.subtitle);
  const searchBarHeight = normalizeSearchBarHeight(appState.settings.searchBarHeight);
  const tagOpacity = normalizeTagOpacity(appState.settings.tagOpacity);
  appState.settings.searchBarHeight = searchBarHeight;
  appState.settings.tagOpacity = tagOpacity;

  document.title = appState.settings.siteTitle || BRAND_NAME;
  siteTitleDisplay.textContent = BRAND_NAME;
  searchInput.placeholder = placeholder;
  applySearchBarHeight(searchBarHeight);
  applyTagOpacity(tagOpacity);
  updateSearchClearButton();
  updateHistoryCountLabel();
  renderActiveEngineButton();
  applyBackgroundOverlayOpacity(appState.settings.background.overlayOpacity);
  renderBackgroundFieldVisibility(appState.settings.background);
  void refreshBackgroundNow({ manual: false, force: true });
  scheduleBackgroundRotation();
  renderTagBoard();
  renderHistoryList(searchInput.value);
  renderEngineMenu();
  queueTagViewportFadeUpdate();
}

function renderActiveEngineButton() {
  const activeEngine = getActiveEngine();
  if (!activeEngine) {
    currentActiveEngineId = "";
    activeEngineIcon.innerHTML = buildIconMarkup({ host: "", sources: [] }, "");
    return;
  }

  const iconData = getFaviconUrlFromTemplate(activeEngine.urlTemplate);
  const firstSource = iconData.sources[0] || "";
  const renderKey = `${activeEngine.id}|${firstSource}`;
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
    activeEngineIcon.replaceChildren(iconNode);
    currentActiveEngineId = activeEngine.id;
  }

  engineToggleButton.title = `当前搜索引擎：${activeEngine.name}`;
  engineToggleButton.setAttribute("aria-label", `切换搜索引擎，当前为 ${activeEngine.name}`);
}

function renderTagBoard() {
  if (!appState.categories.length) {
    tagBoard.innerHTML = '<div class="empty-state">当前还没有标签分类，去右上角设置里添加即可。</div>';
    return;
  }

  tagBoard.innerHTML = appState.categories
    .map((category) => {
      const isExpanded = expandedCategoryIds.has(category.id);
      const hasOverflow = category.links.length > MAX_TAGS_PER_ROW;
      const rowCount = Math.max(1, Math.ceil(category.links.length / MAX_TAGS_PER_ROW));
      const content = category.links.length
        ? `<div class="tag-grid">
            ${category.links
              .map((link) => {
                const iconUrl = getFaviconUrl(link.url);
                return `
                  <a
                    class="tag-card"
                    href="${escapeAttribute(link.url)}"
                    target="_blank"
                    rel="noreferrer"
                    title="${escapeAttribute(link.label)}"
                    draggable="true"
                    data-category-id="${escapeAttribute(category.id)}"
                    data-link-id="${escapeAttribute(link.id)}"
                  >
                    ${buildIconMarkup(iconUrl, link.label, "tile-icon")}
                    <span class="tile-label">${escapeHtml(link.label)}</span>
                  </a>
                `;
              })
              .join("")}
          </div>`
        : '<div class="empty-state">这个分类还没有标签，去设置里添加吧。</div>';
      const tail = hasOverflow
        ? `
          <button
            class="category-expand-btn ${isExpanded ? "is-expanded" : ""}"
            type="button"
            data-toggle-category="${escapeAttribute(category.id)}"
            aria-expanded="${isExpanded ? "true" : "false"}"
            aria-label="${isExpanded ? "收起分类标签" : "展开更多标签"}"
            title="${isExpanded ? "收起分类标签" : "展开更多标签"}"
          >
            <span class="category-expand-icon" aria-hidden="true"></span>
          </button>
        `
        : `
          <button
            class="category-expand-btn is-disabled"
            type="button"
            disabled
            aria-disabled="true"
            aria-label="当前分类已全部显示"
            title="当前分类已全部显示"
          >
            <span class="category-expand-icon" aria-hidden="true"></span>
          </button>
        `;
      const rowClassNames = [
        "category-row",
        hasOverflow ? "has-overflow" : "",
        isExpanded ? "is-expanded" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `
        <section class="${rowClassNames}" data-category-id="${escapeAttribute(category.id)}" style="--category-rows:${rowCount};">
          <div
            class="category-head"
            draggable="true"
            data-category-drag-handle="true"
            data-category-id="${escapeAttribute(category.id)}"
            title="拖动调整分类顺序"
          >
            <div class="category-name">${escapeHtml(category.name)}</div>
          </div>
          <div class="category-middle">
            <div class="category-mobile-title">${escapeHtml(category.name)}</div>
            <div class="category-links">${content}</div>
          </div>
          <div class="category-tail">
            ${tail}
          </div>
        </section>
      `;
    })
    .join("");
  queueTagLabelFit();
  queueTagViewportFadeUpdate();
}

function renderHistoryList(keyword = "") {
  if (!appState) {
    return;
  }

  const query = keyword.trim().toLowerCase();
  const entries = appState.history
    .filter((entry) => !query || entry.query.toLowerCase().includes(query));

  if (document.activeElement !== searchInput) {
    historyPanel.classList.add("hidden");
    return;
  }

  if (!entries.length) {
    if (query) {
      historyPanel.classList.add("hidden");
      return;
    }
    historyPanel.innerHTML = '<div class="empty-state">还没有搜索历史，首次搜索后仅保存在当前浏览器。</div>';
    historyPanel.classList.remove("hidden");
    return;
  }

  historyPanel.innerHTML = entries
    .map((entry) => {
      const engine = appState.engines.find((item) => item.id === entry.engineId);
      const iconUrl = engine ? getFaviconUrlFromTemplate(engine.urlTemplate) : "";
      return `
        <button class="history-item" type="button" data-history-id="${escapeAttribute(entry.id)}" data-query="${escapeAttribute(entry.query)}">
          ${buildIconMarkup(iconUrl, engine?.name || entry.query, "history-engine-icon")}
          <div>
            <div class="history-query">${escapeHtml(entry.query)}</div>
            <div class="history-meta">${escapeHtml(engine?.name || "搜索")} · ${formatTime(entry.createdAt)}</div>
          </div>
          <div class="history-meta">使用</div>
        </button>
      `;
    })
    .join("");

  historyPanel.classList.remove("hidden");
  engineMenu.classList.add("hidden");
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
}

function renderBackgroundFieldVisibility(background) {
  backgroundSeedField.classList.toggle("hidden", background.provider !== "picsum_seed");
  backgroundUrlField.classList.toggle("hidden", background.provider !== "custom_url");
}

function normalizeOverlayOpacity(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 100;
  }
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function updateBackgroundOpacityLabel(opacity) {
  backgroundOpacityValue.textContent = `${normalizeOverlayOpacity(opacity)}%`;
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

function updateTagOpacityLabel(opacity) {
  if (!tagOpacityValue) {
    return;
  }
  tagOpacityValue.textContent = `${normalizeTagOpacity(opacity)}%`;
}

function applyTagOpacity(opacity) {
  const safe = normalizeTagOpacity(opacity) / 100;
  const soft = Math.max(0, safe - 0.03);
  const border = Math.max(0, safe - 0.08);
  document.documentElement.style.setProperty("--tag-surface-opacity", String(safe));
  document.documentElement.style.setProperty("--tag-surface-opacity-soft", String(soft));
  document.documentElement.style.setProperty("--tag-border-opacity", String(border));
}

function updateSearchBarHeightLabel(height) {
  if (!searchBarHeightValue) {
    return;
  }
  searchBarHeightValue.textContent = `${normalizeSearchBarHeight(height)}px`;
}

function applySearchBarHeight(height) {
  const safe = normalizeSearchBarHeight(height);
  document.documentElement.style.setProperty("--search-height", `${safe}px`);
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
    setStatus("没有可用的搜索引擎，请先在设置里添加一个", "error");
    return;
  }

  const url = activeEngine.urlTemplate.replace("%s", encodeURIComponent(query));
  addLocalHistoryEntry(query, activeEngine.id);

  window.open(url, "_blank", "noopener,noreferrer");
  closeMenus();
  searchInput.select();
  updateSearchClearButton();
}

function openSettings() {
  if (!authState.loggedIn) {
    pendingOpenSettingsAfterAuth = true;
    openAuthModal(authState.userCount === 0 ? AUTH_MODE_REGISTER : AUTH_MODE_LOGIN);
    return;
  }

  settingsDraft = structuredClone({
    settings: appState.settings,
    engines: appState.engines,
    selectedEngineId: appState.selectedEngineId,
    categories: appState.categories,
  });

  renderSettingsDrawer();
  settingsDrawer.classList.remove("hidden");
  settingsDrawer.setAttribute("aria-hidden", "false");
  syncOverlayVisibility();
  queueSettingsTrailUpdate();
  queueSettingsQuickScrollUpdate();
}

function closeSettings() {
  if (appState?.settings?.background) {
    applyBackgroundOverlayOpacity(appState.settings.background.overlayOpacity);
  }
  if (appState?.settings) {
    applySearchBarHeight(appState.settings.searchBarHeight);
    applyTagOpacity(appState.settings.tagOpacity);
  }
  settingsDrawer.classList.add("hidden");
  settingsDrawer.setAttribute("aria-hidden", "true");
  settingsQuickScroll?.classList.add("hidden");
  settingsQuickThumb?.classList.remove("is-dragging");
  settingsQuickDragState.active = false;
  settingsQuickDragState.pointerId = null;
  settingsQuickDragState.pointerOffsetY = 0;
  syncOverlayVisibility();
  settingsDraft = null;
  if (settingsTrailFrame) {
    window.cancelAnimationFrame(settingsTrailFrame);
    settingsTrailFrame = 0;
  }
  if (settingsQuickScrollFrame) {
    window.cancelAnimationFrame(settingsQuickScrollFrame);
    settingsQuickScrollFrame = 0;
  }
}

function renderSettingsDrawer() {
  if (!settingsDraft) {
    return;
  }

  siteTitleInput.value = settingsDraft.settings.siteTitle || "";
  searchPlaceholderInput.value = normalizePlaceholder(settingsDraft.settings.subtitle);
  const searchBarHeight = normalizeSearchBarHeight(settingsDraft.settings.searchBarHeight);
  settingsDraft.settings.searchBarHeight = searchBarHeight;
  searchBarHeightInput.value = String(searchBarHeight);
  updateSearchBarHeightLabel(searchBarHeight);
  const tagOpacity = normalizeTagOpacity(settingsDraft.settings.tagOpacity);
  settingsDraft.settings.tagOpacity = tagOpacity;
  tagOpacityInput.value = String(tagOpacity);
  updateTagOpacityLabel(tagOpacity);
  backgroundProviderInput.value = settingsDraft.settings.background.provider;
  backgroundSeedInput.value = settingsDraft.settings.background.seed;
  backgroundCustomUrlInput.value = settingsDraft.settings.background.customUrl;
  const overlayOpacity = normalizeOverlayOpacity(settingsDraft.settings.background.overlayOpacity);
  settingsDraft.settings.background.overlayOpacity = overlayOpacity;
  backgroundOpacityInput.value = String(overlayOpacity);
  updateBackgroundOpacityLabel(overlayOpacity);
  renderBackgroundFieldVisibility(settingsDraft.settings.background);

  engineEditor.innerHTML = settingsDraft.engines
    .map((engine) => {
      const iconUrl = getFaviconUrlFromTemplate(engine.urlTemplate);
      return `
        <article class="editor-card" data-engine-card="${escapeAttribute(engine.id)}">
          <div class="editor-card-header">
            <div class="engine-preview">
              ${buildIconMarkup(iconUrl, engine.name, "preview-icon")}
              <h4>${escapeHtml(engine.name || "未命名引擎")}</h4>
            </div>
            <button class="ghost-button danger" type="button" data-remove-engine="${escapeAttribute(engine.id)}">删除</button>
          </div>
          <div class="radio-pill">
            <input type="radio" name="defaultEngine" value="${escapeAttribute(engine.id)}" ${engine.id === settingsDraft.selectedEngineId ? "checked" : ""} />
            <span>默认引擎</span>
          </div>
          <div class="editor-grid-two">
            <label class="field">
              <span>名称</span>
              <input type="text" data-engine-field="name" data-engine-id="${escapeAttribute(engine.id)}" value="${escapeAttribute(engine.name)}" maxlength="24" />
            </label>
            <label class="field">
              <span>查询地址（必须包含 %s）</span>
              <input type="url" data-engine-field="urlTemplate" data-engine-id="${escapeAttribute(engine.id)}" value="${escapeAttribute(engine.urlTemplate)}" />
            </label>
          </div>
        </article>
      `;
    })
    .join("");

  categoryEditor.innerHTML = settingsDraft.categories
    .map(
      (category) => `
        <article class="editor-card" data-category-card="${escapeAttribute(category.id)}">
          <div class="editor-card-header">
            <h4>${escapeHtml(category.name || "未命名分类")}</h4>
            <button class="ghost-button danger" type="button" data-remove-category="${escapeAttribute(category.id)}">删除分类</button>
          </div>
          <label class="field">
            <span>分类名称</span>
            <input type="text" data-category-field="name" data-category-id="${escapeAttribute(category.id)}" value="${escapeAttribute(category.name)}" maxlength="18" />
          </label>
          <div class="link-list">
            ${
              category.links.length
                ? category.links
                    .map(
                      (link) => `
                        <div class="link-item-grid">
                          <label class="field">
                            <span>标签名</span>
                            <input type="text" data-link-field="label" data-category-id="${escapeAttribute(category.id)}" data-link-id="${escapeAttribute(link.id)}" value="${escapeAttribute(link.label)}" maxlength="18" />
                          </label>
                          <label class="field">
                            <span>网址</span>
                            <input type="url" data-link-field="url" data-category-id="${escapeAttribute(category.id)}" data-link-id="${escapeAttribute(link.id)}" value="${escapeAttribute(link.url)}" />
                          </label>
                          <button class="ghost-button danger" type="button" data-remove-link="${escapeAttribute(link.id)}" data-category-id="${escapeAttribute(category.id)}">删除</button>
                        </div>
                      `
                    )
                    .join("")
                : '<div class="editor-tip">这个分类还没有标签，点击“添加标签”开始配置。</div>'
            }
          </div>
          <div class="editor-card-footer">
            <button class="ghost-button" type="button" data-add-link="${escapeAttribute(category.id)}">添加标签</button>
          </div>
        </article>
      `
    )
    .join("");

  queueSettingsTrailUpdate();
  queueSettingsQuickScrollUpdate();
}

function handleSettingsInput(event) {
  if (!settingsDraft) {
    return;
  }

  const { target } = event;

  if (target === siteTitleInput) {
    settingsDraft.settings.siteTitle = target.value;
    return;
  }

  if (target === searchPlaceholderInput) {
    settingsDraft.settings.subtitle = target.value;
    return;
  }

  if (target === searchBarHeightInput) {
    const height = normalizeSearchBarHeight(target.value);
    settingsDraft.settings.searchBarHeight = height;
    updateSearchBarHeightLabel(height);
    applySearchBarHeight(height);
    return;
  }

  if (target === tagOpacityInput) {
    const opacity = normalizeTagOpacity(target.value);
    settingsDraft.settings.tagOpacity = opacity;
    updateTagOpacityLabel(opacity);
    applyTagOpacity(opacity);
    return;
  }

  if (target === backgroundProviderInput) {
    settingsDraft.settings.background.provider = target.value;
    renderSettingsDrawer();
    return;
  }

  if (target === backgroundSeedInput) {
    settingsDraft.settings.background.seed = target.value;
    return;
  }

  if (target === backgroundCustomUrlInput) {
    settingsDraft.settings.background.customUrl = target.value;
    return;
  }

  if (target === backgroundOpacityInput) {
    const opacity = normalizeOverlayOpacity(target.value);
    settingsDraft.settings.background.overlayOpacity = opacity;
    updateBackgroundOpacityLabel(opacity);
    applyBackgroundOverlayOpacity(opacity);
    return;
  }

  if (target.name === "defaultEngine") {
    settingsDraft.selectedEngineId = target.value;
    return;
  }

  if (target.dataset.engineField) {
    const engine = settingsDraft.engines.find((item) => item.id === target.dataset.engineId);
    if (engine) {
      engine[target.dataset.engineField] = target.value;
      const card = target.closest("[data-engine-card]");
      if (card && target.dataset.engineField === "name") {
        const heading = card.querySelector("h4");
        if (heading) {
          heading.textContent = target.value || "未命名引擎";
        }
      }
    }
    return;
  }

  if (target.dataset.categoryField) {
    const category = settingsDraft.categories.find((item) => item.id === target.dataset.categoryId);
    if (category) {
      category[target.dataset.categoryField] = target.value;
      if (target.dataset.categoryField === "name") {
        const card = target.closest("[data-category-card]");
        const heading = card?.querySelector("h4");
        if (heading) {
          heading.textContent = target.value || "未命名分类";
        }
      }
    }
    queueSettingsTrailUpdate();
    return;
  }

  if (target.dataset.linkField) {
    const category = settingsDraft.categories.find((item) => item.id === target.dataset.categoryId);
    const link = category?.links.find((item) => item.id === target.dataset.linkId);
    if (link) {
      link[target.dataset.linkField] = target.value;
    }
  }

  queueSettingsTrailUpdate();
}

function handleSettingsClick(event) {
  if (!settingsDraft) {
    return;
  }

  const removeEngineId = event.target.dataset.removeEngine;
  if (removeEngineId) {
    settingsDraft.engines = settingsDraft.engines.filter((engine) => engine.id !== removeEngineId);
    if (!settingsDraft.engines.some((engine) => engine.id === settingsDraft.selectedEngineId)) {
      settingsDraft.selectedEngineId = settingsDraft.engines[0]?.id || "";
    }
    renderSettingsDrawer();
    return;
  }

  const removeCategoryId = event.target.dataset.removeCategory;
  if (removeCategoryId) {
    settingsDraft.categories = settingsDraft.categories.filter((category) => category.id !== removeCategoryId);
    renderSettingsDrawer();
    return;
  }

  const addLinkCategoryId = event.target.dataset.addLink;
  if (addLinkCategoryId) {
    const category = settingsDraft.categories.find((item) => item.id === addLinkCategoryId);
    if (category) {
      category.links.push({
        id: createId("link"),
        label: "新标签",
        url: "https://",
      });
      renderSettingsDrawer();
    }
    return;
  }

  const removeLinkId = event.target.dataset.removeLink;
  if (removeLinkId) {
    const category = settingsDraft.categories.find((item) => item.id === event.target.dataset.categoryId);
    if (category) {
      category.links = category.links.filter((link) => link.id !== removeLinkId);
      renderSettingsDrawer();
    }
  }
}

function addEngineDraft() {
  if (!settingsDraft) {
    return;
  }

  const id = createId("engine");
  settingsDraft.engines.push({
    id,
    name: "新引擎",
    urlTemplate: "https://www.google.com/search?q=%s",
  });
  settingsDraft.selectedEngineId = settingsDraft.selectedEngineId || id;
  renderSettingsDrawer();
}

function addCategoryDraft() {
  if (!settingsDraft) {
    return;
  }

  settingsDraft.categories.push({
    id: createId("category"),
    name: "新分类",
    links: [],
  });
  renderSettingsDrawer();
}

async function saveSettings(event) {
  event.preventDefault();
  if (!settingsDraft) {
    return;
  }

  try {
    const payload = await updateState({
      settings: settingsDraft.settings,
      engines: settingsDraft.engines,
      selectedEngineId: settingsDraft.selectedEngineId,
      categories: settingsDraft.categories,
    });
    applyState(payload);
    closeSettings();
    setStatus("设置已保存，并同步到所有设备", "success");
  } catch (error) {
    console.error(error);
    setStatus("保存失败，请检查输入格式", "error");
  }
}

async function clearHistory() {
  if (!window.confirm("确定要清空最近 100 条搜索历史吗？")) {
    return;
  }

  if (!appState) {
    return;
  }

  appState.history = [];
  persistLocalHistory(appState.history);
  updateHistoryCountLabel();
  renderHistoryList(searchInput.value);
  setStatus("本地搜索历史已清空", "success");
}

async function updateState(patch) {
  try {
    const payload = await fetchJson("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    applyState(payload);
    return payload;
  } catch (error) {
    if (error?.status === 401) {
      await refreshAuthStatus();
      applyGuestState();
      openAuthModal(authState.userCount === 0 ? AUTH_MODE_REGISTER : AUTH_MODE_LOGIN);
    }
    throw error;
  }
}

function handleTagDragStart(event) {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  const categoryHandle = target.closest("[data-category-drag-handle]");
  if (categoryHandle?.dataset.categoryId) {
    const row = categoryHandle.closest(".category-row");
    categoryDragState.categoryId = categoryHandle.dataset.categoryId;
    categoryDragState.targetCategoryId = "";
    categoryDragState.dropPosition = "before";
    row?.classList.add("is-category-dragging");
    tagBoard.classList.add("is-dragging-categories");
    clearTagDragState();

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", categoryDragState.categoryId);
    }
    return;
  }

  const card = target.closest(".tag-card");
  if (!card || !card.dataset.linkId || !card.dataset.categoryId) {
    return;
  }

  clearCategoryDragState();
  dragState.categoryId = card.dataset.categoryId;
  dragState.linkId = card.dataset.linkId;
  card.classList.add("is-dragging");
  tagBoard.classList.add("is-dragging-links");

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", dragState.linkId);
  }
}

function handleTagDragOver(event) {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  if (categoryDragState.categoryId) {
    handleCategoryDragOver(event);
    return;
  }

  const targetCard = target.closest(".tag-card");
  const targetLinks = target.closest(".category-links");
  if (!dragState.linkId) {
    return;
  }

  if (targetCard) {
    const sameCategory = targetCard.dataset.categoryId === dragState.categoryId;
    const isSameCard = targetCard.dataset.linkId === dragState.linkId;
    if (sameCategory && isSameCard) {
      return;
    }

    event.preventDefault();
    clearTagDropHints();
    targetCard.classList.add("is-drop-target");
    return;
  }

  if (!targetLinks) {
    return;
  }

  const targetRow = targetLinks.closest(".category-row");
  if (!targetRow?.dataset.categoryId) {
    return;
  }

  event.preventDefault();
  clearTagDropHints();
  targetLinks.classList.add("is-drop-target-container");
}

function handleTagDrop(event) {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  if (categoryDragState.categoryId) {
    handleCategoryDrop(event);
    return;
  }

  const targetCard = target.closest(".tag-card");
  const targetLinks = target.closest(".category-links");
  if (!dragState.linkId) {
    return;
  }

  let targetCategoryId = "";
  let targetLinkId = "";

  if (targetCard) {
    const sameCategory = targetCard.dataset.categoryId === dragState.categoryId;
    const isSameCard = targetCard.dataset.linkId === dragState.linkId;
    if (sameCategory && isSameCard) {
      clearTagDragState();
      return;
    }
    targetCategoryId = targetCard.dataset.categoryId || "";
    targetLinkId = targetCard.dataset.linkId || "";
  } else if (targetLinks) {
    targetCategoryId = targetLinks.closest(".category-row")?.dataset.categoryId || "";
  }

  if (!targetCategoryId) {
    return;
  }

  event.preventDefault();
  const moved = moveCategoryLink(
    dragState.categoryId,
    dragState.linkId,
    targetCategoryId,
    targetLinkId
  );
  clearTagDragState();

  if (!moved) {
    return;
  }

  updateState({ categories: moved })
    .then(() => {
      setStatus("标签位置已同步", "success");
    })
    .catch((error) => {
      console.error(error);
      setStatus("标签位置保存失败，请重试", "error");
    });
}

function handleTagDragEnd() {
  clearTagDragState();
  clearCategoryDragState();
}

function clearTagDropHints() {
  tagBoard.querySelectorAll(".tag-card.is-drop-target").forEach((item) => {
    item.classList.remove("is-drop-target");
  });
  tagBoard.querySelectorAll(".category-links.is-drop-target-container").forEach((item) => {
    item.classList.remove("is-drop-target-container");
  });
}

function clearTagDragState() {
  tagBoard.querySelectorAll(".tag-card.is-dragging").forEach((item) => {
    item.classList.remove("is-dragging");
  });
  clearTagDropHints();
  tagBoard.classList.remove("is-dragging-links");
  dragState.categoryId = "";
  dragState.linkId = "";
}

function moveCategoryLink(fromCategoryId, fromLinkId, toCategoryId, toLinkId = "") {
  const nextCategories = structuredClone(appState.categories);
  const fromCategory = nextCategories.find((item) => item.id === fromCategoryId);
  const toCategory = nextCategories.find((item) => item.id === toCategoryId);
  if (!fromCategory || !toCategory) {
    return null;
  }

  const fromIndex = fromCategory.links.findIndex((item) => item.id === fromLinkId);
  if (fromIndex < 0) {
    return null;
  }

  const sameCategory = fromCategory.id === toCategory.id;
  const toIndexBeforeMove = toLinkId
    ? toCategory.links.findIndex((item) => item.id === toLinkId)
    : -1;
  if (toLinkId && toIndexBeforeMove < 0) {
    return null;
  }
  const fromOrderBefore = fromCategory.links.map((item) => item.id).join("|");
  const toOrderBefore = sameCategory ? fromOrderBefore : toCategory.links.map((item) => item.id).join("|");

  const [moved] = fromCategory.links.splice(fromIndex, 1);
  let insertIndex = toCategory.links.length;
  if (toIndexBeforeMove >= 0) {
    insertIndex = toIndexBeforeMove;
  }

  toCategory.links.splice(insertIndex, 0, moved);

  const fromOrderAfter = fromCategory.links.map((item) => item.id).join("|");
  const toOrderAfter = sameCategory ? fromOrderAfter : toCategory.links.map((item) => item.id).join("|");
  if (fromOrderBefore === fromOrderAfter && toOrderBefore === toOrderAfter) {
    return null;
  }

  return nextCategories;
}

function handleCategoryDragOver(event) {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  const targetRow = target.closest(".category-row");
  if (!targetRow) {
    return;
  }

  const targetCategoryId = targetRow.dataset.categoryId || "";
  if (!targetCategoryId || targetCategoryId === categoryDragState.categoryId) {
    return;
  }

  event.preventDefault();
  const rect = targetRow.getBoundingClientRect();
  const dropPosition = event.clientY < rect.top + rect.height / 2 ? "before" : "after";
  categoryDragState.targetCategoryId = targetCategoryId;
  categoryDragState.dropPosition = dropPosition;

  clearCategoryDropHints();
  targetRow.classList.add(
    dropPosition === "before" ? "is-category-drop-before" : "is-category-drop-after"
  );
}

function handleCategoryDrop(event) {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  const targetRow = target.closest(".category-row");
  const targetCategoryId = targetRow?.dataset.categoryId || categoryDragState.targetCategoryId;
  if (!targetCategoryId || targetCategoryId === categoryDragState.categoryId) {
    clearCategoryDragState();
    return;
  }

  event.preventDefault();
  const rect = targetRow?.getBoundingClientRect();
  const dropPosition =
    rect && Number.isFinite(event.clientY)
      ? event.clientY < rect.top + rect.height / 2
        ? "before"
        : "after"
      : categoryDragState.dropPosition;

  const moved = reorderCategoriesById(
    categoryDragState.categoryId,
    targetCategoryId,
    dropPosition
  );
  clearCategoryDragState();

  if (!moved) {
    return;
  }

  updateState({ categories: moved })
    .then(() => {
      setStatus("分类顺序已同步", "success");
    })
    .catch((error) => {
      console.error(error);
      setStatus("分类顺序保存失败，请重试", "error");
    });
}

function clearCategoryDropHints() {
  tagBoard
    .querySelectorAll(".category-row.is-category-drop-before, .category-row.is-category-drop-after")
    .forEach((item) => {
      item.classList.remove("is-category-drop-before", "is-category-drop-after");
    });
}

function clearCategoryDragState() {
  tagBoard
    .querySelectorAll(".category-row.is-category-dragging")
    .forEach((item) => item.classList.remove("is-category-dragging"));
  clearCategoryDropHints();
  tagBoard.classList.remove("is-dragging-categories");
  categoryDragState.categoryId = "";
  categoryDragState.targetCategoryId = "";
  categoryDragState.dropPosition = "before";
}

function reorderCategoriesById(fromCategoryId, toCategoryId, position = "before") {
  const nextCategories = structuredClone(appState.categories);
  const fromIndex = nextCategories.findIndex((item) => item.id === fromCategoryId);
  const toIndex = nextCategories.findIndex((item) => item.id === toCategoryId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return null;
  }

  const [moved] = nextCategories.splice(fromIndex, 1);
  let insertIndex = position === "after" ? toIndex + 1 : toIndex;
  if (fromIndex < insertIndex) {
    insertIndex -= 1;
  }
  insertIndex = Math.max(0, Math.min(nextCategories.length, insertIndex));
  nextCategories.splice(insertIndex, 0, moved);

  const before = appState.categories.map((item) => item.id).join("|");
  const after = nextCategories.map((item) => item.id).join("|");
  return before === after ? null : nextCategories;
}

function queueTagLabelFit() {
  if (tagLabelFitFrame) {
    window.cancelAnimationFrame(tagLabelFitFrame);
  }
  tagLabelFitFrame = window.requestAnimationFrame(() => {
    tagLabelFitFrame = 0;
    fitTagLabelText();
  });
}

function fitTagLabelText() {
  const labels = tagBoard.querySelectorAll(".tile-label");
  labels.forEach((labelNode) => {
    if (!(labelNode instanceof HTMLElement)) {
      return;
    }

    labelNode.style.fontSize = "";
    labelNode.style.lineHeight = "";

    const defaultSize = 15;
    const minSize = 1;
    let currentSize = defaultSize;

    while (currentSize > minSize && labelNode.scrollWidth > labelNode.clientWidth + 0.5) {
      currentSize -= 1;
      labelNode.style.fontSize = `${currentSize}px`;
      labelNode.style.lineHeight = "1.2";
    }
  });
}

function toggleCategoryExpanded(categoryId) {
  const row = Array.from(tagBoard.querySelectorAll(".category-row")).find(
    (item) => item.dataset.categoryId === categoryId
  );
  if (!row || !row.classList.contains("has-overflow")) {
    return;
  }

  const expandButton = row.querySelector("[data-toggle-category]");
  if (!expandButton || expandButton.disabled) {
    return;
  }

  const nextExpanded = !expandedCategoryIds.has(categoryId);
  if (nextExpanded) {
    expandedCategoryIds.add(categoryId);
  } else {
    expandedCategoryIds.delete(categoryId);
  }

  row.classList.toggle("is-expanded", nextExpanded);
  expandButton.classList.toggle("is-expanded", nextExpanded);
  expandButton.setAttribute("aria-expanded", nextExpanded ? "true" : "false");
  expandButton.setAttribute("aria-label", nextExpanded ? "收起分类标签" : "展开更多标签");
  expandButton.title = nextExpanded ? "收起分类标签" : "展开更多标签";
}

function closeMenus() {
  historyPanel.classList.add("hidden");
  engineMenu.classList.add("hidden");
  engineToggleButton.setAttribute("aria-expanded", "false");
}

function handleSettingsScroll() {
  queueSettingsTrailUpdate();
  queueSettingsQuickScrollUpdate();
}

function queueSettingsTrailUpdate() {
  if (!settingsDraft || settingsDrawer.classList.contains("hidden")) {
    return;
  }

  if (settingsTrailFrame) {
    window.cancelAnimationFrame(settingsTrailFrame);
  }

  settingsTrailFrame = window.requestAnimationFrame(() => {
    settingsTrailFrame = 0;
    updateSettingsTrail();
  });
}

function updateSettingsTrail() {
  if (!settingsTrail || !settingsScroll) {
    return;
  }

  const sectionNodes = Array.from(settingsScroll.querySelectorAll("[data-trail-section]"));
  if (!sectionNodes.length) {
    settingsTrail.textContent = "首页配置";
    return;
  }

  const containerTop = settingsScroll.getBoundingClientRect().top;
  const sectionThreshold = 20;
  let activeSection = sectionNodes[0];

  for (const section of sectionNodes) {
    const top = section.getBoundingClientRect().top - containerTop;
    if (top <= sectionThreshold) {
      activeSection = section;
    }
  }

  const sectionName = activeSection.dataset.trailSection || "基础信息";
  let trailText = `首页配置 - ${sectionName}`;

  if (sectionName === "标签分类") {
    const cards = Array.from(activeSection.querySelectorAll("[data-category-card]"));
    if (cards.length) {
      const cardThreshold = 84;
      let activeCard = cards[0];
      for (const card of cards) {
        const top = card.getBoundingClientRect().top - containerTop;
        if (top <= cardThreshold) {
          activeCard = card;
        }
      }

      const nameInput = activeCard.querySelector('[data-category-field="name"]');
      const cardName = (nameInput?.value || activeCard.querySelector("h4")?.textContent || "").trim();
      if (cardName) {
        trailText += ` - ${cardName}`;
      }
    }
  }

  settingsTrail.textContent = trailText;
}

function queueSettingsQuickScrollUpdate() {
  if (!settingsQuickScroll || !settingsQuickThumb || !settingsScroll) {
    return;
  }

  if (settingsQuickScrollFrame) {
    window.cancelAnimationFrame(settingsQuickScrollFrame);
  }

  settingsQuickScrollFrame = window.requestAnimationFrame(() => {
    settingsQuickScrollFrame = 0;
    updateSettingsQuickScroll();
  });
}

function updateSettingsQuickScroll() {
  if (!settingsQuickScroll || !settingsQuickThumb || !settingsScroll) {
    return;
  }

  const shouldHide =
    !settingsDraft ||
    settingsDrawer.classList.contains("hidden") ||
    settingsScroll.scrollHeight <= settingsScroll.clientHeight + 1;

  if (shouldHide) {
    settingsQuickScroll.classList.add("hidden");
    return;
  }

  settingsQuickScroll.classList.remove("hidden");

  const trackInset = 3;
  const trackHeight = Math.max(1, settingsQuickScroll.clientHeight - trackInset * 2);
  const maxScroll = Math.max(0, settingsScroll.scrollHeight - settingsScroll.clientHeight);
  const thumbHeight = Math.max(44, Math.round((settingsScroll.clientHeight / settingsScroll.scrollHeight) * trackHeight));
  const maxThumbTravel = Math.max(0, trackHeight - thumbHeight);
  const ratio = maxScroll > 0 ? settingsScroll.scrollTop / maxScroll : 0;
  const thumbTop = trackInset + Math.round(maxThumbTravel * ratio);

  settingsQuickThumb.style.height = `${thumbHeight}px`;
  settingsQuickThumb.style.top = `${thumbTop}px`;
}

function scrollSettingsByQuickPointer(clientY, centerThumb = false) {
  if (!settingsQuickScroll || !settingsQuickThumb || !settingsScroll) {
    return;
  }

  const rect = settingsQuickScroll.getBoundingClientRect();
  const trackInset = 3;
  const trackHeight = Math.max(1, rect.height - trackInset * 2);
  const thumbHeight = Math.max(44, settingsQuickThumb.offsetHeight || 0);
  const maxThumbTravel = Math.max(0, trackHeight - thumbHeight);

  const anchorOffset = centerThumb ? thumbHeight / 2 : settingsQuickDragState.pointerOffsetY;
  const pointerY = clientY - rect.top - trackInset - anchorOffset;
  const clampedThumbTop = Math.max(0, Math.min(maxThumbTravel, pointerY));
  const ratio = maxThumbTravel > 0 ? clampedThumbTop / maxThumbTravel : 0;
  const maxScroll = Math.max(0, settingsScroll.scrollHeight - settingsScroll.clientHeight);

  settingsScroll.scrollTop = ratio * maxScroll;
}

function handleSettingsQuickTrackPointerDown(event) {
  if (!settingsQuickScroll || !settingsQuickThumb) {
    return;
  }

  const target = event.target;
  if (target instanceof Element && target.closest("#settingsQuickThumb")) {
    return;
  }

  event.preventDefault();
  scrollSettingsByQuickPointer(event.clientY, true);
  queueSettingsQuickScrollUpdate();
}

function handleSettingsQuickThumbPointerDown(event) {
  if (!settingsQuickThumb) {
    return;
  }

  event.preventDefault();
  const thumbRect = settingsQuickThumb.getBoundingClientRect();
  settingsQuickDragState.active = true;
  settingsQuickDragState.pointerId = event.pointerId;
  settingsQuickDragState.pointerOffsetY = Math.max(0, Math.min(thumbRect.height, event.clientY - thumbRect.top));
  settingsQuickThumb.classList.add("is-dragging");
}

function handleSettingsQuickThumbPointerMove(event) {
  if (!settingsQuickDragState.active || event.pointerId !== settingsQuickDragState.pointerId) {
    return;
  }

  event.preventDefault();
  scrollSettingsByQuickPointer(event.clientY, false);
  queueSettingsQuickScrollUpdate();
}

function handleSettingsQuickThumbPointerUp(event) {
  if (!settingsQuickDragState.active || event.pointerId !== settingsQuickDragState.pointerId) {
    return;
  }

  settingsQuickDragState.active = false;
  settingsQuickDragState.pointerId = null;
  settingsQuickDragState.pointerOffsetY = 0;
  settingsQuickThumb?.classList.remove("is-dragging");
}

function queueTagViewportFadeUpdate() {
  if (!tagBoard || !searchStage) {
    return;
  }

  if (tagViewportFadeFrame) {
    window.cancelAnimationFrame(tagViewportFadeFrame);
  }

  tagViewportFadeFrame = window.requestAnimationFrame(() => {
    tagViewportFadeFrame = 0;
    updateTagViewportFade();
  });
}

function updateTagViewportFade() {
  if (!tagBoard || !searchStage) {
    return;
  }

  const fadeTargets = Array.from(
    tagBoard.querySelectorAll(".tag-card, .category-name, .category-expand-btn, .category-mobile-title")
  );
  const rows = Array.from(tagBoard.querySelectorAll(".category-row"));
  if (!fadeTargets.length) {
    return;
  }

  for (const row of rows) {
    row.style.opacity = "";
    row.style.pointerEvents = "";
  }

  const searchRect = (searchBar && searchBar.getBoundingClientRect()) || searchStage.getBoundingClientRect();
  const fadeHiddenLine = searchRect.bottom + TAG_FADE_HIDDEN_OFFSET;
  const fadeStartLine = fadeHiddenLine + TAG_FADE_START_DISTANCE;
  const fadeRange = Math.max(1, fadeStartLine - fadeHiddenLine);

  for (const target of fadeTargets) {
    const rect = target.getBoundingClientRect();
    let opacity = 1;

    if (rect.top <= fadeHiddenLine) {
      opacity = 0;
    } else if (rect.top < fadeStartLine) {
      opacity = (rect.top - fadeHiddenLine) / fadeRange;
    }

    const clamped = Math.max(0, Math.min(1, opacity));
    target.style.opacity = clamped.toFixed(3);
    target.style.pointerEvents = clamped < 0.02 ? "none" : "";
  }
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

async function refreshBackgroundNow({ manual = false, force = false } = {}) {
  if (!appState) {
    return;
  }

  const background = appState.settings?.background || {};
  const provider = background.provider || "bing_hourly";

  if (provider === "custom_url") {
    const customUrl = String(background.customUrl || "").trim();
    if (customUrl) {
      setBackgroundUrl(customUrl);
      if (manual) {
        setStatus("已切换到自定义背景", "success");
      }
      return;
    }
  }

  if (provider === "bing_hourly") {
    const switched = await applyBingBackground({ manual, force });
    if (switched) {
      return;
    }
  }

  const seed = String(background.seed || "linen-warm").trim() || "linen-warm";
  const token = manual ? `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` : getCurrentHourKey();
  const picsumUrl = `https://picsum.photos/seed/${encodeURIComponent(`${seed}-${token}`)}/1920/1080`;
  setBackgroundUrl(picsumUrl);
  if (manual) {
    setStatus("已切换背景", "success");
  }
}

async function applyBingBackground({ manual = false, force = false } = {}) {
  const images = await fetchBingBackgroundImages(force);
  if (!images.length) {
    return false;
  }

  let nextIndex = 0;
  if (manual) {
    nextIndex = Math.floor(Math.random() * images.length);
    if (images.length > 1 && nextIndex === currentBingImageIndex) {
      nextIndex = (nextIndex + 1) % images.length;
    }
  } else {
    nextIndex = Math.abs(hashString(getCurrentHourKey())) % images.length;
  }

  currentBingImageIndex = nextIndex;
  const picked = images[nextIndex];
  setBackgroundUrl(picked.url);
  if (manual) {
    const title = picked.title ? `：${picked.title}` : "";
    setStatus(`已切换 Bing 背景${title}`, "success");
  }
  return true;
}

async function fetchBingBackgroundImages(force = false) {
  const now = Date.now();
  if (!force && bingBackgroundCache.images.length && now < bingBackgroundCache.expiresAt) {
    return bingBackgroundCache.images;
  }

  try {
    const response = await fetch("/api/background/bing");
    if (!response.ok) {
      throw new Error(`bing api failed: ${response.status}`);
    }

    const payload = await response.json();
    const images = Array.isArray(payload?.images)
      ? payload.images
          .map((item) => ({
            url: typeof item?.url === "string" ? item.url : "",
            title: typeof item?.title === "string" ? item.title : "",
          }))
          .filter((item) => item.url)
      : [];

    if (images.length) {
      bingBackgroundCache = {
        expiresAt: now + 15 * 60 * 1000,
        images,
      };
    }
  } catch (error) {
    console.error(error);
  }

  return bingBackgroundCache.images;
}

function scheduleBackgroundRotation() {
  if (backgroundIntervalTimer) {
    window.clearInterval(backgroundIntervalTimer);
    backgroundIntervalTimer = 0;
  }
  if (backgroundDelayTimer) {
    window.clearTimeout(backgroundDelayTimer);
    backgroundDelayTimer = 0;
  }

  if (!appState) {
    return;
  }

  const provider = appState.settings?.background?.provider;
  if (provider === "custom_url") {
    return;
  }

  const now = new Date();
  const msUntilNextHour =
    (59 - now.getMinutes()) * 60 * 1000 +
    (59 - now.getSeconds()) * 1000 +
    (1000 - now.getMilliseconds());

  backgroundDelayTimer = window.setTimeout(() => {
    void refreshBackgroundNow({ manual: false, force: false });
    backgroundIntervalTimer = window.setInterval(() => {
      void refreshBackgroundNow({ manual: false, force: false });
    }, BACKGROUND_SWITCH_INTERVAL_MS);
  }, Math.max(msUntilNextHour, 1000));
}

function setBackgroundUrl(url) {
  if (!url || url === currentBackgroundUrl) {
    return;
  }
  currentBackgroundUrl = url;
  document.documentElement.style.setProperty("--page-bg", `url("${url}")`);
}

function getCurrentHourKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  return `${year}-${month}-${day}-${hour}`;
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function addLocalHistoryEntry(query, engineId) {
  if (!appState) {
    return;
  }

  const limit = Number(appState.settings?.historyLimit) || 100;
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
}

function loadLocalHistory(engines, selectedEngineId, limit = 100) {
  const validEngineIds = new Set((engines || []).map((engine) => engine.id));
  const safeLimit = Number(limit) > 0 ? Number(limit) : 100;
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

function updateHistoryCountLabel() {
  if (!appState) {
    return;
  }
  historyCountLabel.textContent = `最近保留 ${appState.settings.historyLimit} 条（仅本机），目前 ${appState.history.length} 条`;
}

function getActiveEngine() {
  return appState?.engines.find((engine) => engine.id === appState.selectedEngineId) || null;
}

function getFaviconUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return buildIconSources(url);
  } catch {
    return { host: "", sources: [] };
  }
}

function getFaviconUrlFromTemplate(templateUrl) {
  try {
    const url = new URL(templateUrl.replace("%s", "search"));
    return buildIconSources(url);
  } catch {
    return { host: "", sources: [] };
  }
}

function getHostFromTemplate(templateUrl) {
  try {
    return new URL(templateUrl.replace("%s", "search")).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function buildIconSources(url) {
  const host = sanitizeIconHost(url.host.replace(/^www\./, ""));
  if (!host) {
    return { host: "", sources: [] };
  }
  const native = `${url.origin}/favicon.ico`;
  const duck = `https://icons.duckduckgo.com/ip3/${host}.ico`;
  const s2 = `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(host)}`;
  const cached = iconSourceCache[host] || "";
  const sources = [cached, native, duck, s2]
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index);
  return { host, sources };
}

function buildIconMarkup(iconUrl, _fallback, className = "engine-button-icon") {
  const iconData = iconUrl && typeof iconUrl === "object" ? iconUrl : { host: "", sources: [] };
  const iconHost = sanitizeIconHost(iconData.host || "");
  const iconSources = Array.isArray(iconData.sources)
    ? iconData.sources.filter(Boolean)
    : Array.isArray(iconUrl)
      ? iconUrl.filter(Boolean)
      : iconUrl
        ? [iconUrl]
        : [];
  const imageMarkup = iconSources.length
    ? `<img class="mx-icon-image" src="${escapeAttribute(iconSources[0])}" data-icon-host="${escapeAttribute(iconHost)}" data-icon-chain="${escapeAttribute(iconSources.slice(1).join("|"))}" alt="" loading="eager" fetchpriority="low" decoding="async" onload="window.__mxIconLoaded(this);" onerror="window.__mxIconFallback(this);" />`
    : "";

  return `
    <span class="${className}">
      ${imageMarkup}
    </span>
  `;
}

window.__mxIconLoaded = function handleIconLoaded(imageNode) {
  if (!imageNode) {
    return;
  }

  imageNode.classList.add("is-ready");

  const host = sanitizeIconHost(imageNode.dataset.iconHost || "");
  const source = normalizeIconSource(imageNode.currentSrc || imageNode.src || imageNode.getAttribute("src"));
  if (!host || !source) {
    return;
  }

  imageNode.dataset.iconChain = "";

  if (iconSourceCache[host] === source) {
    syncIconNodesByHost(host, source, imageNode);
    return;
  }

  iconSourceCache[host] = source;
  persistIconSourceCache(iconSourceCache);
  syncIconNodesByHost(host, source, imageNode);
};

window.__mxIconFallback = function handleIconFallback(imageNode) {
  if (!imageNode) {
    return;
  }

  imageNode.classList.remove("is-ready");

  const chain = (imageNode.dataset.iconChain || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!chain.length) {
    imageNode.remove();
    return;
  }

  const [next, ...rest] = chain;
  imageNode.dataset.iconChain = rest.join("|");
  imageNode.src = next;
};

function syncIconNodesByHost(host, source, sourceNode = null) {
  const normalizedHost = sanitizeIconHost(host);
  const normalizedSource = normalizeIconSource(source);
  if (!normalizedHost || !normalizedSource) {
    return;
  }

  const allNodes = document.querySelectorAll("img[data-icon-host]");
  allNodes.forEach((node) => {
    if (!(node instanceof HTMLImageElement)) {
      return;
    }
    if (node === sourceNode) {
      return;
    }
    if (sanitizeIconHost(node.dataset.iconHost || "") !== normalizedHost) {
      return;
    }

    const current = normalizeIconSource(node.currentSrc || node.src || node.getAttribute("src"));
    if (current === normalizedSource) {
      node.classList.add("is-ready");
      node.dataset.iconChain = "";
      return;
    }

    node.dataset.iconChain = "";
    node.classList.remove("is-ready");
    node.src = normalizedSource;
  });
}

function loadIconSourceCache() {
  try {
    const raw = window.localStorage.getItem(ICON_CACHE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const entries = Object.entries(parsed)
      .filter(([host, source]) => sanitizeIconHost(host) && typeof source === "string" && source.trim())
      .slice(0, ICON_CACHE_MAX_ENTRIES);
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

function persistIconSourceCache(cache) {
  try {
    const trimmedEntries = Object.entries(cache)
      .filter(([host, source]) => sanitizeIconHost(host) && typeof source === "string" && source.trim())
      .slice(-ICON_CACHE_MAX_ENTRIES);
    const normalized = Object.fromEntries(trimmedEntries);
    window.localStorage.setItem(ICON_CACHE_STORAGE_KEY, JSON.stringify(normalized));
    iconSourceCache = normalized;
  } catch (error) {
    console.warn("icon source cache persist failed", error);
  }
}

function sanitizeIconHost(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeIconSource(value) {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  try {
    return new URL(trimmed, window.location.origin).toString();
  } catch {
    return trimmed;
  }
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload.message === "string" && payload.message) ||
      `Request failed: ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
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

function setStatus(message, tone = "default") {
  syncStatus.innerHTML = `<span class="sync-dot" aria-hidden="true"></span><span>${escapeHtml(message)}${appState?.updatedAt ? ` · ${escapeHtml(formatTime(appState.updatedAt))}` : ""}</span>`;
  syncStatus.classList.remove("status-success", "status-error");
  if (tone === "success") {
    syncStatus.classList.add("status-success");
  }
  if (tone === "error") {
    syncStatus.classList.add("status-error");
  }
}

function formatTime(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

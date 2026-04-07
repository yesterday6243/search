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
const syncModal = document.getElementById("syncModal");
const closeSyncModalButton = document.getElementById("closeSyncModalButton");
const syncModalMeta = document.getElementById("syncModalMeta");
const syncModalMessage = document.getElementById("syncModalMessage");
const backupNowButton = document.getElementById("backupNowButton");
const refreshBackupsButton = document.getElementById("refreshBackupsButton");
const syncBackupList = document.getElementById("syncBackupList");
const confirmModal = document.getElementById("confirmModal");
const confirmModalTitle = document.getElementById("confirmModalTitle");
const confirmModalMessage = document.getElementById("confirmModalMessage");
const confirmModalInputField = document.getElementById("confirmModalInputField");
const confirmModalInputLabel = document.getElementById("confirmModalInputLabel");
const confirmModalInput = document.getElementById("confirmModalInput");
const closeConfirmModalButton = document.getElementById("closeConfirmModalButton");
const confirmModalCancelButton = document.getElementById("confirmModalCancelButton");
const confirmModalConfirmButton = document.getElementById("confirmModalConfirmButton");
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
const historyLimitInput = document.getElementById("historyLimitInput");
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
const backgroundSeedPresetField = document.getElementById("backgroundSeedPresetField");
const backgroundSeedPresetInput = document.getElementById("backgroundSeedPresetInput");
const backgroundSeedPresetHint = document.getElementById("backgroundSeedPresetHint");
const backgroundCustomUrlInput = document.getElementById("backgroundCustomUrlInput");
const backgroundOpacityInput = document.getElementById("backgroundOpacityInput");
const backgroundOpacityValue = document.getElementById("backgroundOpacityValue");
const backgroundBingRecentCountField = document.getElementById("backgroundBingRecentCountField");
const backgroundBingRecentCountInput = document.getElementById("backgroundBingRecentCountInput");
const backgroundBingRecentCountValue = document.getElementById("backgroundBingRecentCountValue");
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
const noticeToast = document.getElementById("noticeToast");
const BRAND_NAME = "mx search";
const MAX_TAGS_PER_ROW = 10;
const LOCAL_HISTORY_STORAGE_KEY = "mx_search_local_history_v1";
const STATE_SNAPSHOT_STORAGE_KEY = "mx_state_snapshot_v1";
const UI_PREFS_STORAGE_KEY = "mx_ui_prefs_v1";
const BACKGROUND_SNAPSHOT_STORAGE_KEY = "mx_background_url_v1";
const SYNC_META_STORAGE_KEY = "mx_sync_meta_v1";
const BACKGROUND_SWITCH_INTERVAL_MS = 60 * 60 * 1000;
const ICON_CACHE_STORAGE_KEY = "mx_icon_source_cache_v1";
const ICON_CACHE_MAX_ENTRIES = 300;
const ICON_CACHE_SERVER_PROMOTE_DEBOUNCE_MS = 1200;
const ICON_SOURCE_FAILURE_COOLDOWN_MS = 10 * 60 * 1000;
const NOTICE_HIDE_DELAY_MS = 2200;
const SEARCH_BAR_HEIGHT_MIN = 52;
const SEARCH_BAR_HEIGHT_MAX = 96;
const TAG_FADE_START_DISTANCE = 34;
const TAG_FADE_HIDDEN_OFFSET = 2;
const CATEGORY_DROP_EDGE_PADDING = 16;
const CATEGORY_DROP_END_ZONE = 42;
const CATEGORY_DROP_END_OFFSET = 14;
const BING_RECENT_COUNT_MIN = 1;
const BING_RECENT_COUNT_MAX = 8;
const BACKGROUND_SEED_PRESETS = [
  { value: "amber-dawn", label: "暖金晨光", description: "偏暖、柔和、通用背景。" },
  { value: "mist-forest", label: "薄雾森林", description: "自然系、低对比、护眼。" },
  { value: "ocean-breeze", label: "海风青蓝", description: "清爽冷色、适合科技内容。" },
  { value: "city-night", label: "城市夜景", description: "高反差、霓虹感更强。" },
  { value: "minimal-paper", label: "纸感极简", description: "纯净背景，视觉干扰低。" },
  { value: "mountain-air", label: "山野空气", description: "自然风景，层次柔和。" },
  { value: "desert-light", label: "荒漠暖调", description: "暖色氛围、质感偏硬。" },
  { value: "nordic-cold", label: "北欧冷调", description: "冷灰干净、偏克制风格。" },
  { value: "retro-film", label: "复古胶片", description: "偏棕与颗粒感氛围。" },
  { value: "neon-street", label: "霓虹街景", description: "对比强，适合夜间风格。" },
  { value: "sunset-cliff", label: "落日山崖", description: "暖橙晚霞、空间感强。" },
  { value: "snow-field", label: "雪地云层", description: "亮背景、极简清爽。" },
  { value: "ink-water", label: "水墨流动", description: "东方意境、低饱和过渡。" },
  { value: "future-grid", label: "未来网格", description: "数字感、偏抽象背景。" },
  { value: "rain-window", label: "雨窗朦胧", description: "柔焦氛围、细节弱化。" },
  { value: "stone-cave", label: "岩洞纹理", description: "深色肌理、层次丰富。" },
];
const DEFAULT_ICON_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23d6dde8'/%3E%3Cstop offset='1' stop-color='%23b9c4d4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='128' height='128' rx='34' fill='url(%23g)'/%3E%3Cpath d='M44 64c0-11 9-20 20-20h20v12H64a8 8 0 1 0 0 16h20v12H64c-11 0-20-9-20-20Z' fill='%23fff'/%3E%3Ccircle cx='92' cy='64' r='12' fill='%23ffffffcc'/%3E%3C/svg%3E";
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
      bingRecentCount: 8,
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
  dropPosition: "center",
};

let appState = null;
let settingsDraft = null;
let syncModalBusy = false;
let syncModalBackups = [];
let settingsTrailFrame = 0;
let settingsQuickScrollFrame = 0;
let tagViewportFadeFrame = 0;
let tagLabelFitFrame = 0;
let backgroundIntervalTimer = 0;
let backgroundDelayTimer = 0;
const persistedBackgroundSnapshot = loadPersistedBackgroundSnapshot();
let currentBackgroundUrl = persistedBackgroundSnapshot.url;
let currentBackgroundRefreshKey = persistedBackgroundSnapshot.key;
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
let serverDefaultIconCache = {};
let categoryDropIndicator = null;
let currentActiveEngineId = "";
const engineButtonIconNodeCache = new Map();
const engineRenderKeyCache = new Map();
const bingBackgroundCacheByCount = new Map();
let iconCachePromoteTimer = 0;
const pendingIconPromoteHosts = new Set();
const iconSourceFailureCooldown = new Map();
let noticeTimer = 0;
let confirmResolver = null;
let confirmScopeElement = null;

boot();

async function boot() {
  ensureCategoryDropIndicator();
  bindEvents();
  const cachedStatePayload = loadPersistedStateSnapshot();
  if (cachedStatePayload) {
    applyState(cachedStatePayload, { persistLocalCache: false });
  } else {
    applyGuestState();
  }
  await refreshAuthStatus();
  if (authState.loggedIn) {
    if (cachedStatePayload?.username && cachedStatePayload.username !== authState.username) {
      clearPersistedStateSnapshot();
      applyGuestState();
    }
  } else {
    clearPersistedStateSnapshot();
    applyGuestState();
  }
  renderSyncStatus();
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
  syncStatus?.addEventListener("click", () => {
    void handleManualSyncClick();
  });
  closeSyncModalButton?.addEventListener("click", closeSyncModal);
  backupNowButton?.addEventListener("click", () => {
    void handleBackupNow();
  });
  refreshBackupsButton?.addEventListener("click", () => {
    void refreshBackupList();
  });
  syncBackupList?.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-backup-action]");
    if (!actionButton) {
      return;
    }
    const backupId = actionButton.dataset.backupId || "";
    const action = actionButton.dataset.backupAction || "";
    if (!backupId || !action) {
      return;
    }
    if (action === "restore") {
      void handleRestoreBackup(backupId);
      return;
    }
    if (action === "rename") {
      void handleRenameBackup(backupId, actionButton.dataset.backupName || "");
      return;
    }
    if (action === "delete") {
      void handleDeleteBackup(backupId);
    }
  });
  closeConfirmModalButton?.addEventListener("click", () => {
    resolveConfirmDialog(false);
  });
  confirmModalCancelButton?.addEventListener("click", () => {
    resolveConfirmDialog(false);
  });
  confirmModalConfirmButton?.addEventListener("click", () => {
    resolveConfirmDialog(true);
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
    if (!confirmModal.classList.contains("hidden")) {
      resolveConfirmDialog(false);
      return;
    }
    if (!syncModal.classList.contains("hidden")) {
      closeSyncModal();
      return;
    }
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

function ensureCategoryDropIndicator() {
  if (!tagBoard || categoryDropIndicator?.isConnected) {
    return;
  }
  categoryDropIndicator = document.createElement("div");
  categoryDropIndicator.className = "category-drop-indicator";
  categoryDropIndicator.setAttribute("aria-hidden", "true");
  tagBoard.appendChild(categoryDropIndicator);
}

function createGuestPayload() {
  return {
    state: structuredClone(GUEST_STATE),
    updatedAt: new Date().toISOString(),
  };
}

function applyGuestState() {
  const payload = createGuestPayload();
  applyState(payload, { persistLocalCache: false });
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
    !settingsDrawer.classList.contains("hidden") ||
    !authModal.classList.contains("hidden") ||
    !syncModal.classList.contains("hidden") ||
    !confirmModal.classList.contains("hidden");
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
    closeAuthModal();
    renderSyncStatus();
    showNotice(`欢迎回来，${authState.username}`, "success");
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
    closeAuthModal();
    renderSyncStatus();
    showNotice(`注册成功，欢迎 ${authState.username}`, "success");
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
  const confirmed = await openConfirmDialog({
    title: "退出登录",
    message: "退出后会保留当前浏览器里的本地数据，但需要重新登录才能访问云端备份。",
    confirmText: "退出登录",
    scopeElement: settingsDrawer,
  });
  if (!confirmed) {
    return;
  }

  try {
    await fetchJson("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.error(error);
  }

  await refreshAuthStatus();
  closeSettings();
  closeSyncModal();
  clearPersistedStateSnapshot();
  applyGuestState();
  renderSyncStatus();
  showNotice("已退出登录", "success");
}

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

function openConfirmDialog({
  title = "请确认操作",
  message = "确认后会继续执行当前操作。",
  confirmText = "确定",
  cancelText = "取消",
  scopeElement = null,
  inputValue = null,
  inputLabel = "名称",
  inputPlaceholder = "",
} = {}) {
  if (!confirmModal || !confirmModalTitle || !confirmModalMessage) {
    return Promise.resolve(false);
  }
  if (confirmResolver) {
    confirmResolver(false);
    confirmResolver = null;
  }

  confirmModalTitle.textContent = title;
  confirmModalMessage.textContent = message;
  if (confirmModalConfirmButton) {
    confirmModalConfirmButton.textContent = confirmText;
  }
  if (confirmModalCancelButton) {
    confirmModalCancelButton.textContent = cancelText;
  }
  const useInput = inputValue !== null;
  if (confirmModalInputField && confirmModalInput && confirmModalInputLabel) {
    confirmModalInputField.classList.toggle("hidden", !useInput);
    confirmModalInputLabel.textContent = inputLabel || "名称";
    confirmModalInput.placeholder = inputPlaceholder || "";
    confirmModalInput.value = useInput ? String(inputValue) : "";
  }
  if (confirmScopeElement instanceof Element) {
    confirmScopeElement.classList.remove("has-local-confirm");
  }
  confirmScopeElement = scopeElement instanceof Element ? scopeElement : null;
  confirmScopeElement?.classList.add("has-local-confirm");

  confirmModal.classList.remove("hidden");
  confirmModal.setAttribute("aria-hidden", "false");
  syncOverlayVisibility();
  if (useInput && confirmModalInput) {
    confirmModalInput.focus();
    confirmModalInput.select();
  } else {
    confirmModalConfirmButton?.focus();
  }

  return new Promise((resolve) => {
    confirmResolver = resolve;
  });
}

function resolveConfirmDialog(result) {
  if (!confirmModal) {
    return;
  }
  confirmModal.classList.add("hidden");
  confirmModal.setAttribute("aria-hidden", "true");
  if (confirmScopeElement instanceof Element) {
    confirmScopeElement.classList.remove("has-local-confirm");
  }
  confirmScopeElement = null;
  syncOverlayVisibility();
  const resolver = confirmResolver;
  confirmResolver = null;
  if (resolver) {
    if (!confirmModalInputField?.classList.contains("hidden") && confirmModalInput) {
      resolver({
        confirmed: Boolean(result),
        value: confirmModalInput.value.trim(),
      });
      return;
    }
    resolver(Boolean(result));
  }
}

function renderSyncModalMeta() {
  if (!syncModalMeta) {
    return;
  }
  if (!authState.loggedIn) {
    syncModalMeta.textContent = "登录后可管理云端备份与同步。";
    return;
  }
  syncModalMeta.textContent = "备份会把当前本地数据写入云端。同步会从选中的云端备份恢复，并覆盖当前本地数据。";
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
  if (backupNowButton) {
    backupNowButton.disabled = syncModalBusy;
  }
  if (refreshBackupsButton) {
    refreshBackupsButton.disabled = syncModalBusy;
  }
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

function renderBackupList() {
  if (!syncBackupList) {
    return;
  }
  if (!syncModalBackups.length) {
    syncBackupList.innerHTML = '<div class="sync-backup-empty">当前还没有云端备份。先点击上方“备份当前本地数据”创建一条记录。</div>';
    return;
  }

  syncBackupList.innerHTML = syncModalBackups
    .map((backup, index) => {
      const backupId = escapeAttribute(backup.id || "");
      const createdAt = backup.createdAt ? formatPreciseTime(backup.createdAt) : "未知时间";
      const backupName = (backup.name || `备份 ${syncModalBackups.length - index}`).trim();
      return `
        <div class="sync-backup-item">
          <div>
            <div class="sync-backup-title-row">
              <p class="sync-backup-title">${escapeHtml(backupName)}</p>
              <button class="sync-backup-rename" type="button" data-backup-action="rename" data-backup-id="${backupId}" data-backup-name="${escapeAttribute(backupName)}">重命名</button>
            </div>
            <p class="sync-backup-meta">创建时间 · ${escapeHtml(createdAt)}</p>
          </div>
          <div class="sync-backup-actions">
            <button class="primary-button" type="button" data-backup-action="restore" data-backup-id="${backupId}">同步到本地</button>
            <button class="ghost-button danger" type="button" data-backup-action="delete" data-backup-id="${backupId}">删除</button>
          </div>
        </div>
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
      { persistLocalCache: true }
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

function applyState(payload, options = {}) {
  const previousBackgroundRefreshKey = currentBackgroundRefreshKey;
  const persistLocalCache = options.persistLocalCache !== false;
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
  const bingRecentCount = normalizeBingRecentCount(appState.settings?.background?.bingRecentCount);
  appState.settings.searchBarHeight = searchBarHeight;
  appState.settings.tagOpacity = tagOpacity;
  appState.settings.background.bingRecentCount = bingRecentCount;

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
  const nextBackgroundRefreshKey = getBackgroundRefreshKey(appState.settings.background);
  const shouldRefreshBackground =
    !currentBackgroundUrl || previousBackgroundRefreshKey !== nextBackgroundRefreshKey;
  currentBackgroundRefreshKey = nextBackgroundRefreshKey;
  if (shouldRefreshBackground) {
    void refreshBackgroundNow({ manual: false, force: previousBackgroundRefreshKey !== nextBackgroundRefreshKey });
  }
  scheduleBackgroundRotation();
  renderTagBoard();
  renderHistoryList(searchInput.value);
  renderEngineMenu();
  primeEngineButtonIcons();
  queueTagViewportFadeUpdate();

  if (persistLocalCache && authState.loggedIn) {
    persistStateSnapshot({
      state: appState,
      updatedAt: appState.updatedAt,
      username: authState.username,
    });
    persistUiPrefsSnapshot(appState.settings);
  }
  renderSyncStatus();
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
    activeEngineIcon.replaceChildren(iconNode);
    currentActiveEngineId = activeEngine.id;
  }

  engineToggleButton.title = `当前搜索引擎：${activeEngine.name}`;
  engineToggleButton.setAttribute("aria-label", `切换搜索引擎，当前为 ${activeEngine.name}`);
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

function renderTagBoard() {
  if (!appState.categories.length) {
    tagBoard.innerHTML = '<div class="empty-state">当前还没有标签分类，去右上角设置里添加即可。</div>';
    ensureCategoryDropIndicator();
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
  ensureCategoryDropIndicator();
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
  const provider = background?.provider || "bing_hourly";
  const isPicsum = provider === "picsum_seed";
  const isBing = provider === "bing_hourly";
  const isCustom = provider === "custom_url";
  const matchedPreset = BACKGROUND_SEED_PRESETS.find(
    (item) => item.value === String(background?.seed || "").trim()
  );
  const shouldShowCustomSeed = isPicsum && !matchedPreset;
  backgroundSeedField.classList.toggle("hidden", !shouldShowCustomSeed);
  backgroundSeedPresetField?.classList.toggle("hidden", !isPicsum);
  backgroundBingRecentCountField?.classList.toggle("hidden", !isBing);
  backgroundUrlField.classList.toggle("hidden", !isCustom);
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

function normalizeHistoryLimit(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 100;
  }
  return Math.max(1, Math.min(500, Math.round(numeric)));
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

function normalizeBingRecentCount(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 8;
  }
  return Math.max(BING_RECENT_COUNT_MIN, Math.min(BING_RECENT_COUNT_MAX, Math.round(numeric)));
}

function updateBingRecentCountLabel(value) {
  if (!backgroundBingRecentCountValue) {
    return;
  }
  backgroundBingRecentCountValue.textContent = `${normalizeBingRecentCount(value)} 张`;
}

function renderSeedPresetOptions(currentSeed = "") {
  if (!backgroundSeedPresetInput) {
    return;
  }
  const normalizedCurrent = String(currentSeed || "").trim();
  const options = BACKGROUND_SEED_PRESETS.map(
    (item) =>
      `<option value="${escapeAttribute(item.value)}">${escapeHtml(item.value)} · ${escapeHtml(item.label)}</option>`
  );
  backgroundSeedPresetInput.innerHTML = options.join("");
  const matched = BACKGROUND_SEED_PRESETS.find((item) => item.value === normalizedCurrent);
  backgroundSeedPresetInput.value = matched ? matched.value : BACKGROUND_SEED_PRESETS[0]?.value || "";
  updateSeedPresetHint(matched, normalizedCurrent);
}

function updateSeedPresetHint(preset, currentSeed = "") {
  if (!backgroundSeedPresetHint) {
    return;
  }
  if (preset) {
    backgroundSeedPresetHint.textContent = `${preset.label}：${preset.description}`;
    return;
  }
  const seedText = String(currentSeed || "").trim();
  backgroundSeedPresetHint.textContent = seedText
    ? `当前为自定义种子：${seedText}`
    : "选择后会自动填充到上方随机种子。";
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
  const historyLimit = normalizeHistoryLimit(settingsDraft.settings.historyLimit);
  settingsDraft.settings.historyLimit = historyLimit;
  if (historyLimitInput) {
    historyLimitInput.value = String(historyLimit);
  }
  backgroundProviderInput.value = settingsDraft.settings.background.provider;
  backgroundSeedInput.value = settingsDraft.settings.background.seed;
  backgroundCustomUrlInput.value = settingsDraft.settings.background.customUrl;
  renderSeedPresetOptions(settingsDraft.settings.background.seed);
  const bingRecentCount = normalizeBingRecentCount(settingsDraft.settings.background.bingRecentCount);
  settingsDraft.settings.background.bingRecentCount = bingRecentCount;
  if (backgroundBingRecentCountInput) {
    backgroundBingRecentCountInput.value = String(bingRecentCount);
  }
  updateBingRecentCountLabel(bingRecentCount);
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

  if (target === historyLimitInput) {
    const limit = normalizeHistoryLimit(target.value);
    settingsDraft.settings.historyLimit = limit;
    historyLimitInput.value = String(limit);
    return;
  }

  if (target === backgroundProviderInput) {
    settingsDraft.settings.background.provider = target.value;
    renderSettingsDrawer();
    return;
  }

  if (target === backgroundSeedInput) {
    settingsDraft.settings.background.seed = target.value;
    const matched = BACKGROUND_SEED_PRESETS.find((item) => item.value === target.value.trim());
    if (backgroundSeedPresetInput) {
      backgroundSeedPresetInput.value = matched ? matched.value : "";
    }
    updateSeedPresetHint(matched, target.value);
    renderBackgroundFieldVisibility(settingsDraft.settings.background);
    return;
  }

  if (target === backgroundSeedPresetInput) {
    const selected = BACKGROUND_SEED_PRESETS.find((item) => item.value === target.value);
    if (selected) {
      settingsDraft.settings.background.seed = selected.value;
      backgroundSeedInput.value = selected.value;
      updateSeedPresetHint(selected, selected.value);
    } else {
      updateSeedPresetHint(null, backgroundSeedInput.value);
    }
    renderBackgroundFieldVisibility(settingsDraft.settings.background);
    return;
  }

  if (target === backgroundBingRecentCountInput) {
    const count = normalizeBingRecentCount(target.value);
    settingsDraft.settings.background.bingRecentCount = count;
    backgroundBingRecentCountInput.value = String(count);
    updateBingRecentCountLabel(count);
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
    const historyLimitOnlyChange =
      JSON.stringify({
        settings: {
          ...appState.settings,
          historyLimit: undefined,
        },
        engines: appState.engines,
        selectedEngineId: appState.selectedEngineId,
        categories: appState.categories,
      }) ===
      JSON.stringify({
        settings: {
          ...settingsDraft.settings,
          historyLimit: undefined,
        },
        engines: settingsDraft.engines,
        selectedEngineId: settingsDraft.selectedEngineId,
        categories: settingsDraft.categories,
      });

    await updateState({
      settings: settingsDraft.settings,
      engines: settingsDraft.engines,
      selectedEngineId: settingsDraft.selectedEngineId,
      categories: settingsDraft.categories,
    }, {
      markDirty: !historyLimitOnlyChange,
    });
    closeSettings();
    showNotice("设置已保存到本地", "success");
  } catch (error) {
    console.error(error);
    showNotice("保存失败，请检查输入格式", "error");
  }
}

async function clearHistory() {
  const confirmed = await openConfirmDialog({
    title: "清空本地搜索历史",
    message: `这会删除当前浏览器里最近 ${normalizeHistoryLimit(appState?.settings?.historyLimit)} 条搜索历史，且不会影响云端备份。是否继续？`,
    confirmText: "清空历史",
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
  showNotice("本地搜索历史已清空", "success");
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
    categoryDragState.dropPosition = "center";
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
      showNotice("标签位置已保存到本地", "success");
    })
    .catch((error) => {
      console.error(error);
      showNotice("标签位置保存失败，请重试", "error");
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
  if (!categoryDragState.categoryId) {
    return;
  }

  const dropTarget = resolveCategoryDropTarget(event.clientX, event.clientY);
  if (!dropTarget) {
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "none";
    }
    clearCategoryDropHints();
    categoryDragState.targetCategoryId = "";
    categoryDragState.dropPosition = "center";
    return;
  }

  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
  categoryDragState.targetCategoryId = dropTarget.targetCategoryId;
  categoryDragState.dropPosition = dropTarget.position;
  showCategoryDropIndicator(dropTarget);
}

function handleCategoryDrop(event) {
  const rows = Array.from(tagBoard.querySelectorAll(".category-row"));
  const pointerBlocked = isPointerInsideCategoryHead(rows, event.clientX, event.clientY);
  const resolvedTarget = pointerBlocked
    ? null
    : resolveCategoryDropTarget(event.clientX, event.clientY);
  const canUseStoredTarget =
    !pointerBlocked && isPointerWithinCategoryDropArea(event.clientX, event.clientY);
  const targetCategoryId = resolvedTarget?.targetCategoryId ||
    (canUseStoredTarget ? categoryDragState.targetCategoryId : "");
  const dropPosition = resolvedTarget?.position ||
    (canUseStoredTarget ? categoryDragState.dropPosition : "");
  if (!targetCategoryId || !dropPosition || targetCategoryId === categoryDragState.categoryId) {
    clearCategoryDragState();
    return;
  }

  event.preventDefault();
  const moved = reorderCategoriesById(categoryDragState.categoryId, targetCategoryId, dropPosition);
  clearCategoryDragState();

  if (!moved) {
    return;
  }

  updateState({ categories: moved })
    .then(() => {
      showNotice("分类顺序已保存到本地", "success");
    })
    .catch((error) => {
      console.error(error);
      showNotice("分类顺序保存失败，请重试", "error");
    });
}

function clearCategoryDropHints() {
  tagBoard
    .querySelectorAll(".category-row.is-category-drop-before, .category-row.is-category-drop-after, .category-row.is-category-drop-center")
    .forEach((item) => {
      item.classList.remove("is-category-drop-before", "is-category-drop-after", "is-category-drop-center");
    });
  hideCategoryDropIndicator();
}

function clearCategoryDragState() {
  tagBoard
    .querySelectorAll(".category-row.is-category-dragging")
    .forEach((item) => item.classList.remove("is-category-dragging"));
  clearCategoryDropHints();
  tagBoard.classList.remove("is-dragging-categories");
  categoryDragState.categoryId = "";
  categoryDragState.targetCategoryId = "";
  categoryDragState.dropPosition = "center";
}

function reorderCategoriesById(fromCategoryId, toCategoryId, position = "center") {
  const nextCategories = structuredClone(appState.categories);
  const fromIndex = nextCategories.findIndex((item) => item.id === fromCategoryId);
  const toIndex = nextCategories.findIndex((item) => item.id === toCategoryId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return null;
  }

  const [moved] = nextCategories.splice(fromIndex, 1);
  const targetIndexAfterRemoval = fromIndex < toIndex ? toIndex - 1 : toIndex;
  let insertIndex = targetIndexAfterRemoval;
  if (position === "after") {
    insertIndex = targetIndexAfterRemoval + 1;
  }
  insertIndex = Math.max(0, Math.min(nextCategories.length, insertIndex));
  nextCategories.splice(insertIndex, 0, moved);

  const before = appState.categories.map((item) => item.id).join("|");
  const after = nextCategories.map((item) => item.id).join("|");
  return before === after ? null : nextCategories;
}

function resolveCategoryDropTarget(pointerX, pointerY) {
  if (!tagBoard || !Number.isFinite(pointerX) || !Number.isFinite(pointerY)) {
    return null;
  }

  const rows = Array.from(tagBoard.querySelectorAll(".category-row"));
  if (rows.length < 2 || isPointerInsideCategoryHead(rows, pointerX, pointerY)) {
    return null;
  }

  const slots = buildCategoryDropSlots(rows);
  let bestSlot = null;
  for (const slot of slots) {
    if (!slot.targetCategoryId || pointerY < slot.captureTop || pointerY > slot.captureBottom) {
      continue;
    }
    const distance = Math.abs(pointerY - slot.lineY);
    if (!bestSlot || distance < bestSlot.distance) {
      bestSlot = { ...slot, distance };
    }
  }

  if (!bestSlot) {
    return null;
  }

  const moved = reorderCategoriesById(categoryDragState.categoryId, bestSlot.targetCategoryId, bestSlot.position);
  if (!moved) {
    return null;
  }

  return bestSlot;
}

function buildCategoryDropSlots(rows) {
  const slots = [];
  const boardRect = tagBoard.getBoundingClientRect();
  for (let index = 0; index <= rows.length; index += 1) {
    const previousRow = rows[index - 1] || null;
    const nextRow = rows[index] || null;
    const referenceRow = nextRow || previousRow;
    if (!referenceRow) {
      continue;
    }

    const indicatorRect = getCategoryDropIndicatorRect(referenceRow);
    if (!indicatorRect) {
      continue;
    }

    if (previousRow && nextRow) {
      const previousRect = previousRow.getBoundingClientRect();
      const nextRect = nextRow.getBoundingClientRect();
      const gap = Math.max(8, nextRect.top - previousRect.bottom);
      slots.push({
        targetCategoryId: nextRow.dataset.categoryId || "",
        position: "before",
        lineY: previousRect.bottom + gap / 2,
        captureTop: previousRect.bottom - CATEGORY_DROP_EDGE_PADDING,
        captureBottom: nextRect.top + CATEGORY_DROP_EDGE_PADDING,
        lineLeft: indicatorRect.left - boardRect.left,
        lineWidth: indicatorRect.width,
      });
      continue;
    }

    if (nextRow) {
      const nextRect = nextRow.getBoundingClientRect();
      slots.push({
        targetCategoryId: nextRow.dataset.categoryId || "",
        position: "before",
        lineY: nextRect.top - CATEGORY_DROP_END_OFFSET,
        captureTop: nextRect.top - CATEGORY_DROP_END_ZONE,
        captureBottom: nextRect.top + CATEGORY_DROP_EDGE_PADDING,
        lineLeft: indicatorRect.left - boardRect.left,
        lineWidth: indicatorRect.width,
      });
      continue;
    }

    const previousRect = previousRow.getBoundingClientRect();
    slots.push({
      targetCategoryId: previousRow.dataset.categoryId || "",
      position: "after",
      lineY: previousRect.bottom + CATEGORY_DROP_END_OFFSET,
      captureTop: previousRect.bottom - CATEGORY_DROP_EDGE_PADDING,
      captureBottom: previousRect.bottom + CATEGORY_DROP_END_ZONE,
      lineLeft: indicatorRect.left - boardRect.left,
      lineWidth: indicatorRect.width,
    });
  }
  return slots;
}

function getCategoryDropIndicatorRect(row) {
  if (!(row instanceof Element)) {
    return null;
  }
  const middle = row.querySelector(".category-middle");
  const rect = (middle instanceof Element ? middle : row).getBoundingClientRect();
  if (!rect || !Number.isFinite(rect.left) || !Number.isFinite(rect.width) || rect.width <= 0) {
    return null;
  }
  return rect;
}

function isPointerInsideCategoryHead(rows, pointerX, pointerY) {
  return rows.some((row) => {
    const head = row.querySelector(".category-head");
    const name = row.querySelector(".category-head .category-name");
    const anchor = name instanceof Element ? name : head;
    if (!(anchor instanceof Element)) {
      return false;
    }
    const rect = anchor.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      pointerX >= rect.left &&
      pointerX <= rect.right &&
      pointerY >= rect.top &&
      pointerY <= rect.bottom
    );
  });
}

function isPointerWithinCategoryDropArea(pointerX, pointerY) {
  if (!tagBoard || !Number.isFinite(pointerX) || !Number.isFinite(pointerY)) {
    return false;
  }
  const boardRect = tagBoard.getBoundingClientRect();
  return (
    pointerX >= boardRect.left &&
    pointerX <= boardRect.right &&
    pointerY >= boardRect.top - CATEGORY_DROP_END_ZONE &&
    pointerY <= boardRect.bottom + CATEGORY_DROP_END_ZONE
  );
}

function showCategoryDropIndicator(dropTarget) {
  ensureCategoryDropIndicator();
  if (!categoryDropIndicator || !dropTarget) {
    return;
  }
  const boardRect = tagBoard.getBoundingClientRect();
  categoryDropIndicator.style.left = `${Math.max(0, dropTarget.lineLeft)}px`;
  categoryDropIndicator.style.width = `${Math.max(0, dropTarget.lineWidth)}px`;
  categoryDropIndicator.style.top = `${dropTarget.lineY - boardRect.top}px`;
  categoryDropIndicator.classList.add("is-visible");
}

function hideCategoryDropIndicator() {
  if (!categoryDropIndicator) {
    return;
  }
  categoryDropIndicator.classList.remove("is-visible");
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
  updateSettingsQuickGuides({
    trackInset,
    maxThumbTravel,
    maxScroll,
  });
}

function updateSettingsQuickGuides({ trackInset, maxThumbTravel, maxScroll }) {
  if (!settingsQuickScroll || !settingsScroll) {
    return;
  }

  const guideNodes = Array.from(settingsQuickScroll.querySelectorAll(".settings-quick-guide"));
  if (!guideNodes.length) {
    return;
  }

  const sections = Array.from(settingsScroll.querySelectorAll("[data-trail-section]"));
  const effectiveMaxScroll = Math.max(0, maxScroll);

  guideNodes.forEach((guideNode, index) => {
    const nextSection = sections[index + 1];
    if (!(guideNode instanceof HTMLElement) || !(nextSection instanceof HTMLElement) || effectiveMaxScroll <= 0) {
      guideNode.style.display = "none";
      return;
    }

    const sectionOffset = Math.max(0, nextSection.offsetTop - 6);
    const ratio = Math.max(0, Math.min(1, sectionOffset / effectiveMaxScroll));
    const guideTop = trackInset + Math.round(maxThumbTravel * ratio);

    guideNode.style.display = "";
    guideNode.style.top = `${guideTop}px`;
  });
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
        showNotice("已切换到自定义背景", "success");
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
    showNotice("已切换背景", "success");
  }
}

async function applyBingBackground({ manual = false, force = false } = {}) {
  const recentCount = normalizeBingRecentCount(appState?.settings?.background?.bingRecentCount);
  const images = await fetchBingBackgroundImages(force, recentCount);
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
    showNotice(`已切换 Bing 背景${title}`, "success");
  }
  return true;
}

async function fetchBingBackgroundImages(force = false, recentCount = 8) {
  const safeRecentCount = normalizeBingRecentCount(recentCount);
  const now = Date.now();
  const cached = bingBackgroundCacheByCount.get(safeRecentCount);
  if (!force && cached?.images?.length && now < cached.expiresAt) {
    return cached.images;
  }

  try {
    const response = await fetch(`/api/background/bing?n=${safeRecentCount}`);
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
      bingBackgroundCacheByCount.set(safeRecentCount, {
        expiresAt: now + 15 * 60 * 1000,
        images,
      });
      return images;
    }
  } catch (error) {
    console.error(error);
  }

  return cached?.images || [];
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

function setBackgroundUrl(url, persistenceKey = currentBackgroundRefreshKey) {
  if (!url) {
    return;
  }

  let normalizedUrl = "";
  try {
    normalizedUrl = new URL(String(url).trim(), window.location.origin).toString();
  } catch {
    return;
  }

  const normalizedKey = typeof persistenceKey === "string" ? persistenceKey : "";
  const shouldUpdateStyle = normalizedUrl !== currentBackgroundUrl;
  currentBackgroundUrl = normalizedUrl;
  if (normalizedKey) {
    currentBackgroundRefreshKey = normalizedKey;
  }
  persistBackgroundSnapshot(currentBackgroundUrl, currentBackgroundRefreshKey);
  if (!shouldUpdateStyle) {
    return;
  }
  document.documentElement.style.setProperty("--page-bg", `url("${currentBackgroundUrl}")`);
}

function loadPersistedBackgroundSnapshot() {
  try {
    const raw = window.localStorage.getItem(BACKGROUND_SNAPSHOT_STORAGE_KEY);
    if (!raw) {
      return { url: "", key: "" };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("legacy snapshot");
    }

    const url = new URL(String(parsed.url || "").trim(), window.location.origin).toString();
    const key = typeof parsed.key === "string" ? parsed.key : "";
    return { url, key };
  } catch {
    try {
      const legacy = window.localStorage.getItem(BACKGROUND_SNAPSHOT_STORAGE_KEY);
      const trimmed = typeof legacy === "string" ? legacy.trim() : "";
      if (!trimmed) {
        return { url: "", key: "" };
      }
      return {
        url: new URL(trimmed, window.location.origin).toString(),
        key: "",
      };
    } catch {
      return { url: "", key: "" };
    }
  }
}

function persistBackgroundSnapshot(url, key = currentBackgroundRefreshKey) {
  try {
    const normalizedUrl = new URL(String(url || "").trim(), window.location.origin).toString();
    const normalizedKey = typeof key === "string" ? key : "";
    window.localStorage.setItem(
      BACKGROUND_SNAPSHOT_STORAGE_KEY,
      JSON.stringify({
        url: normalizedUrl,
        key: normalizedKey,
      })
    );
  } catch {}
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
      subtitle:
        typeof settingsSource.subtitle === "string" && settingsSource.subtitle.trim()
          ? settingsSource.subtitle.trim()
          : "搜索网页",
      searchBarHeight: normalizeSearchBarHeight(settingsSource.searchBarHeight),
      tagOpacity: normalizeTagOpacity(settingsSource.tagOpacity),
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

function getBackgroundRefreshKey(background) {
  const source = background && typeof background === "object" ? background : {};
  const provider = source.provider || "bing_hourly";
  const seed = String(source.seed || "linen-warm").trim() || "linen-warm";
  const customUrl = String(source.customUrl || "").trim();
  const bingRecentCount = normalizeBingRecentCount(source.bingRecentCount);
  return JSON.stringify({
    provider,
    seed,
    customUrl,
    bingRecentCount,
  });
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
  const url = parseUrlWithFallback(rawUrl);
  if (!url) {
    return { host: "", sources: [] };
  }
  return buildIconSources(url);
}

function getFaviconUrlFromTemplate(templateUrl) {
  const url = parseUrlWithFallback(String(templateUrl || "").replace("%s", "search"));
  if (!url) {
    return { host: "", sources: [] };
  }
  return buildIconSources(url);
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
  const pathBase = getIconPathBase(url.pathname);
  const native = `${url.origin}/favicon.ico`;
  const nativePng = `${url.origin}/favicon.png`;
  const pathNative = pathBase ? `${url.origin}${pathBase}favicon.ico` : "";
  const pathNativePng = pathBase ? `${url.origin}${pathBase}favicon.png` : "";
  const duck = `https://icons.duckduckgo.com/ip3/${host}.ico`;
  const s2 = `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(host)}`;
  const s2DomainUrl = `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(url.href)}`;
  const iconHorse = `https://icon.horse/icon/${encodeURIComponent(host)}`;
  const unavatar = `https://unavatar.io/${encodeURIComponent(host)}`;
  const allSources = [pathNative, pathNativePng, s2DomainUrl, native, nativePng, duck, s2, iconHorse, unavatar]
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index);
  const cooledSources = allSources.filter((item) => !isIconSourceCoolingDown(item));
  const sources = cooledSources.length ? cooledSources : allSources;
  return { host, sources };
}

function getPreferredIconDisplaySource(iconData) {
  const iconHost = sanitizeIconHost(iconData?.host || "");
  const cachedSource = iconHost ? normalizeIconSource(iconSourceCache[iconHost] || "") : "";
  if (cachedSource) {
    return cachedSource;
  }

  const iconSources = Array.isArray(iconData?.sources)
    ? iconData.sources
        .map((item) => normalizeIconSource(item))
        .filter(Boolean)
    : [];
  return iconSources[0] || "";
}

function getIconPathBase(pathname) {
  if (typeof pathname !== "string") {
    return "";
  }
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === "/") {
    return "";
  }
  if (trimmed.endsWith("/")) {
    return trimmed;
  }
  const lastSlashIndex = trimmed.lastIndexOf("/");
  if (lastSlashIndex <= 0) {
    return "";
  }
  return trimmed.slice(0, lastSlashIndex + 1);
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
  const cachedSource = iconHost ? normalizeIconSource(iconSourceCache[iconHost] || "") : "";
  const normalizedSources = iconSources
    .map((item) => normalizeIconSource(item))
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index);
  const fallbackSources = normalizedSources.filter((item) => item !== cachedSource);
  const displaySource = cachedSource || fallbackSources[0] || "";
  const chainSources = cachedSource ? fallbackSources : fallbackSources.slice(1);
  const readyClass = cachedSource ? " is-ready" : "";
  const imageMarkup = displaySource
    ? `<img class="mx-icon-image${readyClass}" src="${escapeAttribute(displaySource)}" data-icon-host="${escapeAttribute(iconHost)}" data-icon-chain="${escapeAttribute(chainSources.join("|"))}" alt="" loading="eager" fetchpriority="low" decoding="async" onload="window.__mxIconLoaded(this);" onerror="window.__mxIconFallback(this);" />`
    : `<img class="mx-icon-image is-ready" src="${DEFAULT_ICON_DATA_URL}" alt="" loading="eager" fetchpriority="low" decoding="async" />`;

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

  clearIconSourceFailure(source);
  imageNode.dataset.iconChain = "";

  if (iconSourceCache[host] === source) {
    syncIconNodesByHost(host, source, imageNode);
    return;
  }

  iconSourceCache[host] = source;
  persistIconSourceCache(iconSourceCache);
  syncIconNodesByHost(host, source, imageNode);
  queuePromoteIconHost(host);
};

window.__mxIconFallback = function handleIconFallback(imageNode) {
  if (!imageNode) {
    return;
  }

  imageNode.classList.remove("is-ready");
  markIconSourceFailure(imageNode.currentSrc || imageNode.src || imageNode.getAttribute("src"));

  const chain = (imageNode.dataset.iconChain || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  const nextSource = takeNextAvailableIconSource(chain);
  if (!nextSource) {
    imageNode.onerror = null;
    imageNode.onload = null;
    imageNode.dataset.iconHost = "";
    imageNode.dataset.iconChain = "";
    imageNode.classList.add("is-ready");
    imageNode.src = DEFAULT_ICON_DATA_URL;
    return;
  }

  imageNode.dataset.iconChain = chain
    .filter((item) => normalizeIconSource(item) !== normalizeIconSource(nextSource))
    .join("|");
  imageNode.src = nextSource;
};

function parseUrlWithFallback(value) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
}

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

function isIconSourceCoolingDown(source) {
  const normalizedSource = normalizeIconSource(source);
  if (!normalizedSource || normalizedSource.startsWith("data:")) {
    return false;
  }

  const expiresAt = iconSourceFailureCooldown.get(normalizedSource) || 0;
  if (!expiresAt) {
    return false;
  }
  if (Date.now() >= expiresAt) {
    iconSourceFailureCooldown.delete(normalizedSource);
    return false;
  }
  return true;
}

function markIconSourceFailure(source) {
  const normalizedSource = normalizeIconSource(source);
  if (!normalizedSource || normalizedSource.startsWith("data:")) {
    return;
  }
  iconSourceFailureCooldown.set(
    normalizedSource,
    Date.now() + ICON_SOURCE_FAILURE_COOLDOWN_MS
  );
}

function clearIconSourceFailure(source) {
  const normalizedSource = normalizeIconSource(source);
  if (!normalizedSource) {
    return;
  }
  iconSourceFailureCooldown.delete(normalizedSource);
}

function takeNextAvailableIconSource(chain) {
  for (const candidate of chain) {
    const normalizedCandidate = normalizeIconSource(candidate);
    if (!normalizedCandidate) {
      continue;
    }
    if (isIconSourceCoolingDown(normalizedCandidate)) {
      continue;
    }
    return normalizedCandidate;
  }
  return "";
}

function loadIconSourceCache() {
  try {
    const raw = window.localStorage.getItem(ICON_CACHE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const entries = Object.entries(parsed)
      .filter(
        ([host, source]) =>
          sanitizeIconHost(host) &&
          typeof source === "string" &&
          source.trim() &&
          isProbablyValidIconDataUrl(source.trim())
      )
      .slice(0, ICON_CACHE_MAX_ENTRIES);
    const normalized = Object.fromEntries(entries);
    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      window.localStorage.setItem(ICON_CACHE_STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return {};
  }
}

function persistIconSourceCache(cache) {
  try {
    const trimmedEntries = Object.entries(cache)
      .filter(
        ([host, source]) =>
          sanitizeIconHost(host) &&
          typeof source === "string" &&
          source.trim() &&
          isProbablyValidIconDataUrl(source.trim())
      )
      .slice(-ICON_CACHE_MAX_ENTRIES);
    const normalized = Object.fromEntries(trimmedEntries);
    window.localStorage.setItem(ICON_CACHE_STORAGE_KEY, JSON.stringify(normalized));
    iconSourceCache = normalized;
  } catch (error) {
    console.warn("icon source cache persist failed", error);
  }
}

async function hydrateServerIconCacheForState(state) {
  if (!authState.loggedIn || !state) {
    return;
  }

  const missingHosts = collectRelevantIconHosts(state).filter(
    (host) => !normalizeIconSource(iconSourceCache[host] || "")
  );
  if (!missingHosts.length) {
    return;
  }

  try {
    const payload = await fetchJson("/api/icon-cache/default/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hosts: missingHosts }),
    });
    serverDefaultIconCache = {
      ...serverDefaultIconCache,
      ...(payload?.iconCache && typeof payload.iconCache === "object" ? payload.iconCache : {}),
    };
    const mergedHosts = mergeIconSourceCacheEntries(payload?.iconCache, { preferExisting: true });
    if (mergedHosts.length) {
      refreshResolvedIconHosts(mergedHosts);
    }
  } catch (error) {
    console.warn("server icon cache query failed", error);
  }
}

function mergeIconSourceCacheEntries(entries, options = {}) {
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
    return [];
  }

  const preferExisting = options.preferExisting !== false;
  const nextCache = { ...iconSourceCache };
  const updatedHosts = [];

  Object.entries(entries).forEach(([rawHost, rawSource]) => {
    const host = sanitizeIconHost(rawHost);
    const source = normalizeIconSource(rawSource);
    if (!host || !source) {
      return;
    }

    const currentSource = normalizeIconSource(nextCache[host] || "");
    if (preferExisting && currentSource) {
      return;
    }
    if (currentSource === source) {
      return;
    }

    nextCache[host] = source;
    updatedHosts.push(host);
  });

  if (updatedHosts.length) {
    persistIconSourceCache(nextCache);
  }

  return updatedHosts;
}

function collectRelevantIconHosts(state = appState) {
  if (!state) {
    return [];
  }

  const hosts = [];
  (state.engines || []).forEach((engine) => {
    const host = getHostFromTemplate(engine.urlTemplate || "");
    if (host) {
      hosts.push(host);
    }
  });
  (state.categories || []).forEach((category) => {
    (category.links || []).forEach((link) => {
      const url = parseUrlWithFallback(link.url);
      const host = sanitizeIconHost(url?.host?.replace(/^www\./, "") || "");
      if (host) {
        hosts.push(host);
      }
    });
  });

  return hosts.filter((host, index, array) => array.indexOf(host) === index);
}

function refreshResolvedIconHosts(hosts) {
  const safeHosts = Array.isArray(hosts)
    ? hosts.map((host) => sanitizeIconHost(host)).filter(Boolean)
    : [];
  if (!safeHosts.length) {
    return;
  }

  safeHosts.forEach((host) => {
    const source = normalizeIconSource(iconSourceCache[host] || "");
    if (source) {
      syncIconNodesByHost(host, source);
    }
  });

  if (appState) {
    renderActiveEngineButton();
    primeEngineButtonIcons();
  }
}

function queuePromoteRelevantIconCacheEntries(state = appState) {
  if (!authState.loggedIn || !state) {
    return;
  }

  collectRelevantIconHosts(state).forEach((host) => {
    const source = normalizeIconSource(iconSourceCache[host] || "");
    if (source) {
      pendingIconPromoteHosts.add(host);
    }
  });

  scheduleIconCachePromoteFlush();
}

function queuePromoteIconHost(host) {
  const safeHost = sanitizeIconHost(host);
  if (!safeHost || !authState.loggedIn || !appState) {
    return;
  }
  if (!collectRelevantIconHosts(appState).includes(safeHost)) {
    return;
  }

  pendingIconPromoteHosts.add(safeHost);
  scheduleIconCachePromoteFlush();
}

function scheduleIconCachePromoteFlush() {
  if (iconCachePromoteTimer) {
    window.clearTimeout(iconCachePromoteTimer);
  }
  iconCachePromoteTimer = window.setTimeout(() => {
    iconCachePromoteTimer = 0;
    void flushPromoteRelevantIconCacheEntries();
  }, ICON_CACHE_SERVER_PROMOTE_DEBOUNCE_MS);
}

async function flushPromoteRelevantIconCacheEntries() {
  if (!authState.loggedIn || !appState || !pendingIconPromoteHosts.size) {
    return;
  }

  const relevantHosts = new Set(collectRelevantIconHosts(appState));
  const entries = {};
  const hosts = Array.from(pendingIconPromoteHosts);
  pendingIconPromoteHosts.clear();

  hosts.forEach((host) => {
    if (!relevantHosts.has(host)) {
      return;
    }
    const source = normalizeIconSource(iconSourceCache[host] || "");
    if (!source) {
      return;
    }
    entries[host] = source;
  });

  if (!Object.keys(entries).length) {
    return;
  }

  try {
    const payload = await fetchJson("/api/icon-cache/default/promote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ entries }),
    });
    serverDefaultIconCache = {
      ...serverDefaultIconCache,
      ...(payload?.iconCache && typeof payload.iconCache === "object" ? payload.iconCache : {}),
    };
    const mergedHosts = mergeIconSourceCacheEntries(payload?.iconCache, { preferExisting: false });
    if (mergedHosts.length) {
      refreshResolvedIconHosts(mergedHosts);
    }
  } catch (error) {
    console.warn("server icon cache promote failed", error);
  }
}

function sanitizeIconHost(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isProbablyValidIconDataUrl(value) {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("data:image/")) {
    return true;
  }

  const commaIndex = trimmed.indexOf(",");
  if (commaIndex === -1) {
    return false;
  }

  try {
    const preview = window.atob(trimmed.slice(commaIndex + 1).slice(0, 128));
    const normalized = preview.trimStart().toLowerCase();
    if (normalized.startsWith("<!doctype html") || normalized.startsWith("<html")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function normalizeIconSource(value) {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (!isProbablyValidIconDataUrl(trimmed)) {
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
    lastAction: entry.lastAction === "backup" || entry.lastAction === "sync" ? entry.lastAction : "",
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
    lastAction: meta?.lastAction === "backup" || meta?.lastAction === "sync" ? meta.lastAction : "",
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
  const meta = getCurrentSyncMeta();
  saveCurrentSyncMeta({
    ...meta,
    dirty: true,
  });
  renderSyncStatus();
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
    if (meta.dirty) {
      message = "未备份改动";
      tone = "warning";
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

function showNotice(message, tone = "default") {
  if (!noticeToast || !message) {
    return;
  }
  if (noticeTimer) {
    window.clearTimeout(noticeTimer);
    noticeTimer = 0;
  }
  noticeToast.textContent = message;
  noticeToast.dataset.tone = tone;
  noticeToast.classList.remove("hidden");
  noticeTimer = window.setTimeout(() => {
    noticeToast.classList.add("hidden");
    noticeToast.dataset.tone = "";
    noticeTimer = 0;
  }, NOTICE_HIDE_DELAY_MS);
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

function formatPreciseTime(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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

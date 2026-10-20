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
const brandIconDisplay = document.getElementById("brandIconDisplay");
const brandTextDisplay = document.getElementById("brandTextDisplay");
const siteFavicon = document.getElementById("siteFavicon");
const tagBoard = document.getElementById("tagBoard");
const syncStatus = document.getElementById("syncStatus");
const homeTagSearch = document.getElementById("homeTagSearch");
const homeTagSearchButton = document.getElementById("homeTagSearchButton");
const homeTagSearchInput = document.getElementById("homeTagSearchInput");
const syncModal = document.getElementById("syncModal");
const closeSyncModalButton = document.getElementById("closeSyncModalButton");
const syncModalMeta = document.getElementById("syncModalMeta");
const syncModalMessage = document.getElementById("syncModalMessage");
const backupNowButton = document.getElementById("backupNowButton");
const refreshBackupsButton = document.getElementById("refreshBackupsButton");
const syncBackupList = document.getElementById("syncBackupList");
const confirmModal = document.getElementById("confirmModal");
const syncStatusCard = document.getElementById("syncStatusCard");
const syncStatusTitle = document.getElementById("syncStatusTitle");
const syncStatusDetail = document.getElementById("syncStatusDetail");
const syncBackupCount = document.getElementById("syncBackupCount");
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
const settingsAnchorNav = document.getElementById("settingsAnchorNav");
const settingsCategoryJumpList = document.getElementById("settingsCategoryJumpList");
const settingsSections = {
  basic: document.getElementById("settingsBasicSection"),
  background: document.getElementById("settingsBackgroundSection"),
  engines: document.getElementById("settingsEnginesSection"),
  history: document.getElementById("settingsHistorySection"),
  categories: document.getElementById("categorySection"),
};
let activeSettingsSection = "basic";
let activeSettingsCategoryId = "";
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
const clearHistoryButton = document.getElementById("clearHistoryButton");
const historyCountLabel = document.getElementById("historyCountLabel");
const historyLimitInput = document.getElementById("historyLimitInput");
const settingsHistoryList = document.getElementById("settingsHistoryList");
const engineEditor = document.getElementById("engineEditor");
const categoryEditor = document.getElementById("categoryEditor");
const siteTitleInput = document.getElementById("siteTitleInput");
const brandLabelInput = document.getElementById("brandLabelInput");
const iconThemeGrid = document.getElementById("iconThemeGrid");
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
const ICON_THEMES = [
  { id: "graphite", name: "石墨极简", file: "/icon-options/pixel-magnifiers/02-graphite.svg", panel: "#172325", accent: "#a9d1b6" },
  { id: "arcade", name: "街机霓虹", file: "/icon-options/pixel-magnifiers/01-arcade.svg", panel: "#191b3f", accent: "#65f2d0" },
  { id: "candy", name: "糖果粉", file: "/icon-options/pixel-magnifiers/03-candy.svg", panel: "#422038", accent: "#ff9bc7" },
  { id: "blueprint", name: "蓝图测绘", file: "/icon-options/pixel-magnifiers/04-blueprint.svg", panel: "#142c58", accent: "#a2e2fb" },
  { id: "sunset", name: "落日胶片", file: "/icon-options/pixel-magnifiers/05-sunset.svg", panel: "#42233f", accent: "#ffc485" },
  { id: "mint", name: "薄荷清新", file: "/icon-options/pixel-magnifiers/06-mint.svg", panel: "#173c39", accent: "#b9e9d3" },
  { id: "gold", name: "金属夜色", file: "/icon-options/pixel-magnifiers/07-gold.svg", panel: "#272339", accent: "#ffc75b" },
  { id: "glitch", name: "故障信号", file: "/icon-options/pixel-magnifiers/08-glitch.svg", panel: "#111a27", accent: "#00e4d4" },
  { id: "paper", name: "旧纸印记", file: "/icon-options/pixel-magnifiers/09-paper.svg", panel: "#2a4243", accent: "#e5cf9d" },
  { id: "space", name: "星际探测", file: "/icon-options/pixel-magnifiers/10-space.svg", panel: "#141a3d", accent: "#abb1ff" },
];
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
const ICON_DISCOVER_STORAGE_KEY = "mx_icon_discover_v1";
const ICON_DISCOVER_RETRY_MS = 7 * 24 * 60 * 60 * 1000;
// Runs after the icon promote round, which already turns working icons into cached data URLs.
const ICON_DISCOVER_DELAY_MS = 8000;
const ICON_DISCOVER_CONCURRENCY = 3;
// Third-party favicon services answer unknown sites with a generic globe (HTTP 404 + image),
// which still fires onload; such cached results are worth replacing with the page's own icon.
const GENERIC_ICON_SERVICE_PATTERN = /google\.com\/s2\/favicons|icons\.duckduckgo\.com|icon\.horse|unavatar\.io/i;
const NOTICE_HIDE_DELAY_MS = 2200;
const SEARCH_BAR_HEIGHT_MIN = 52;
const SEARCH_BAR_HEIGHT_MAX = 96;
const TAG_FADE_START_DISTANCE = 34;
// Where CSS scroll-driven animations exist, styles.css fades tags on the compositor;
// the per-frame JS fade below is only a fallback (it always lags fast scrolling by a frame or more).
const SUPPORTS_SCROLL_DRIVEN_FADE =
  typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("animation-timeline: view()");
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
    brandLabel: "mx search",
    iconTheme: "graphite",
    brandIconUrl: "",
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
const TAG_DRAG_START_DISTANCE = 6;
const TAG_DRAG_TOUCH_HOLD_MS = 320;
const TAG_DRAG_TOUCH_SLOP = 10;
const TAG_DRAG_AUTOSCROLL_EDGE = 72;
const TAG_REFLOW_DURATION_MS = 340;
const TAG_REFLOW_EASING = "cubic-bezier(0.2, 0.9, 0.25, 1.08)";
const TAG_SETTLE_DURATION_MS = 260;
const TAG_POP_DURATION_MS = 240;
// Pointer must be this far inside a card (fraction of its size) before it swaps, to avoid edge jitter.
const TAG_SWAP_INSET = 0.18;
const tagPointerDrag = {
  pointerId: null,
  pointerType: "",
  card: null,
  ghost: null,
  active: false,
  settling: false,
  holdTimer: 0,
  frame: 0,
  startX: 0,
  startY: 0,
  pointerX: 0,
  pointerY: 0,
  offsetX: 0,
  offsetY: 0,
  originParent: null,
  originNext: null,
  originCategoryId: "",
  lastTargetCard: null,
  scrollParent: null,
  suppressClick: false,
};
const ROW_DRAG_TOUCH_HOLD_MS = 260;
const rowPointerDrag = {
  pointerId: null,
  pointerType: "",
  row: null,
  ghost: null,
  active: false,
  settling: false,
  holdTimer: 0,
  frame: 0,
  startX: 0,
  startY: 0,
  pointerY: 0,
  offsetY: 0,
  ghostLeft: 0,
  originNext: null,
  scrollParent: null,
};

let appState = null;
let settingsDraft = null;
let homeTagSearchQuery = "";
const tagSearchTermsCache = new Map();
let syncModalBusy = false;
let syncModalBackups = [];
let syncModalBackupLimit = 10;
let syncModalLoaded = false;
let settingsTrailFrame = 0;
let settingsQuickScrollFrame = 0;
let tagViewportFadeFrame = 0;
let tagLabelFitFrame = 0;
let tagOverflowLayoutFrame = 0;
let iconReadyStateFrame = 0;
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
let currentActiveEngineId = "";
const engineButtonIconNodeCache = new Map();
const engineRenderKeyCache = new Map();
const bingBackgroundCacheByCount = new Map();
let iconCachePromoteTimer = 0;
const pendingIconPromoteHosts = new Set();
let iconDiscoverTimer = 0;
let iconDiscoverActiveCount = 0;
const iconDiscoverQueue = [];
const iconDiscoverPendingHosts = new Set();
const iconSourceFailureCooldown = new Map();
let noticeTimer = 0;
let confirmResolver = null;
let confirmScopeElement = null;

boot();

async function boot() {
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
    const hasUnsyncedLocalState =
      cachedStatePayload?.username === authState.username && getCurrentSyncMeta().dirty;
    if (!hasUnsyncedLocalState) {
      await hydratePreferredUserStateOnce({ silent: true });
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
  clearHistoryButton.addEventListener("click", clearHistory);

  settingsForm.addEventListener("submit", saveSettings);
  settingsForm.addEventListener("input", handleSettingsInput);
  settingsForm.addEventListener("change", (event) => {
    if (event.target.matches("[data-range-for]")) {
      applyRangeNumberInput(event.target, true);
    }
  });
  settingsForm.addEventListener("focusout", (event) => {
    if (event.target.matches("[data-range-for]")) {
      applyRangeNumberInput(event.target, true);
    }
  });
  settingsForm.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.matches("[data-range-for]")) {
      event.preventDefault();
      applyRangeNumberInput(event.target, true);
    }
  });
  settingsForm.addEventListener("click", handleSettingsClick);
  settingsScroll.addEventListener("scroll", handleSettingsScroll, { passive: true });
  settingsAnchorNav?.addEventListener("click", handleSettingsAnchorNavigation);
  settingsAnchorNav?.addEventListener("keydown", handleSettingsAnchorKeydown);
  homeTagSearchButton?.addEventListener("click", toggleHomeTagSearch);
  homeTagSearchInput?.addEventListener("input", handleHomeTagSearchInput);
  settingsQuickScroll?.addEventListener("pointerdown", handleSettingsQuickTrackPointerDown);
  settingsQuickThumb?.addEventListener("pointerdown", handleSettingsQuickThumbPointerDown);
  window.addEventListener("pointermove", handleSettingsQuickThumbPointerMove);
  window.addEventListener("pointerup", handleSettingsQuickThumbPointerUp);
  window.addEventListener("pointercancel", handleSettingsQuickThumbPointerUp);
  window.addEventListener("scroll", queueTagViewportFadeUpdate, { passive: true });
  window.addEventListener("resize", queueSettingsQuickScrollUpdate, { passive: true });
  window.addEventListener("resize", queueTagViewportFadeUpdate, { passive: true });
  window.addEventListener("resize", queueTagLabelFit, { passive: true });
  window.addEventListener("resize", queueTagOverflowLayoutUpdate, { passive: true });
  siteTitleDisplay.addEventListener("click", () => {
    void refreshBackgroundNow({ manual: true, force: true });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-panel")) {
      closeMenus();
    }
    if (!event.target.closest("#homeTagSearch") && !event.target.closest("#homeTagSearchButton")) {
      closeHomeTagSearch();
    }
  });

  historyPanel.addEventListener("click", (event) => {
    const item = event.target.closest("[data-history-id]");
    if (!item) {
      return;
    }

    searchInput.value = item.dataset.query || "";
    updateSearchClearButton();
    // 「搜索」runs the query right away with the current engine; the rest of the row only fills the input.
    if (event.target.closest("[data-history-search]")) {
      closeMenus();
      searchForm.requestSubmit();
      return;
    }
    searchInput.focus();
    closeMenus();
  });

  historyPanel.addEventListener("keydown", (event) => {
    const item = event.target instanceof Element ? event.target : null;
    if (!item?.matches("[data-history-id]") || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }
    event.preventDefault();
    item.click();
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
  tagBoard.addEventListener("pointerdown", handleTagPointerDown);
  tagBoard.addEventListener("pointerdown", handleRowPointerDown);
  tagBoard.addEventListener("click", handleTagDragClickGuard, true);
  tagBoard.addEventListener("contextmenu", handleTagDragContextMenu);
  tagBoard.addEventListener("touchmove", handleTagDragTouchMove, { passive: false });
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

async function hydrateStateFromServerOnce(options = {}) {
  if (!authState.loggedIn) {
    return false;
  }

  try {
    const payload = await fetchJson("/api/state");
    applyState(payload, { persistLocalCache: true, preserveLocalHistoryLimit: true });
    return true;
  } catch (error) {
    console.error(error);
    if (options.silent !== true) {
      showNotice("已登录，但拉取云端布局失败", "error");
    }
    return false;
  }
}

async function hydratePreferredUserStateOnce(options = {}) {
  if (!authState.loggedIn) {
    return false;
  }

  try {
    const backupListPayload = await fetchJson("/api/backups");
    syncModalBackups = Array.isArray(backupListPayload?.backups) ? backupListPayload.backups : [];
    const latestBackupId = syncModalBackups[0]?.id;
    if (latestBackupId) {
      const backupPayload = await fetchJson(`/api/backups/${encodeURIComponent(latestBackupId)}`);
      applyState(backupPayload, { persistLocalCache: true, preserveLocalHistoryLimit: true });
      return true;
    }
  } catch (error) {
    console.error(error);
    if (options.silent !== true) {
      showNotice("云端备份读取失败，已回退到账号布局", "error");
    }
  }

  return hydrateStateFromServerOnce(options);
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
    await hydratePreferredUserStateOnce();
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
    await hydratePreferredUserStateOnce();
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

function openConfirmDialog({
  title = "请确认操作",
  message = "确认后会继续执行当前操作。",
  confirmText = "确定",
  cancelText = "取消",
  scopeElement = null,
  inputValue = null,
  inputLabel = "名称",
  inputPlaceholder = "",
  tone = "default",
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
    confirmModalConfirmButton.classList.toggle("is-danger", tone === "danger");
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
  if (syncModalMeta) {
    syncModalMeta.textContent = authState.loggedIn
      ? `已登录 ${authState.username || ""} · 数据只在你手动备份时上传`
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
  } else if (meta.dirty) {
    tone = "warning";
    title = "有未备份的改动";
    detail = latest?.createdAt
      ? `上次备份于 ${formatRelativeTime(latest.createdAt)}，之后的改动只保存在本机。`
      : "当前改动只保存在本机，建议立即备份。";
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

function formatRelativeTime(value) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) {
    return "";
  }
  const seconds = Math.round((Date.now() - time) / 1000);
  if (seconds < 45) {
    return "刚刚";
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} 分钟前`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} 小时前`;
  }
  const days = Math.round(hours / 24);
  if (days < 7) {
    return `${days} 天前`;
  }
  return formatTime(value);
}

function formatByteSize(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(value < 10 * 1024 ? 1 : 0)} KB`;
  }
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
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

function applyBackupLimit(payload) {
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
    syncBackupCount.textContent = syncModalLoaded ? `${syncModalBackups.length} / ${syncModalBackupLimit}` : "";
  }
  renderSyncModalStatus();

  if (!syncModalLoaded && authState.loggedIn) {
    syncBackupList.innerHTML = Array.from({ length: 3 }, () => '<div class="sync-backup-skeleton" aria-hidden="true"><span></span><span></span></div>').join("");
    return;
  }

  if (!syncModalBackups.length) {
    syncBackupList.innerHTML = `
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

  syncBackupList.innerHTML = syncModalBackups
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
              <time datetime="${escapeAttribute(createdAt)}" title="${escapeAttribute(createdAt ? formatPreciseTime(createdAt) : "")}">${escapeHtml(createdAt ? formatRelativeTime(createdAt) : "未知时间")}</time>
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
  renderTagBoard();
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
  [authModal, syncModal, confirmModal].forEach((dialog) => {
    if (dialog) {
      dialog.dataset.colorTheme = theme.id;
    }
  });
  settingsDrawer.style.setProperty("--settings-theme-panel", theme.panel);
  settingsDrawer.style.setProperty("--settings-theme-accent", theme.accent);
}

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

function renderTagBoard() {
  if (!appState.categories.length) {
    tagBoard.innerHTML = '<div class="empty-state">当前还没有标签分类，去右上角设置里添加即可。</div>';
    return;
  }

  const query = homeTagSearchQuery;
  const visibleCategories = appState.categories
    .map((category) => ({
      category,
      links: query ? category.links.filter((link) => matchesTagSearch(link.label, query)) : category.links,
    }))
    .filter(({ links }) => !query || links.length);

  if (!visibleCategories.length) {
    tagBoard.innerHTML = '<div class="empty-state">没有匹配的自定义标签。</div>';
    return;
  }

  tagBoard.innerHTML = visibleCategories
    .map(({ category, links }) => {
      const isExpanded = expandedCategoryIds.has(category.id) || Boolean(query);
      const content = links.length
        ? `<div class="tag-grid">
            ${links
              .map((link) => {
                const iconUrl = getFaviconUrl(link.url);
                return `
                  <a
                    class="tag-card"
                    href="${escapeAttribute(link.url)}"
                    target="_blank"
                    rel="noreferrer"
                    title="${escapeAttribute(link.label)}"
                    draggable="false"
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
      const tail = `
          <button
            class="category-expand-btn ${isExpanded ? "is-expanded" : ""} ${query ? "is-search-filtering" : ""}"
            type="button"
            data-toggle-category="${escapeAttribute(category.id)}"
            ${query ? "disabled" : ""}
            aria-expanded="${isExpanded ? "true" : "false"}"
            aria-label="${isExpanded ? "收起分类标签" : "展开更多标签"}"
            title="${isExpanded ? "收起分类标签" : "展开更多标签"}"
          >
            <span class="category-expand-icon" aria-hidden="true"></span>
          </button>
        `;
      const rowClassNames = [
        "category-row",
        isExpanded ? "is-expanded" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `
        <section class="${rowClassNames}" data-category-id="${escapeAttribute(category.id)}" style="--category-rows:1;">
          <div
            class="category-head"
            draggable="false"
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
  queueTagOverflowLayoutUpdate();
  queueTagLabelFit();
  queueTagViewportFadeUpdate();
  queueIconReadyStateCheck();
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
  queueIconReadyStateCheck();
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
  syncRangeControl(backgroundOpacityInput, backgroundOpacityValue, normalizeOverlayOpacity(opacity));
}

function syncRangeControl(range, numberInput, value) {
  range.value = String(value);
  if (numberInput && document.activeElement !== numberInput) {
    numberInput.value = String(value);
  }
  const progress = ((value - Number(range.min)) / (Number(range.max) - Number(range.min))) * 100;
  range.style.setProperty("--range-progress", `${progress}%`);
}

function applyRangeNumberInput(numberInput, commit = false) {
  const range = document.getElementById(numberInput.dataset.rangeFor);
  if (!range) return;
  let value = numberInput.valueAsNumber;
  const min = Number(range.min);
  const max = Number(range.max);
  // Allow clearing the field and typing an intermediate digit without snapping it back.
  if (!commit && (!Number.isFinite(value) || value < min || value > max || !Number.isInteger(value))) return;
  value = Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : Number(range.value);
  if (commit) numberInput.value = String(value);
  range.value = String(value);
  range.dispatchEvent(new Event("input", { bubbles: true }));
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
  syncRangeControl(tagOpacityInput, tagOpacityValue, normalizeTagOpacity(opacity));
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
  syncRangeControl(searchBarHeightInput, searchBarHeightValue, normalizeSearchBarHeight(height));
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

  activeSettingsSection = "basic";
  activeSettingsCategoryId = settingsDraft.categories[0]?.id || "";
  renderSettingsDrawer();
  settingsScroll.scrollTop = 0;
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
  syncRangeControl(backgroundBingRecentCountInput, backgroundBingRecentCountValue, normalizeBingRecentCount(value));
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
    applyIconTheme(appState.settings.iconTheme);
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
  brandLabelInput.value = settingsDraft.settings.brandLabel || BRAND_NAME;
  const selectedTheme = ICON_THEMES.find((theme) => theme.id === settingsDraft.settings.iconTheme) || ICON_THEMES[0];
  settingsDraft.settings.iconTheme = selectedTheme.id;
  applyIconTheme(selectedTheme.id);
  iconThemeGrid.innerHTML = ICON_THEMES.map((theme) => `
    <label class="icon-theme-choice" style="--choice-color:${theme.accent}">
      <input type="radio" name="iconTheme" value="${theme.id}" ${theme.id === selectedTheme.id ? "checked" : ""} />
      <img src="${theme.file}" alt="" />
      <span>${theme.name}</span>
    </label>
  `).join("");
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
        <article class="editor-card settings-panel" data-engine-card="${escapeAttribute(engine.id)}">
          <div class="editor-card-header">
            <div class="engine-preview">
              ${buildIconMarkup(iconUrl, engine.name, "preview-icon")}
              <h4>${escapeHtml(engine.name || "未命名引擎")}</h4>
            </div>
            <div class="engine-card-actions">
              <label class="radio-pill">
                <input type="radio" name="defaultEngine" value="${escapeAttribute(engine.id)}" ${engine.id === settingsDraft.selectedEngineId ? "checked" : ""} />
                <span>默认引擎</span>
              </label>
              <button class="ghost-button danger" type="button" data-remove-engine="${escapeAttribute(engine.id)}">删除</button>
            </div>
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

  if (!settingsDraft.categories.some((category) => category.id === activeSettingsCategoryId)) {
    activeSettingsCategoryId = settingsDraft.categories[0]?.id || "";
  }
  categoryEditor.innerHTML = settingsDraft.categories
    .filter((category) => category.id === activeSettingsCategoryId)
    .map((category) => {
      const categoryId = escapeAttribute(category.id);
      const linkRows = category.links
        .map(
          (link, index) => `
            <div class="link-row" role="row" data-link-row="${escapeAttribute(link.id)}">
              <span class="link-row-index" role="cell">${String(index + 1).padStart(2, "0")}</span>
              <div class="link-row-name" role="cell">
                ${buildIconMarkup(getFaviconUrl(link.url), link.label, "preview-icon link-row-icon")}
                <input class="link-row-input" type="text" aria-label="标签名" placeholder="标签名" data-link-field="label" data-category-id="${categoryId}" data-link-id="${escapeAttribute(link.id)}" value="${escapeAttribute(link.label)}" maxlength="18" />
              </div>
              <div class="link-row-url" role="cell">
                <input class="link-row-input" type="url" aria-label="网址" placeholder="https://" data-link-field="url" data-category-id="${categoryId}" data-link-id="${escapeAttribute(link.id)}" value="${escapeAttribute(link.url)}" />
              </div>
              <div class="link-row-actions" role="cell">
                <a class="link-row-action" href="${escapeAttribute(link.url)}" target="_blank" rel="noopener noreferrer" data-link-open="${escapeAttribute(link.id)}" aria-label="在新标签页打开" title="在新标签页打开">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6h-2V7.41l-7.29 7.3-1.42-1.42L16.59 6H14V4ZM5 6h6v2H6v10h10v-5h2v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" /></svg>
                </a>
                <button class="link-row-action danger" type="button" data-remove-link="${escapeAttribute(link.id)}" data-category-id="${categoryId}" aria-label="删除标签" title="删除标签">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-.8 11.1A2 2 0 0 1 15.2 22H8.8a2 2 0 0 1-2-1.9L6 9Zm4 2v8h2v-8h-2Zm4 0v8h2v-8h-2Z" /></svg>
                </button>
              </div>
            </div>
          `
        )
        .join("");
      return `
        <article class="category-editor-card" data-category-card="${categoryId}">
          <div class="category-panel">
            <div class="category-panel-head">
              <div class="category-panel-title">
                <h4 class="category-editor-card-title">${escapeHtml(category.name || "未命名分类")}</h4>
                <span class="category-badge">${category.links.length} 个标签</span>
              </div>
              <button class="category-text-button danger" type="button" data-remove-category="${categoryId}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-.8 11.1A2 2 0 0 1 15.2 22H8.8a2 2 0 0 1-2-1.9L6 9Z" /></svg>
                删除分类
              </button>
            </div>
            <div class="category-panel-body">
              <label class="field category-name-field">
                <span>分类名称</span>
                <input type="text" data-category-field="name" data-category-id="${categoryId}" value="${escapeAttribute(category.name)}" maxlength="18" />
              </label>
              <label class="category-switch">
                <input type="checkbox" role="switch" data-category-pin="${categoryId}" ${category.isPinned ? "checked" : ""} />
                <span class="category-switch-track" aria-hidden="true"></span>
                <span class="category-switch-text">
                  <strong>首页默认展开</strong>
                  <small>打开主页时自动展开此分类</small>
                </span>
              </label>
            </div>
          </div>

          <div class="link-table" role="table" aria-label="${escapeAttribute(category.name || "未命名分类")} 的标签">
            <div class="link-table-toolbar">
              <div class="link-table-title">
                <strong>标签列表</strong>
                <span data-link-visible-count>${category.links.length}</span>
              </div>
              <div class="link-table-tools">
                ${
                  category.links.length > 1
                    ? `<label class="link-table-search">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 4a6.5 6.5 0 0 1 5.18 10.43l4.45 4.44-1.42 1.42-4.44-4.45A6.5 6.5 0 1 1 10.5 4Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" /></svg>
                        <input type="search" placeholder="筛选名称或网址" aria-label="筛选标签" data-link-filter="${categoryId}" />
                      </label>`
                    : ""
                }
                <button class="primary-button link-table-add" type="button" data-add-link="${categoryId}">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" /></svg>
                  添加标签
                </button>
              </div>
            </div>
            ${
              category.links.length
                ? `<div class="link-table-head" role="row">
                    <span role="columnheader">#</span>
                    <span role="columnheader">名称</span>
                    <span role="columnheader">网址</span>
                    <span role="columnheader">操作</span>
                  </div>
                  <div class="link-list" role="rowgroup">${linkRows}</div>
                  <div class="link-table-empty hidden" data-link-filter-empty>没有匹配的标签</div>`
                : `<div class="link-table-empty">
                    <strong>这个分类还没有标签</strong>
                    <span>点击右上角“添加标签”，填写名称和网址即可显示在首页。</span>
                  </div>`
            }
          </div>
        </article>
      `;
    })
    .join("");

  renderSettingsAnchorNav();
  renderSettingsHistoryList();
  showSettingsSection(activeSettingsSection);
  queueSettingsTrailUpdate();
  queueSettingsQuickScrollUpdate();
}

function handleSettingsInput(event) {
  if (!settingsDraft) {
    return;
  }

  const { target } = event;

  if (target.matches("[data-range-for]")) {
    applyRangeNumberInput(target);
    return;
  }

  if (target === siteTitleInput) {
    settingsDraft.settings.siteTitle = target.value;
    return;
  }

  if (target === brandLabelInput) {
    settingsDraft.settings.brandLabel = target.value;
    return;
  }

  if (target.name === "iconTheme") {
    settingsDraft.settings.iconTheme = target.value;
    applyIconTheme(target.value);
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
        renderSettingsAnchorNav();
      }
    }
    queueSettingsTrailUpdate();
    return;
  }

  if (target.dataset.categoryPin) {
    const category = settingsDraft.categories.find((item) => item.id === target.dataset.categoryPin);
    if (category) {
      category.isPinned = target.checked;
      renderSettingsAnchorNav();
    }
    return;
  }

  if (target.dataset.linkFilter !== undefined) {
    filterCategoryLinkRows(target);
    return;
  }

  if (target.dataset.linkField) {
    const category = settingsDraft.categories.find((item) => item.id === target.dataset.categoryId);
    const link = category?.links.find((item) => item.id === target.dataset.linkId);
    if (link) {
      link[target.dataset.linkField] = target.value;
      if (target.dataset.linkField === "url") {
        const row = target.closest("[data-link-row]");
        row?.querySelector("[data-link-open]")?.setAttribute("href", target.value);
        queueSettingsLinkIconRefresh(row, target.value);
      }
    }
  }

  queueSettingsTrailUpdate();
}

let settingsLinkIconTimer = 0;

function queueSettingsLinkIconRefresh(row, rawUrl) {
  window.clearTimeout(settingsLinkIconTimer);
  settingsLinkIconTimer = window.setTimeout(() => {
    const icon = row?.querySelector(".link-row-icon");
    if (!icon?.isConnected || !parseUrlWithFallback(rawUrl)) {
      return;
    }
    icon.outerHTML = buildIconMarkup(getFaviconUrl(rawUrl), "", "preview-icon link-row-icon").trim();
    const host = getLinkIconHost(rawUrl);
    if (host && needsIconDiscovery(host)) {
      queueIconDiscovery(rawUrl, { priority: true });
    }
  }, 700);
}

function filterCategoryLinkRows(filterInput) {
  const card = filterInput.closest("[data-category-card]");
  if (!card) {
    return;
  }

  const keyword = filterInput.value.trim().toLowerCase();
  const rows = Array.from(card.querySelectorAll("[data-link-row]"));
  let visibleCount = 0;
  rows.forEach((row) => {
    const text = Array.from(row.querySelectorAll("[data-link-field]"))
      .map((input) => input.value.toLowerCase())
      .join(" ");
    const isVisible = !keyword || text.includes(keyword);
    row.classList.toggle("hidden", !isVisible);
    visibleCount += isVisible ? 1 : 0;
  });

  const countLabel = card.querySelector("[data-link-visible-count]");
  if (countLabel) {
    countLabel.textContent = keyword ? `${visibleCount} / ${rows.length}` : String(rows.length);
  }
  card.querySelector("[data-link-filter-empty]")?.classList.toggle("hidden", visibleCount > 0);
}

function handleSettingsClick(event) {
  if (!settingsDraft) {
    return;
  }

  const historyButton = event.target instanceof Element ? event.target.closest("[data-delete-history]") : null;
  if (historyButton) {
    deleteLocalHistoryEntry(historyButton.dataset.deleteHistory);
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

  const removeCategoryId = event.target instanceof Element
    ? event.target.closest("[data-remove-category]")?.dataset.removeCategory
    : "";
  if (removeCategoryId) {
    settingsDraft.categories = settingsDraft.categories.filter((category) => category.id !== removeCategoryId);
    if (activeSettingsCategoryId === removeCategoryId) {
      activeSettingsCategoryId = settingsDraft.categories[0]?.id || "";
    }
    renderSettingsDrawer();
    return;
  }

  const addLinkButton = event.target instanceof Element ? event.target.closest("[data-add-link]") : null;
  if (addLinkButton) {
    addLinkToCategoryDraft(addLinkButton.dataset.addLink, { focusAddedLink: true });
    return;
  }

  const removeLinkButton = event.target instanceof Element ? event.target.closest("[data-remove-link]") : null;
  if (removeLinkButton) {
    const removeLinkId = removeLinkButton.dataset.removeLink;
    const category = settingsDraft.categories.find((item) => item.id === removeLinkButton.dataset.categoryId);
    if (category) {
      category.links = category.links.filter((link) => link.id !== removeLinkId);
      renderSettingsDrawer();
    }
  }
}

function addLinkToCategoryDraft(categoryId, { focusAddedLink = false } = {}) {
  const category = settingsDraft?.categories.find((item) => item.id === categoryId);
  if (!category) {
    return;
  }

  const linkId = createId("link");
  category.links.push({
    id: linkId,
    label: "新标签",
    url: "https://",
  });
  renderSettingsDrawer();

  if (!focusAddedLink) {
    return;
  }

  window.requestAnimationFrame(() => {
    scrollSettingsToCategoryBottom(categoryId);
    const labelInput = categoryEditor?.querySelector(
      `[data-link-field="label"][data-link-id="${CSS.escape(linkId)}"]`
    );
    labelInput?.focus();
    labelInput?.select();
  });
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

  const id = createId("category");
  settingsDraft.categories.push({
    id,
    name: "新分类",
    links: [],
  });
  activeSettingsCategoryId = id;
  renderSettingsDrawer();
  showSettingsSection("categories");
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

// Tags and rows use pointer-driven drags; block the browser's native link/image dragging.
function handleTagDragStart(event) {
  if (event.target instanceof Element && event.target.closest(".tag-card, [data-category-drag-handle]")) {
    event.preventDefault();
  }
}

function handleTagPointerDown(event) {
  if (event.button !== 0 || tagPointerDrag.card || tagPointerDrag.settling) {
    return;
  }
  const card = event.target instanceof Element ? event.target.closest(".tag-card") : null;
  if (!card?.dataset.linkId || !card.dataset.categoryId) {
    return;
  }

  Object.assign(tagPointerDrag, {
    pointerId: event.pointerId,
    pointerType: event.pointerType || "mouse",
    card,
    active: false,
    startX: event.clientX,
    startY: event.clientY,
    pointerX: event.clientX,
    pointerY: event.clientY,
  });
  if (tagPointerDrag.pointerType !== "mouse") {
    // Touch waits for a long press (like iOS) so a normal swipe still scrolls the page.
    tagPointerDrag.holdTimer = window.setTimeout(startTagPointerDrag, TAG_DRAG_TOUCH_HOLD_MS);
  }
  window.addEventListener("pointermove", handleTagPointerMove);
  window.addEventListener("pointerup", handleTagPointerUp);
  window.addEventListener("pointercancel", handleTagPointerCancel);
  window.addEventListener("keydown", handleTagDragKeydown);
}

function handleTagPointerMove(event) {
  if (event.pointerId !== tagPointerDrag.pointerId) {
    return;
  }
  tagPointerDrag.pointerX = event.clientX;
  tagPointerDrag.pointerY = event.clientY;
  const distance = Math.hypot(event.clientX - tagPointerDrag.startX, event.clientY - tagPointerDrag.startY);

  if (!tagPointerDrag.active) {
    if (tagPointerDrag.pointerType === "mouse") {
      if (distance >= TAG_DRAG_START_DISTANCE) {
        startTagPointerDrag();
      }
    } else if (distance > TAG_DRAG_TOUCH_SLOP) {
      resetTagPointerDrag();
    }
    return;
  }

  event.preventDefault();
  scheduleTagDragFrame();
}

function handleTagPointerUp(event) {
  if (event.pointerId !== tagPointerDrag.pointerId) {
    return;
  }
  if (!tagPointerDrag.active) {
    resetTagPointerDrag();
    return;
  }
  tagPointerDrag.suppressClick = true;
  window.setTimeout(() => {
    tagPointerDrag.suppressClick = false;
  }, 0);
  finishTagPointerDrag(true);
}

function handleTagPointerCancel(event) {
  if (event.pointerId !== tagPointerDrag.pointerId) {
    return;
  }
  if (tagPointerDrag.active) {
    finishTagPointerDrag(false);
  } else {
    resetTagPointerDrag();
  }
}

function handleTagDragKeydown(event) {
  if (event.key === "Escape" && tagPointerDrag.active) {
    event.preventDefault();
    finishTagPointerDrag(false);
  }
}

function handleTagDragClickGuard(event) {
  if (tagPointerDrag.suppressClick || tagPointerDrag.active) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function handleTagDragContextMenu(event) {
  if (tagPointerDrag.card || rowPointerDrag.row) {
    event.preventDefault();
  }
}

function handleTagDragTouchMove(event) {
  if (tagPointerDrag.active || rowPointerDrag.active) {
    event.preventDefault();
  }
}

function startTagPointerDrag() {
  const { card } = tagPointerDrag;
  window.clearTimeout(tagPointerDrag.holdTimer);
  tagPointerDrag.holdTimer = 0;
  if (!card?.isConnected || tagPointerDrag.active) {
    return;
  }

  const rect = card.getBoundingClientRect();
  const ghost = card.cloneNode(true);
  ghost.classList.add("tag-drag-ghost");
  ghost.removeAttribute("href");
  ghost.setAttribute("aria-hidden", "true");
  ghost.style.opacity = "";
  ghost.style.pointerEvents = "";
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  // Position via `translate` (applied before `scale`) so the lift scale never shifts the ghost off the pointer.
  ghost.style.transform = "none";
  ghost.style.translate = `${rect.left}px ${rect.top}px`;
  document.body.appendChild(ghost);

  Object.assign(tagPointerDrag, {
    active: true,
    ghost,
    offsetX: tagPointerDrag.startX - rect.left,
    offsetY: tagPointerDrag.startY - rect.top,
    originParent: card.parentElement,
    originNext: card.nextElementSibling,
    originCategoryId: card.dataset.categoryId,
    lastTargetCard: null,
    scrollParent: getScrollParent(tagBoard),
  });
  ghost.style.transformOrigin = `${tagPointerDrag.offsetX}px ${tagPointerDrag.offsetY}px`;
  card.classList.add("is-drag-placeholder");
  tagBoard.classList.add("is-tag-pointer-dragging");
  document.body.classList.add("is-tag-dragging");
  window.requestAnimationFrame(() => ghost.classList.add("is-lifted"));
  if (tagPointerDrag.pointerType !== "mouse") {
    navigator.vibrate?.(8);
  }
  scheduleTagDragFrame();
}

function scheduleTagDragFrame() {
  if (tagPointerDrag.frame) {
    return;
  }
  tagPointerDrag.frame = window.requestAnimationFrame(() => {
    tagPointerDrag.frame = 0;
    if (!tagPointerDrag.active) {
      return;
    }
    const { ghost, pointerX, pointerY, offsetX, offsetY } = tagPointerDrag;
    ghost.style.translate = `${pointerX - offsetX}px ${pointerY - offsetY}px`;
    updateTagDragPlaceholder(pointerX, pointerY);
    if (autoScrollDuringTagDrag(pointerY)) {
      scheduleTagDragFrame();
    }
  });
}

function updateTagDragPlaceholder(pointerX, pointerY) {
  const placeholder = tagPointerDrag.card;
  const hit = document.elementFromPoint(pointerX, pointerY);
  const targetCard = hit?.closest(".tag-card");

  if (targetCard && targetCard !== placeholder && tagBoard.contains(targetCard)) {
    if (targetCard === tagPointerDrag.lastTargetCard) {
      return;
    }
    const hitRect = targetCard.getBoundingClientRect();
    const insetX = hitRect.width * TAG_SWAP_INSET;
    const insetY = hitRect.height * TAG_SWAP_INSET;
    if (
      pointerX < hitRect.left + insetX ||
      pointerX > hitRect.right - insetX ||
      pointerY < hitRect.top + insetY ||
      pointerY > hitRect.bottom - insetY
    ) {
      return;
    }
    const grid = targetCard.parentElement;
    let insertBefore = targetCard;
    if (grid === placeholder.parentElement) {
      // Same grid: take the target's slot, like iOS home screen icons.
      const siblings = Array.from(grid.children);
      if (siblings.indexOf(placeholder) < siblings.indexOf(targetCard)) {
        insertBefore = targetCard.nextElementSibling;
      }
    } else {
      const targetRect = targetCard.getBoundingClientRect();
      if (pointerX > targetRect.left + targetRect.width / 2) {
        insertBefore = targetCard.nextElementSibling;
      }
    }
    tagPointerDrag.lastTargetCard = targetCard;
    animateTagReflow(() => grid.insertBefore(placeholder, insertBefore));
    return;
  }

  if (targetCard !== placeholder) {
    tagPointerDrag.lastTargetCard = null;
  }
  const links = hit?.closest(".category-links");
  if (!links || !tagBoard.contains(links) || links.contains(placeholder)) {
    return;
  }

  // Hovering an empty area of another category: append at its end.
  let grid = links.querySelector(".tag-grid");
  if (!grid) {
    links.querySelector(".empty-state")?.classList.add("hidden");
    grid = document.createElement("div");
    grid.className = "tag-grid";
    links.appendChild(grid);
  }
  const clipRect = getTagClipRect(grid);
  const firstHiddenCard = Array.from(grid.children).find(
    (card) => card !== placeholder && !isRectVisibleIn(card.getBoundingClientRect(), clipRect)
  );
  animateTagReflow(() => grid.insertBefore(placeholder, firstHiddenCard || null));
}

// FLIP reflow that respects collapsed category rows (which clip overflowing cards):
// cards visible before and after slide to their new slot, cards entering the visible
// row pop in, and cards pushed into the clipped area shrink out where they were.
function animateTagReflow(mutate) {
  const cards = Array.from(tagBoard.querySelectorAll(".tag-card"));
  const before = new Map(
    cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return [card, { rect, visible: isRectVisibleIn(rect, getTagClipRect(card)) }];
    })
  );
  cards.forEach((card) => {
    card.getAnimations().forEach((animation) => {
      if (animation.id === "tag-reflow") {
        animation.cancel();
      }
    });
  });
  mutate();
  syncTagRowOverflowDuringDrag();

  cards.forEach((card) => {
    if (card === tagPointerDrag.card) {
      return;
    }
    const first = before.get(card);
    const last = card.getBoundingClientRect();
    const lastVisible = isRectVisibleIn(last, getTagClipRect(card));
    const deltaX = first.rect.left - last.left;
    const deltaY = first.rect.top - last.top;
    if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
      return;
    }

    if (first.visible && lastVisible) {
      runTagReflowAnimation(
        card,
        [{ transform: `translate(${deltaX}px, ${deltaY}px)` }, { transform: "translate(0, 0)" }],
        TAG_REFLOW_DURATION_MS,
        TAG_REFLOW_EASING
      );
    } else if (lastVisible) {
      runTagReflowAnimation(
        card,
        [{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "scale(1)" }],
        TAG_POP_DURATION_MS,
        "cubic-bezier(0.2, 0.9, 0.3, 1.2)"
      );
    } else if (first.visible) {
      shrinkOutTagCardCopy(card, first.rect);
    }
  });
}

// Keeps each row's collapsed clipping in step with its live card count while dragging,
// without touching the saved expanded state (a full render follows the drop).
function syncTagRowOverflowDuringDrag() {
  if (homeTagSearchQuery) {
    return;
  }
  tagBoard.querySelectorAll(".category-row").forEach((row) => {
    const grid = row.querySelector(".tag-grid");
    if (!grid) {
      return;
    }
    const columns = getGridColumnCount(grid);
    const count = grid.querySelectorAll(".tag-card").length;
    const hasOverflow = count > columns * getCollapsedRowCount(row);
    row.classList.toggle("has-overflow", hasOverflow);
    row.classList.toggle("is-expanded", hasOverflow && expandedCategoryIds.has(row.dataset.categoryId));
    row.style.setProperty("--category-rows", String(Math.max(1, Math.ceil(count / columns))));
  });
}

function runTagReflowAnimation(card, keyframes, duration, easing) {
  const animation = card.animate(keyframes, { duration, easing });
  animation.id = "tag-reflow";
}

function shrinkOutTagCardCopy(card, rect) {
  const copy = card.cloneNode(true);
  copy.classList.add("tag-reflow-copy");
  copy.removeAttribute("href");
  copy.setAttribute("aria-hidden", "true");
  copy.style.width = `${rect.width}px`;
  copy.style.height = `${rect.height}px`;
  copy.style.left = `${rect.left}px`;
  copy.style.top = `${rect.top}px`;
  document.body.appendChild(copy);
  copy.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.6)" }], {
    duration: TAG_POP_DURATION_MS,
    easing: "ease-in",
    fill: "forwards",
  });
  window.setTimeout(() => copy.remove(), TAG_POP_DURATION_MS + 40);
}

function getTagClipRect(node) {
  const links = node.closest(".category-links");
  if (!links || window.getComputedStyle(links).overflowY === "visible") {
    return null;
  }
  return links.getBoundingClientRect();
}

function isRectVisibleIn(rect, clipRect) {
  if (!clipRect) {
    return true;
  }
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return (
    centerX >= clipRect.left &&
    centerX <= clipRect.right &&
    centerY >= clipRect.top &&
    centerY <= clipRect.bottom
  );
}

function autoScrollDuringTagDrag(pointerY, scroller = tagPointerDrag.scrollParent) {
  if (!scroller) {
    return false;
  }
  const isRoot = scroller === document.scrollingElement || scroller === document.body;
  const bounds = isRoot
    ? { top: 0, bottom: window.innerHeight }
    : scroller.getBoundingClientRect();
  let delta = 0;
  if (pointerY < bounds.top + TAG_DRAG_AUTOSCROLL_EDGE) {
    delta = -Math.ceil((bounds.top + TAG_DRAG_AUTOSCROLL_EDGE - pointerY) / 6);
  } else if (pointerY > bounds.bottom - TAG_DRAG_AUTOSCROLL_EDGE) {
    delta = Math.ceil((pointerY - (bounds.bottom - TAG_DRAG_AUTOSCROLL_EDGE)) / 6);
  }
  if (!delta) {
    return false;
  }
  const before = scroller.scrollTop;
  scroller.scrollTop += delta;
  return scroller.scrollTop !== before;
}

function getScrollParent(element) {
  let node = element?.parentElement;
  while (node) {
    const { overflowY } = window.getComputedStyle(node);
    if (/(auto|scroll)/.test(overflowY) && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return document.scrollingElement;
}

function finishTagPointerDrag(commit) {
  const { card, ghost, originParent, originNext, originCategoryId } = tagPointerDrag;
  const linkId = card.dataset.linkId;
  detachTagPointerListeners();
  window.cancelAnimationFrame(tagPointerDrag.frame);
  tagPointerDrag.frame = 0;
  tagPointerDrag.active = false;
  tagPointerDrag.settling = true;

  if (!commit && originParent?.isConnected) {
    animateTagReflow(() => originParent.insertBefore(card, originNext?.parentElement === originParent ? originNext : null));
  }

  const targetRect = card.getBoundingClientRect();
  ghost.classList.add("is-settling");
  ghost.classList.remove("is-lifted");
  ghost.style.translate = `${targetRect.left}px ${targetRect.top}px`;

  window.setTimeout(() => {
    ghost.remove();
    card.classList.remove("is-drag-placeholder");
    tagBoard.classList.remove("is-tag-pointer-dragging");
    document.body.classList.remove("is-tag-dragging");
    const targetCategoryId = card.closest(".category-row")?.dataset.categoryId || "";
    let nextCard = card.nextElementSibling;
    while (nextCard && !nextCard.classList.contains("tag-card")) {
      nextCard = nextCard.nextElementSibling;
    }
    const beforeLinkId = nextCard?.dataset.linkId || "";
    resetTagPointerDrag();

    const moved = commit && targetCategoryId
      ? moveLinkBefore(originCategoryId, linkId, targetCategoryId, beforeLinkId)
      : null;
    if (!moved) {
      // Restore any temporary grids / hidden empty states created while hovering.
      renderTagBoard();
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
  }, TAG_SETTLE_DURATION_MS);
}

function detachTagPointerListeners() {
  window.removeEventListener("pointermove", handleTagPointerMove);
  window.removeEventListener("pointerup", handleTagPointerUp);
  window.removeEventListener("pointercancel", handleTagPointerCancel);
  window.removeEventListener("keydown", handleTagDragKeydown);
}

function resetTagPointerDrag() {
  detachTagPointerListeners();
  window.clearTimeout(tagPointerDrag.holdTimer);
  Object.assign(tagPointerDrag, {
    pointerId: null,
    card: null,
    ghost: null,
    active: false,
    settling: false,
    holdTimer: 0,
    originParent: null,
    originNext: null,
    lastTargetCard: null,
  });
}

function moveLinkBefore(fromCategoryId, linkId, toCategoryId, beforeLinkId = "") {
  const nextCategories = structuredClone(appState.categories);
  const fromCategory = nextCategories.find((item) => item.id === fromCategoryId);
  const toCategory = nextCategories.find((item) => item.id === toCategoryId);
  const fromIndex = fromCategory?.links.findIndex((item) => item.id === linkId) ?? -1;
  if (!toCategory || fromIndex < 0) {
    return null;
  }

  const before = nextCategories.map((category) => category.links.map((link) => link.id).join(",")).join("|");
  const [moved] = fromCategory.links.splice(fromIndex, 1);
  const insertIndex = beforeLinkId ? toCategory.links.findIndex((item) => item.id === beforeLinkId) : -1;
  toCategory.links.splice(insertIndex < 0 ? toCategory.links.length : insertIndex, 0, moved);
  const after = nextCategories.map((category) => category.links.map((link) => link.id).join(",")).join("|");
  return before === after ? null : nextCategories;
}

// ---- Category row drag (whole row lifts and moves vertically; others slide aside) ----

function handleRowPointerDown(event) {
  if (event.button !== 0 || rowPointerDrag.row || rowPointerDrag.settling || tagPointerDrag.card || homeTagSearchQuery) {
    return;
  }
  const handle = event.target instanceof Element ? event.target.closest("[data-category-drag-handle]") : null;
  const row = handle?.closest(".category-row");
  if (!row || tagBoard.querySelectorAll(".category-row").length < 2) {
    return;
  }

  Object.assign(rowPointerDrag, {
    pointerId: event.pointerId,
    pointerType: event.pointerType || "mouse",
    row,
    active: false,
    startX: event.clientX,
    startY: event.clientY,
    pointerY: event.clientY,
  });
  if (rowPointerDrag.pointerType !== "mouse") {
    rowPointerDrag.holdTimer = window.setTimeout(startRowPointerDrag, ROW_DRAG_TOUCH_HOLD_MS);
  }
  window.addEventListener("pointermove", handleRowPointerMove);
  window.addEventListener("pointerup", handleRowPointerUp);
  window.addEventListener("pointercancel", handleRowPointerCancel);
  window.addEventListener("keydown", handleRowDragKeydown);
}

function handleRowPointerMove(event) {
  if (event.pointerId !== rowPointerDrag.pointerId) {
    return;
  }
  rowPointerDrag.pointerY = event.clientY;
  const distance = Math.hypot(event.clientX - rowPointerDrag.startX, event.clientY - rowPointerDrag.startY);
  if (!rowPointerDrag.active) {
    if (rowPointerDrag.pointerType === "mouse") {
      if (distance >= TAG_DRAG_START_DISTANCE) {
        startRowPointerDrag();
      }
    } else if (distance > TAG_DRAG_TOUCH_SLOP) {
      resetRowPointerDrag();
    }
    return;
  }
  event.preventDefault();
  scheduleRowDragFrame();
}

function handleRowPointerUp(event) {
  if (event.pointerId !== rowPointerDrag.pointerId) {
    return;
  }
  if (rowPointerDrag.active) {
    finishRowPointerDrag(true);
  } else {
    resetRowPointerDrag();
  }
}

function handleRowPointerCancel(event) {
  if (event.pointerId !== rowPointerDrag.pointerId) {
    return;
  }
  if (rowPointerDrag.active) {
    finishRowPointerDrag(false);
  } else {
    resetRowPointerDrag();
  }
}

function handleRowDragKeydown(event) {
  if (event.key === "Escape" && rowPointerDrag.active) {
    event.preventDefault();
    finishRowPointerDrag(false);
  }
}

function startRowPointerDrag() {
  const { row } = rowPointerDrag;
  window.clearTimeout(rowPointerDrag.holdTimer);
  rowPointerDrag.holdTimer = 0;
  if (!row?.isConnected || rowPointerDrag.active) {
    return;
  }

  const rect = row.getBoundingClientRect();
  const ghost = row.cloneNode(true);
  ghost.classList.add("category-row-ghost");
  ghost.setAttribute("aria-hidden", "true");
  ghost.querySelectorAll("a[href]").forEach((link) => link.removeAttribute("href"));
  ghost.style.width = `${rect.width}px`;
  ghost.style.translate = `${rect.left}px ${rect.top}px`;
  ghost.style.transformOrigin = `${rowPointerDrag.startX - rect.left}px ${rowPointerDrag.startY - rect.top}px`;
  document.body.appendChild(ghost);

  Object.assign(rowPointerDrag, {
    active: true,
    ghost,
    offsetY: rowPointerDrag.startY - rect.top,
    ghostLeft: rect.left,
    originNext: row.nextElementSibling,
    scrollParent: getScrollParent(tagBoard),
  });
  row.classList.add("is-row-placeholder");
  tagBoard.classList.add("is-row-dragging");
  document.body.classList.add("is-tag-dragging");
  window.requestAnimationFrame(() => ghost.classList.add("is-lifted"));
  if (rowPointerDrag.pointerType !== "mouse") {
    navigator.vibrate?.(8);
  }
  scheduleRowDragFrame();
}

function scheduleRowDragFrame() {
  if (rowPointerDrag.frame) {
    return;
  }
  rowPointerDrag.frame = window.requestAnimationFrame(() => {
    rowPointerDrag.frame = 0;
    if (!rowPointerDrag.active) {
      return;
    }
    const { ghost, ghostLeft, pointerY, offsetY } = rowPointerDrag;
    // Locked to the vertical axis, like reordering a list on iOS.
    ghost.style.translate = `${ghostLeft}px ${pointerY - offsetY}px`;
    updateRowDragPlaceholder(pointerY - offsetY + rowPointerDrag.row.offsetHeight / 2);
    if (autoScrollDuringTagDrag(pointerY, rowPointerDrag.scrollParent)) {
      scheduleRowDragFrame();
    }
  });
}

function updateRowDragPlaceholder(ghostCenterY) {
  const placeholder = rowPointerDrag.row;
  const boardTop = tagBoard.getBoundingClientRect().top;
  // Layout positions (offsetTop) ignore the rows' in-flight FLIP transforms, so targets don't jitter.
  const otherRows = Array.from(tagBoard.querySelectorAll(".category-row")).filter((row) => row !== placeholder);
  const beforeRow =
    otherRows.find((row) => ghostCenterY < boardTop + row.offsetTop + row.offsetHeight / 2) || null;

  let currentNext = placeholder.nextElementSibling;
  while (currentNext && !currentNext.classList.contains("category-row")) {
    currentNext = currentNext.nextElementSibling;
  }
  if (beforeRow === currentNext) {
    return;
  }
  animateRowReflow(() => tagBoard.insertBefore(placeholder, beforeRow));
}

function animateRowReflow(mutate) {
  const rows = Array.from(tagBoard.querySelectorAll(".category-row"));
  const firstRects = new Map(rows.map((row) => [row, row.getBoundingClientRect()]));
  rows.forEach((row) => {
    row.getAnimations().forEach((animation) => {
      if (animation.id === "row-reflow") {
        animation.cancel();
      }
    });
  });
  mutate();
  rows.forEach((row) => {
    if (row === rowPointerDrag.row) {
      return;
    }
    const first = firstRects.get(row);
    const deltaY = first.top - row.getBoundingClientRect().top;
    if (Math.abs(deltaY) < 0.5) {
      return;
    }
    const animation = row.animate(
      [{ transform: `translateY(${deltaY}px)` }, { transform: "translateY(0)" }],
      { duration: TAG_REFLOW_DURATION_MS, easing: TAG_REFLOW_EASING }
    );
    animation.id = "row-reflow";
  });
}

function finishRowPointerDrag(commit) {
  const { row, ghost, originNext } = rowPointerDrag;
  detachRowPointerListeners();
  window.cancelAnimationFrame(rowPointerDrag.frame);
  rowPointerDrag.frame = 0;
  rowPointerDrag.active = false;
  rowPointerDrag.settling = true;

  if (!commit) {
    animateRowReflow(() => tagBoard.insertBefore(row, originNext?.parentElement === tagBoard ? originNext : null));
  }

  const target = row.getBoundingClientRect();
  ghost.classList.add("is-settling");
  ghost.classList.remove("is-lifted");
  ghost.style.translate = `${target.left}px ${target.top}px`;

  window.setTimeout(() => {
    ghost.remove();
    row.classList.remove("is-row-placeholder");
    tagBoard.classList.remove("is-row-dragging");
    document.body.classList.remove("is-tag-dragging");
    const order = Array.from(tagBoard.querySelectorAll(".category-row")).map((item) => item.dataset.categoryId);
    resetRowPointerDrag();

    const moved = commit ? reorderCategoriesToMatch(order) : null;
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
  }, TAG_SETTLE_DURATION_MS);
}

function detachRowPointerListeners() {
  window.removeEventListener("pointermove", handleRowPointerMove);
  window.removeEventListener("pointerup", handleRowPointerUp);
  window.removeEventListener("pointercancel", handleRowPointerCancel);
  window.removeEventListener("keydown", handleRowDragKeydown);
}

function resetRowPointerDrag() {
  detachRowPointerListeners();
  window.clearTimeout(rowPointerDrag.holdTimer);
  Object.assign(rowPointerDrag, {
    pointerId: null,
    row: null,
    ghost: null,
    active: false,
    settling: false,
    holdTimer: 0,
    originNext: null,
  });
}

function reorderCategoriesToMatch(categoryIds) {
  const byId = new Map(appState.categories.map((category) => [category.id, category]));
  const ordered = categoryIds.map((id) => byId.get(id)).filter(Boolean);
  // Categories not on the board (none today, but keep them rather than drop them) stay at the end.
  appState.categories.forEach((category) => {
    if (!ordered.includes(category)) {
      ordered.push(category);
    }
  });
  const before = appState.categories.map((category) => category.id).join("|");
  const after = ordered.map((category) => category.id).join("|");
  return before === after ? null : structuredClone(ordered);
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

function queueTagOverflowLayoutUpdate() {
  if (tagOverflowLayoutFrame) {
    window.cancelAnimationFrame(tagOverflowLayoutFrame);
  }
  tagOverflowLayoutFrame = window.requestAnimationFrame(() => {
    tagOverflowLayoutFrame = 0;
    updateTagOverflowLayout();
  });
}

function queueIconReadyStateCheck() {
  if (iconReadyStateFrame) {
    window.cancelAnimationFrame(iconReadyStateFrame);
  }
  iconReadyStateFrame = window.requestAnimationFrame(() => {
    iconReadyStateFrame = 0;
    reconcileIconReadyState();
  });
}

function reconcileIconReadyState() {
  document.querySelectorAll("img.mx-icon-image").forEach((node) => {
    if (!(node instanceof HTMLImageElement) || !node.complete) {
      return;
    }

    if (node.naturalWidth > 0) {
      node.classList.add("is-ready");
      if (node.dataset.iconHost) {
        window.__mxIconLoaded(node);
      }
      return;
    }

    if (node.dataset.iconChain || node.dataset.iconHost) {
      window.__mxIconFallback(node);
      return;
    }

    node.classList.add("is-ready");
  });
}

function getGridColumnCount(gridNode) {
  if (!(gridNode instanceof HTMLElement)) {
    return MAX_TAGS_PER_ROW;
  }

  const template = window.getComputedStyle(gridNode).gridTemplateColumns || "";
  const columns = template
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .length;

  return Math.max(1, columns || MAX_TAGS_PER_ROW);
}

// Rows a collapsed category shows; set per breakpoint in CSS via --collapsed-rows.
function getCollapsedRowCount(rowNode) {
  const value = Number.parseInt(window.getComputedStyle(rowNode).getPropertyValue("--collapsed-rows"), 10);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function updateCategoryExpandButtonState(buttonNode, hasOverflow, isExpanded) {
  if (!(buttonNode instanceof HTMLButtonElement)) {
    return;
  }

  buttonNode.disabled = !hasOverflow;
  buttonNode.classList.toggle("is-disabled", !hasOverflow);
  buttonNode.classList.toggle("is-expanded", hasOverflow && isExpanded);
  buttonNode.setAttribute("aria-disabled", hasOverflow ? "false" : "true");

  if (!hasOverflow) {
    buttonNode.setAttribute("aria-expanded", "false");
    buttonNode.setAttribute("aria-label", "当前分类已全部显示");
    buttonNode.title = "当前分类已全部显示";
    return;
  }

  buttonNode.setAttribute("aria-expanded", isExpanded ? "true" : "false");
  buttonNode.setAttribute("aria-label", isExpanded ? "收起分类标签" : "展开更多标签");
  buttonNode.title = isExpanded ? "收起分类标签" : "展开更多标签";
}

function updateTagOverflowLayout() {
  const isFilteringTags = Boolean(homeTagSearchQuery);
  const rows = tagBoard.querySelectorAll(".category-row");
  rows.forEach((rowNode) => {
    if (!(rowNode instanceof HTMLElement)) {
      return;
    }

    const categoryId = rowNode.dataset.categoryId || "";
    const gridNode = rowNode.querySelector(".tag-grid");
    const buttonNode = rowNode.querySelector("[data-toggle-category]");
    const linkCount = gridNode?.querySelectorAll(".tag-card").length || 0;

    if (isFilteringTags) {
      const filteredRowCount = Math.max(1, Math.ceil(linkCount / getGridColumnCount(gridNode)));
      rowNode.style.setProperty("--category-rows", String(filteredRowCount));
      rowNode.classList.add("is-expanded");
      rowNode.classList.remove("has-overflow");
      if (buttonNode instanceof HTMLButtonElement) {
        buttonNode.disabled = true;
        buttonNode.classList.add("is-search-filtering");
        buttonNode.setAttribute("aria-hidden", "true");
      }
      return;
    }

    const columns = getGridColumnCount(gridNode);
    const hasOverflow = linkCount > columns * getCollapsedRowCount(rowNode);
    const rowCount = Math.max(1, Math.ceil(linkCount / columns));
    const isExpanded = hasOverflow && expandedCategoryIds.has(categoryId);

    rowNode.style.setProperty("--category-rows", String(rowCount));
    rowNode.classList.toggle("has-overflow", hasOverflow);
    rowNode.classList.toggle("is-expanded", isExpanded);

    if (!hasOverflow && categoryId) {
      expandedCategoryIds.delete(categoryId);
    }

    updateCategoryExpandButtonState(buttonNode, hasOverflow, isExpanded);
  });
}

function matchesTagSearch(label, query) {
  if (!query) {
    return true;
  }

  return getTagSearchTerms(label).some((term) => term.includes(query));
}

function getTagSearchTerms(label) {
  const normalizedLabel = String(label || "").trim().toLocaleLowerCase();
  if (!normalizedLabel) {
    return [];
  }

  const cachedTerms = tagSearchTermsCache.get(normalizedLabel);
  if (cachedTerms) {
    return cachedTerms;
  }

  const terms = new Set([normalizedLabel]);
  const convertToPinyin = window.pinyinPro?.pinyin;
  if (typeof convertToPinyin === "function") {
    const syllables = convertToPinyin(normalizedLabel, {
      toneType: "none",
      type: "array",
      nonZh: "consecutive",
    })
      .map((value) => String(value || "").toLocaleLowerCase())
      .filter(Boolean);

    if (syllables.length) {
      terms.add(syllables.join(""));
      terms.add(syllables.map((value) => value[0] || "").join(""));
    }
  }

  const resolvedTerms = Array.from(terms);
  tagSearchTermsCache.set(normalizedLabel, resolvedTerms);
  return resolvedTerms;
}

function fitTagLabelText() {
  const labels = tagBoard.querySelectorAll(".tile-label");
  labels.forEach((labelNode) => {
    if (!(labelNode instanceof HTMLElement)) {
      return;
    }

    labelNode.style.fontSize = "";
    labelNode.style.lineHeight = "";

    // Start from the breakpoint's CSS size so small screens never get bumped up.
    const minSize = 9;
    let currentSize = Math.round(Number.parseFloat(window.getComputedStyle(labelNode).fontSize) || 15);

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

  const activeSection = settingsSections[activeSettingsSection];
  if (!activeSection) {
    settingsTrail.textContent = "首页配置";
    return;
  }

  const containerTop = settingsScroll.getBoundingClientRect().top;
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
  updateSettingsAnchorNav(sectionName);
}

function renderSettingsAnchorNav() {
  if (!settingsCategoryJumpList) {
    return;
  }

  const categories = Array.isArray(settingsDraft?.categories) ? settingsDraft.categories : [];
  settingsCategoryJumpList.innerHTML = categories
    .map(
      (category) => `
        <div class="settings-category-jump-card ${category.id === activeSettingsCategoryId ? "is-active" : ""}">
          <button class="settings-category-jump-name" type="button" data-settings-category-id="${escapeAttribute(category.id)}" aria-current="${category.id === activeSettingsCategoryId ? "true" : "false"}">
          <span>${escapeHtml(category.name || "未命名分类")}</span>
          </button>
          <div class="settings-category-jump-actions">
            <button class="settings-category-jump-action" type="button" data-add-link-from-nav="${escapeAttribute(category.id)}" aria-label="添加标签" title="添加标签">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" /></svg>
            </button>
            <button class="settings-category-jump-action ${category.isPinned ? "is-pinned" : ""}" type="button" data-toggle-category-pin="${escapeAttribute(category.id)}" aria-label="${category.isPinned ? "取消默认展开" : "设为默认展开"}" title="${category.isPinned ? "取消默认展开" : "设为默认展开"}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.6 3.5 5.9 5.9-2 2-1.3-1.3-3.2 3.2v4.2l-1.7 1.7-3.5-3.5-4.3 4.3-1.4-1.4 4.3-4.3-3.5-3.5 1.7-1.7h4.2L13 5.8l-1.3-1.3 2-2Z" /></svg>
            </button>
          </div>
        </div>
      `
    )
    .join("") + `
      <button class="settings-category-jump-add" type="button" data-add-category-from-nav>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" /></svg>
        新增分类
      </button>
    `;
}

function updateSettingsAnchorNav(sectionName) {
  if (!settingsAnchorNav) {
    return;
  }

  const anchorBySection = {
    基础信息: "basic",
    背景图: "background",
    搜索引擎: "engines",
    搜索历史: "history",
    标签分类: "categories",
  };
  const activeAnchor = anchorBySection[sectionName] || "basic";
  settingsAnchorNav.querySelectorAll("[data-settings-anchor]").forEach((button) => {
    const isActive = button.dataset.settingsAnchor === activeAnchor;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
    if (isActive) {
      keepTabVisibleInScroller(button);
    }
  });
  settingsCategoryJumpList?.classList.toggle("hidden", activeAnchor !== "categories");
}

// On phones the section tabs form a horizontal scroller; keep the active one in view
// without scrolling the page or drawer vertically (scrollIntoView would).
function keepTabVisibleInScroller(button) {
  const scroller = button.parentElement;
  if (!scroller || scroller.scrollWidth <= scroller.clientWidth) {
    return;
  }
  const left = button.offsetLeft - scroller.offsetLeft;
  const right = left + button.offsetWidth;
  if (left < scroller.scrollLeft) {
    scroller.scrollTo({ left: left - 12, behavior: "smooth" });
  } else if (right > scroller.scrollLeft + scroller.clientWidth) {
    scroller.scrollTo({ left: right - scroller.clientWidth + 12, behavior: "smooth" });
  }
}

function showSettingsSection(sectionKey) {
  if (!settingsSections[sectionKey]) {
    return;
  }
  const sectionChanged = activeSettingsSection !== sectionKey;
  activeSettingsSection = sectionKey;
  Object.entries(settingsSections).forEach(([key, section]) => {
    section?.classList.toggle("hidden", key !== sectionKey);
  });
  if (sectionChanged && settingsScroll) {
    settingsScroll.scrollTop = 0;
  }
  updateSettingsAnchorNav(settingsSections[sectionKey].dataset.trailSection);
  queueSettingsTrailUpdate();
  queueSettingsQuickScrollUpdate();
}

function handleSettingsAnchorNavigation(event) {
  const target = event.target instanceof Element ? event.target : null;
  const addLinkButton = target?.closest("[data-add-link-from-nav]");
  const pinButton = target?.closest("[data-toggle-category-pin]");
  const addCategoryButton = target?.closest("[data-add-category-from-nav]");
  const anchorButton = target?.closest("[data-settings-anchor]");
  // The whole category card is clickable, not just its name text (padding and gaps used to be dead zones).
  const categoryButton =
    target?.closest("[data-settings-category-id]") ||
    target?.closest(".settings-category-jump-card")?.querySelector("[data-settings-category-id]");

  if (addLinkButton) {
    activeSettingsCategoryId = addLinkButton.dataset.addLinkFromNav;
    addLinkToCategoryDraft(addLinkButton.dataset.addLinkFromNav, { focusAddedLink: true });
    return;
  }

  if (addCategoryButton) {
    addCategoryDraft();
    window.requestAnimationFrame(() => {
      const nameInput = categoryEditor?.querySelector('[data-category-field="name"]');
      nameInput?.focus();
      nameInput?.select();
    });
    return;
  }

  if (pinButton) {
    const category = settingsDraft?.categories.find((item) => item.id === pinButton.dataset.toggleCategoryPin);
    if (category) {
      category.isPinned = !category.isPinned;
      renderSettingsDrawer();
      updateSettingsAnchorNav("标签分类");
    }
    return;
  }

  if (anchorButton) {
    showSettingsSection(anchorButton.dataset.settingsAnchor);
    return;
  }
  if (categoryButton) {
    activeSettingsCategoryId = categoryButton.dataset.settingsCategoryId;
    renderSettingsDrawer();
    showSettingsSection("categories");
    settingsScroll.scrollTop = 0;
  }
}

function handleSettingsAnchorKeydown(event) {
  const current = event.target instanceof Element ? event.target.closest("[data-settings-anchor]") : null;
  if (!current || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
    return;
  }

  const tabs = Array.from(settingsAnchorNav.querySelectorAll("[data-settings-anchor]"));
  const index = tabs.indexOf(current);
  const nextIndex = event.key === "Home" ? 0
    : event.key === "End" ? tabs.length - 1
    : (index + (event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1) + tabs.length) % tabs.length;
  event.preventDefault();
  tabs[nextIndex].focus();
  showSettingsSection(tabs[nextIndex].dataset.settingsAnchor);
}

function scrollSettingsToCategoryBottom(categoryId) {
  const card = categoryEditor?.querySelector(`[data-category-card="${CSS.escape(categoryId)}"]`);
  if (!(card instanceof HTMLElement) || !settingsScroll) {
    return;
  }

  const cardTop = card.getBoundingClientRect().top - settingsScroll.getBoundingClientRect().top + settingsScroll.scrollTop;
  settingsScroll.scrollTop = Math.max(0, Math.round(cardTop + card.offsetHeight - settingsScroll.clientHeight + 18));
}

function toggleHomeTagSearch() {
  if (!homeTagSearch || !homeTagSearchInput) {
    return;
  }

  const willOpen = !homeTagSearch.classList.contains("is-open");
  homeTagSearch.classList.toggle("is-open", willOpen);
  homeTagSearch.setAttribute("aria-hidden", willOpen ? "false" : "true");
  homeTagSearchButton?.classList.toggle("is-active", willOpen);
  if (willOpen) {
    homeTagSearchInput.focus();
    return;
  }

  closeHomeTagSearch();
}

function closeHomeTagSearch() {
  if (!homeTagSearch || !homeTagSearchInput || !homeTagSearch.classList.contains("is-open")) {
    return;
  }

  homeTagSearch.classList.remove("is-open");
  homeTagSearch.setAttribute("aria-hidden", "true");
  homeTagSearchButton?.classList.remove("is-active");
  homeTagSearchQuery = "";
  homeTagSearchInput.value = "";
  renderTagBoard();
}

function handleHomeTagSearchInput(event) {
  homeTagSearchQuery = String(event.target?.value || "").trim().toLocaleLowerCase();
  renderTagBoard();
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

  const sections = Array.from(settingsScroll.querySelectorAll("[data-trail-section]:not(.hidden)"));
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
  if (SUPPORTS_SCROLL_DRIVEN_FADE) {
    return;
  }
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

  for (const target of fadeTargets) {
    target.style.opacity = "";
    target.style.pointerEvents = "";
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

function updateHistoryCountLabel() {
  if (!appState) {
    return;
  }
  historyCountLabel.textContent = `最近保留 ${appState.settings.historyLimit} 条（仅本机），目前 ${appState.history.length} 条`;
}

function renderSettingsHistoryList() {
  if (!settingsHistoryList || !appState) {
    return;
  }
  if (!appState.history.length) {
    settingsHistoryList.innerHTML = '<div class="editor-tip">当前浏览器还没有搜索历史。</div>';
    return;
  }

  settingsHistoryList.innerHTML = appState.history.map((entry) => {
    const engine = appState.engines.find((item) => item.id === entry.engineId);
    return `
      <div class="settings-history-item">
        <div class="settings-history-detail">
          <strong>${escapeHtml(entry.query)}</strong>
          <span>${escapeHtml(engine?.name || "搜索")} · ${escapeHtml(formatPreciseTime(entry.createdAt))}</span>
        </div>
        <button class="ghost-button danger" type="button" data-delete-history="${escapeAttribute(entry.id)}" aria-label="删除搜索记录 ${escapeAttribute(entry.query)}">删除</button>
      </div>
    `;
  }).join("");
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

  const cachedSource = normalizeIconSource(iconSourceCache[host] || "");
  if (cachedSource.startsWith("data:") && cachedSource !== source) {
    syncIconNodesByHost(host, cachedSource);
    imageNode.src = cachedSource;
    return;
  }

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

function getLinkIconHost(rawUrl) {
  const url = parseUrlWithFallback(rawUrl);
  return sanitizeIconHost(url?.host?.replace(/^www\./, "") || "");
}

function loadIconDiscoverLog() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ICON_DISCOVER_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function recordIconDiscoverAttempt(host) {
  try {
    const now = Date.now();
    const log = Object.fromEntries(
      Object.entries(loadIconDiscoverLog()).filter(([, time]) => now - Number(time) < ICON_DISCOVER_RETRY_MS)
    );
    log[host] = now;
    window.localStorage.setItem(ICON_DISCOVER_STORAGE_KEY, JSON.stringify(log));
  } catch {
    // Storage may be unavailable; discovery simply runs again next time.
  }
}

function needsIconDiscovery(host) {
  const cachedSource = normalizeIconSource(iconSourceCache[host] || "");
  return !cachedSource || GENERIC_ICON_SERVICE_PATTERN.test(cachedSource);
}

let iconDiscoverKnownUrls = null;

function scheduleIconDiscovery() {
  if (!authState.loggedIn || !appState) {
    return;
  }
  const currentUrls = new Set(appState.categories.flatMap((category) => category.links.map((link) => link.url)));
  if (iconDiscoverKnownUrls) {
    currentUrls.forEach((rawUrl) => {
      const host = getLinkIconHost(rawUrl);
      if (!iconDiscoverKnownUrls.has(rawUrl) && host && needsIconDiscovery(host)) {
        queueIconDiscovery(rawUrl, { priority: true });
      }
    });
  }
  iconDiscoverKnownUrls = currentUrls;
  window.clearTimeout(iconDiscoverTimer);
  iconDiscoverTimer = window.setTimeout(() => {
    iconDiscoverTimer = 0;
    const log = loadIconDiscoverLog();
    const now = Date.now();
    appState.categories.forEach((category) => {
      category.links.forEach((link) => {
        const host = getLinkIconHost(link.url);
        if (host && needsIconDiscovery(host) && !(now - Number(log[host] || 0) < ICON_DISCOVER_RETRY_MS)) {
          queueIconDiscovery(link.url);
        }
      });
    });
  }, ICON_DISCOVER_DELAY_MS);
}

function queueIconDiscovery(rawUrl, { priority = false } = {}) {
  const url = parseUrlWithFallback(rawUrl);
  const host = getLinkIconHost(rawUrl);
  if (!authState.loggedIn || !url || !/^https?:$/.test(url.protocol) || !host) {
    return;
  }
  if (iconDiscoverPendingHosts.has(host)) {
    const queuedIndex = iconDiscoverQueue.findIndex((job) => job.host === host);
    if (priority && queuedIndex > 0) {
      iconDiscoverQueue.unshift(...iconDiscoverQueue.splice(queuedIndex, 1));
    }
    return;
  }
  iconDiscoverPendingHosts.add(host);
  const job = { host, url: url.toString() };
  if (priority) {
    iconDiscoverQueue.unshift(job);
  } else {
    iconDiscoverQueue.push(job);
  }
  pumpIconDiscoveryQueue();
}

function pumpIconDiscoveryQueue() {
  while (iconDiscoverActiveCount < ICON_DISCOVER_CONCURRENCY && iconDiscoverQueue.length) {
    const job = iconDiscoverQueue.shift();
    iconDiscoverActiveCount += 1;
    fetchJson("/api/icon-cache/discover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: job.url }),
    })
      .then((payload) => {
        const dataUrl = typeof payload?.dataUrl === "string" ? payload.dataUrl : "";
        if (!dataUrl) {
          return;
        }
        const mergedHosts = mergeIconSourceCacheEntries({ [job.host]: dataUrl }, { preferExisting: false });
        if (mergedHosts.length) {
          refreshResolvedIconHosts(mergedHosts);
        }
      })
      .catch((error) => {
        console.warn("icon discover failed", error);
      })
      .finally(() => {
        recordIconDiscoverAttempt(job.host);
        iconDiscoverPendingHosts.delete(job.host);
        iconDiscoverActiveCount -= 1;
        pumpIconDiscoveryQueue();
      });
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

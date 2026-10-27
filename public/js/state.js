// DOM references, constants and shared mutable state. Runs after the feature files (it calls loadIconSourceCache / loadPersistedBackgroundSnapshot) and before main.js.
// Classic script sharing the page's global scope; load order is defined in index.html.

﻿const searchForm = document.getElementById("searchForm");
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
const quickAddModal = document.getElementById("quickAddModal");
const quickAddForm = document.getElementById("quickAddForm");
const quickAddUrlInput = document.getElementById("quickAddUrlInput");
const quickAddNameInput = document.getElementById("quickAddNameInput");
const quickAddPreview = document.getElementById("quickAddPreview");
const quickAddMeta = document.getElementById("quickAddMeta");
const quickAddStatus = document.getElementById("quickAddStatus");
const quickAddMessage = document.getElementById("quickAddMessage");
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
const searchSuggestionsInput = document.getElementById("searchSuggestionsInput");
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
// v2: retry hosts whose earlier lookups failed before discovery learned manifest/root-path icons.
const ICON_DISCOVER_STORAGE_KEY = "mx_icon_discover_v2";
const PLACEHOLDER_ICON_SOURCE_PATTERN = /^https?:\/\/(?:[^/]+\.)?(?:unavatar\.io|icon\.horse)\//i;
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
    searchSuggestions: true,
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
// Search suggestions (engine autocomplete via /api/suggest) and dropdown keyboard state.
const SEARCH_SUGGEST_DEBOUNCE_MS = 140;
const SEARCH_DROPDOWN_HISTORY_WITH_QUERY = 4;
const searchSuggestCache = new Map();
let searchSuggestTimer = 0;
let searchSuggestController = null;
let searchDropdownTypedText = "";
let searchDropdownActiveIndex = -1;
let lastRenderedSuggestions = [];
// Homepage quick-add dialog
const QUICK_ADD_LOOKUP_DEBOUNCE_MS = 450;
let quickAddCategoryId = "";
let quickAddNameEdited = false;
let quickAddLookupTimer = 0;
let quickAddLookupController = null;
let quickAddLookupPromise = null;
let quickAddLookupUrl = "";
let syncModalBackupLimit = 10;
let syncModalAutoBackup = null;
let syncModalAutoBackups = [];
let syncAutoHistoryOpen = false;
// Field-level sync (sync.js). Pushes are tiny, so they go out shortly after the last change.
const SYNC_STORE_KEY = "mx_sync_v2";
const SYNC_PUSH_DELAY_MS = 1500;
const SYNC_RETRY_MS = 15 * 1000;
// Pull when the page is shown / focused, when the user starts interacting (if the last sync is older
// than 30s), and as a safety net every 10 min for a visible page nobody touches. Idle = no requests.
const SYNC_POLL_INTERVAL_MS = 10 * 60 * 1000;
const SYNC_ACTIVITY_PULL_GAP_MS = 30 * 1000;
const SYNC_PULL_MIN_GAP_MS = 3000;
let syncViewDoc = null; // the doc this tab is showing (base + unsent ops)
let lastRenderedSyncKey = "";
let syncPushTimer = 0;
let syncPhase = "idle"; // idle | pushing | offline
let lastSyncPullAt = 0;
// Doc the open settings draft was cloned from: saving diffs the draft against it, so only what was
// edited in the drawer is sent and changes made meanwhile elsewhere are kept.
let settingsDraftBaseDoc = null;
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

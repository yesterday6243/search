const crypto = require("crypto");
const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const PORT = Number(process.env.PORT) || 3000;
const HISTORY_LIMIT = 100;
const USER_LIMIT = 50;
const PASSWORD_MIN_LENGTH = 8;
const SESSION_COOKIE_NAME = "mx_search_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const publicDir = path.join(__dirname, "public");
const databasePath = path.join(__dirname, "searchindex.db");
const BING_HOST = "https://cn.bing.com";
const BING_RECENT_MIN = 1;
const BING_RECENT_MAX = 8;
const BING_RECENT_DEFAULT = 8;
const ICON_CACHE_MAX_ENTRIES = 300;
const ICON_CACHE_FETCH_LIMIT = 120;
const ICON_CACHE_ENTRY_MAX_BYTES = 512 * 1024;

const defaultState = {
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
      bingRecentCount: BING_RECENT_DEFAULT,
    },
    historyLimit: HISTORY_LIMIT,
  },
  engines: [
    {
      id: "google",
      name: "Google",
      urlTemplate: "https://www.google.com/search?q=%s",
    },
    {
      id: "bing",
      name: "Bing",
      urlTemplate: "https://www.bing.com/search?q=%s",
    },
    {
      id: "baidu",
      name: "Baidu",
      urlTemplate: "https://www.baidu.com/s?wd=%s",
    },
    {
      id: "duckduckgo",
      name: "DuckDuckGo",
      urlTemplate: "https://duckduckgo.com/?q=%s",
    },
    {
      id: "github",
      name: "GitHub",
      urlTemplate: "https://github.com/search?q=%s",
    },
  ],
  selectedEngineId: "google",
  categories: [
    {
      id: "cat_ai",
      name: "AI",
      links: [
        { id: "openai", label: "OpenAI", url: "https://openai.com/" },
        { id: "huggingface", label: "Hugging Face", url: "https://huggingface.co/" },
        { id: "kimi", label: "Kimi", url: "https://kimi.moonshot.cn/" },
        { id: "claude", label: "Claude", url: "https://claude.ai/" },
        { id: "perplexity", label: "Perplexity", url: "https://www.perplexity.ai/" },
        { id: "replicate", label: "Replicate", url: "https://replicate.com/" },
        { id: "coze", label: "Coze", url: "https://www.coze.com/" },
        { id: "waytoagi", label: "WayToAGI", url: "https://www.waytoagi.com/" },
        { id: "poe", label: "Poe", url: "https://poe.com/" },
        { id: "lmarena", label: "LMArena", url: "https://lmarena.ai/" },
      ],
    },
    {
      id: "cat_dev",
      name: "开发",
      links: [
        { id: "github_home", label: "GitHub", url: "https://github.com/" },
        { id: "npm", label: "npm", url: "https://www.npmjs.com/" },
        { id: "mdn", label: "MDN", url: "https://developer.mozilla.org/" },
        { id: "vercel", label: "Vercel", url: "https://vercel.com/" },
        { id: "cloudflare", label: "Cloudflare", url: "https://dash.cloudflare.com/" },
        { id: "stackoverflow", label: "StackOverflow", url: "https://stackoverflow.com/" },
        { id: "vite", label: "Vite", url: "https://vite.dev/" },
        { id: "nodejs", label: "Node.js", url: "https://nodejs.org/" },
        { id: "docker", label: "Docker", url: "https://www.docker.com/" },
        { id: "figma_dev", label: "Figma", url: "https://www.figma.com/" },
      ],
    },
    {
      id: "cat_media",
      name: "内容",
      links: [
        { id: "bilibili", label: "Bilibili", url: "https://www.bilibili.com/" },
        { id: "youtube", label: "YouTube", url: "https://www.youtube.com/" },
        { id: "juejin", label: "掘金", url: "https://juejin.cn/" },
        { id: "zhihu", label: "知乎", url: "https://www.zhihu.com/" },
        { id: "sspai", label: "少数派", url: "https://sspai.com/" },
        { id: "wechat", label: "微信读书", url: "https://weread.qq.com/" },
        { id: "x", label: "X", url: "https://x.com/" },
        { id: "reddit", label: "Reddit", url: "https://www.reddit.com/" },
        { id: "news", label: "Google News", url: "https://news.google.com/" },
        { id: "feishu", label: "飞书", url: "https://www.feishu.cn/" },
      ],
    },
  ],
  history: [],
};

const defaultCategoryNameById = new Map(
  defaultState.categories.map((category) => [category.id, category.name])
);
const defaultLinkLabelById = new Map(
  defaultState.categories.flatMap((category) =>
    category.links.map((link) => [link.id, link.label])
  )
);

const bingBackgroundCacheByCount = new Map();

const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
ensureDatabaseSchema();

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(publicDir));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/auth/status", (req, res) => {
  cleanupExpiredSessions();
  const authUser = getAuthUserFromRequest(req);
  const userCount = getUserCount();
  res.json({
    loggedIn: Boolean(authUser),
    username: authUser?.username || "",
    userCount,
    userLimit: USER_LIMIT,
    canRegister: userCount < USER_LIMIT,
  });
});

app.post("/api/auth/register", (req, res) => {
  cleanupExpiredSessions();
  const username = sanitizeUsername(req.body?.username);
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!username) {
    res.status(400).json({ message: "用户名格式无效（3-32位，不能含空格）" });
    return;
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    res.status(400).json({ message: `密码至少 ${PASSWORD_MIN_LENGTH} 位` });
    return;
  }

  const userCount = getUserCount();
  if (userCount >= USER_LIMIT) {
    res.status(409).json({
      code: "USER_LIMIT_REACHED",
      message: "注册人数已达上限（50）",
      userCount,
      userLimit: USER_LIMIT,
      canRegister: false,
    });
    return;
  }

  const normalized = normalizeUsername(username);
  const existing = db
    .prepare("SELECT id FROM users WHERE username_normalized = ?")
    .get(normalized);
  if (existing) {
    res.status(409).json({ code: "USERNAME_EXISTS", message: "账号已存在" });
    return;
  }

  const passwordBundle = hashPassword(password);
  const now = new Date().toISOString();
  const insert = db.prepare(
    `
      INSERT INTO users (
        username,
        username_normalized,
        password_hash,
        password_salt,
        password_algo,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `
  ).run(
    username,
    normalized,
    passwordBundle.hashHex,
    passwordBundle.saltHex,
    passwordBundle.algo,
    now
  );

  const userId = Number(insert.lastInsertRowid);
  ensureUserState(userId, readDefaultStateSeed());
  const sessionToken = createSession(userId);
  setSessionCookie(res, req, sessionToken);

  const nextCount = getUserCount();
  res.status(201).json({
    ok: true,
    username,
    userCount: nextCount,
    userLimit: USER_LIMIT,
    canRegister: nextCount < USER_LIMIT,
  });
});

app.post("/api/auth/login", (req, res) => {
  cleanupExpiredSessions();
  const username = sanitizeUsername(req.body?.username);
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!username || !password) {
    res.status(400).json({ message: "请输入账号和密码" });
    return;
  }

  const normalized = normalizeUsername(username);
  const user = db
    .prepare(
      `
        SELECT id, username, password_hash, password_salt, password_algo
        FROM users
        WHERE username_normalized = ?
      `
    )
    .get(normalized);

  if (!user || !verifyPassword(password, user.password_salt, user.password_hash)) {
    res.status(401).json({ message: "账号或密码错误" });
    return;
  }

  ensureUserState(user.id);
  const sessionToken = createSession(user.id);
  setSessionCookie(res, req, sessionToken);

  const userCount = getUserCount();
  res.json({
    ok: true,
    username: user.username,
    userCount,
    userLimit: USER_LIMIT,
    canRegister: userCount < USER_LIMIT,
  });
});

app.post("/api/auth/logout", (req, res) => {
  const sessionToken = readCookie(req.headers.cookie, SESSION_COOKIE_NAME);
  if (sessionToken) {
    db.prepare("DELETE FROM user_sessions WHERE token_hash = ?").run(hashToken(sessionToken));
  }
  clearSessionCookie(res, req);
  res.json({ ok: true });
});

app.get("/api/background/bing", async (req, res) => {
  try {
    const requestedCount = sanitizeBingRecentCount(req.query?.n, BING_RECENT_DEFAULT);
    const payload = await getBingBackgroundPayload(requestedCount);
    res.json(payload);
  } catch (error) {
    res.status(502).json({
      message: "failed to fetch bing backgrounds",
      images: [],
      fetchedAt: new Date().toISOString(),
    });
  }
});

app.get("/api/state", requireAuth, (req, res) => {
  res.json(getStateRecord(req.authUser.id));
});

app.put("/api/state", requireAuth, (req, res) => {
  const patch = req.body && typeof req.body === "object" ? req.body : {};
  const nextRecord = mutateState(req.authUser.id, (current) => mergeState(current, patch));
  res.json(nextRecord);
});

app.get("/api/backups", requireAuth, (req, res) => {
  res.json({
    backups: listUserBackups(req.authUser.id),
  });
});

app.get("/api/backups/:backupId", requireAuth, (req, res) => {
  const backup = getUserBackupRecord(req.authUser.id, req.params.backupId);
  if (!backup) {
    res.status(404).json({ message: "备份不存在" });
    return;
  }
  res.json(backup);
});

app.post("/api/backups", requireAuth, (req, res) => {
  const inputState = req.body?.state;
  if (!inputState || typeof inputState !== "object" || Array.isArray(inputState)) {
    res.status(400).json({ message: "state is required" });
    return;
  }

  const backup = createUserBackup(req.authUser.id, inputState);
  res.status(201).json(backup);
});

app.delete("/api/backups/:backupId", requireAuth, (req, res) => {
  const deleted = deleteUserBackup(req.authUser.id, req.params.backupId);
  if (!deleted) {
    res.status(404).json({ message: "备份不存在" });
    return;
  }
  res.json({
    ok: true,
    backups: listUserBackups(req.authUser.id),
  });
});

app.post("/api/icon-cache/default/query", requireAuth, (req, res) => {
  const hosts = sanitizeIconHostList(req.body?.hosts);
  res.json({
    iconCache: readDefaultIconCache(hosts),
  });
});

app.post("/api/icon-cache/default/promote", requireAuth, async (req, res) => {
  const entries = sanitizeIconCachePromoteEntries(req.body?.entries);
  if (!entries.length) {
    res.json({ ok: true, iconCache: {} });
    return;
  }

  try {
    const iconCache = await promoteDefaultIconCacheEntries(entries);
    res.json({ ok: true, iconCache });
  } catch (error) {
    console.error("default icon cache promote failed", error);
    res.status(502).json({ message: "图标缓存同步失败" });
  }
});

app.post("/api/history", requireAuth, (req, res) => {
  const query = sanitizeText(req.body?.query, "").slice(0, 120);
  const engineId = sanitizeText(req.body?.engineId, "");

  if (!query) {
    res.status(400).json({ message: "query is required" });
    return;
  }

  const nextRecord = mutateState(req.authUser.id, (current) => {
    const activeEngineId = current.engines.some((engine) => engine.id === engineId)
      ? engineId
      : current.selectedEngineId;

    const nextHistory = [
      {
        id: createId("history"),
        query,
        engineId: activeEngineId,
        createdAt: new Date().toISOString(),
      },
      ...current.history.filter(
        (entry) => !(entry.query === query && entry.engineId === activeEngineId)
      ),
    ].slice(0, HISTORY_LIMIT);

    return {
      ...current,
      history: nextHistory,
    };
  });

  res.status(201).json(nextRecord);
});

app.delete("/api/history", requireAuth, (req, res) => {
  const historyId = sanitizeText(req.query.id, "");
  const nextRecord = mutateState(req.authUser.id, (current) => ({
    ...current,
    history: historyId
      ? current.history.filter((entry) => entry.id !== historyId)
      : [],
  }));

  res.json(nextRecord);
});

app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Search homepage is running at http://localhost:${PORT}`);
});

function ensureDatabaseSchema() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      username_normalized TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      password_algo TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS user_state (
      user_id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS user_backups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_user_backups_user_created
    ON user_backups(user_id, created_at DESC)
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS app_icon_cache (
      host TEXT PRIMARY KEY,
      data_url TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id
    ON user_sessions(user_id)
  `).run();
}

function requireAuth(req, res, next) {
  cleanupExpiredSessions();
  const authUser = getAuthUserFromRequest(req);
  if (!authUser) {
    res.status(401).json({ message: "请先登录", requiresAuth: true });
    return;
  }
  req.authUser = authUser;
  next();
}

function getAuthUserFromRequest(req) {
  const sessionToken = readCookie(req.headers.cookie, SESSION_COOKIE_NAME);
  if (!sessionToken) {
    return null;
  }

  const session = db
    .prepare(
      `
        SELECT
          s.id AS session_id,
          s.user_id AS user_id,
          s.expires_at AS expires_at,
          u.username AS username
        FROM user_sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ?
      `
    )
    .get(hashToken(sessionToken));

  if (!session) {
    return null;
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    db.prepare("DELETE FROM user_sessions WHERE id = ?").run(session.session_id);
    return null;
  }

  return {
    id: session.user_id,
    username: session.username,
    sessionId: session.session_id,
  };
}

function cleanupExpiredSessions() {
  const now = new Date().toISOString();
  db.prepare("DELETE FROM user_sessions WHERE expires_at <= ?").run(now);
}

function getUserCount() {
  const row = db.prepare("SELECT COUNT(*) AS count FROM users").get();
  return Number(row?.count || 0);
}

function sanitizeUsername(value) {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.length < 3 || trimmed.length > 32) {
    return "";
  }
  if (/\s/.test(trimmed)) {
    return "";
  }
  return trimmed;
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashBuffer = crypto.scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  });
  return {
    algo: "scrypt-N16384-r8-p1-l64",
    saltHex: salt,
    hashHex: hashBuffer.toString("hex"),
  };
}

function verifyPassword(password, saltHex, hashHex) {
  if (!saltHex || !hashHex) {
    return false;
  }

  try {
    const hashBuffer = Buffer.from(hashHex, "hex");
    const derived = crypto.scryptSync(password, saltHex, hashBuffer.length, {
      N: 16384,
      r: 8,
      p: 1,
    });

    if (derived.length !== hashBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(derived, hashBuffer);
  } catch {
    return false;
  }
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const now = new Date();
  const nowIso = now.toISOString();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
  db.prepare(
    `
      INSERT INTO user_sessions (user_id, token_hash, created_at, expires_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?)
    `
  ).run(userId, hashToken(token), nowIso, expiresAt, nowIso);
  return token;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function setSessionCookie(res, req, token) {
  const secure = isSecureRequest(req);
  const cookie = serializeCookie(SESSION_COOKIE_NAME, token, {
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    secure,
  });
  res.setHeader("Set-Cookie", cookie);
}

function clearSessionCookie(res, req) {
  const secure = isSecureRequest(req);
  const cookie = serializeCookie(SESSION_COOKIE_NAME, "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    secure,
  });
  res.setHeader("Set-Cookie", cookie);
}

function isSecureRequest(req) {
  if (req.secure) {
    return true;
  }
  const forwarded = String(req.headers["x-forwarded-proto"] || "");
  return forwarded.split(",").map((item) => item.trim()).includes("https");
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || "/"}`);

  if (Number.isFinite(options.maxAge)) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }
  if (options.httpOnly) {
    parts.push("HttpOnly");
  }
  if (options.secure) {
    parts.push("Secure");
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }
  return parts.join("; ");
}

function readCookie(cookieHeader, cookieName) {
  if (!cookieHeader || typeof cookieHeader !== "string") {
    return "";
  }
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [rawName, ...rawValue] = pair.trim().split("=");
    if (rawName === cookieName) {
      return decodeURIComponent(rawValue.join("="));
    }
  }
  return "";
}

function readDefaultStateSeed() {
  const row = db.prepare("SELECT data FROM app_state WHERE id = 1").get();
  if (!row?.data) {
    return structuredClone(defaultState);
  }
  const parsed = safelyParse(row.data);
  return sanitizeState(parsed, defaultState);
}

function ensureUserState(userId, seedState = null) {
  const row = db.prepare("SELECT user_id FROM user_state WHERE user_id = ?").get(userId);
  if (row) {
    return;
  }

  const seed = sanitizeState(seedState || readDefaultStateSeed(), defaultState);
  const now = new Date().toISOString();
  db.prepare(
    `
      INSERT INTO user_state (user_id, data, updated_at)
      VALUES (?, ?, ?)
    `
  ).run(userId, JSON.stringify(seed), now);
}

function getStateRecord(userId) {
  ensureUserState(userId);

  const row = db
    .prepare("SELECT data, updated_at FROM user_state WHERE user_id = ?")
    .get(userId);
  const parsed = row ? safelyParse(row.data) : structuredClone(defaultState);
  const state = sanitizeState(parsed, defaultState);
  const parsedSerialized = JSON.stringify(parsed);
  const stateSerialized = JSON.stringify(state);

  if (row && parsedSerialized !== stateSerialized) {
    const healedAt = new Date().toISOString();
    db.prepare("UPDATE user_state SET data = ?, updated_at = ? WHERE user_id = ?").run(
      stateSerialized,
      healedAt,
      userId
    );

    return {
      state,
      updatedAt: healedAt,
    };
  }

  return {
    state,
    updatedAt: row?.updated_at || new Date().toISOString(),
  };
}

function listUserBackups(userId) {
  return db
    .prepare(
      `
        SELECT id, created_at
        FROM user_backups
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 3
      `
    )
    .all(userId)
    .map((row) => ({
      id: String(row.id),
      createdAt: row.created_at,
    }));
}

function getUserBackupRecord(userId, backupId) {
  const numericId = Number(backupId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  const row = db
    .prepare(
      `
        SELECT id, data, created_at
        FROM user_backups
        WHERE user_id = ? AND id = ?
      `
    )
    .get(userId, numericId);

  if (!row?.data) {
    return null;
  }

  return {
    id: String(row.id),
    createdAt: row.created_at,
    state: sanitizeState(safelyParse(row.data), defaultState),
  };
}

function createUserBackup(userId, inputState) {
  const state = sanitizeState(inputState, defaultState);
  const createdAt = new Date().toISOString();
  const insert = db.prepare(
    `
      INSERT INTO user_backups (user_id, data, created_at)
      VALUES (?, ?, ?)
    `
  ).run(userId, JSON.stringify(state), createdAt);

  db.prepare(
    `
      DELETE FROM user_backups
      WHERE user_id = ?
        AND id NOT IN (
          SELECT id
          FROM user_backups
          WHERE user_id = ?
          ORDER BY created_at DESC, id DESC
          LIMIT 3
        )
    `
  ).run(userId, userId);

  return {
    id: String(insert.lastInsertRowid),
    createdAt,
    backups: listUserBackups(userId),
  };
}

function deleteUserBackup(userId, backupId) {
  const numericId = Number(backupId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return false;
  }

  const result = db
    .prepare(
      `
        DELETE FROM user_backups
        WHERE user_id = ? AND id = ?
      `
    )
    .run(userId, numericId);

  return result.changes > 0;
}

function readDefaultIconCache(hosts = []) {
  const safeHosts = sanitizeIconHostList(hosts);
  const rows = safeHosts.length
    ? db
        .prepare(
          `SELECT host, data_url FROM app_icon_cache WHERE host IN (${safeHosts
            .map(() => "?")
            .join(", ")})`
        )
        .all(...safeHosts)
    : db
        .prepare(
          `
            SELECT host, data_url
            FROM app_icon_cache
            ORDER BY updated_at DESC
            LIMIT ?
          `
        )
        .all(ICON_CACHE_MAX_ENTRIES);

  return Object.fromEntries(
    rows
      .map((row) => [sanitizeIconHost(row.host), sanitizeDataUrl(row.data_url)])
      .filter(([host, dataUrl]) => host && dataUrl)
  );
}

async function promoteDefaultIconCacheEntries(entries) {
  const incoming = Array.isArray(entries) ? entries.slice(0, ICON_CACHE_FETCH_LIMIT) : [];
  const requestedHosts = incoming
    .map((entry) => sanitizeIconHost(entry.host))
    .filter(Boolean);
  const existingCache = readDefaultIconCache(requestedHosts);
  const nextEntries = [];

  for (const entry of incoming) {
    const host = sanitizeIconHost(entry.host);
    const source = sanitizeIconSourceValue(entry.source);
    if (!host || !source || existingCache[host]) {
      continue;
    }

    try {
      const dataUrl = source.startsWith("data:")
        ? sanitizeDataUrl(source)
        : await fetchRemoteIconAsDataUrl(source);
      if (!dataUrl) {
        continue;
      }

      nextEntries.push({
        host,
        dataUrl,
      });
      existingCache[host] = dataUrl;
    } catch (error) {
      console.warn(`icon promote skipped for ${host}:`, error?.message || error);
    }
  }

  if (nextEntries.length) {
    const now = new Date().toISOString();
    const statement = db.prepare(
      `
        INSERT INTO app_icon_cache (host, data_url, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(host) DO UPDATE SET
          data_url = excluded.data_url,
          updated_at = excluded.updated_at
      `
    );
    const transaction = db.transaction((items) => {
      items.forEach((item) => {
        statement.run(item.host, item.dataUrl, now);
      });
    });
    transaction(nextEntries);
  }

  return Object.fromEntries(
    requestedHosts
      .map((host) => [host, existingCache[host] || ""])
      .filter(([, dataUrl]) => dataUrl)
  );
}

function mutateState(userId, updater) {
  const current = getStateRecord(userId).state;
  const candidate = updater(structuredClone(current));
  const state = sanitizeState(candidate, current);
  const updatedAt = new Date().toISOString();

  db.prepare(
    `
      UPDATE user_state
      SET data = ?, updated_at = ?
      WHERE user_id = ?
    `
  ).run(JSON.stringify(state), updatedAt, userId);

  return { state, updatedAt };
}

function mergeState(current, patch) {
  return {
    ...current,
    ...patch,
    settings: {
      ...current.settings,
      ...(patch.settings || {}),
      background: {
        ...current.settings.background,
        ...(patch.settings?.background || {}),
      },
    },
    engines: Array.isArray(patch.engines) ? patch.engines : current.engines,
    categories: Array.isArray(patch.categories) ? patch.categories : current.categories,
    history: Array.isArray(patch.history) ? patch.history : current.history,
    selectedEngineId:
      typeof patch.selectedEngineId === "string"
        ? patch.selectedEngineId
        : current.selectedEngineId,
  };
}

function sanitizeState(input, fallback = defaultState) {
  const source = input && typeof input === "object" ? input : {};
  const settings = sanitizeSettings(source.settings, fallback.settings);
  const engines =
    source.engines !== undefined
      ? sanitizeEngines(source.engines, fallback.engines)
      : sanitizeEngines(fallback.engines, defaultState.engines);
  const categories =
    source.categories !== undefined
      ? sanitizeCategories(source.categories, fallback.categories)
      : sanitizeCategories(fallback.categories, defaultState.categories);
  const selectedEngineId = engines.some((engine) => engine.id === source.selectedEngineId)
    ? source.selectedEngineId
    : engines[0].id;
  const history =
    source.history !== undefined
      ? sanitizeHistory(source.history, engines, selectedEngineId)
      : sanitizeHistory(fallback.history, engines, selectedEngineId);

  return {
    settings,
    engines,
    selectedEngineId,
    categories,
    history,
  };
}

function sanitizeSettings(input, fallback) {
  const source = input && typeof input === "object" ? input : {};
  const background = source.background && typeof source.background === "object"
    ? source.background
    : fallback.background;
  const allowedProviders = new Set(["picsum_seed", "custom_url", "bing_hourly"]);
  const provider = allowedProviders.has(background.provider) ? background.provider : "bing_hourly";

  return {
    siteTitle: normalizeSiteTitle(
      sanitizeText(source.siteTitle, fallback.siteTitle).slice(0, 32) || fallback.siteTitle
    ),
    subtitle: normalizePlaceholderText(
      sanitizeText(source.subtitle, fallback.subtitle).slice(0, 80) || fallback.subtitle
    ),
    searchBarHeight: sanitizeSearchBarHeight(
      source.searchBarHeight,
      fallback.searchBarHeight
    ),
    tagOpacity: sanitizeTagOpacity(
      source.tagOpacity,
      fallback.tagOpacity
    ),
    background: {
      provider,
      seed: sanitizeText(background.seed, fallback.background.seed).slice(0, 60) || fallback.background.seed,
      customUrl:
        provider === "custom_url"
          ? sanitizePublicUrl(background.customUrl) || fallback.background.customUrl
          : sanitizePublicUrl(background.customUrl) || "",
      overlayOpacity: sanitizeOpacity(background.overlayOpacity, fallback.background.overlayOpacity),
      bingRecentCount: sanitizeBingRecentCount(
        background.bingRecentCount,
        fallback.background.bingRecentCount
      ),
    },
    historyLimit: HISTORY_LIMIT,
  };
}

async function getBingBackgroundPayload(recentCount = BING_RECENT_DEFAULT) {
  const safeRecentCount = sanitizeBingRecentCount(recentCount, BING_RECENT_DEFAULT);
  const endpoint = `${BING_HOST}/HPImageArchive.aspx?format=js&idx=0&n=${safeRecentCount}&mkt=zh-CN`;
  const now = Date.now();
  const cached = bingBackgroundCacheByCount.get(safeRecentCount);
  if (cached?.images?.length && now < cached.expiresAt) {
    return {
      provider: "bing_hourly",
      images: cached.images,
      fetchedAt: cached.fetchedAt,
      recentCount: safeRecentCount,
    };
  }

  const response = await fetch(endpoint, {
    headers: {
      "User-Agent": "mx-search/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`bing endpoint failed: ${response.status}`);
  }

  const body = await response.json();
  const images = Array.isArray(body?.images)
    ? body.images
        .map((item) => {
          const relativeUrl = sanitizeText(item?.url, "");
          const relativeUrlBase = sanitizeText(item?.urlbase, "");
          const bestRelative = relativeUrl || (relativeUrlBase ? `${relativeUrlBase}_1920x1080.jpg` : "");
          if (!bestRelative) {
            return null;
          }

          const fullUrl = new URL(bestRelative, BING_HOST).toString();
          return {
            url: fullUrl,
            title: sanitizeText(item?.title, ""),
            copyright: sanitizeText(item?.copyright, ""),
          };
        })
        .filter(Boolean)
    : [];

  if (!images.length && cached?.images?.length) {
    return {
      provider: "bing_hourly",
      images: cached.images,
      fetchedAt: cached.fetchedAt,
      recentCount: safeRecentCount,
    };
  }

  const fetchedAt = new Date().toISOString();
  bingBackgroundCacheByCount.set(safeRecentCount, {
    expiresAt: now + 1000 * 60 * 20,
    images,
    fetchedAt,
  });

  return {
    provider: "bing_hourly",
    images,
    fetchedAt,
    recentCount: safeRecentCount,
  };
}

function sanitizeEngines(input, fallback) {
  if (!Array.isArray(input)) {
    return sanitizeEngines(fallback, defaultState.engines);
  }

  const sanitized = input
    .map((engine, index) => {
      const name = sanitizeText(engine?.name, `搜索引擎 ${index + 1}`).slice(0, 24);
      const urlTemplate = sanitizeTemplateUrl(engine?.urlTemplate);
      if (!name || !urlTemplate) {
        return null;
      }

      return {
        id: sanitizeText(engine?.id, createId("engine")).slice(0, 40) || createId("engine"),
        name,
        urlTemplate,
      };
    })
    .filter(Boolean);

  return sanitized.length ? sanitized : structuredClone(defaultState.engines);
}

function sanitizeCategories(input, fallbackCategories = defaultState.categories) {
  if (!Array.isArray(input)) {
    return sanitizeCategories(fallbackCategories, defaultState.categories);
  }

  const fallbackCategoryMap = new Map(
    Array.isArray(fallbackCategories)
      ? fallbackCategories.map((category) => [category?.id, category])
      : []
  );

  const sanitized = input
    .map((category, categoryIndex) => {
      const categoryId = sanitizeText(category?.id, createId("category")).slice(0, 40) || createId("category");
      const fallbackCategory = fallbackCategoryMap.get(categoryId);
      const fallbackCategoryName =
        fallbackCategory?.name ||
        defaultCategoryNameById.get(categoryId) ||
        `分类 ${categoryIndex + 1}`;
      let name = sanitizeText(category?.name, fallbackCategoryName).slice(0, 18);
      if (isLikelyCorruptedText(name) && fallbackCategoryName) {
        name = fallbackCategoryName.slice(0, 18);
      }

      const fallbackLinkMap = new Map(
        Array.isArray(fallbackCategory?.links)
          ? fallbackCategory.links.map((link) => [link?.id, link])
          : []
      );
      const links = Array.isArray(category?.links)
        ? category.links
            .map((link, linkIndex) => {
              const linkId = sanitizeText(link?.id, createId("link")).slice(0, 40) || createId("link");
              const fallbackLink = fallbackLinkMap.get(linkId);
              const fallbackLabel =
                fallbackLink?.label ||
                defaultLinkLabelById.get(linkId) ||
                `标签 ${linkIndex + 1}`;
              let label = sanitizeText(link?.label, fallbackLabel).slice(0, 18);
              if (isLikelyCorruptedText(label) && fallbackLabel) {
                label = fallbackLabel.slice(0, 18);
              }
              const url = sanitizePublicUrl(link?.url);
              if (!label || !url) {
                return null;
              }

              return {
                id: linkId,
                label,
                url,
              };
            })
            .filter(Boolean)
        : [];

      return {
        id: categoryId,
        name,
        links,
      };
    })
    .filter(Boolean);

  return sanitized.length
    ? sanitized
    : sanitizeCategories(fallbackCategories, defaultState.categories);
}

function sanitizeHistory(input, engines, selectedEngineId) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((entry) => {
      const query = sanitizeText(entry?.query, "").slice(0, 120);
      if (!query) {
        return null;
      }

      const engineId = engines.some((engine) => engine.id === entry?.engineId)
        ? entry.engineId
        : selectedEngineId;
      const createdAt = new Date(entry?.createdAt || Date.now());

      return {
        id: sanitizeText(entry?.id, createId("history")).slice(0, 40) || createId("history"),
        query,
        engineId,
        createdAt: Number.isNaN(createdAt.getTime()) ? new Date().toISOString() : createdAt.toISOString(),
      };
    })
    .filter(Boolean)
    .slice(0, HISTORY_LIMIT);
}

function sanitizeText(value, fallback) {
  return typeof value === "string" ? value.trim() : fallback;
}

function sanitizeIconHost(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function sanitizeIconHostList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => sanitizeIconHost(item))
    .filter(Boolean)
    .slice(0, ICON_CACHE_FETCH_LIMIT)
    .filter((item, index, array) => array.indexOf(item) === index);
}

function sanitizeIconSourceValue(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("data:")) {
    return sanitizeDataUrl(trimmed);
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

function sanitizeIconCachePromoteEntries(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.entries(value)
    .map(([host, source]) => ({
      host: sanitizeIconHost(host),
      source: sanitizeIconSourceValue(source),
    }))
    .filter((entry) => entry.host && entry.source)
    .slice(0, ICON_CACHE_FETCH_LIMIT);
}

function sanitizeDataUrl(value) {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  if (!/^data:image\/[a-z0-9.+-]+;base64,/i.test(trimmed)) {
    return "";
  }
  if (trimmed.length > ICON_CACHE_ENTRY_MAX_BYTES * 2) {
    return "";
  }

  return isProbablyValidImageDataUrl(trimmed) ? trimmed : "";
}

async function fetchRemoteIconAsDataUrl(sourceUrl) {
  const response = await fetch(sourceUrl, {
    headers: {
      "User-Agent": "mx-search/1.0",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`icon fetch failed: ${response.status}`);
  }

  const mimeType = normalizeIconMimeType(response.headers.get("content-type"), sourceUrl);
  if (!mimeType) {
    throw new Error("icon content-type is not supported");
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (!buffer.length || buffer.length > ICON_CACHE_ENTRY_MAX_BYTES) {
    throw new Error("icon payload size is invalid");
  }
  if (!isProbablyValidImageBuffer(buffer, mimeType)) {
    throw new Error("icon payload content is invalid");
  }

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function isProbablyValidImageDataUrl(dataUrl) {
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) {
    return false;
  }

  try {
    const buffer = Buffer.from(dataUrl.slice(commaIndex + 1), "base64");
    if (!buffer.length) {
      return false;
    }

    const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/i);
    const mimeType = mimeMatch?.[1]?.toLowerCase() || "";
    return isProbablyValidImageBuffer(buffer, mimeType);
  } catch {
    return false;
  }
}

function isProbablyValidImageBuffer(buffer, mimeType = "") {
  if (!Buffer.isBuffer(buffer) || !buffer.length) {
    return false;
  }

  const prefix = buffer.subarray(0, 64).toString("utf8").trimStart().toLowerCase();
  if (prefix.startsWith("<!doctype html") || prefix.startsWith("<html")) {
    return false;
  }

  if (mimeType === "image/svg+xml") {
    return prefix.startsWith("<svg") || prefix.startsWith("<?xml") || prefix.includes("<svg");
  }

  const pngSignature = [0x89, 0x50, 0x4e, 0x47];
  if (pngSignature.every((value, index) => buffer[index] === value)) {
    return true;
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  if (buffer.subarray(0, 4).toString("ascii") === "GIF8") {
    return true;
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return true;
  }

  if (
    buffer.length >= 4 &&
    buffer[0] === 0x00 &&
    buffer[1] === 0x00 &&
    (buffer[2] === 0x01 || buffer[2] === 0x02) &&
    buffer[3] === 0x00
  ) {
    return true;
  }

  return false;
}

function normalizeIconMimeType(contentType, sourceUrl = "") {
  const normalized = typeof contentType === "string" ? contentType.split(";")[0].trim().toLowerCase() : "";
  const allowed = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/x-icon",
    "image/vnd.microsoft.icon",
  ]);

  if (allowed.has(normalized)) {
    return normalized === "image/vnd.microsoft.icon" ? "image/x-icon" : normalized;
  }

  const lowerUrl = typeof sourceUrl === "string" ? sourceUrl.toLowerCase() : "";
  if (lowerUrl.endsWith(".ico")) {
    return "image/x-icon";
  }
  if (lowerUrl.endsWith(".png")) {
    return "image/png";
  }
  if (lowerUrl.endsWith(".svg")) {
    return "image/svg+xml";
  }
  if (lowerUrl.endsWith(".webp")) {
    return "image/webp";
  }
  if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  return "";
}

function sanitizeOpacity(value, fallback = 100) {
  const source = Number.isFinite(Number(value)) ? Number(value) : Number(fallback);
  if (!Number.isFinite(source)) {
    return 100;
  }
  return Math.max(0, Math.min(100, Math.round(source)));
}

function sanitizeSearchBarHeight(value, fallback = 68) {
  const source = Number.isFinite(Number(value)) ? Number(value) : Number(fallback);
  if (!Number.isFinite(source)) {
    return 68;
  }
  return Math.max(52, Math.min(96, Math.round(source)));
}

function sanitizeTagOpacity(value, fallback = 94) {
  const source = Number.isFinite(Number(value)) ? Number(value) : Number(fallback);
  if (!Number.isFinite(source)) {
    return 94;
  }
  return Math.max(35, Math.min(100, Math.round(source)));
}

function sanitizeBingRecentCount(value, fallback = BING_RECENT_DEFAULT) {
  const source = Number.isFinite(Number(value)) ? Number(value) : Number(fallback);
  if (!Number.isFinite(source)) {
    return BING_RECENT_DEFAULT;
  }
  return Math.max(BING_RECENT_MIN, Math.min(BING_RECENT_MAX, Math.round(source)));
}

function isLikelyCorruptedText(value) {
  if (typeof value !== "string") {
    return true;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  return /^\?+$/.test(trimmed) || trimmed.includes("�");
}

function normalizePlaceholderText(value) {
  return value === "把常用搜索和常访问的网站，收在一个安静的首页里。"
    ? "搜索网页"
    : value;
}

function normalizeSiteTitle(value) {
  return value === "Shen Search" ? "mx search" : value;
}

function sanitizePublicUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

function sanitizeTemplateUrl(value) {
  if (typeof value !== "string" || !value.includes("%s")) {
    return "";
  }

  try {
    const probe = new URL(value.replace("%s", "search"));
    if (probe.protocol !== "http:" && probe.protocol !== "https:") {
      return "";
    }
    return value.trim();
  } catch {
    return "";
  }
}

function safelyParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return structuredClone(defaultState);
  }
}

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

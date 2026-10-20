const crypto = require("crypto");
const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const PORT = Number(process.env.PORT) || 3000;
const HOST = (typeof process.env.HOST === "string" && process.env.HOST.trim()) || "0.0.0.0";
const HISTORY_LIMIT = 100;
const USER_LIMIT = 50;
const USER_BACKUP_LIMIT = 10;
const PASSWORD_MIN_LENGTH = 8;
const SESSION_COOKIE_NAME = "mx_search_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const publicDir = path.join(__dirname, "public");
const databasePath =
  (typeof process.env.DATABASE_PATH === "string" && process.env.DATABASE_PATH.trim()) ||
  path.join(__dirname, "searchindex.db");
const BING_HOST = "https://cn.bing.com";
const BING_RECENT_MIN = 1;
const BING_RECENT_MAX = 8;
const BING_RECENT_DEFAULT = 8;
const ICON_CACHE_MAX_ENTRIES = 300;
const ICON_CACHE_FETCH_LIMIT = 120;
const ICON_CACHE_ENTRY_MAX_BYTES = 512 * 1024;
// Login brute-force protection (per client IP and per account).
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 10;
const LOGIN_BACKOFF_AFTER = 5;
const LOGIN_BACKOFF_BASE_MS = 1000;
const LOGIN_LIMITER_MAX_KEYS = 10000;

const defaultState = require('./default-state.json');

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
// Behind nginx / Docker the TCP peer is the proxy; trust X-Forwarded-For only from
// loopback and private networks so req.ip is the real client and can't be spoofed from outside.
app.set("trust proxy", parseTrustProxySetting(process.env.TRUST_PROXY));
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
    res.status(400).json({ message: "用户名格式无效（3-32位，不能包含空格）" });
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
  const now = Date.now();
  const limiterKeys = [`ip:${req.ip}`, `user:${normalized}`];
  const blockedMs = getLoginRetryAfterMs(limiterKeys, now);
  if (blockedMs > 0) {
    sendLoginRateLimited(res, blockedMs);
    return;
  }

  const user = db
    .prepare(
      `
        SELECT id, username, password_hash, password_salt, password_algo
        FROM users
        WHERE username_normalized = ?
      `
    )
    .get(normalized);

  // Unknown accounts still pay for one scrypt check so response time doesn't reveal which usernames exist.
  const passwordValid = user
    ? verifyPassword(password, user.password_salt, user.password_hash)
    : verifyPassword(password, DUMMY_PASSWORD.saltHex, DUMMY_PASSWORD.hashHex) && false;

  if (!passwordValid) {
    recordLoginFailure(limiterKeys, now);
    const retryMs = getLoginRetryAfterMs(limiterKeys, now);
    if (retryMs > 0) {
      sendLoginRateLimited(res, retryMs, "账号或密码错误。");
      return;
    }
    res.status(401).json({ message: "账号或密码错误" });
    return;
  }

  loginFailures.delete(`user:${normalized}`);

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
    backupLimit: USER_BACKUP_LIMIT,
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

app.patch("/api/backups/:backupId", requireAuth, (req, res) => {
  const backupName = sanitizeBackupName(req.body?.name);
  if (!backupName) {
    res.status(400).json({ message: "name is required" });
    return;
  }

  const backup = renameUserBackup(req.authUser.id, req.params.backupId, backupName);
  if (!backup) {
    res.status(404).json({ message: "备份不存在" });
    return;
  }

  res.json({
    ok: true,
    backup,
    backups: listUserBackups(req.authUser.id),
    backupLimit: USER_BACKUP_LIMIT,
  });
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
    backupLimit: USER_BACKUP_LIMIT,
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
    res.status(502).json({ message: "鍥炬爣缂撳瓨鍚屾澶辫触" });
  }
});

app.post("/api/icon-cache/discover", requireAuth, async (req, res) => {
  const pageUrl = sanitizeIconSourceValue(req.body?.url);
  if (!pageUrl || pageUrl.startsWith("data:")) {
    res.status(400).json({ message: "url is required" });
    return;
  }

  try {
    const host = new URL(pageUrl).host.replace(/^www\./, "").toLowerCase();
    const cachedDataUrl = readDefaultIconCache([host])[host];
    if (cachedDataUrl) {
      res.json({ ok: true, host, dataUrl: cachedDataUrl });
      return;
    }
    const dataUrl = await discoverPageIconAsDataUrl(pageUrl);
    if (!dataUrl) {
      res.json({ ok: true, host, dataUrl: "" });
      return;
    }
    db.prepare(
      `
        INSERT INTO app_icon_cache (host, data_url, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(host) DO UPDATE SET
          data_url = excluded.data_url,
          updated_at = excluded.updated_at
      `
    ).run(host, dataUrl, new Date().toISOString());
    res.json({ ok: true, host, dataUrl });
  } catch (error) {
    console.warn(`icon discover skipped for ${pageUrl}:`, error?.message || error);
    res.json({ ok: true, dataUrl: "" });
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

// Express 5 passes listen errors (e.g. EADDRINUSE) to this callback instead of throwing.
app.listen(PORT, HOST, (error) => {
  if (error) {
    console.error(`Failed to start on ${HOST}:${PORT}: ${error.code || error.message}`);
    process.exit(1);
  }
  console.log(`Search homepage is running at http://${HOST}:${PORT}`);
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
      name TEXT NOT NULL DEFAULT '',
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  try {
    db.prepare(`ALTER TABLE user_backups ADD COLUMN name TEXT NOT NULL DEFAULT ''`).run();
  } catch {}

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
    res.status(401).json({ message: "璇峰厛鐧诲綍", requiresAuth: true });
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

const loginFailures = new Map();
const DUMMY_PASSWORD = hashPassword(crypto.randomBytes(18).toString("hex"));

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of loginFailures) {
    if (now - entry.windowStart > LOGIN_WINDOW_MS && entry.blockedUntil <= now) {
      loginFailures.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

function parseTrustProxySetting(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return "loopback, uniquelocal";
  }
  if (raw === "true" || raw === "false") {
    return raw === "true";
  }
  return /^\d+$/.test(raw) ? Number(raw) : raw;
}

function getLoginRetryAfterMs(keys, now) {
  return keys.reduce((longest, key) => {
    const entry = loginFailures.get(key);
    return entry ? Math.max(longest, entry.blockedUntil - now) : longest;
  }, 0);
}

// Up to LOGIN_BACKOFF_AFTER failures are free; then waits double (1s, 2s, 4s…);
// at LOGIN_MAX_FAILURES the key is locked until its 15-minute window ends.
function recordLoginFailure(keys, now) {
  keys.forEach((key) => {
    let entry = loginFailures.get(key);
    if (!entry || now - entry.windowStart > LOGIN_WINDOW_MS) {
      entry = { count: 0, windowStart: now, blockedUntil: 0 };
    }
    entry.count += 1;
    if (entry.count >= LOGIN_MAX_FAILURES) {
      entry.blockedUntil = entry.windowStart + LOGIN_WINDOW_MS;
    } else if (entry.count >= LOGIN_BACKOFF_AFTER) {
      entry.blockedUntil = now + LOGIN_BACKOFF_BASE_MS * 2 ** (entry.count - LOGIN_BACKOFF_AFTER);
    }
    loginFailures.delete(key);
    loginFailures.set(key, entry);
  });
  while (loginFailures.size > LOGIN_LIMITER_MAX_KEYS) {
    loginFailures.delete(loginFailures.keys().next().value);
  }
}

function sendLoginRateLimited(res, retryMs, prefix = "") {
  const seconds = Math.max(1, Math.ceil(retryMs / 1000));
  const wait = seconds >= 60 ? `${Math.ceil(seconds / 60)} 分钟` : `${seconds} 秒`;
  res.set("Retry-After", String(seconds));
  res.status(429).json({
    message: `${prefix}尝试次数过多，请 ${wait}后再试`,
    retryAfter: seconds,
  });
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
        SELECT id, name, data, created_at
        FROM user_backups
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT ${USER_BACKUP_LIMIT}
      `
    )
    .all(userId)
    .map((row) => ({
      id: String(row.id),
      name: normalizeBackupName(row.name, row.created_at),
      createdAt: row.created_at,
      summary: summarizeBackupData(row.data),
    }));
}

// Lightweight content summary shown in the backup list (counts + payload size).
function summarizeBackupData(rawData) {
  const text = typeof rawData === "string" ? rawData : "";
  let state = null;
  try {
    state = JSON.parse(text);
  } catch {
    state = null;
  }
  const categories = Array.isArray(state?.categories) ? state.categories : [];
  return {
    categories: categories.length,
    links: categories.reduce((total, category) => total + (Array.isArray(category?.links) ? category.links.length : 0), 0),
    engines: Array.isArray(state?.engines) ? state.engines.length : 0,
    bytes: Buffer.byteLength(text, "utf8"),
  };
}

function getUserBackupRecord(userId, backupId) {
  const numericId = Number(backupId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  const row = db
    .prepare(
      `
        SELECT id, name, data, created_at
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
    name: normalizeBackupName(row.name, row.created_at),
    createdAt: row.created_at,
    state: sanitizeState(safelyParse(row.data), defaultState),
  };
}

function createUserBackup(userId, inputState) {
  const state = sanitizeState(inputState, defaultState);
  const createdAt = new Date().toISOString();
  const backupName = formatBackupName(createdAt);
  const insert = db.prepare(
    `
      INSERT INTO user_backups (user_id, name, data, created_at)
      VALUES (?, ?, ?, ?)
    `
  ).run(userId, backupName, JSON.stringify(state), createdAt);

  db.prepare(
    `
      DELETE FROM user_backups
      WHERE user_id = ?
        AND id NOT IN (
          SELECT id
          FROM user_backups
          WHERE user_id = ?
          ORDER BY created_at DESC, id DESC
          LIMIT ${USER_BACKUP_LIMIT}
        )
    `
  ).run(userId, userId);

  return {
    id: String(insert.lastInsertRowid),
    name: backupName,
    createdAt,
    backups: listUserBackups(userId),
    backupLimit: USER_BACKUP_LIMIT,
  };
}

function renameUserBackup(userId, backupId, backupName) {
  const numericId = Number(backupId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  const result = db
    .prepare(
      `
        UPDATE user_backups
        SET name = ?
        WHERE user_id = ? AND id = ?
      `
    )
    .run(backupName, userId, numericId);

  if (!result.changes) {
    return null;
  }

  return getUserBackupRecord(userId, numericId);
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
    brandLabel: sanitizeText(source.brandLabel, fallback.brandLabel || "mx search").slice(0, 24) || "mx search",
    iconTheme: ["graphite", "arcade", "candy", "blueprint", "sunset", "mint", "gold", "glitch", "paper", "space"].includes(source.iconTheme)
      ? source.iconTheme
      : "graphite",
    brandIconUrl: sanitizeBrandIconUrl(source.brandIconUrl),
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
      const name = sanitizeText(engine?.name, `鎼滅储寮曟搸 ${index + 1}`).slice(0, 24);
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
        `鍒嗙被 ${categoryIndex + 1}`;
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
                `鏍囩 ${linkIndex + 1}`;
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
        isPinned: Boolean(category?.isPinned),
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

const ICON_DISCOVER_HTML_MAX_BYTES = 1024 * 1024;

// Reads <link rel="icon"> declarations from the page itself, for sites whose icon
// is not at /favicon.ico (e.g. inline data: SVG icons or icons under custom paths).
async function discoverPageIconAsDataUrl(pageUrl) {
  await assertPublicHttpUrl(pageUrl);
  const response = await fetch(pageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; mx-search/1.0)",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`page fetch failed: ${response.status}`);
  }
  const contentType = response.headers.get("content-type") || "";
  if (contentType && !/html|xml/i.test(contentType)) {
    throw new Error("page is not html");
  }

  const html = await readResponseTextWithLimit(response, ICON_DISCOVER_HTML_MAX_BYTES);
  const finalUrl = response.url || pageUrl;
  const baseHref = findHtmlTags(html, "base").map((attrs) => attrs.href).find(Boolean);
  let baseUrl = finalUrl;
  try {
    baseUrl = baseHref ? new URL(baseHref, finalUrl).toString() : finalUrl;
  } catch {
    baseUrl = finalUrl;
  }

  const candidates = findHtmlTags(html, "link")
    .map((attrs) => {
      const rel = String(attrs.rel || "").toLowerCase().split(/\s+/);
      const href = String(attrs.href || "").trim();
      if (!href || !rel.some((item) => item === "icon" || item === "apple-touch-icon" || item === "apple-touch-icon-precomposed")) {
        return null;
      }
      const type = String(attrs.type || "").toLowerCase();
      const isSvg = type.includes("svg") || /\.svg(\?|#|$)/i.test(href) || /^data:image\/svg/i.test(href);
      const size = Math.max(
        0,
        ...String(attrs.sizes || "")
          .split(/\s+/)
          .map((item) => Number.parseInt(item, 10))
          .filter(Number.isFinite)
      );
      const score = isSvg ? 1000 : size ? Math.min(size, 512) : rel.includes("apple-touch-icon") ? 180 : 32;
      return { href, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  for (const candidate of candidates) {
    try {
      if (/^data:/i.test(candidate.href)) {
        const dataUrl = normalizeInlineIconDataUrl(candidate.href);
        if (dataUrl) {
          return dataUrl;
        }
        continue;
      }
      const iconUrl = new URL(candidate.href, baseUrl);
      if (iconUrl.protocol !== "http:" && iconUrl.protocol !== "https:") {
        continue;
      }
      await assertPublicHttpUrl(iconUrl.toString());
      return await fetchRemoteIconAsDataUrl(iconUrl.toString());
    } catch {
      // Try the next declared icon.
    }
  }
  return "";
}

async function assertPublicHttpUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("unsupported protocol");
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const { address } = await require("dns").promises.lookup(hostname);
  if (isPrivateIpAddress(address)) {
    throw new Error("private address is not allowed");
  }
}

function isPrivateIpAddress(address) {
  const ip = String(address || "").toLowerCase().replace(/^::ffff:/, "");
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }
  return ip === "::1" || ip === "::" || /^f[cd]/.test(ip) || /^fe[89ab]/.test(ip);
}

async function readResponseTextWithLimit(response, maxBytes) {
  if (!response.body?.getReader) {
    return (await response.text()).slice(0, maxBytes);
  }
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(Buffer.from(value));
    total += value.length;
    if (Buffer.from(value).toString("utf8").toLowerCase().includes("</head>")) {
      break;
    }
  }
  reader.cancel().catch(() => {});
  return Buffer.concat(chunks).subarray(0, maxBytes).toString("utf8");
}

// Minimal tag scanner that respects quoted attribute values, so inline SVG
// data URLs containing ">" do not cut a <link> tag short.
function findHtmlTags(html, tagName) {
  const results = [];
  const source = String(html || "");
  const pattern = new RegExp(`<${tagName}\\b`, "gi");
  let match;
  while ((match = pattern.exec(source))) {
    const attrs = {};
    let index = match.index + match[0].length;
    while (index < source.length) {
      while (/\s|\//.test(source[index] || "")) {
        index += 1;
      }
      if (index >= source.length || source[index] === ">") {
        break;
      }
      const nameMatch = /^[^\s=>\/]+/.exec(source.slice(index));
      if (!nameMatch) {
        index += 1;
        continue;
      }
      const name = nameMatch[0].toLowerCase();
      index += nameMatch[0].length;
      while (/\s/.test(source[index] || "")) {
        index += 1;
      }
      let value = "";
      if (source[index] === "=") {
        index += 1;
        while (/\s/.test(source[index] || "")) {
          index += 1;
        }
        const quote = source[index];
        if (quote === '"' || quote === "'") {
          const end = source.indexOf(quote, index + 1);
          value = source.slice(index + 1, end === -1 ? source.length : end);
          index = end === -1 ? source.length : end + 1;
        } else {
          const rawMatch = /^[^\s>]*/.exec(source.slice(index));
          value = rawMatch[0];
          index += value.length;
        }
      }
      attrs[name] = decodeHtmlEntities(value);
    }
    pattern.lastIndex = index;
    results.push(attrs);
  }
  return results;
}

function decodeHtmlEntities(value) {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_all, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&");
}

function normalizeInlineIconDataUrl(href) {
  const match = /^data:([^,;]+)((?:;[^,;]+)*),([\s\S]*)$/i.exec(String(href).trim());
  if (!match) {
    return "";
  }
  const mimeType = match[1].toLowerCase();
  if (!mimeType.startsWith("image/")) {
    return "";
  }
  if (/;base64/i.test(match[2])) {
    return sanitizeDataUrl(`data:${mimeType};base64,${match[3].replace(/\s+/g, "")}`);
  }
  let payload = match[3];
  try {
    payload = decodeURIComponent(payload);
  } catch {
    // Keep raw payload when it is not URI-encoded.
  }
  return sanitizeDataUrl(`data:${mimeType};base64,${Buffer.from(payload, "utf8").toString("base64")}`);
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

function sanitizeBackupName(value, fallback = "") {
  const trimmed = sanitizeText(value, fallback).slice(0, 32).trim();
  return trimmed;
}

function normalizeBackupName(value, createdAt) {
  const name = sanitizeBackupName(value);
  return name.replace(/^澶囦唤(?=\s|$)/, "备份") || formatBackupName(createdAt);
}

function formatBackupName(value) {
  const date = new Date(value || Date.now());
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `备份 ${year}/${month}/${day} ${hour}:${minute}`;
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

function sanitizeBrandIconUrl(value) {
  if (typeof value !== "string" || value.length > 500) {
    return "";
  }
  const url = sanitizePublicUrl(value);
  return url.startsWith("https://") && url.length <= 500 ? url : "";
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


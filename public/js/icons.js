// Site icons: source chain, local/server caches, failure cooldown, page-declared icon discovery.
// Classic script sharing the page's global scope; load order is defined in index.html.

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
  // icon.horse / unavatar.io are deliberately absent: for unknown sites they return a generic
  // 200 placeholder that looks like a success. Server-side discovery covers what this chain misses.
  const allSources = [pathNative, pathNativePng, s2DomainUrl, native, nativePng, duck, s2]
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
  // Tile icons load lazily: icons in collapsed rows or far below the fold don't compete for the network.
  const loading = className.includes("tile-icon") ? "lazy" : "eager";
  const imageMarkup = displaySource
    ? `<img class="mx-icon-image${readyClass}" src="${escapeAttribute(displaySource)}" data-icon-host="${escapeAttribute(iconHost)}" data-icon-chain="${escapeAttribute(chainSources.join("|"))}" data-icon-managed alt="" loading="${loading}" fetchpriority="low" decoding="async" />`
    : `<img class="mx-icon-image is-ready" src="${DEFAULT_ICON_DATA_URL}" alt="" loading="${loading}" fetchpriority="low" decoding="async" />`;

  return `
    <span class="${className}">
      ${imageMarkup}
    </span>
  `;
}

function handleManagedIconEvent(event) {
  const imageNode = event.target;
  if (!(imageNode instanceof HTMLImageElement) || !("iconManaged" in imageNode.dataset)) {
    return;
  }
  if (event.type === "load") {
    window.__mxIconLoaded(imageNode);
  } else {
    window.__mxIconFallback(imageNode);
  }
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
    delete imageNode.dataset.iconManaged;
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
// Lazy tile icons that haven't started loading yet (collapsed rows, below the fold) aren't failures.
function hasAttemptedIconLoad(host) {
  const images = document.querySelectorAll(`img[data-icon-host="${CSS.escape(host)}"]`);
  return !images.length || Array.from(images).some((image) => image.complete);
}

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
        if (host && needsIconDiscovery(host) && !(now - Number(log[host] || 0) < ICON_DISCOVER_RETRY_MS) && hasAttemptedIconLoad(host)) {
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
    return !PLACEHOLDER_ICON_SOURCE_PATTERN.test(trimmed);
  }

  const commaIndex = trimmed.indexOf(",");
  if (commaIndex === -1) {
    return false;
  }

  try {
    const preview = window.atob(trimmed.slice(commaIndex + 1).slice(0, 2048).replace(/=+$/, "").slice(0, 2044));
    const normalized = preview.trimStart().toLowerCase();
    if (normalized.startsWith("<!doctype html") || normalized.startsWith("<html")) {
      return false;
    }
    // unavatar.io's logo, which earlier versions cached as if it were the site's icon.
    if (normalized.includes("<title>unavatar</title>")) {
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

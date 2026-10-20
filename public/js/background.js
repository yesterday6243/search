// Page background: Bing / Picsum / custom providers, hourly rotation, cached snapshot.
// Classic script sharing the page's global scope; load order is defined in index.html.

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

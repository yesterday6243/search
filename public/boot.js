// Runs in <head> before first paint: restores cached background and size prefs to avoid a flash.
// Kept as an external file (not inline) so the Content-Security-Policy can forbid inline scripts.
try {
  const rawSnapshot = window.localStorage.getItem("mx_background_url_v1");
  let cachedBackgroundUrl = "";
  if (rawSnapshot) {
    try {
      const parsed = JSON.parse(rawSnapshot);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        cachedBackgroundUrl = String(parsed.url || "");
      } else {
        cachedBackgroundUrl = String(rawSnapshot);
      }
    } catch {
      cachedBackgroundUrl = String(rawSnapshot);
    }
  }
  if (cachedBackgroundUrl) {
    const safeUrl = cachedBackgroundUrl.replace(/"/g, "%22");
    document.documentElement.style.setProperty("--page-bg", `url("${safeUrl}")`);
  }

  const rawUiPrefs = window.localStorage.getItem("mx_ui_prefs_v1");
  if (rawUiPrefs) {
    const parsedUiPrefs = JSON.parse(rawUiPrefs);
    const safeSearchHeight = Number(parsedUiPrefs.searchBarHeight);
    if (Number.isFinite(safeSearchHeight)) {
      document.documentElement.style.setProperty("--search-height", `${Math.max(52, Math.min(96, Math.round(safeSearchHeight)))}px`);
    }
    const safeTagOpacity = Number(parsedUiPrefs.tagOpacity);
    if (Number.isFinite(safeTagOpacity)) {
      const normalizedTagOpacity = Math.max(35, Math.min(100, Math.round(safeTagOpacity))) / 100;
      document.documentElement.style.setProperty("--tag-surface-opacity", normalizedTagOpacity.toFixed(2));
      document.documentElement.style.setProperty("--tag-surface-opacity-soft", Math.min(1, normalizedTagOpacity * 0.97).toFixed(2));
    }
    const safeOverlayOpacity = Number(parsedUiPrefs.overlayOpacity);
    if (Number.isFinite(safeOverlayOpacity)) {
      document.documentElement.style.setProperty("--bg-overlay-opacity", (Math.max(0, Math.min(100, Math.round(safeOverlayOpacity))) / 100).toFixed(2));
    }
  }
} catch {}

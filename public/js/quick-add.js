// Homepage "+" quick-add dialog: URL lookup (name + icon) and adding the tag.
// Classic script sharing the page's global scope; load order is defined in index.html.

function openQuickAdd(categoryId) {
  if (!quickAddModal || !appState) {
    return;
  }
  if (!authState.loggedIn) {
    openAuthModal(authState.userCount === 0 ? AUTH_MODE_REGISTER : AUTH_MODE_LOGIN);
    return;
  }
  const category = appState.categories.find((item) => item.id === categoryId);
  if (!category) {
    return;
  }
  quickAddCategoryId = categoryId;
  quickAddNameEdited = false;
  quickAddLookupUrl = "";
  quickAddLookupPromise = null;
  quickAddForm.reset();
  quickAddMeta.textContent = `添加到「${category.name}」`;
  setQuickAddStatus("");
  setQuickAddMessage("");
  renderQuickAddPreview("");
  quickAddModal.classList.remove("hidden");
  quickAddModal.setAttribute("aria-hidden", "false");
  syncOverlayVisibility();
  quickAddUrlInput.focus();
}

function closeQuickAdd() {
  if (!quickAddModal) {
    return;
  }
  window.clearTimeout(quickAddLookupTimer);
  quickAddLookupController?.abort();
  quickAddModal.classList.add("hidden");
  quickAddModal.setAttribute("aria-hidden", "true");
  syncOverlayVisibility();
}

// Accepts "github.com", "github.com/foo" or full URLs; only http(s) with a real host.
function normalizeQuickAddUrl(rawValue) {
  let value = String(rawValue || "").trim();
  if (!value) {
    return "";
  }
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    value = `https://${value}`;
  }
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol) || (!url.hostname.includes(".") && url.hostname !== "localhost")) {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

function getHostDisplayName(rawUrl) {
  const host = parseUrlWithFallback(rawUrl)?.hostname?.replace(/^www\./, "") || "";
  const labels = host.split(".").filter(Boolean);
  const main = labels.length > 2 && labels.at(-2).length <= 3 ? labels.at(-3) : labels.at(-2) || labels[0] || "";
  return main ? (main[0].toUpperCase() + main.slice(1)).slice(0, 18) : "";
}

function handleQuickAddUrlInput() {
  setQuickAddMessage("");
  window.clearTimeout(quickAddLookupTimer);
  const url = normalizeQuickAddUrl(quickAddUrlInput.value);
  if (!url) {
    setQuickAddStatus("");
    renderQuickAddPreview("");
    return;
  }
  quickAddLookupTimer = window.setTimeout(() => {
    if (url !== quickAddLookupUrl) {
      quickAddLookupPromise = lookupQuickAddMeta(url);
    }
  }, QUICK_ADD_LOOKUP_DEBOUNCE_MS);
}

async function lookupQuickAddMeta(url) {
  quickAddLookupController?.abort();
  const controller = new AbortController();
  quickAddLookupController = controller;
  quickAddLookupUrl = url;
  setQuickAddStatus("识别中…");
  try {
    const payload = await fetchJson("/api/site-meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    if (normalizeQuickAddUrl(quickAddUrlInput.value) !== url) {
      return;
    }
    if (!quickAddNameEdited && payload?.name) {
      quickAddNameInput.value = String(payload.name).slice(0, 18);
    }
    const host = getLinkIconHost(url);
    if (payload?.iconDataUrl && host) {
      const mergedHosts = mergeIconSourceCacheEntries({ [host]: payload.iconDataUrl }, { preferExisting: false });
      refreshResolvedIconHosts(mergedHosts);
    }
    renderQuickAddPreview(url);
    setQuickAddStatus("");
  } catch (error) {
    if (error?.name !== "AbortError") {
      setQuickAddStatus("");
      if (!quickAddNameEdited && !quickAddNameInput.value) {
        quickAddNameInput.value = getHostDisplayName(url);
      }
    }
  } finally {
    if (quickAddLookupController === controller) {
      quickAddLookupController = null;
    }
  }
}

function renderQuickAddPreview(url) {
  if (!quickAddPreview) {
    return;
  }
  quickAddPreview.innerHTML = url
    ? buildIconMarkup(getFaviconUrl(url), "", "quick-add-preview-icon")
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" /></svg>';
  queueIconReadyStateCheck();
}

function setQuickAddStatus(text) {
  if (quickAddStatus) {
    quickAddStatus.textContent = text;
  }
}

function setQuickAddMessage(message) {
  if (!quickAddMessage) {
    return;
  }
  quickAddMessage.textContent = message;
  quickAddMessage.classList.toggle("hidden", !message);
}

async function handleQuickAddSubmit(event) {
  event.preventDefault();
  const category = appState?.categories.find((item) => item.id === quickAddCategoryId);
  const url = normalizeQuickAddUrl(quickAddUrlInput.value);
  if (!category) {
    closeQuickAdd();
    return;
  }
  if (!url) {
    setQuickAddMessage("请输入有效的网址，例如 github.com");
    quickAddUrlInput.focus();
    return;
  }
  const sameUrl = (value) => String(value || "").replace(/\/+$/, "").toLowerCase() === url.replace(/\/+$/, "").toLowerCase();
  if (category.links.some((link) => sameUrl(link.url))) {
    setQuickAddMessage(`这个网址已经在「${category.name}」里了`);
    return;
  }

  // Pressing Enter right after pasting: give the name lookup a moment to finish.
  if (!quickAddNameInput.value.trim()) {
    window.clearTimeout(quickAddLookupTimer);
    if (url !== quickAddLookupUrl || !quickAddLookupPromise) {
      quickAddLookupPromise = lookupQuickAddMeta(url);
    }
    await Promise.race([quickAddLookupPromise, new Promise((resolve) => window.setTimeout(resolve, 3000))]);
  }
  const label = (quickAddNameInput.value.trim() || getHostDisplayName(url) || "新标签").slice(0, 18);

  const linkId = createId("link");
  const categories = structuredClone(appState.categories);
  categories.find((item) => item.id === category.id).links.push({ id: linkId, label, url });
  try {
    await updateState({ categories });
  } catch (error) {
    console.error(error);
    setQuickAddMessage("添加失败，请重试");
    return;
  }
  closeQuickAdd();
  revealAddedLink(category.id, linkId);
  showNotice(`已添加「${label}」到「${category.name}」`, "success");
}

// Expand a collapsed category if the new tag landed in its hidden rows, then pop it in.
function revealAddedLink(categoryId, linkId) {
  updateTagOverflowLayout();
  const row = tagBoard.querySelector(`.category-row[data-category-id="${CSS.escape(categoryId)}"]`);
  if (row?.classList.contains("has-overflow") && !row.classList.contains("is-expanded")) {
    toggleCategoryExpanded(categoryId);
  }
  const card = tagBoard.querySelector(`[data-link-id="${CSS.escape(linkId)}"]`);
  card?.animate(
    [{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "scale(1)" }],
    { duration: TAG_POP_DURATION_MS, easing: "cubic-bezier(0.2, 0.9, 0.3, 1.2)" }
  );
}

// Settings drawer: sections, editors, anchor nav, quick scroll, save.
// Classic script sharing the page's global scope; load order is defined in index.html.

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

function updateTagOpacityLabel(opacity) {
  if (!tagOpacityValue) {
    return;
  }
  syncRangeControl(tagOpacityInput, tagOpacityValue, normalizeTagOpacity(opacity));
}

function updateSearchBarHeightLabel(height) {
  if (!searchBarHeightValue) {
    return;
  }
  syncRangeControl(searchBarHeightInput, searchBarHeightValue, normalizeSearchBarHeight(height));
}

function openSettings() {
  if (!authState.loggedIn) {
    pendingOpenSettingsAfterAuth = true;
    openAuthModal(authState.userCount === 0 ? AUTH_MODE_REGISTER : AUTH_MODE_LOGIN);
    return;
  }

  settingsDraftStale = false;
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
  if (searchSuggestionsInput) {
    searchSuggestionsInput.checked = settingsDraft.settings.searchSuggestions !== false;
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

  if (target === searchSuggestionsInput) {
    settingsDraft.settings.searchSuggestions = target.checked;
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
  if (settingsDraftStale) {
    // The draft was cloned before another window changed the data; saving it would undo that change.
    const confirmed = await openConfirmDialog({
      title: "其他窗口已修改配置",
      message: "打开设置后，另一个窗口修改了首页配置。继续保存会用这里的内容覆盖那些修改，是否继续？",
      confirmText: "仍然保存",
      tone: "danger",
      scopeElement: settingsDrawer,
    });
    if (!confirmed) {
      return;
    }
    settingsDraftStale = false;
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

// Homepage tag board: rendering, collapse/expand, label fitting, tag search, scroll fade fallback.
// Classic script sharing the page's global scope; load order is defined in index.html.

let lastTagBoardRenderKey = "";

function renderTagBoardIfChanged() {
  if (getTagBoardRenderKey() !== lastTagBoardRenderKey) {
    renderTagBoard();
  }
}

function getTagBoardRenderKey() {
  return `${homeTagSearchQuery}|${JSON.stringify(appState?.categories || [])}`;
}

function renderTagBoard() {
  lastTagBoardRenderKey = getTagBoardRenderKey();
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
      const addCard = query
        ? ""
        : `<button class="tag-add-card" type="button" data-quick-add="${escapeAttribute(category.id)}" aria-label="添加标签到 ${escapeAttribute(category.name)}" title="添加标签">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" /></svg>
          </button>`;
      const content = links.length || addCard
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
            ${addCard}
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
            <svg class="category-expand-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 9.5 12 15l5.5-5.5" /></svg>
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
    const linkCount = gridNode?.querySelectorAll(".tag-card, .tag-add-card").length || 0;

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

// Batched: reset all, measure all in one layout pass, then write the fitted sizes. Text width scales
// linearly with font size, so the fitted size is computed directly instead of shrinking 1px per reflow.
function fitTagLabelText() {
  const minSize = 9;
  const labels = Array.from(tagBoard.querySelectorAll(".tile-label, .category-name")).filter(
    (node) => node instanceof HTMLElement
  );
  labels.forEach((labelNode) => {
    labelNode.style.fontSize = "";
    labelNode.style.lineHeight = "";
  });
  const measurements = labels.map((labelNode) => ({
    labelNode,
    scrollWidth: labelNode.scrollWidth,
    clientWidth: labelNode.clientWidth,
    fontSize: Number.parseFloat(window.getComputedStyle(labelNode).fontSize) || 15,
  }));
  const shrink = (items) =>
    items.forEach(({ labelNode, scrollWidth, clientWidth, fontSize }) => {
      const fitted = Math.max(minSize, Math.floor(((fontSize * clientWidth) / scrollWidth) * 4) / 4 - 0.25);
      labelNode.style.fontSize = `${fitted}px`;
      labelNode.style.lineHeight = "1.2";
    });
  const overflowing = (items) =>
    items.filter(({ scrollWidth, clientWidth }) => clientWidth && scrollWidth > clientWidth + 0.5);

  const firstPass = overflowing(measurements);
  shrink(firstPass);
  // Glyph rounding can leave a few labels a hair too wide: one more batched pass fixes those.
  const secondPass = overflowing(
    firstPass.map(({ labelNode }) => ({
      labelNode,
      scrollWidth: labelNode.scrollWidth,
      clientWidth: labelNode.clientWidth,
      fontSize: Number.parseFloat(labelNode.style.fontSize) || minSize,
    }))
  ).filter(({ fontSize }) => fontSize > minSize);
  shrink(secondPass);
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

  // FLIP: measure, change the layout once, then animate with transforms/opacity only. Animating the
  // height instead made the browser re-layout and repaint every row below on every frame, so expanding
  // a category near the top of a long board dropped frames.
  const links = row.querySelector(".category-links");
  const rowsBelow = Array.from(tagBoard.querySelectorAll(".category-row")).filter(
    (item) => row.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING
  );
  const topsBefore = rowsBelow.map((item) => item.getBoundingClientRect().top);
  const clipBottomBefore = links?.getBoundingClientRect().bottom ?? 0;

  row.classList.toggle("is-expanded", nextExpanded);
  expandButton.classList.toggle("is-expanded", nextExpanded);
  expandButton.setAttribute("aria-expanded", nextExpanded ? "true" : "false");
  expandButton.setAttribute("aria-label", nextExpanded ? "收起分类标签" : "展开更多标签");
  expandButton.title = nextExpanded ? "收起分类标签" : "展开更多标签";

  if (!links || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  animateCategoryExpand(links, nextExpanded, clipBottomBefore, rowsBelow, topsBefore);
}

const CATEGORY_EXPAND_DURATION_MS = 360;
const CATEGORY_EXPAND_EASING = "cubic-bezier(0.2, 0.9, 0.25, 1)";

// Drawer-style: tiles stay fully opaque; the row's clip edge and the rows below move together.
// Expanding reveals the extra tiles in place, collapsing covers them — nothing fades or is delayed.
function animateCategoryExpand(links, expanded, clipBottomBefore, rowsBelow, topsBefore) {
  const timing = { duration: CATEGORY_EXPAND_DURATION_MS, easing: CATEGORY_EXPAND_EASING };
  rowsBelow.forEach((item, index) => {
    const deltaY = topsBefore[index] - item.getBoundingClientRect().top;
    if (Math.abs(deltaY) < 0.5) {
      return;
    }
    item.getAnimations().forEach((animation) => animation.id === "category-expand" && animation.cancel());
    const animation = item.animate([{ transform: `translateY(${deltaY}px)` }, { transform: "translateY(0)" }], timing);
    animation.id = "category-expand";
  });

  const clipBottomAfter = links.getBoundingClientRect().bottom;
  const travel = Math.abs(clipBottomAfter - clipBottomBefore);
  if (travel < 0.5) {
    return;
  }
  links.getAnimations().forEach((animation) => animation.id === "category-clip" && animation.cancel());
  if (expanded) {
    // Box is already full height: start clipped at the old edge and open to the full height.
    const clip = links.animate([{ clipPath: `inset(0 0 ${travel}px 0)` }, { clipPath: "inset(0 0 0 0)" }], timing);
    clip.id = "category-clip";
    return;
  }
  // Box is already collapsed: keep the overflow painted, clip from the old (expanded) edge down to the new one.
  links.classList.add("is-collapsing");
  const clip = links.animate([{ clipPath: `inset(0 0 -${travel}px 0)` }, { clipPath: "inset(0 0 0 0)" }], timing);
  clip.id = "category-clip";
  let done = false;
  const finish = () => {
    if (done) {
      return;
    }
    done = true;
    links.classList.remove("is-collapsing");
  };
  clip.finished.then(finish, finish);
  window.setTimeout(finish, CATEGORY_EXPAND_DURATION_MS + 80);
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

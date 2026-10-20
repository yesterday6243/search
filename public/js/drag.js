// iOS-style pointer drags: tags (FLIP reflow, clip-aware) and whole category rows.
// Classic script sharing the page's global scope; load order is defined in index.html.

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
  animateTagReflow(() => grid.insertBefore(placeholder, firstHiddenCard || grid.querySelector(".tag-add-card")));
}

// FLIP reflow that respects collapsed category rows (which clip overflowing cards):
// cards visible before and after slide to their new slot, cards entering the visible
// row pop in, and cards pushed into the clipped area shrink out where they were.
function animateTagReflow(mutate) {
  const cards = Array.from(tagBoard.querySelectorAll(".tag-card, .tag-add-card"));
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
    const count = grid.querySelectorAll(".tag-card, .tag-add-card").length;
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

// Entry point: wires up events and boots the app. Loaded last.
// Classic script sharing the page's global scope; load order is defined in index.html.

async function boot() {
  bindEvents();
  const cachedStatePayload = loadPersistedStateSnapshot();
  if (cachedStatePayload) {
    applyState(cachedStatePayload, { persistLocalCache: false });
  } else {
    applyGuestState();
  }
  await refreshAuthStatus();
  if (authState.loggedIn) {
    if (cachedStatePayload?.username && cachedStatePayload.username !== authState.username) {
      clearPersistedStateSnapshot();
      applyGuestState();
    }
    // Edits from the pre-sync version that never reached the cloud are replayed as ops once.
    const legacyDirty = takeLegacyDirtyFlag(authState.username);
    await startUserSync({
      legacyState: legacyDirty && cachedStatePayload?.username === authState.username ? cachedStatePayload.state : null,
    });
  } else {
    clearPersistedStateSnapshot();
    applyGuestState();
  }
  renderSyncStatus();
}

function bindEvents() {
  bindSyncEvents();
  // Icon <img> load/error handling is delegated (capture phase, since these events don't bubble)
  // instead of inline onload/onerror attributes, so the CSP can forbid inline handlers.
  document.addEventListener("load", handleManagedIconEvent, true);
  document.addEventListener("error", handleManagedIconEvent, true);
  searchForm.addEventListener("submit", handleSearch);
  searchBar?.addEventListener("pointerdown", handleSearchBarPointerDown);
  searchInput.addEventListener("focus", () => renderHistoryList(searchInput.value));
  searchInput.addEventListener("keydown", handleSearchDropdownKeydown);
  searchInput.addEventListener("input", () => {
    updateSearchClearButton();
    renderHistoryList(searchInput.value);
  });
  searchIconButton.addEventListener("click", () => {
    void triggerSearchFromIcon();
  });
  searchClearButton.addEventListener("click", () => {
    searchInput.value = "";
    updateSearchClearButton();
    searchInput.focus();
    renderHistoryList("");
  });
  syncStatus?.addEventListener("click", () => {
    void handleManualSyncClick();
  });
  closeSyncModalButton?.addEventListener("click", closeSyncModal);
  backupNowButton?.addEventListener("click", () => {
    void handleBackupNow();
  });
  refreshBackupsButton?.addEventListener("click", () => {
    void refreshBackupList();
  });
  syncBackupList?.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-backup-action]");
    if (!actionButton) {
      return;
    }
    const backupId = actionButton.dataset.backupId || "";
    const action = actionButton.dataset.backupAction || "";
    if (!backupId || !action) {
      return;
    }
    if (action === "toggle-auto-history") {
      toggleAutoBackupHistory();
      return;
    }
    if (action === "restore") {
      void handleRestoreBackup(backupId);
      return;
    }
    if (action === "rename") {
      void handleRenameBackup(backupId, actionButton.dataset.backupName || "");
      return;
    }
    if (action === "delete") {
      void handleDeleteBackup(backupId);
    }
  });
  closeConfirmModalButton?.addEventListener("click", () => {
    resolveConfirmDialog(false);
  });
  confirmModalCancelButton?.addEventListener("click", () => {
    resolveConfirmDialog(false);
  });
  confirmModalConfirmButton?.addEventListener("click", () => {
    resolveConfirmDialog(true);
  });

  engineToggleButton.addEventListener("click", () => {
    const hidden = engineMenu.classList.contains("hidden");
    if (hidden) {
      renderEngineMenu();
      historyPanel.classList.add("hidden");
      engineMenu.classList.remove("hidden");
      engineToggleButton.setAttribute("aria-expanded", "true");
      return;
    }

    closeMenus();
  });

  openSettingsButton.addEventListener("click", () => {
    void handleOpenSettingsClick();
  });
  closeSettingsButton.addEventListener("click", closeSettings);
  cancelSettingsButton.addEventListener("click", closeSettings);
  logoutButton.addEventListener("click", () => {
    void handleLogout();
  });
  closeAuthButton.addEventListener("click", () => {
    pendingOpenSettingsAfterAuth = false;
    closeAuthModal();
  });
  authTabLogin.addEventListener("click", () => switchAuthMode(AUTH_MODE_LOGIN));
  authTabRegister.addEventListener("click", () => switchAuthMode(AUTH_MODE_REGISTER));
  loginForm.addEventListener("submit", (event) => {
    void handleLoginSubmit(event);
  });
  registerForm.addEventListener("submit", (event) => {
    void handleRegisterSubmit(event);
  });
  quickAddForm?.addEventListener("submit", (event) => {
    void handleQuickAddSubmit(event);
  });
  quickAddUrlInput?.addEventListener("input", handleQuickAddUrlInput);
  quickAddNameInput?.addEventListener("input", () => {
    quickAddNameEdited = Boolean(quickAddNameInput.value.trim());
  });
  quickAddModal?.querySelectorAll("[data-close-quick-add]").forEach((button) => {
    button.addEventListener("click", closeQuickAdd);
  });
  quickAddModal?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeQuickAdd();
    }
  });
  drawerScrim.addEventListener("click", () => {
    if (quickAddModal && !quickAddModal.classList.contains("hidden")) {
      closeQuickAdd();
      return;
    }
    if (!confirmModal.classList.contains("hidden")) {
      resolveConfirmDialog(false);
      return;
    }
    if (!syncModal.classList.contains("hidden")) {
      closeSyncModal();
      return;
    }
    if (!authModal.classList.contains("hidden")) {
      pendingOpenSettingsAfterAuth = false;
      closeAuthModal();
      return;
    }
    closeSettings();
  });
  addEngineButton.addEventListener("click", addEngineDraft);
  clearHistoryButton.addEventListener("click", clearHistory);

  settingsForm.addEventListener("submit", saveSettings);
  settingsForm.addEventListener("input", handleSettingsInput);
  settingsForm.addEventListener("change", (event) => {
    if (event.target.matches("[data-range-for]")) {
      applyRangeNumberInput(event.target, true);
    }
  });
  settingsForm.addEventListener("focusout", (event) => {
    if (event.target.matches("[data-range-for]")) {
      applyRangeNumberInput(event.target, true);
    }
  });
  settingsForm.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.matches("[data-range-for]")) {
      event.preventDefault();
      applyRangeNumberInput(event.target, true);
    }
  });
  settingsForm.addEventListener("click", handleSettingsClick);
  settingsScroll.addEventListener("scroll", handleSettingsScroll, { passive: true });
  settingsAnchorNav?.addEventListener("click", handleSettingsAnchorNavigation);
  settingsAnchorNav?.addEventListener("keydown", handleSettingsAnchorKeydown);
  homeTagSearchButton?.addEventListener("click", toggleHomeTagSearch);
  homeTagSearchInput?.addEventListener("input", handleHomeTagSearchInput);
  settingsQuickScroll?.addEventListener("pointerdown", handleSettingsQuickTrackPointerDown);
  settingsQuickThumb?.addEventListener("pointerdown", handleSettingsQuickThumbPointerDown);
  window.addEventListener("pointermove", handleSettingsQuickThumbPointerMove);
  window.addEventListener("pointerup", handleSettingsQuickThumbPointerUp);
  window.addEventListener("pointercancel", handleSettingsQuickThumbPointerUp);
  window.addEventListener("scroll", queueTagViewportFadeUpdate, { passive: true });
  window.addEventListener("resize", queueSettingsQuickScrollUpdate, { passive: true });
  window.addEventListener("resize", queueTagViewportFadeUpdate, { passive: true });
  window.addEventListener("resize", queueTagLabelFit, { passive: true });
  window.addEventListener("resize", queueTagOverflowLayoutUpdate, { passive: true });
  siteTitleDisplay.addEventListener("click", () => {
    void refreshBackgroundNow({ manual: true, force: true });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-panel")) {
      closeMenus();
    }
    if (!event.target.closest("#homeTagSearch") && !event.target.closest("#homeTagSearchButton")) {
      closeHomeTagSearch();
    }
  });

  historyPanel.addEventListener("click", (event) => {
    const suggestion = event.target.closest("[data-suggestion]");
    if (suggestion) {
      searchInput.value = suggestion.dataset.suggestion || "";
      updateSearchClearButton();
      // ↖ fills the input and keeps suggesting from there; the row itself searches right away.
      if (event.target.closest("[data-suggestion-fill]")) {
        searchInput.focus();
        renderHistoryList(searchInput.value);
        return;
      }
      closeMenus();
      searchForm.requestSubmit();
      return;
    }

    const item = event.target.closest("[data-history-id]");
    if (!item) {
      return;
    }

    searchInput.value = item.dataset.query || "";
    updateSearchClearButton();
    // 「搜索」runs the query right away with the current engine; the rest of the row only fills the input.
    if (event.target.closest("[data-history-search]")) {
      closeMenus();
      searchForm.requestSubmit();
      return;
    }
    searchInput.focus();
    closeMenus();
  });

  historyPanel.addEventListener("keydown", (event) => {
    const item = event.target instanceof Element ? event.target : null;
    if (!item?.matches("[data-history-id], [data-suggestion]") || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }
    event.preventDefault();
    item.click();
  });

  engineMenu.addEventListener("click", async (event) => {
    const item = event.target.closest("[data-engine-id]");
    if (!item) {
      return;
    }

    await updateState({ selectedEngineId: item.dataset.engineId });
    closeMenus();
  });

  tagBoard.addEventListener("click", (event) => {
    const addCard = event.target.closest("[data-quick-add]");
    if (addCard) {
      openQuickAdd(addCard.dataset.quickAdd);
      return;
    }
    const button = event.target.closest("[data-toggle-category]");
    if (!button) {
      return;
    }

    const categoryId = button.dataset.toggleCategory;
    if (!categoryId) {
      return;
    }
    toggleCategoryExpanded(categoryId);
  });

  tagBoard.addEventListener("dragstart", handleTagDragStart);
  tagBoard.addEventListener("pointerdown", handleTagPointerDown);
  tagBoard.addEventListener("pointerdown", handleRowPointerDown);
  tagBoard.addEventListener("click", handleTagDragClickGuard, true);
  tagBoard.addEventListener("contextmenu", handleTagDragContextMenu);
  tagBoard.addEventListener("touchmove", handleTagDragTouchMove, { passive: false });
}

boot();
